import OpenAI from "openai";
import { getGrokEnv } from "../config/env";
import { parseJsonObject } from "../lib/http";

let client: OpenAI | null = null;

function getGrokClient() {
  if (!client) {
    const { apiKey, baseUrl } = getGrokEnv();
    client = new OpenAI({
      apiKey,
      baseURL: baseUrl,
    });
  }
  return client;
}

type JsonOptions = { maxTokens?: number; system?: string; timeoutMs?: number };

const DEFAULT_SYSTEM = "You are a careful expert. Reply with valid JSON only. No markdown fences.";

async function readJsonResponse<T>(response: { choices?: Array<{ message?: { content?: string | null }; finish_reason?: string | null }> }): Promise<T> {
  const choice = response.choices?.[0];
  const text = choice?.message?.content || "{}";
  try {
    return parseJsonObject<T>(text);
  } catch (error) {
    if (choice?.finish_reason === "length") {
      throw new Error("AI response was cut off before the JSON finished");
    }
    throw error;
  }
}

export async function completeJson<T>(prompt: string, options?: JsonOptions): Promise<T> {
  const grok = getGrokClient();
  const { model } = getGrokEnv();
  const timeoutMs = options?.timeoutMs ?? 90_000;

  const response = await grok.chat.completions.create(
    {
      model,
      messages: [
        { role: "system", content: options?.system ?? DEFAULT_SYSTEM },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      max_tokens: options?.maxTokens,
      response_format: { type: "json_object" },
    },
    { timeout: timeoutMs }
  );

  return readJsonResponse<T>(response);
}

export async function completeJsonWithImage<T>(
  prompt: string,
  imageDataUrl: string,
  options?: JsonOptions
): Promise<T> {
  const grok = getGrokClient();
  const { model } = getGrokEnv();
  const timeoutMs = options?.timeoutMs ?? 90_000;

  const response = await grok.chat.completions.create(
    {
      model,
      messages: [
        { role: "system", content: options?.system ?? DEFAULT_SYSTEM },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: imageDataUrl } },
            { type: "text", text: prompt },
          ],
        },
      ],
      temperature: 0.4,
      max_tokens: options?.maxTokens,
      response_format: { type: "json_object" },
    },
    { timeout: timeoutMs }
  );

  return readJsonResponse<T>(response);
}
