"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDaysIso, clampIsoDateToToday } from "@/shared/lib/plan-tracking";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function parts(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return { year, month, day };
}

function monthIso(year: number, monthIndex: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`;
}

function weekdayMondayIndex(iso: string) {
  const { year, month, day } = parts(iso);
  const utcDay = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return utcDay === 0 ? 6 : utcDay - 1;
}

function cellsForMonth(year: number, monthIndex: number) {
  const first = monthIso(year, monthIndex);
  const start = addDaysIso(first, -weekdayMondayIndex(first));
  return Array.from({ length: 42 }, (_, index) => addDaysIso(start, index));
}

export default function DayCalendar({
  value,
  max,
  onChange,
}: {
  value: string;
  max: string;
  onChange: (iso: string) => void;
}) {
  const selected = parts(value);
  const maxParts = parts(max);
  const [viewYear, setViewYear] = useState(selected.year);
  const [viewMonth, setViewMonth] = useState(selected.month - 1);

  useEffect(() => {
    setViewYear(selected.year);
    setViewMonth(selected.month - 1);
  }, [selected.year, selected.month]);

  const days = useMemo(() => cellsForMonth(viewYear, viewMonth), [viewYear, viewMonth]);
  const canGoNext =
    viewYear < maxParts.year || (viewYear === maxParts.year && viewMonth < maxParts.month - 1);

  const shiftMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    const nextYear = next.getFullYear();
    const nextMonth = next.getMonth();
    if (delta > 0 && (nextYear > maxParts.year || (nextYear === maxParts.year && nextMonth > maxParts.month - 1))) {
      return;
    }
    setViewYear(nextYear);
    setViewMonth(nextMonth);
  };

  return (
    <div className="max-w-sm">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#282828] hover:bg-gray-50"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="text-sm font-semibold text-[#282828]">
          {MONTHS[viewMonth]} {viewYear}
        </p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          disabled={!canGoNext}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#282828] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <p key={day} className="pb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            {day}
          </p>
        ))}
        {days.map((iso) => {
          const { month } = parts(iso);
          const inMonth = month === viewMonth + 1;
          const future = iso > max;
          const selectedDay = iso === value;
          const isToday = iso === max;
          return (
            <button
              key={iso}
              type="button"
              disabled={future}
              onClick={() => onChange(clampIsoDateToToday(iso, max))}
              className={`flex h-10 items-center justify-center rounded-xl text-sm font-semibold transition ${
                selectedDay
                  ? "bg-[#282828] text-white"
                  : future
                    ? "cursor-not-allowed text-gray-300"
                    : inMonth
                      ? isToday
                        ? "border-2 border-[#282828] bg-white text-[#282828]"
                        : "text-[#282828] hover:bg-gray-100"
                      : "text-gray-300 hover:bg-gray-50"
              }`}
            >
              {parts(iso).day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
