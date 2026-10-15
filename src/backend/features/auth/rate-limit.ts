import { cacheIncr } from "@backend/shared/lib/redis";
import { ApiError } from "@backend/shared/lib/errors";

const memory = new Map<string, { count: number; resetAt: number }>();

async function incr(key: string, ttlSeconds: number) {
  const n = await cacheIncr(key, ttlSeconds);
  if (n != null) return n;

  const now = Date.now();
  const current = memory.get(key);
  if (!current || current.resetAt < now) {
    memory.set(key, { count: 1, resetAt: now + ttlSeconds * 1000 });
    return 1;
  }
  current.count += 1;
  return current.count;
}

export async function hitLimit(key: string, max: number, ttlSeconds: number) {
  const n = await incr(key, ttlSeconds);
  if (n > max) {
    throw new ApiError("Too many tries. Wait a few minutes and try again.", 429);
  }
  return n;
}

export async function hitCooldown(key: string, ttlSeconds: number) {
  const n = await incr(key, ttlSeconds);
  if (n > 1) {
    throw new ApiError("Wait a minute before requesting another code.", 429);
  }
}
