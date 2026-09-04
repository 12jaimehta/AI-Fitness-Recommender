export class ApiRequestError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const isForm = typeof FormData !== "undefined" && init?.body instanceof FormData;
  if (!isForm && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    ...init,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string; code?: string; details?: string };
    if (response.status === 429) {
      throw new ApiRequestError(
        payload.error || "Rate limit exceeded. Please try again in a few minutes.",
        429,
        payload.code
      );
    }
    throw new ApiRequestError(
      payload.error || payload.details || "Request failed",
      response.status,
      payload.code
    );
  }

  return (await response.json()) as T;
}
