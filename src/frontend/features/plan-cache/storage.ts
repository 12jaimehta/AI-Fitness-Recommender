import { api } from "@frontend/shared/api/http";

const LEGACY_KEYS = [
  "fyte.generated-diet-plan",
  "fyte.generated-workout-plan",
  "fyte.last-workout-form",
];

export function purgeLegacyPlanStorage() {
  if (typeof window === "undefined") return;
  for (const key of LEGACY_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* private mode */
    }
    try {
      sessionStorage.removeItem(key);
    } catch {
      /* private mode */
    }
  }
}

export async function persistPlanCache(payload: {
  diet?: unknown;
  workout?: unknown;
}) {
  try {
    await api("/api/cache", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  } catch {
    /* guest, offline, or Redis down — memory still holds the plan */
  }
}

export async function dropServerPlanCache() {
  try {
    await api("/api/cache", { method: "DELETE" });
  } catch {
    /* already signed out */
  }
}
