"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/hooks/use-user";
import {
  answerCoachInterview,
  coachCheckin,
  completeCoachInterview,
  getCoachToday,
  seedCoachToday,
  startCoachInterview,
} from "@/lib/service/coach";
import { clampIsoDateToToday, localIsoDate } from "@/shared/lib/plan-tracking";
import { extraStepsCard } from "@/shared/lib/coach/copy";
import { ENERGY_OPTIONS, FEEL_OPTIONS } from "@/shared/lib/coach/questions";
import { fyte } from "@/shared/lib/ui";
import type { CoachInterviewKind, CoachInterviewView, CoachSlotView, CoachToday } from "@/shared/types/coach";
import { ProgressSkeleton } from "@/components/ui/Skeleton";
import FormInput from "@/components/shared/FormInput";
import FormSelect from "@/components/shared/FormSelect";
import { Collapse } from "@/components/shared/Motion";
import DateStrip from "@/components/coach/DateStrip";
import PageHero from "@/components/shared/PageHero";
import InterviewModal from "@/components/coach/InterviewModal";

function statusLine(slot: CoachSlotView) {
  if (slot.status === "as_planned") return "As planned";
  if (slot.status === "replaced") return slot.actualLabel || "Replaced";
  if (slot.status === "ate_other") {
    return slot.actualKcal != null
      ? `${slot.actualLabel || "Different meal"} · ~${slot.actualKcal} kcal`
      : slot.actualLabel || "Different from the plan";
  }
  if (slot.status === "done") return slot.feel === "too_hard" ? "Trained · felt hard" : "Trained";
  if (slot.status === "skipped") return "Skipped";
  return null;
}

const ROW = "flex flex-wrap items-center justify-between gap-3 py-4";
const CHIP = "inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-semibold transition";
const CHIP_PRIMARY = `${CHIP} bg-fyte-ink text-white disabled:opacity-60`;
const CHIP_SECONDARY = `${CHIP} border border-fyte-line bg-fyte-card text-fyte-ink hover:border-fyte-ink disabled:opacity-40`;

