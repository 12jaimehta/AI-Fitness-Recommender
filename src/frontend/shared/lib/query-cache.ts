type Entry = { value: unknown; expires: number };

const memory = new Map<string, Entry>();
const inflight = new Map<string, Promise<unknown>>();

export function peekQueryCache<T>(key: string): T | undefined {
  const hit = memory.get(key);
  if (!hit) return undefined;
  if (hit.expires < Date.now()) {
    memory.delete(key);
    return undefined;
  }
  return hit.value as T;
}

export function setQueryCache<T>(key: string, value: T, ttlMs = 30_000) {
  memory.set(key, { value, expires: Date.now() + ttlMs });
}

export function invalidateQueryCache(prefix?: string) {
  if (!prefix) {
    memory.clear();
    inflight.clear();
    return;
  }
  for (const key of memory.keys()) {
    if (key === prefix || key.startsWith(prefix)) memory.delete(key);
  }
  for (const key of inflight.keys()) {
    if (key === prefix || key.startsWith(prefix)) inflight.delete(key);
  }
}

export function clearQueryCache() {
  invalidateQueryCache();
}

export async function cachedQuery<T>(key: string, fn: () => Promise<T>, ttlMs = 30_000): Promise<T> {
  const cached = peekQueryCache<T>(key);
  if (cached !== undefined) return cached;

  const pending = inflight.get(key);
  if (pending) return pending as Promise<T>;

  const request = fn()
    .then((value) => {
      setQueryCache(key, value, ttlMs);
      return value;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, request);
  return request;
}
