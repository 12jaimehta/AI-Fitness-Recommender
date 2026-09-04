"use client";

import { useMemo, useState } from "react";
import AppModal from "@/components/shared/AppModal";
import FormSelect from "@/components/shared/FormSelect";
import FormTextarea from "@/components/shared/FormTextarea";
import MotionButton from "@/components/ui/MotionButton";
import { remainingQuestions } from "@/shared/lib/coach/questions";
import { fyte } from "@/shared/lib/ui";
import type { CoachInterviewKind, CoachInterviewView } from "@/shared/types/coach";

export default function InterviewModal({
  open,
  kind,
  slotTitle,
  interview,
  busy,
  error,
  onClose,
  onStart,
  onAnswer,
  onComplete,
}: {
  open: boolean;
  kind: CoachInterviewKind | null;
  slotTitle: string;
  interview: CoachInterviewView | null;
  busy: boolean;
  error: string;
  onClose: () => void;
  onStart: (payload: { text?: string; image?: string }) => Promise<void>;
  onAnswer: (questionId: string, value: string) => Promise<void>;
  onComplete: (optionId?: string) => Promise<void>;
}) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string>("");
  const current = interview ? remainingQuestions(interview.questions, interview.answers) : null;
  const waitingStart = kind === "meal_other" && !interview;
  const title = useMemo(() => {
    if (kind === "meal_dislike") return `Replace ${slotTitle}`;
    if (kind === "session_dislike") return "Change today's session";
    return slotTitle ? `Different from ${slotTitle}` : "What did you have?";
  }, [kind, slotTitle]);

  const readPhoto = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  return (
    <AppModal isOpen={open} onClose={onClose} title={title}>
      <div className="space-y-5 text-left">
        {error ? <p className="text-sm text-fyte-danger">{error}</p> : null}
        {kind && !interview && !waitingStart ? (
          <p className="text-sm text-fyte-muted">Asking the next thing that matters…</p>
        ) : null}

        {waitingStart ? (
          <>
            <p className="text-sm text-fyte-muted">
              Type it or add a photo. We&apos;ll ask only what still changes the number — like a trainer would.
            </p>
            <FormTextarea
              label="What did you have?"
              value={text}
              onChange={setText}
              placeholder="e.g. 2 plates pav bhaji"
              required
            />
            <label className="block">
              <span className={fyte.label}>Photo of the plate</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="block w-full text-sm text-fyte-muted"
                onChange={(e) => readPhoto(e.target.files?.[0])}
              />
              {image ? <p className="mt-2 text-xs text-fyte-muted">Photo attached.</p> : null}
            </label>
            <MotionButton
              type="button"
              loading={busy}
              onClick={() => onStart({ text: text.trim(), image: image || undefined })}
              disabled={busy || (!text.trim() && !image)}
            >
              Continue
            </MotionButton>
          </>
        ) : null}

        {interview && current ? (
          <FormSelect
            label={current.prompt}
            required
            columns={1}
            value=""
            onChange={(value) => {
              if (value) void onAnswer(current.id, value);
            }}
            options={current.options}
          />
        ) : null}

        {interview && !current && interview.options.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-fyte-ink">Pick one. Same slot budget.</p>
            {interview.options.map((option) => (
              <button
                key={option.id}
                type="button"
                disabled={busy}
                onClick={() => void onComplete(option.id)}
                className="w-full rounded-xl border-2 border-fyte-line bg-fyte-card p-4 text-left hover:border-fyte-ink"
              >
                <p className="font-semibold text-fyte-ink">{option.name}</p>
                <p className="mt-1 text-sm text-fyte-muted">
                  {option.calories} kcal · {option.protein} g protein
                </p>
                {option.description ? <p className="mt-1 text-sm text-fyte-muted">{option.description}</p> : null}
              </button>
            ))}
          </div>
        ) : null}

        {interview && !current && !interview.options.length ? (
          <MotionButton type="button" loading={busy} onClick={() => void onComplete()}>
            Save
          </MotionButton>
        ) : null}

        {interview?.headline && current ? (
          <p className="text-sm text-fyte-muted">{interview.headline}</p>
        ) : null}
      </div>
    </AppModal>
  );
}
