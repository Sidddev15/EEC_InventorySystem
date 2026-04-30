import "server-only";

import { AiSuggestionType, Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import {
  aiSuggestionRequestSchema,
  productDuplicateCheckSchema,
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

type OpenAiResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};

function getSuggestionFromResponse(response: OpenAiResponse) {
  if (response.output_text) {
    return response.output_text.trim();
  }

  return (
    response.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .filter(Boolean)
      .join("\n")
      .trim() ?? ""
  );
}

async function callAi(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: AI_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_output_tokens: 180,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as OpenAiResponse;
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
    source: process.env.OPENAI_API_KEY ? "ai" : "fallback",
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

  const parts = [
    product.name,
    data.thickness,
    data.gsm ? `${data.gsm} GSM` : "",
    data.material,
    data.size,
  ].filter(Boolean);
  const fallback = parts.join(" ").replace(/\s+/g, " ").trim();

  return requestAiSuggestion({
    type: AiSuggestionType.VARIANT_NAMING,
    prompt: [
      `Suggest one clean EEC product variant name for parent product "${product.name}".`,
      `Attributes: thickness=${data.thickness || "n/a"}, gsm=${data.gsm || "n/a"}, material=${data.material || "n/a"}, size=${data.size || "n/a"}, inventoryType=${data.inventoryType || "n/a"}.`,
      `Existing variant names: ${product.variants.map((variant) => variant.name).join("; ") || "none"}.`,
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
