import { completeJson } from "@backend/shared/api/grok";
import { requireUser } from "@backend/shared/api/supabase";
import { cacheGet, cacheSet, userCacheKeys } from "@backend/shared/lib/redis";
import type { CoachingAdvice, CoachingStatus, PlateauFlag } from "@/shared/types/progress-tracking";
import { buildCoachingPrompt, coerceCalorieChange } from "@backend/ai/prompts/coaching";
import { retrieveCoachingContext, type CoachingContext } from "./retrieve";
import { fallbackCoachingAdvice } from "./fallback";
import type { CoachingFacts, CoachingNote } from "./memory";

const COACHING_TTL = 60 * 60 * 12;

type CachedAdvice = {
  fingerprint: string;
  advice: CoachingAdvice;
};

function clampCalories(value: unknown, current: number | null) {
  const n = Number(value);
  if (!Number.isFinite(n)) return current;
  return Math.min(4500, Math.max(1400, Math.round(n)));
}

function asStatus(value: unknown, flags: PlateauFlag[]): CoachingStatus {
  const allowed: CoachingStatus[] = ["learning", "on_track", "watch", "plateau", "needs_new_plan"];
  if (!flags.length) {
    if (value === "learning") return "learning";
    return "on_track";
  }
  if (typeof value === "string" && allowed.includes(value as CoachingStatus)) return value as CoachingStatus;
  if (flags.includes("weight_loss_plateau") || flags.includes("stale_diet")) return "needs_new_plan";
  return "watch";
}

function applyGuardrails(raw: Partial<CoachingAdvice> & { memory_note?: string }, ctx: CoachingContext): CoachingAdvice {
  const fallback = fallbackCoachingAdvice(ctx);
  const plateau = ctx.flags.includes("weight_loss_plateau");
  const shouldChangeDiet =
    Boolean(raw.diet?.should_change) || plateau || ctx.flags.includes("stale_diet");
  const shouldChangeWorkout =
    Boolean(raw.workout?.should_change) ||
    ctx.flags.includes("stale_workout") ||
    ctx.flags.includes("training_stagnation");

  return {
    headline: String(raw.headline || fallback.headline).slice(0, 180),
    status: asStatus(raw.status, ctx.flags),
    plateau,
    flags: ctx.flags,
    reasons: ctx.reasons.length ? ctx.reasons : fallback.reasons,
    remembered: String(raw.memory_note || fallback.remembered).slice(0, 240),
    diet: {
      should_change: shouldChangeDiet,
      summary: String(raw.diet?.summary || fallback.diet.summary).slice(0, 280),
      calorie_change: coerceCalorieChange(raw.diet?.calorie_change, ctx.facts.diet_goal),
      suggested_calories: clampCalories(raw.diet?.suggested_calories, ctx.diet?.calorieTarget || null),
      protein_note: String(raw.diet?.protein_note || fallback.diet.protein_note).slice(0, 180),
      meal_tweaks: (raw.diet?.meal_tweaks || fallback.diet.meal_tweaks)
        .map((item) => String(item).slice(0, 160))
        .filter(Boolean)
        .slice(0, 3),
    },
    workout: {
      should_change: shouldChangeWorkout,
      summary: String(raw.workout?.summary || fallback.workout.summary).slice(0, 280),
      action: String(raw.workout?.action || fallback.workout.action).slice(0, 180),
    },
  };
}

async function persistAdvice(ctx: CoachingContext, advice: CoachingAdvice) {
  try {
    const { supabase, user } = await requireUser();
    const facts: CoachingFacts = {
      ...ctx.facts,
      last_plateau_flags: ctx.flags,
      last_calorie_suggestion: advice.diet.suggested_calories,
    };
    const note: CoachingNote = {
      at: new Date().toISOString(),
      text: advice.remembered,
      flags: ctx.flags,
    };
    const notes = [...ctx.memory.notes, note].slice(-12);
    await supabase.from("user_coaching_memory").upsert({
      user_id: user.id,
      facts,
      notes,
      last_advice: advice,
      last_advice_at: new Date().toISOString(),
      fingerprint: ctx.fingerprint,
    });
    await supabase.from("user_coaching_advice").insert({
      user_id: user.id,
      plateau_flags: ctx.flags,
      diet_plan_id: ctx.diet?.id,
      workout_plan_id: ctx.workout?.id,
      advice,
    });
  } catch {
    /* schema 09 not pasted yet — still return advice */
  }
}

async function generateAdvice(ctx: CoachingContext): Promise<CoachingAdvice> {
  try {
    const raw = await completeJson<Partial<CoachingAdvice> & { memory_note?: string }>(
      buildCoachingPrompt(ctx),
      {
        maxTokens: 700,
        system:
          "You are Fyte AI's coach. Reply with valid JSON only. No medical claims. Obey the plateau flags.",
      }
    );
    return applyGuardrails(raw, ctx);
  } catch {
    return fallbackCoachingAdvice(ctx);
  }
}

export async function getCoachingAdvice(force = false): Promise<CoachingAdvice> {
  const { user } = await requireUser();
  const ctx = await retrieveCoachingContext();
  const key = userCacheKeys(user.id).coaching;

  if (!force) {
    const cached = await cacheGet<CachedAdvice>(key);
    if (cached?.advice && cached.fingerprint === ctx.fingerprint) return cached.advice;
    if (ctx.memory.last_advice && ctx.memory.fingerprint === ctx.fingerprint) {
      await cacheSet(key, { fingerprint: ctx.fingerprint, advice: ctx.memory.last_advice }, COACHING_TTL);
      return ctx.memory.last_advice;
    }
  }

  const advice = await generateAdvice(ctx);
  await persistAdvice(ctx, advice);
  await cacheSet(key, { fingerprint: ctx.fingerprint, advice }, COACHING_TTL);
  return advice;
}
