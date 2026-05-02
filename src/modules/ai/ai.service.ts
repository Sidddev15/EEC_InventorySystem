import "server-only";

import { AiSuggestionType, Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import {
  aiSuggestionRequestSchema,
  missingFieldSuggestionSchema,
  productDuplicateCheckSchema,
  reorderInsightSchema,
  unitSuggestionSchema,
  variantNameSuggestionSchema,
} from "@/lib/validations/ai.schema";
import { AI_SYSTEM_PROMPT } from "./prompts";

type AiSuggestionRequest = {
  type: AiSuggestionType;
  prompt: string;
  context?: Record<string, unknown>;
  fallback: string;
  userId?: string;
};

type GroqChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

function getSuggestionFromResponse(response: GroqChatCompletionResponse) {
  return response.choices?.[0]?.message?.content?.trim() ?? "";
}

async function callAi(prompt: string) {
  const apiKey = process.env.AI_API_KEY ?? process.env.GROQ_API_KEY;
  const baseUrl =
    process.env.AI_BASE_URL ?? "https://api.groq.com/openai/v1";
  const model =
    process.env.AI_MODEL ?? process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";

  if (!apiKey) {
    return null;
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: AI_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 180,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as GroqChatCompletionResponse;
  const suggestion = getSuggestionFromResponse(data);

  return suggestion || null;
}

export async function requestAiSuggestion(input: AiSuggestionRequest) {
  const data = aiSuggestionRequestSchema.parse(input);
  const suggestion = (await callAi(data.prompt)) ?? data.fallback;

  await db.aiSuggestionLog.create({
    data: {
      type: data.type,
      prompt: data.prompt,
      suggestion,
      context: (data.context ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      createdByUserId: input.userId,
    },
  });

  return {
    suggestion,
    source: process.env.AI_API_KEY || process.env.GROQ_API_KEY ? "ai" : "fallback",
  };
}

export async function checkProductDuplicateName(input: unknown, userId?: string) {
  const data = productDuplicateCheckSchema.parse(input);
  const matches = await db.product.findMany({
    where: {
      ...(data.categoryId ? { categoryId: data.categoryId } : {}),
      OR: [
        { name: { equals: data.name, mode: "insensitive" } },
        { name: { contains: data.name, mode: "insensitive" } },
      ],
    },
    take: 5,
    select: {
      name: true,
      category: {
        select: {
          name: true,
        },
      },
    },
  });
  const fallback =
    matches.length > 0
      ? `Similar product already exists: ${matches
          .map((match) => `${match.name} (${match.category.name})`)
          .join(", ")}.`
      : "No close duplicate found in product master data.";

  return requestAiSuggestion({
    type: AiSuggestionType.PRODUCT_CREATION,
    prompt: [
      `Check whether this product name may duplicate existing EEC inventory master data: ${data.name}.`,
      matches.length > 0
        ? `Existing matches: ${matches
            .map((match) => `${match.name} in ${match.category.name}`)
            .join("; ")}.`
        : "No database matches were found.",
      "Return one concise sentence.",
    ].join(" "),
    context: {
      name: data.name,
      categoryId: data.categoryId,
      matches,
    },
    fallback,
    userId,
  });
}

export async function suggestVariantName(input: unknown, userId?: string) {
  const data = variantNameSuggestionSchema.parse(input);
  const product = await db.product.findUnique({
    where: { id: data.productId },
    select: {
      name: true,
      variants: {
        select: {
          name: true,
        },
        take: 20,
        orderBy: { name: "asc" },
      },
    },
  });

  if (!product) {
    throw new Error("Parent product not found.");
  }

  const draftName = data.draftName?.trim() ?? "";
  const productTokens = new Set(
    product.name
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean)
  );
  const draftTokens = new Set(
    draftName
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean)
  );
  const hasProductReference = [...productTokens].some((token) => draftTokens.has(token));
  const parts = [
    hasProductReference ? draftName : [product.name, draftName].filter(Boolean).join(" "),
    data.thickness,
    data.gsm ? `${data.gsm} GSM` : "",
    data.material,
    data.size,
  ]
    .filter(Boolean)
    .map((value) => value?.trim())
    .filter(Boolean);
  const fallback = parts.join(" ").replace(/\s+/g, " ").trim();

  return requestAiSuggestion({
    type: AiSuggestionType.VARIANT_NAMING,
    prompt: [
      `Suggest one clean EEC product variant name for parent product "${product.name}".`,
      draftName
        ? `The user has already typed this draft name: "${draftName}". Refine it instead of replacing it with a generic standard name.`
        : "No draft variant name has been typed yet. Build the name from the supplied attributes.",
      `Attributes: thickness=${data.thickness || "n/a"}, gsm=${data.gsm || "n/a"}, material=${data.material || "n/a"}, size=${data.size || "n/a"}, inventoryType=${data.inventoryType || "n/a"}.`,
      `Existing variant names: ${product.variants.map((variant) => variant.name).join("; ") || "none"}.`,
      "Use the user's wording when it is operationally meaningful. Avoid generic names like Standard unless the user explicitly asked for them.",
      "Return only the suggested variant name.",
    ].join(" "),
    context: {
      ...data,
      productName: product.name,
      existingVariants: product.variants,
    },
    fallback,
    userId,
  });
}

function fallbackUnitCode(input: {
  variantName?: string;
  material?: string;
  size?: string;
  inventoryType?: string;
}) {
  const text = `${input.variantName ?? ""} ${input.material ?? ""} ${input.size ?? ""}`.toLowerCase();

  if (text.includes("carbon") || text.includes("granule")) return "Kg";
  if (text.includes("roll")) return "Roll";
  if (text.includes("media") || text.includes("pad") || text.includes("floor") || text.includes("ceiling")) {
    return "Sq Meter";
  }
  if (text.includes("meter") && !text.includes("sq")) return "Meter";

  return input.inventoryType === "RAW_MATERIAL" ? "Kg" : "NOS";
}

export async function suggestUnit(input: unknown, userId?: string) {
  const data = unitSuggestionSchema.parse(input);
  const unitCode = fallbackUnitCode(data);
  const result = await requestAiSuggestion({
    type: AiSuggestionType.UNIT_SUGGESTION,
    prompt: [
      "Suggest the best stock unit for this EEC filter inventory variant.",
      `Variant name: ${data.variantName || "n/a"}.`,
      `Material: ${data.material || "n/a"}. Size: ${data.size || "n/a"}. Inventory type: ${data.inventoryType || "n/a"}.`,
      "Return one short sentence naming the unit and reason.",
    ].join(" "),
    context: data,
    fallback: `Suggested unit: ${unitCode} because this item matches common EEC stock measurement patterns.`,
    userId,
  });

  return {
    ...result,
    unitCode,
  };
}

export async function suggestMissingFields(input: unknown, userId?: string) {
  const data = missingFieldSuggestionSchema.parse(input);
  const missing = [
    !data.thickness ? "Thickness" : "",
    !data.gsm ? "GSM" : "",
    !data.material ? "Material" : "",
    !data.size ? "Size" : "",
    !data.unitCode ? "Default Unit" : "",
  ].filter(Boolean);
  const fallback =
    missing.length > 0
      ? `Missing fields to review: ${missing.join(", ")}.`
      : "Key variant fields look complete for master data entry.";

  return requestAiSuggestion({
    type: AiSuggestionType.MISSING_FIELD_SUGGESTION,
    prompt: [
      "Review this EEC filter variant entry for missing master-data fields.",
      `Variant: ${data.variantName || "n/a"}. Thickness: ${data.thickness || "n/a"}. GSM: ${data.gsm || "n/a"}. Material: ${data.material || "n/a"}. Size: ${data.size || "n/a"}. Unit: ${data.unitCode || "n/a"}. Inventory type: ${data.inventoryType || "n/a"}.`,
      "Return one concise practical sentence.",
    ].join(" "),
    context: data,
    fallback,
    userId,
  });
}

export async function getReorderInsight(input: unknown, userId?: string) {
  const data = reorderInsightSchema.parse(input);
  const item = await db.inventoryItem.findUnique({
    where: { id: data.inventoryItemId },
    select: {
      quantity: true,
      location: { select: { name: true } },
      variant: {
        select: {
          name: true,
          minStockLevel: true,
          reorderLevel: true,
          unit: { select: { code: true } },
          product: { select: { name: true } },
        },
      },
    },
  });

  if (!item) {
    throw new Error("Inventory item not found.");
  }

  const quantity = Number(item.quantity.toString());
  const reorderLevel = item.variant.reorderLevel
    ? Number(item.variant.reorderLevel.toString())
    : 0;
  const minStock = item.variant.minStockLevel
    ? Number(item.variant.minStockLevel.toString())
    : 0;
  const fallback =
    reorderLevel > 0 && quantity <= reorderLevel
      ? `Reorder insight: ${item.variant.product.name} - ${item.variant.name} is at ${quantity} ${item.variant.unit.code} in ${item.location.name}; reorder level is ${reorderLevel}.`
      : minStock > 0 && quantity <= minStock
        ? `Reorder insight: stock is below minimum level of ${minStock} ${item.variant.unit.code}.`
        : `Reorder insight: stock is currently normal at ${quantity} ${item.variant.unit.code}.`;

  return requestAiSuggestion({
    type: AiSuggestionType.REORDER_INSIGHT,
    prompt: [
      "Give one practical reorder insight for this EEC inventory item.",
      `Product: ${item.variant.product.name}. Variant: ${item.variant.name}. Location: ${item.location.name}. Quantity: ${quantity} ${item.variant.unit.code}. Min stock: ${minStock || "not set"}. Reorder level: ${reorderLevel || "not set"}.`,
    ].join(" "),
    context: {
      inventoryItemId: data.inventoryItemId,
      quantity,
      reorderLevel,
      minStock,
    },
    fallback,
    userId,
  });
}
