import "server-only";

import { AiSuggestionType, Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { aiSuggestionRequestSchema } from "@/lib/validations/ai.schema";
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
