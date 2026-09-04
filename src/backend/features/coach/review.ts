import { resolveAuth, type AuthCtx } from "@backend/shared/api/supabase";
import { parseLogDate } from "@backend/features/progress/db";
import { addDaysIso, weekStartMonday } from "@/shared/lib/plan-tracking";
import { coerceProgramGoal } from "@/shared/lib/program-goals";
import { buildWeekReview, mealFollowed } from "@/shared/lib/coach/review";
import type { CoachWeekReviewView } from "@/shared/types/coach";
import { throwIfCoachSchemaMissing } from "./db";

export async function computeWeekReview(dateInput?: string | null, auth?: AuthCtx): Promise<CoachWeekReviewView | null> {
  const resolved = await resolveAuth(auth);
  const date = parseLogDate(dateInput);
  const weekStart = weekStartMonday(date);
  const weekEnd = addDaysIso(weekStart, 6);
  const lookbackStart = addDaysIso(date, -27);

  const [{ data: days, error: daysError }, { data: profile }, { data: measures, error: measureError }] =
    await Promise.all([
      resolved.supabase
        .from("coach_daily")
        .select("*")
        .eq("user_id", resolved.user.id)
        .gte("date", lookbackStart)
        .lte("date", date)
        .order("date", { ascending: true }),
      resolved.supabase.from("coach_profiles").select("goal").eq("user_id", resolved.user.id).maybeSingle(),
      resolved.supabase
        .from("coach_measurements")
        .select("date, waist_cm")
        .eq("user_id", resolved.user.id)
        .gte("date", lookbackStart)
        .order("date", { ascending: true }),
    ]);
  throwIfCoachSchemaMissing(daysError);
  throwIfCoachSchemaMissing(measureError);

  const rows = days || [];
  if (!rows.length) return null;

  const thisWeek = rows.filter((row) => String(row.date).slice(0, 10) >= weekStart && String(row.date).slice(0, 10) <= weekEnd);
  const weights = rows
    .map((row) => ({ date: String(row.date).slice(0, 10), kg: row.weight_kg == null ? null : Number(row.weight_kg) }))
    .filter((row) => row.kg && row.kg > 0) as { date: string; kg: number }[];

  const latest = weights[weights.length - 1];
  const prior = weights.find((row) => addDaysIso(row.date, 0) <= addDaysIso(date, -7)) || weights[0];
  const spanDays =
    latest && prior ? Math.max(0, Math.round((Date.parse(latest.date) - Date.parse(prior.date)) / 86400000)) : 0;
  const weightDeltaKg = latest && prior && latest !== prior ? Math.round((latest.kg - prior.kg) * 10) / 10 : null;

  const waist = (measures || [])
    .map((row) => ({ date: String(row.date).slice(0, 10), cm: row.waist_cm == null ? null : Number(row.waist_cm) }))
    .filter((row) => row.cm && row.cm > 0) as { date: string; cm: number }[];
  const waistDeltaCm =
    waist.length >= 2 ? Math.round((waist[waist.length - 1].cm - waist[0].cm) * 10) / 10 : null;

  let mealsPlanned = 0;
  let mealsFollowed = 0;
  let sessionsPlanned = 0;
  let sessionsDone = 0;
  let lowEnergyDays = 0;
  for (const row of thisWeek) {
    mealsPlanned += Number(row.meals_planned || 0);
    mealsFollowed += Number(row.meals_logged || 0);
    if (row.session_planned) {
      sessionsPlanned += 1;
      if (row.session_done) sessionsDone += 1;
    }
    if (row.energy === "low") lowEnergyDays += 1;
  }

  const { data: slotRows } = await resolved.supabase
    .from("coach_slots")
    .select("status, kind")
    .eq("user_id", resolved.user.id)
    .gte("date", weekStart)
    .lte("date", weekEnd);
  const mealSlots = (slotRows || []).filter((row) => row.kind === "meal");
  mealsFollowed = mealSlots.filter((row) => mealFollowed(String(row.status))).length;
  mealsPlanned = mealSlots.length || mealsPlanned;

  const highAdherence =
    mealsPlanned > 0
      ? mealsFollowed / mealsPlanned >= 0.8 && (sessionsPlanned === 0 || sessionsDone / sessionsPlanned >= 0.75)
      : false;

  const built = buildWeekReview({
    goal: coerceProgramGoal(profile?.goal) || null,
    daysLogged: thisWeek.length,
    sessionsPlanned,
    sessionsDone,
    mealsPlanned,
    mealsFollowed,
    weightDeltaKg,
    waistDeltaCm,
    spanDays,
    highAdherence,
    lowEnergyDays,
  });

  const view: CoachWeekReviewView = {
    weekStart,
    attendancePct: built.attendancePct,
    mealAdherencePct: built.mealAdherencePct,
    weightAvgKg: weights.length
      ? Math.round((weights.reduce((sum, row) => sum + row.kg, 0) / weights.length) * 10) / 10
      : null,
    weightDeltaKg,
    waistDeltaCm,
    decision: built.decision,
    headline: built.headline,
    body: built.body,
  };

  await resolved.supabase.from("coach_week_reviews").upsert(
    {
      user_id: resolved.user.id,
      week_start: weekStart,
      attendance_pct: view.attendancePct,
      meal_adherence_pct: view.mealAdherencePct,
      weight_avg_kg: view.weightAvgKg,
      weight_delta_kg: view.weightDeltaKg,
      waist_delta_cm: view.waistDeltaCm,
      decision: view.decision,
      headline: view.headline,
      body: view.body,
    },
    { onConflict: "user_id,week_start" }
  );

  return view;
}
