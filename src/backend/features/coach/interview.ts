import { resolveAuth } from "@backend/shared/api/supabase";
import { ApiError } from "@backend/shared/lib/errors";
import { parseLogDate } from "@backend/features/progress/db";
import { applyMealAdders } from "@/shared/lib/coach/adders";
import { mealOtherCopy, replacedMealCopy } from "@/shared/lib/coach/copy";
import {
  extraStepsForSurplus,
  goalDelayDays,
  midKcal,
  surplusVsBudget,
} from "@/shared/lib/coach/ledger";
import {
  DISLIKE_QUESTIONS,
  remainingQuestions,
  questionsForUnknowns,
  SESSION_DISLIKE_QUESTIONS,
} from "@/shared/lib/coach/questions";
import type {
  CoachInterviewKind,
  CoachInterviewView,
  CoachMealDraft,
  CoachQuestion,
  CoachSwapOption,
} from "@/shared/types/coach";
import { parseMeal, proposeMealSwaps } from "./ai";
import { getTodayBoard, listSlots, projectDaily, bumpCoachCache, ensureDay } from "./board";
import { throwIfCoachSchemaMissing } from "./db";
import { hateList, insertEvent, rememberPreference } from "./events";
import { patchDietSlot } from "./patch-plan";

function assertImage(dataUrl: string) {
  if (!dataUrl.startsWith("data:image/")) {
    throw new ApiError("Upload a photo of the plate.", 400);
  }
  if (dataUrl.length > 2_000_000) {
    throw new ApiError("Photo is too large. Use a closer shot.", 400);
  }
}

function viewFromRow(
  row: Record<string, unknown>,
  slotTitle: string,
  slotKey: string
): CoachInterviewView {
  const draft = row.draft && typeof row.draft === "object" ? (row.draft as CoachMealDraft) : null;
  return {
    id: String(row.id),
    kind: row.kind as CoachInterviewKind,
    slotId: String(row.slot_id || ""),
    slotKey,
    slotTitle,
    status: "open",
    questions: Array.isArray(row.questions) ? (row.questions as CoachQuestion[]) : [],
    answers: (row.answers as Record<string, string>) || {},
    draft,
    options: Array.isArray(row.options) ? (row.options as CoachSwapOption[]) : [],
    headline: draft?.explanation || "A couple of details, like a trainer would ask.",
  };
}

async function closeOpen(auth: Awaited<ReturnType<typeof resolveAuth>>, date: string) {
  await auth.supabase
    .from("coach_interviews")
    .update({ status: "abandoned" })
    .eq("user_id", auth.user.id)
    .eq("date", date)
    .eq("status", "open");
}

export async function startInterview(input: {
  date?: string;
  slot_key: string;
  kind: CoachInterviewKind;
  text?: string;
  image?: string;
}) {
  const auth = await resolveAuth();
  const date = parseLogDate(input.date);
  await ensureDay(date, auth);
  const slots = await listSlots(auth, date);
  const kind = input.kind === "session_dislike" ? "session" : "meal";
  const slotKey = input.kind === "session_dislike" ? "workout" : input.slot_key;
  const slot = slots.find((item) => item.kind === kind && item.slot_key === slotKey);
  if (!slot) throw new ApiError("That slot is not on today's plan.", 400);

  if (input.image) assertImage(input.image);
  await closeOpen(auth, date);

  let questions: CoachQuestion[] = [];
  let draft: CoachMealDraft | null = null;
  let headline = "A couple of details.";

  if (input.kind === "meal_other") {
    const text = String(input.text || "").trim();
    if (!text && !input.image) throw new ApiError("Tell us what you had, or add a photo.", 400);
    draft = await parseMeal({
      userId: auth.user.id,
      slotTitle: slot.title,
      budgetKcal: slot.budget_kcal,
      text: text || "Photo of the plate",
      imageDataUrl: input.image,
    });
    questions = questionsForUnknowns(draft.unknowns);
    headline = draft.explanation;
  } else if (input.kind === "meal_dislike") {
    questions = DISLIKE_QUESTIONS;
    headline = "We'll replace this meal only. The rest of the day stays.";
  } else {
    questions = SESSION_DISLIKE_QUESTIONS;
    headline = "We'll change today's session, not the whole split.";
  }

  const { data, error } = await auth.supabase
    .from("coach_interviews")
    .insert({
      user_id: auth.user.id,
      slot_id: slot.id,
      date,
      kind: input.kind,
      questions,
      answers: {},
      draft: draft || {},
      options: [],
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    })
    .select()
    .single();
  throwIfCoachSchemaMissing(error);
  if (error) throw new ApiError(error.message, 400);
  await insertEvent(auth, { date, slotId: slot.id, kind: "interview_start", payload: { interview: input.kind } });
  await bumpCoachCache(auth.user.id, date);
  return viewFromRow(data as Record<string, unknown>, slot.title, slot.slot_key);
}

async function loadOpen(auth: Awaited<ReturnType<typeof resolveAuth>>, id: string) {
  const { data, error } = await auth.supabase
    .from("coach_interviews")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .maybeSingle();
  throwIfCoachSchemaMissing(error);
  if (!data) throw new ApiError("That question is no longer open.", 400);
  if (String(data.status) !== "open") throw new ApiError("That question is no longer open.", 400);
  if (data.expires_at && new Date(String(data.expires_at)).getTime() < Date.now()) {
    await auth.supabase.from("coach_interviews").update({ status: "abandoned" }).eq("id", id);
    throw new ApiError("That check-in expired. Start again.", 400);
  }
  return data as Record<string, unknown>;
}

