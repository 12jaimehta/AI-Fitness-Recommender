const DEFAULT_MS = 8_000;

export function timedFetch(timeoutMs = DEFAULT_MS): typeof fetch {
  return async (input, init) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const parent = init?.signal;
    if (parent) {
      if (parent.aborted) controller.abort();
      else parent.addEventListener("abort", () => controller.abort(), { once: true });
    }
    try {
      return await fetch(input, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  };
}

export async function withTimeout<T>(
  work: Promise<T>,
  timeoutMs = DEFAULT_MS,
  message = "That took too long. Try again."
) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function isAuthReachabilityError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");
  return /fetch failed|failed to fetch|network|abort|timeout|took too long|ENOTFOUND|ECONNREFUSED|AuthRetryable/i.test(
    message
  );
}

export function authReachabilityMessage(error?: unknown) {
  if (error && !isAuthReachabilityError(error) && error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return "Could not reach the login server. Check your internet and try again.";
}
