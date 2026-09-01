"use client";

import { useState } from "react";
import AppModal from "@/components/shared/AppModal";
import MotionButton from "@/components/ui/MotionButton";

export default function AIMealLogModal({
  isOpen,
  slotLabel,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  slotLabel: string;
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
      setError(err instanceof Error ? err.message : "Could not log meal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={slotLabel === "this date" ? "Log a meal" : `Something else · ${slotLabel}`}
    >
      <p className="text-sm text-slate-500 mb-4 text-left">
        Type what you ate. AI estimates calories and protein.
      </p>
      <form onSubmit={submit} className="space-y-4">
        {error && <p className="text-sm text-red-500">{error}</p>}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. 2 butter rotis, paneer bhurji, and a bowl of dal"
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
