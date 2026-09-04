import type { GenerateStreamEvent } from "@/shared/types/generate-stream";
import { ApiRequestError } from "./http";

function throwFromFailedResponse(status: number, payload: { error?: string; code?: string; details?: string }) {
  if (status === 429) {
    throw new ApiRequestError(
      payload.error || "Rate limit exceeded. Please try again in a few minutes.",
      429,
      payload.code
    );
  }
  throw new ApiRequestError(payload.error || payload.details || "Request failed", status, payload.code);
}

export async function postSsePlan<T>(
  path: string,
  body: unknown,
  onThought: (text: string) => void
): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      code?: string;
      details?: string;
    };
    throwFromFailedResponse(response.status, payload);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  if (!response.body) {
    throw new ApiRequestError("Empty response", 500);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let plan: T | undefined;

  const consume = (raw: string) => {
    const dataLine = raw
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart())
      .join("\n");
    if (!dataLine || dataLine === "[DONE]") return;

    let event: GenerateStreamEvent<T>;
    try {
      event = JSON.parse(dataLine) as GenerateStreamEvent<T>;
    } catch {
      return;
    }
    if (event.type === "thought") {
      onThought(event.text);
      return;
    }
    if (event.type === "done") {
      plan = event.plan;
      return;
    }
    if (event.type === "error") {
      throwFromFailedResponse(event.status || 500, { error: event.error, code: event.code });
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";
    for (const part of parts) consume(part);
  }
  if (buffer.trim()) consume(buffer);

  if (plan === undefined) {
    throw new ApiRequestError("Could not make your plan. Try again.", 500);
  }
  return plan;
}
