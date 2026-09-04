import type { AuthCtx } from "@backend/shared/api/supabase";
import { throwIfCoachSchemaMissing } from "./db";

export async function insertEvent(
  auth: AuthCtx,
  input: {
    date: string;
    slotId?: string | null;
    kind: string;
    payload?: Record<string, unknown>;
    clientEventId?: string | null;
  }
) {
  const row = {
    user_id: auth.user.id,
    date: input.date,
    slot_id: input.slotId || null,
    kind: input.kind,
    payload: input.payload || {},
    client_event_id: input.clientEventId || null,
  };
  const { error } = await auth.supabase.from("coach_events").insert(row);
  if (error && /duplicate|unique/i.test(error.message)) return;
  throwIfCoachSchemaMissing(error);
  if (error) throw error;
}

export async function rememberPreference(auth: AuthCtx, key: string, value: string, source = "interview") {
  const { error } = await auth.supabase.from("coach_preferences").insert({
    user_id: auth.user.id,
    key,
    value: value.slice(0, 120),
    source,
  });
  throwIfCoachSchemaMissing(error);
}

export async function latestPreferences(auth: AuthCtx, limit = 24) {
  const { data, error } = await auth.supabase
    .from("coach_preferences")
    .select("key, value")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  throwIfCoachSchemaMissing(error);
  const map = new Map<string, string>();
  for (const row of data || []) {
    const key = String((row as { key: string }).key);
    if (!map.has(key)) map.set(key, String((row as { value: string }).value));
  }
  return map;
}

export async function hateList(auth: AuthCtx) {
  const prefs = await latestPreferences(auth);
  return [...prefs.entries()].filter(([key]) => key.startsWith("dislike:")).map(([, value]) => value);
}
