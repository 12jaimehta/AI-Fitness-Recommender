import { Redis } from "@upstash/redis";

const TTL_SECONDS = 60 * 60 * 24 * 30;
const COMMAND_MS = 400;
const DOWN_MS = 10_000;
const FAIL_STREAK_BEFORE_DOWN = 3;

type RedisGlobal = {
  __fyteUpstash?: Redis;
  __fyteRedisDownUntil?: number;
  __fyteRedisFailStreak?: number;
};

function markRedisDown() {
  const globalForRedis = globalThis as RedisGlobal;
  globalForRedis.__fyteRedisDownUntil = Date.now() + DOWN_MS;
  globalForRedis.__fyteUpstash = undefined;
  globalForRedis.__fyteRedisFailStreak = 0;
}

function noteRedisFailure() {
  const globalForRedis = globalThis as RedisGlobal;
  const streak = (globalForRedis.__fyteRedisFailStreak || 0) + 1;
  globalForRedis.__fyteRedisFailStreak = streak;
  if (streak >= FAIL_STREAK_BEFORE_DOWN) markRedisDown();
}

function noteRedisOk() {
  (globalThis as RedisGlobal).__fyteRedisFailStreak = 0;
}

function redisIsSkipped() {
  return Date.now() < ((globalThis as RedisGlobal).__fyteRedisDownUntil || 0);
}

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || redisIsSkipped()) return null;

  const globalForRedis = globalThis as RedisGlobal;
  if (!globalForRedis.__fyteUpstash) {
    globalForRedis.__fyteUpstash = new Redis({ url, token });
  }
  return globalForRedis.__fyteUpstash;
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
      work.then((value) => {
        noteRedisOk();
        return value;
      }),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), COMMAND_MS);
      }),
    ]);
    return raced;
  } catch {
    noteRedisFailure();
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;
  const raw = await withBudget(redis.get<T>(key));
  return raw ?? null;
}

export async function cacheSet(key: string, value: unknown, ttl = TTL_SECONDS) {
  const redis = getRedis();
  if (!redis) return;
  await withBudget(redis.set(key, value, { ex: ttl }));
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
