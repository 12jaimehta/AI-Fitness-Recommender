import { NextResponse } from "next/server";
import { ApiError } from "./errors";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export function jsonError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: error.status }
    );
  }

  const message = error instanceof Error ? error.message : "Internal server error";
  console.error("API error:", error);
  return NextResponse.json({ error: message }, { status: 500 });
}

export function stripCodeFences(value: string) {
  return value
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
}

function closeTruncatedJson(input: string) {
  let text = input.trim();
  let inString = false;
  let escaped = false;

  for (const ch of text) {
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
    } else if (ch === '"') {
      inString = true;
    }
  }
  if (inString) text += '"';

  const stack: string[] = [];
  inString = false;
  escaped = false;
  for (const ch of text) {
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") stack.push("}");
    else if (ch === "[") stack.push("]");
    else if (ch === "}" || ch === "]") stack.pop();
  }
  while (stack.length) text += stack.pop();
  return text;
}

export function parseJsonObject<T>(text: string): T {
  const cleaned = stripCodeFences(text);
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    return JSON.parse(closeTruncatedJson(cleaned)) as T;
  }
}

export function requestOrigin(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const host = forwardedHost || request.headers.get("host");
  if (host) {
    const proto = forwardedProto || (host.includes("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }
  return new URL(request.url).origin;
}

export async function readJsonBody(request: Request): Promise<unknown> {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new ApiError("Invalid content type. Use application/json.", 415);
  }

  const body = (await request.json()) as unknown;
  if (typeof body === "string") {
    try {
      return JSON.parse(stripCodeFences(body));
    } catch {
      return body;
    }
  }
  return body;
}
