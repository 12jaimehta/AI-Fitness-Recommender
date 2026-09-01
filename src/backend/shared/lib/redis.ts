import Redis from "ioredis";

const TTL_SECONDS = 60 * 60 * 24 * 30;
const CONNECT_MS = 200;
const COMMAND_MS = 250;
const DOWN_MS = 60_000;

type RedisGlobal = {
  __fyteRedisFast?: Redis;
  __fyteRedisDownUntil?: number;
};

function redisUrl() {
  return process.env.REDIS_URL || "";
}

function markRedisDown() {
  (globalThis as RedisGlobal).__fyteRedisDownUntil = Date.now() + DOWN_MS;
}

function redisIsSkipped() {
  return Date.now() < ((globalThis as RedisGlobal).__fyteRedisDownUntil || 0);
}

export function getRedis(): Redis | null {
  const url = redisUrl();
  if (!url || redisIsSkipped()) return null;

  const globalForRedis = globalThis as RedisGlobal;
  if (!globalForRedis.__fyteRedisFast) {
    const redis = new Redis(url, {
      maxRetriesPerRequest: 0,
      enableReadyCheck: false,
      enableOfflineQueue: false,
      lazyConnect: true,
      connectTimeout: CONNECT_MS,
      commandTimeout: COMMAND_MS,
      retryStrategy() {
        return null;
      },
    });
    redis.on("error", () => {
      markRedisDown();
    });
    redis.on("end", () => {
      markRedisDown();
    });
    globalForRedis.__fyteRedisFast = redis;
  }
  return globalForRedis.__fyteRedisFast;
}

export function userCacheKeys(userId: string) {
  return {
    diet: `fyte:${userId}:diet:current`,
    workout: `fyte:${userId}:workout:current`,
    coaching: `fyte:${userId}:coaching:advice`,
  };
}

async function withBudget<T>(work: Promise<T>): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const raced = await Promise.race([
      work,
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), COMMAND_MS);
      }),
    ]);
    if (raced === null) markRedisDown();
    return raced;
  } catch {
    markRedisDown();
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;
  const raw = await withBudget(redis.get(key));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttl = TTL_SECONDS) {
  const redis = getRedis();
  if (!redis) return;
  await withBudget(redis.set(key, JSON.stringify(value), "EX", ttl));
}

export async function cacheDel(...keys: string[]) {
  const redis = getRedis();
  if (!redis || !keys.length) return;
  await withBudget(redis.del(...keys));
}

export async function clearUserCache(userId: string) {
  const keys = userCacheKeys(userId);
  await cacheDel(keys.diet, keys.workout, keys.coaching);
}

export async function dropCoachingCache(userId: string) {
  await cacheDel(userCacheKeys(userId).coaching);
}
