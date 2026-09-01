import Redis from "ioredis";

const TTL_SECONDS = 60 * 60 * 24 * 30;

type RedisGlobal = { __fyteRedis?: Redis };

function redisUrl() {
  return process.env.REDIS_URL || "";
}

export function getRedis(): Redis | null {
  const url = redisUrl();
  if (!url) return null;

  const globalForRedis = globalThis as RedisGlobal;
  if (!globalForRedis.__fyteRedis) {
    globalForRedis.__fyteRedis = new Redis(url, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      lazyConnect: true,
    });
    globalForRedis.__fyteRedis.connect().catch(() => {});
  }
  return globalForRedis.__fyteRedis;
}

export function userCacheKeys(userId: string) {
  return {
    diet: `fyte:${userId}:diet:current`,
    workout: `fyte:${userId}:workout:current`,
    coaching: `fyte:${userId}:coaching:advice`,
  };
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedis();
    if (!redis) return null;
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttl = TTL_SECONDS) {
  try {
    const redis = getRedis();
    if (!redis) return;
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  } catch {
    /* Redis down — app still works from the database */
  }
}

export async function cacheDel(...keys: string[]) {
  try {
    const redis = getRedis();
    if (!redis || !keys.length) return;
    await redis.del(...keys);
  } catch {
    /* ignore */
  }
}

export async function clearUserCache(userId: string) {
  const keys = userCacheKeys(userId);
  await cacheDel(keys.diet, keys.workout, keys.coaching);
}

export async function dropCoachingCache(userId: string) {
  await cacheDel(userCacheKeys(userId).coaching);
}
