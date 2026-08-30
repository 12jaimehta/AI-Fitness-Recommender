"use client";

import { useState } from "react";
import AppModal from "@/components/shared/AppModal";
import MotionButton from "@/components/ui/MotionButton";

export default function AIWorkoutLogModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => Promise<void>;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      await onSubmit(text.trim());
      setText("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log workout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppModal isOpen={isOpen} onClose={onClose} title="Log another workout">
      <p className="text-sm text-slate-500 mb-4 text-left">
        Not following the plan today? Describe the session.
      </p>
      <form onSubmit={submit} className="space-y-4">
        {error && <p className="text-sm text-red-500">{error}</p>}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. Played 45 minutes of badminton and did 50 pushups"
          rows={4}
          className="w-full rounded-2xl border-2 border-[#282828]/20 p-4 text-sm text-[#282828] outline-none"
        />
        <MotionButton type="submit" loading={loading}>
          Log with AI
        </MotionButton>
      </form>
    </AppModal>
  );
}
