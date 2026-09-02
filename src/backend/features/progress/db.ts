import { ApiError } from "@backend/shared/lib/errors";
import { addDaysIso, localIsoDate, parseIsoDate } from "@/shared/lib/plan-tracking";

export function throwIfSchemaMissing(error: { message?: string } | null) {
  if (!error) return;
  const message = error.message || "";
  if (/does not exist|schema cache|could not find the table/i.test(message)) {
    throw new ApiError(
      "Paste supabase/schema/04_progress_tracking.sql in the Supabase SQL editor, then try again.",
      400
    );
  }
}

export function utcToday() {
  return localIsoDate();
}

export function parseLogDate(value?: string | null) {
  const today = utcToday();
  const date = parseIsoDate(value, today);
  if (date > today) {
    throw new ApiError("You can only log today or past days.", 400);
  }
  return date;
}

/** YYYY-MM-DD from a DATE or timestamptz value. */
export function civilDate(value: unknown, fallback = "") {
  return parseIsoDate(String(value ?? ""), fallback);
}

export function nextCivilDay(date: string) {
  return addDaysIso(date, 1);
}
