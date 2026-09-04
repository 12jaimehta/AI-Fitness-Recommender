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
import PageBreadcrumb from "@/components/shared/PageBreadcrumb";
import FormInput from "@/components/shared/FormInput";
import FormSelect from "@/components/shared/FormSelect";
import DayCalendar from "@/components/progress/DayCalendar";
import InterviewModal from "@/components/coach/InterviewModal";

function statusLine(slot: CoachSlotView) {
  if (slot.status === "as_planned") return "As planned";
  if (slot.status === "replaced") return slot.actualLabel || "Replaced this slot";
  if (slot.status === "ate_other") {
    return slot.actualKcal != null
      ? `${slot.actualLabel || "Different meal"} · ~${slot.actualKcal} kcal`
      : slot.actualLabel || "Different from the plan";
  }
  if (slot.status === "done") return slot.feel === "too_hard" ? "Trained · felt hard" : "Trained";
  if (slot.status === "skipped") return "Skipped";
  return null;
}

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
  const [weight, setWeight] = useState(initial?.daily.weightKg != null ? String(initial.daily.weightKg) : "");
  const [sleep, setSleep] = useState(initial?.daily.sleepHours != null ? String(initial.daily.sleepHours) : "");
  const [energy, setEnergy] = useState(initial?.daily.energy || "");
  const [modalKind, setModalKind] = useState<CoachInterviewKind | null>(null);
  const [modalSlot, setModalSlot] = useState<CoachSlotView | null>(null);
  const [interview, setInterview] = useState<CoachInterviewView | null>(null);

  const load = async (day: string, silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const next = await getCoachToday(day);
      setBoard(next);
      seedCoachToday(day, next);
      setWeight(next.daily.weightKg != null ? String(next.daily.weightKg) : "");
      setSleep(next.daily.sleepHours != null ? String(next.daily.sleepHours) : "");
      setEnergy(next.daily.energy || "");
      setInterview(next.openInterview);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load today.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLoading) return;
    if (!isSignedIn) return;
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
      setBoard(result.board);
      setNote(result.note);
      setInterview(result.board.openInterview);
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
      const next = await startCoachInterview({ slot_key: slot.slotKey, kind }, date);
      setInterview(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start.");
      setModalKind(null);
      setModalSlot(null);
    } finally {
      setBusy("");
    }
  };

  if (userLoading || loading) return <ProgressSkeleton />;

  return (
    <div className={fyte.page}>
      <div className={fyte.shell}>
        <PageBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Coach" }]} />
        <h1 className="text-2xl font-bold text-fyte-ink">Coach</h1>
        <p className="mt-1 max-w-2xl text-sm text-fyte-muted">
          We watch the week. We change the meal or session that slipped — not the whole plan. No lectures.
        </p>

        {error ? <p className="mt-4 text-sm text-fyte-danger">{error}</p> : null}
        {note ? <p className="mt-4 text-sm font-medium text-fyte-ink">{note}</p> : null}

        {board?.setupRequired ? (
          <section className={`${fyte.card} mt-6`}>
            <p className={fyte.title}>One SQL file to turn the coach on</p>
            <p className={`mt-2 ${fyte.body}`}>{board.setupMessage}</p>
          </section>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_16rem]">
          <div className="space-y-6">
            <section className={fyte.card}>
              <p className={fyte.kicker}>Today</p>
              <h2 className={`mt-1 ${fyte.title}`}>{board?.headline || "Today"}</h2>
              {!board?.hasDiet ? (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Link href="/diet" className={fyte.primary}>
                    Make a diet plan
                  </Link>
                  <Link href="/workout" className={fyte.secondary}>
                    Make a workout
                  </Link>
                </div>
              ) : null}
            </section>

            {board && board.daily.extraStepsTarget > 0 ? (
              <section className={fyte.card}>
                <p className={fyte.kicker}>Same-day hold</p>
                <p className={`mt-1 ${fyte.title}`}>
                  {board.daily.extraStepsDone >= board.daily.extraStepsTarget
                    ? "Extra walk is in."
                    : extraStepsCard(
                        board.daily.extraStepsTarget,
                        board.daily.surplusKcal,
                        board.daily.delayDays
                      )}
                </p>
                {board.daily.extraStepsDone < board.daily.extraStepsTarget ? (
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    className={`${fyte.primary} mt-4`}
                    onClick={() =>
                      run("steps", () =>
                        coachCheckin({ action: "steps", extra_steps_done: board.daily.extraStepsTarget }, date)
                      )
                    }
                  >
                    I walked it
                  </button>
                ) : null}
              </section>
            ) : null}

            {board?.meals.length ? (
              <section className={fyte.card}>
                <p className={fyte.kicker}>Meals</p>
                <p className={`mt-1 ${fyte.body}`}>As planned, something else, or replace this slot only.</p>
                <ul className="mt-5 space-y-4">
                  {board.meals.map((meal) => {
                    const done = meal.status !== "planned";
                    return (
                      <li key={meal.id} className={fyte.panel}>
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-fyte-ink">{meal.title}</p>
                            <p className="text-sm text-fyte-muted">
                              ~{meal.budgetKcal} kcal
                              {meal.budgetProteinG ? ` · ${Math.round(meal.budgetProteinG)} g protein` : ""}
                            </p>
                            {statusLine(meal) ? (
                              <p className="mt-1 text-sm font-medium text-fyte-ink">{statusLine(meal)}</p>
                            ) : null}
                          </div>
                        </div>
                        {!done ? (
                          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                            <button
                              type="button"
                              disabled={Boolean(busy)}
                              className={fyte.primary}
                              onClick={() =>
                                run(`meal-${meal.slotKey}`, () =>
                                  coachCheckin({ action: "as_planned", slot_key: meal.slotKey }, date)
                                )
                              }
                            >
                              As planned
                            </button>
                            <button
                              type="button"
                              disabled={Boolean(busy)}
                              className={fyte.secondary}
                              onClick={() => openInterview(meal, "meal_other")}
                            >
                              Something else
                            </button>
                            <button
                              type="button"
                              disabled={Boolean(busy)}
                              className={fyte.ghost}
                              onClick={() => openInterview(meal, "meal_dislike")}
                            >
                              Don&apos;t like this
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
              <section className={fyte.card}>
                <p className={fyte.kicker}>Session</p>
                <p className={`mt-1 font-semibold text-fyte-ink`}>{board.session.title}</p>
                {board.session.isRest ? (
                  <p className={`mt-2 ${fyte.body}`}>Rest day. Showing up tomorrow is the work.</p>
                ) : (
                  <>
                    {statusLine(board.session) ? (
                      <p className="mt-2 text-sm font-medium text-fyte-ink">{statusLine(board.session)}</p>
                    ) : (
                      <>
                        <div className="mt-4">
                          <FormSelect
                            label="How did it feel?"
                            compact
                            columns={3}
                            value={feel}
                            onChange={setFeel}
                            options={FEEL_OPTIONS}
                          />
                        </div>
                        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                          <button
                            type="button"
                            disabled={Boolean(busy)}
                            className={fyte.primary}
                            onClick={() =>
                              run("session", () =>
                                coachCheckin({ action: "session_done", feel }, date)
                              )
                            }
                          >
                            I trained
                          </button>
                          <button
                            type="button"
                            disabled={Boolean(busy)}
                            className={fyte.secondary}
                            onClick={() => run("skip", () => coachCheckin({ action: "session_skipped" }, date))}
                          >
                            Skipped
                          </button>
                          <button
                            type="button"
                            disabled={Boolean(busy)}
                            className={fyte.ghost}
                            onClick={() => openInterview(board.session!, "session_dislike")}
                          >
                            Don&apos;t like this
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </section>
            ) : board?.hasDiet ? (
              <section className={fyte.card}>
                <p className={fyte.kicker}>Session</p>
                <p className={`mt-1 ${fyte.body}`}>Make a workout so we can watch the week.</p>
                <Link href="/workout" className={`${fyte.secondary} mt-4`}>
                  Make a workout
                </Link>
              </section>
            ) : null}

            <section className={fyte.card}>
              <p className={fyte.kicker}>Check-in</p>
              <p className={`mt-1 ${fyte.body}`}>Weekly average comes from a few morning weigh-ins — not a daily verdict.</p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <FormInput
                  label="Weight (kg)"
                  type="number"
                  placeholder="e.g. 72.4"
                  value={weight}
                  onChange={setWeight}
                />
                <FormInput
                  label="Sleep (hours)"
                  type="number"
                  placeholder="e.g. 7"
                  value={sleep}
                  onChange={setSleep}
                />
              </div>
              <div className="mt-5">
                <FormSelect
                  label="Energy today"
                  compact
                  columns={3}
                  value={energy}
                  onChange={setEnergy}
                  options={ENERGY_OPTIONS}
                />
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
                  )
                }
              >
                Save check-in
              </button>
            </section>

            {board?.review ? (
              <section className={fyte.card}>
                <p className={fyte.kicker}>This week</p>
                <h2 className={`mt-1 ${fyte.title}`}>{board.review.headline}</h2>
                <p className={`mt-2 ${fyte.body}`}>{board.review.body}</p>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                  <div className={fyte.panel}>
                    <dt className="text-fyte-muted">Sessions</dt>
                    <dd className="mt-1 font-semibold text-fyte-ink">
                      {board.review.attendancePct == null ? "—" : `${Math.round(board.review.attendancePct)}%`}
                    </dd>
                  </div>
                  <div className={fyte.panel}>
                    <dt className="text-fyte-muted">Meals followed</dt>
                    <dd className="mt-1 font-semibold text-fyte-ink">
                      {board.review.mealAdherencePct == null ? "—" : `${Math.round(board.review.mealAdherencePct)}%`}
                    </dd>
                  </div>
                  <div className={fyte.panel}>
                    <dt className="text-fyte-muted">Weight vs last week</dt>
                    <dd className="mt-1 font-semibold text-fyte-ink">
                      {board.review.weightDeltaKg == null
                        ? "—"
                        : `${board.review.weightDeltaKg > 0 ? "+" : ""}${board.review.weightDeltaKg} kg`}
                    </dd>
                  </div>
                </dl>
              </section>
            ) : null}
          </div>

          <aside>
            <section className={fyte.card}>
              <p className={fyte.kicker}>Day</p>
              <div className="mt-4">
                <DayCalendar
                  value={date}
                  max={today}
                  onChange={(next) => setDate(clampIsoDateToToday(next, today))}
                />
              </div>
            </section>
          </aside>
        </div>
      </div>

      <InterviewModal
        open={Boolean(modalKind)}
        kind={modalKind}
        slotTitle={modalSlot?.title || ""}
        interview={interview}
        busy={Boolean(busy)}
        error={error}
        onClose={() => {
          setModalKind(null);
          setModalSlot(null);
        }}
        onStart={async ({ text, image }) => {
          if (!modalSlot || !modalKind) return;
          setBusy("interview");
          setError("");
          try {
            const next = await startCoachInterview(
              { slot_key: modalSlot.slotKey, kind: modalKind, text, image },
              date
            );
            setInterview(next);
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
            const next = await answerCoachInterview(interview.id, questionId, value);
            setInterview(next);
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
            setBoard(result.board);
            setNote(result.note);
            setInterview(null);
            setModalKind(null);
            setModalSlot(null);
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