export default function CoachClientPage({ initial = null }: { initial?: CoachToday | null }) {
  const { isSignedIn, isLoading: userLoading } = useUser();
  const today = localIsoDate();
  const [date, setDate] = useState(() => clampIsoDateToToday(initial?.date || today, today));
  const [board, setBoard] = useState<CoachToday | null>(initial);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState("");
  const [feel, setFeel] = useState("right");
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [weight, setWeight] = useState(initial?.daily.weightKg != null ? String(initial.daily.weightKg) : "");
  const [sleep, setSleep] = useState(initial?.daily.sleepHours != null ? String(initial.daily.sleepHours) : "");
  const [energy, setEnergy] = useState(initial?.daily.energy || "");
  const [modalKind, setModalKind] = useState<CoachInterviewKind | null>(null);
  const [modalSlot, setModalSlot] = useState<CoachSlotView | null>(null);
  const [interview, setInterview] = useState<CoachInterviewView | null>(null);

  const applyBoard = (next: CoachToday) => {
    setBoard(next);
    setWeight(next.daily.weightKg != null ? String(next.daily.weightKg) : "");
    setSleep(next.daily.sleepHours != null ? String(next.daily.sleepHours) : "");
    setEnergy(next.daily.energy || "");
    setInterview(next.openInterview);
  };

  const load = async (day: string) => {
    setLoading(true);
    setError("");
    setNote("");
    try {
      const next = await getCoachToday(day);
      seedCoachToday(day, next);
      applyBoard(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load today.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLoading || !isSignedIn) return;
    if (initial && date === initial.date) {
      setLoading(false);
      return;
    }
    void load(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, isSignedIn, userLoading]);

  const run = async (id: string, work: () => Promise<{ board: CoachToday; note: string }>) => {
    setBusy(id);
    setError("");
    try {
      const result = await work();
      applyBoard(result.board);
      setNote(result.note);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy("");
    }
  };

  const openInterview = async (slot: CoachSlotView, kind: CoachInterviewKind) => {
    setModalSlot(slot);
    setModalKind(kind);
    setError("");
    if (kind === "meal_other") {
      setInterview(null);
      return;
    }
    setBusy("interview");
    try {
      setInterview(await startCoachInterview({ slot_key: slot.slotKey, kind }, date));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start.");
      setModalKind(null);
      setModalSlot(null);
    } finally {
      setBusy("");
    }
  };

  const closeModal = () => {
    setModalKind(null);
    setModalSlot(null);
  };

  if (userLoading || loading) return <ProgressSkeleton />;

  const daily = board?.daily;
  const walkOpen = Boolean(daily && daily.extraStepsTarget > 0 && daily.extraStepsDone < daily.extraStepsTarget);
  const checkinSaved = Boolean(daily?.weightKg || daily?.sleepHours || daily?.energy);

  return (
    <div className={fyte.page}>
      <PageHero
        photo="coach"
        kicker="Coach"
        title={board?.headline || "Today"}
        subtitle={
          daily
            ? `${daily.mealsLogged || 0} of ${board?.meals.length || 0} meals answered${
                daily.surplusKcal > 0 ? ` · ${Math.round(daily.surplusKcal)} kcal over` : ""
              }`
            : undefined
        }
        aside={
          <div className="rounded-full border border-white/25 bg-white/10 px-2 py-1 backdrop-blur-md [&_button]:text-white [&_button:hover]:bg-white/15 [&_p]:text-white">
            <DateStrip value={date} today={today} onChange={(next) => setDate(clampIsoDateToToday(next, today))} />
          </div>
        }
      />
      <div className="relative z-10 mx-auto -mt-10 max-w-2xl px-4 pb-20 sm:px-6">
        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-fyte-danger">{error}</p> : null}
        {note ? (
          <p className="rounded-xl bg-fyte-ink px-4 py-3 text-sm font-medium text-white shadow-card">{note}</p>
        ) : null}

        {board?.setupRequired ? (
          <section className={`${fyte.card} mt-4`}>
            <p className={fyte.title}>One SQL file to turn the coach on</p>
            <p className={`mt-2 ${fyte.body}`}>{board.setupMessage}</p>
          </section>
        ) : null}

        {board && !board.hasDiet && !board.setupRequired ? (
          <section className={`${fyte.card} mt-4`}>
            <p className={fyte.title}>Start with a plan. Then we coach the week.</p>
            <p className={`mt-2 ${fyte.body}`}>Two short forms. After that, you only tell us what actually happened.</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link href="/diet" className={fyte.primary}>
                Make a diet
              </Link>
              <Link href="/workout" className={fyte.secondary}>
                Make a workout
              </Link>
            </div>
          </section>
        ) : null}

        {walkOpen && daily ? (
          <section className={`${fyte.card} mt-4 flex flex-wrap items-center justify-between gap-4`}>
            <p className="max-w-sm text-sm font-medium text-fyte-ink">
              {extraStepsCard(daily.extraStepsTarget, daily.surplusKcal, daily.delayDays)}
            </p>
            <button
              type="button"
              disabled={Boolean(busy)}
              className={CHIP_PRIMARY}
              onClick={() =>
                run("steps", () => coachCheckin({ action: "steps", extra_steps_done: daily.extraStepsTarget }, date))
              }
            >
              I walked it
            </button>
          </section>
        ) : null}

        {board?.meals.length ? (
          <section className={`${fyte.card} mt-4`}>
            <div className="flex items-baseline justify-between">
              <h2 className={fyte.title}>Meals</h2>
              <p className="text-sm text-fyte-muted">
                {daily?.mealsLogged || 0} / {board.meals.length}
              </p>
            </div>
            <ul className="mt-2 divide-y divide-fyte-line">
              {board.meals.map((meal) => {
                const done = meal.status !== "planned";
                const line = statusLine(meal);
                return (
                  <li key={meal.id} className={ROW}>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-fyte-ink">{meal.title}</p>
                      <p className="text-sm text-fyte-muted">
                        {line ? line : `~${meal.budgetKcal} kcal${meal.budgetProteinG ? ` · ${Math.round(meal.budgetProteinG)} g protein` : ""}`}
                      </p>
                    </div>
                    {!done ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={Boolean(busy)}
                          className={CHIP_PRIMARY}
                          onClick={() =>
                            run(`meal-${meal.slotKey}`, () =>
                              coachCheckin({ action: "as_planned", slot_key: meal.slotKey }, date)
                            )
                          }
                        >
                          Ate it
                        </button>
                        <button
                          type="button"
                          disabled={Boolean(busy)}
                          className={CHIP_SECONDARY}
                          onClick={() => void openInterview(meal, "meal_other")}
                        >
                          Something else
                        </button>
                        <button
                          type="button"
                          disabled={Boolean(busy)}
                          className={CHIP_SECONDARY}
                          onClick={() => void openInterview(meal, "meal_dislike")}
                        >
                          Swap
                        </button>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {board?.session ? (
          <section className={`${fyte.card} mt-4`}>
            <h2 className={fyte.title}>Session</h2>
            <div className={ROW}>
              <div className="min-w-0">
                <p className="truncate font-semibold text-fyte-ink">{board.session.title}</p>
                <p className="text-sm text-fyte-muted">
                  {board.session.isRest
                    ? "Rest day. Tomorrow is the work."
                    : statusLine(board.session) || "Tell us how it went."}
                </p>
              </div>
              {!board.session.isRest && !statusLine(board.session) ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    className={CHIP_PRIMARY}
                    onClick={() => run("session", () => coachCheckin({ action: "session_done", feel }, date))}
                  >
                    Trained
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    className={CHIP_SECONDARY}
                    onClick={() => run("skip", () => coachCheckin({ action: "session_skipped" }, date))}
                  >
                    Skipped
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    className={CHIP_SECONDARY}
                    onClick={() => void openInterview(board.session!, "session_dislike")}
                  >
                    Change
                  </button>
                </div>
              ) : null}
            </div>
            {!board.session.isRest && !statusLine(board.session) ? (
              <FormSelect label="" compact columns={3} value={feel} onChange={setFeel} options={FEEL_OPTIONS} />
            ) : null}
          </section>
        ) : board?.hasDiet ? (
          <section className={`${fyte.card} mt-4 flex flex-wrap items-center justify-between gap-3`}>
            <p className="text-sm text-fyte-muted">No workout yet.</p>
            <Link href="/workout" className={CHIP_SECONDARY}>
              Make a workout
            </Link>
          </section>
        ) : null}

        {board && !board.setupRequired ? (
          <section className={`${fyte.card} mt-4`}>
            <button
              type="button"
              onClick={() => setCheckinOpen((open) => !open)}
              className="flex w-full items-center justify-between text-left"
            >
              <span>
                <span className={fyte.title}>Check-in</span>
                <span className="block text-sm text-fyte-muted">
                  {checkinSaved
                    ? [
                        daily?.weightKg ? `${daily.weightKg} kg` : null,
                        daily?.sleepHours ? `${daily.sleepHours} h sleep` : null,
                        daily?.energy ? `energy ${daily.energy}` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")
                    : "Weight, sleep, energy. Thirty seconds."}
                </span>
              </span>
              <span className="text-sm font-semibold text-fyte-ink">{checkinOpen ? "Close" : "Open"}</span>
            </button>
            <Collapse open={checkinOpen}>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <FormInput label="Weight (kg)" type="number" placeholder="72.4" value={weight} onChange={setWeight} />
                <FormInput label="Sleep (hours)" type="number" placeholder="7" value={sleep} onChange={setSleep} />
              </div>
              <div className="mt-5">
                <FormSelect label="Energy" compact columns={3} value={energy} onChange={setEnergy} options={ENERGY_OPTIONS} />
              </div>
              <button
                type="button"
                disabled={Boolean(busy)}
                className={`${fyte.primary} mt-5`}
                onClick={() =>
                  run("vitals", () =>
                    coachCheckin(
                      {
                        action: "vitals",
                        weight_kg: weight ? Number(weight) : null,
                        sleep_hours: sleep ? Number(sleep) : null,
                        energy: energy || null,
                      },
                      date
                    )
                  ).then(() => setCheckinOpen(false))
                }
              >
                Save
              </button>
            </Collapse>
          </section>
        ) : null}

        {board?.review ? (
          <section className="mt-8 rounded-2xl bg-fyte-ink p-6 text-white shadow-card sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">This week</p>
            <h2 className="mt-2 text-xl font-bold leading-snug">{board.review.headline}</h2>
            <p className="mt-2 text-sm leading-6 text-white/75">{board.review.body}</p>
            <dl className="mt-6 grid grid-cols-3 gap-3">
              {[
                {
                  label: "Sessions",
                  value: board.review.attendancePct == null ? "—" : `${Math.round(board.review.attendancePct)}%`,
                },
                {
                  label: "Meals",
                  value: board.review.mealAdherencePct == null ? "—" : `${Math.round(board.review.mealAdherencePct)}%`,
                },
                {
                  label: "Weight",
                  value:
                    board.review.weightDeltaKg == null
                      ? "—"
                      : `${board.review.weightDeltaKg > 0 ? "+" : ""}${board.review.weightDeltaKg} kg`,
                },
              ].map((item) => (
                <div key={item.label} className={fyte.stat}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-white/60">{item.label}</dt>
                  <dd className="mt-1 text-2xl font-extrabold">{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
      </div>

      <InterviewModal
        open={Boolean(modalKind)}
        kind={modalKind}
        slotTitle={modalSlot?.title || ""}
        interview={interview}
        busy={Boolean(busy)}
        error={error}
        onClose={closeModal}
        onStart={async ({ text, image }) => {
          if (!modalSlot || !modalKind) return;
          setBusy("interview");
          setError("");
          try {
            setInterview(await startCoachInterview({ slot_key: modalSlot.slotKey, kind: modalKind, text, image }, date));
          } catch (err) {
            setError(err instanceof Error ? err.message : "Could not start.");
          } finally {
            setBusy("");
          }
        }}
        onAnswer={async (questionId, value) => {
          if (!interview) return;
          setBusy("answer");
          setError("");
          try {
            setInterview(await answerCoachInterview(interview.id, questionId, value));
          } catch (err) {
            setError(err instanceof Error ? err.message : "Could not save.");
          } finally {
            setBusy("");
          }
        }}
        onComplete={async (optionId) => {
          if (!interview) return;
          setBusy("complete");
          setError("");
          try {
            const result = await completeCoachInterview(interview.id, optionId, date);
            applyBoard(result.board);
            setNote(result.note);
            setInterview(null);
            closeModal();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Could not save.");
          } finally {
            setBusy("");
          }
        }}
      />
    </div>
  );
}
