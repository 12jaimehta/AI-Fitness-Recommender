"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type MenuOption = { value: string; label: string; disabled?: boolean };

export default function OptionMenu({
  options,
  selected,
  onToggle,
  multiple = false,
  placeholder = "Choose",
  disabled = false,
  compact = false,
}: {
  options: MenuOption[];
  selected: string[];
  onToggle: (value: string) => void;
  multiple?: boolean;
  placeholder?: string;
  disabled?: boolean;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const choices = options.filter((option) => option.value);
  const picked = choices.filter((option) => selected.includes(option.value));
  const summary =
    picked.length === 0 ? placeholder : picked.map((option) => option.label).join(", ");

  useEffect(() => {
    const onDoc = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative text-left font-['Montserrat',sans-serif]">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex w-full items-center justify-between rounded-xl border-2 bg-white text-left font-medium transition",
          compact ? "px-3 py-2 text-sm" : "px-4 py-3 text-sm",
          picked.length ? "text-[#282828]" : "text-gray-500",
          open ? "border-[#282828]" : "border-gray-200 hover:border-[#282828]",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <span className="truncate">{summary}</span>
        <ChevronDown
          className={cn("ml-3 h-4 w-4 shrink-0 text-[#282828] transition", open && "rotate-180")}
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border-2 border-[#282828] bg-white py-1"
        >
          {choices.map((option) => {
            const active = selected.includes(option.value);
            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  disabled={option.disabled}
                  onClick={() => {
                    onToggle(option.value);
                    if (!multiple) setOpen(false);
                  }}
                  className={cn(
                    "w-full px-4 py-2.5 text-left text-sm font-medium",
                    active ? "bg-[#282828] text-white" : "bg-white text-[#282828] hover:bg-gray-50",
                    option.disabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