export async function answerInterview(input: { interview_id: string; question_id: string; value: string }) {
  const auth = await resolveAuth();
  const row = await loadOpen(auth, input.interview_id);
  const questions = (row.questions as CoachQuestion[]) || [];
  const allowed = questions.find((question) => question.id === input.question_id);
  if (!allowed) throw new ApiError("That wasn't one of the options.", 400);
  if (!allowed.options.some((option) => option.value === input.value)) {
    throw new ApiError("Pick one of the options.", 400);
  }
  const answers = { ...((row.answers as Record<string, string>) || {}), [input.question_id]: input.value };
  let options = (row.options as CoachSwapOption[]) || [];

  const slots = await listSlots(auth, String(row.date).slice(0, 10));
  const slot = slots.find((item) => item.id === String(row.slot_id));

  if (row.kind === "meal_dislike" && !remainingQuestions(questions, answers) && slot && !options.length) {
    const hates = await hateList(auth);
    options = await proposeMealSwaps({
      userId: auth.user.id,
      slotTitle: slot.title,
      budgetKcal: slot.budget_kcal,
      proteinG: slot.budget_protein_g,
      preference: answers.instead || "",
      why: answers.why || "",
      instead: answers.instead || "",
      hates,
    });
  }

  const { data, error } = await auth.supabase
    .from("coach_interviews")
    .update({ answers, options })
    .eq("id", input.interview_id)
    .eq("user_id", auth.user.id)
    .select()
    .single();
  throwIfCoachSchemaMissing(error);
  if (error) throw new ApiError(error.message, 400);
  return viewFromRow(data as Record<string, unknown>, slot?.title || "", slot?.slot_key || "");
}

export async function completeInterview(input: { interview_id: string; option_id?: string }) {
  const auth = await resolveAuth();
  const row = await loadOpen(auth, input.interview_id);
  const date = String(row.date).slice(0, 10);
  const answers = (row.answers as Record<string, string>) || {};
  const questions = (row.questions as CoachQuestion[]) || [];
  if (remainingQuestions(questions, answers)) {
    throw new ApiError("Answer the questions first.", 400);
  }

  const slots = await listSlots(auth, date);
  const slot = slots.find((item) => item.id === String(row.slot_id));
  if (!slot) throw new ApiError("That slot is gone.", 400);

  let note = "";

  if (row.kind === "meal_other") {
    const draft = (row.draft || {}) as CoachMealDraft;
    const base = midKcal(draft.kcal_low || 400, draft.kcal_high || 550);
    const actual = applyMealAdders(base, answers);
    const surplus = surplusVsBudget(actual, slot.budget_kcal);
    const steps = extraStepsForSurplus(Math.max(0, surplus));
    const delay = goalDelayDays(Math.max(0, surplus));
    const { error } = await auth.supabase
      .from("coach_slots")
      .update({
        status: "ate_other",
        actual_kcal: actual,
        actual_protein_g: draft.protein_g || null,
        actual_label: draft.meal_name || "Different meal",
      })
      .eq("id", slot.id)
      .eq("user_id", auth.user.id);
    throwIfCoachSchemaMissing(error);
    note = mealOtherCopy({
      food: draft.meal_name || "That meal",
      actual,
      budget: slot.budget_kcal,
      surplus: Math.max(0, surplus),
      steps,
      delayDays: delay,
      answers,
    });
  }

  if (row.kind === "meal_dislike") {
    const options = (row.options as CoachSwapOption[]) || [];
    const picked = options.find((option) => option.id === input.option_id) || options[0];
    if (!picked) throw new ApiError("Pick one of the meals.", 400);
    await patchDietSlot(auth, date, slot.slot_key, picked);
    const { error } = await auth.supabase
      .from("coach_slots")
      .update({
        status: "replaced",
        title: picked.name,
        budget_kcal: picked.calories,
        budget_protein_g: picked.protein,
        actual_kcal: picked.calories,
        actual_protein_g: picked.protein,
        actual_label: picked.name,
      })
      .eq("id", slot.id)
      .eq("user_id", auth.user.id);
    throwIfCoachSchemaMissing(error);
    if (answers.why === "hate_food") {
      await rememberPreference(auth, `dislike:${slot.slot_key}`, slot.title);
    }
    note = replacedMealCopy(picked.name, picked.calories);
  }

  if (row.kind === "session_dislike") {
    const minutes = answers.minutes || "30";
    const title =
      answers.why === "tired"
        ? "Easy walk / mobility"
        : answers.why === "sore"
          ? "Leave the sore part out"
          : `${minutes}-min session`;
    const { error } = await auth.supabase
      .from("coach_slots")
      .update({
        status: "replaced",
        title,
        actual_label: title,
      })
      .eq("id", slot.id)
      .eq("user_id", auth.user.id);
    throwIfCoachSchemaMissing(error);
    await rememberPreference(auth, "session:last_block", answers.why || "");
    note = `${title} is in for today. The rest of the week stays.`;
  }

  await auth.supabase
    .from("coach_interviews")
    .update({ status: "applied" })
    .eq("id", input.interview_id)
    .eq("user_id", auth.user.id);
  await insertEvent(auth, {
    date,
    slotId: slot.id,
    kind: "interview_complete",
    payload: { kind: row.kind, answers },
  });
  await projectDaily(auth, date);
  const board = await getTodayBoard(date, auth);
  return { board, note };
}

export async function abandonInterview(interviewId: string) {
  const auth = await resolveAuth();
  await auth.supabase
    .from("coach_interviews")
    .update({ status: "abandoned" })
    .eq("id", interviewId)
    .eq("user_id", auth.user.id);
  return { ok: true };
}
