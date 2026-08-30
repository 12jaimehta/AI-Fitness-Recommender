import { ApiError } from "@backend/shared/lib/errors";

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
  return new Date().toISOString().split("T")[0];
}
