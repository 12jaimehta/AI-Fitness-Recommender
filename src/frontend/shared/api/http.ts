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
    const payload = await response.json().catch(() => ({}));
    if (response.status === 429) {
      throw new Error(
        payload.error || "Rate limit exceeded. Please try again in a few minutes."
      );
    }
    throw new Error(payload.error || payload.details || (await response.text().catch(() => "")) || "Request failed");
  }

  return (await response.json()) as T;
}
