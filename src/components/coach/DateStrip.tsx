"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDaysIso } from "@/shared/lib/plan-tracking";
import { fyte } from "@/shared/lib/ui";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function label(iso: string, today: string) {
  if (iso === today) return "Today";
  if (iso === addDaysIso(today, -1)) return "Yesterday";
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return `${DAYS[date.getUTCDay()]} ${d} ${MONTHS[m - 1]}`;
}

export default function DateStrip({
  value,
  today,
  onChange,
}: {
  value: string;
  today: string;
  onChange: (iso: string) => void;
}) {
  const atToday = value >= today;
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Previous day"
        onClick={() => onChange(addDaysIso(value, -1))}
        className={`${fyte.ghost} h-9 w-9 px-0`}
      >
        <ChevronLeft size={18} />
      </button>
      <p className="min-w-[7rem] text-center text-sm font-semibold text-fyte-ink">{label(value, today)}</p>
      <button
        type="button"
        aria-label="Next day"
        disabled={atToday}
        onClick={() => onChange(addDaysIso(value, 1))}
        className={`${fyte.ghost} h-9 w-9 px-0`}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
