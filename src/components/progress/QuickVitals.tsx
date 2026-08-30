"use client";

import { useState } from "react";
import { Droplets } from "lucide-react";

export default function QuickVitals({
  weight,
  water,
  sleep,
  onWater,
  onSave,
}: {
  weight: number | null;
  water: number;
  sleep: number | null;
  onWater: () => void;
  onSave: (patch: { weight_kg?: number; sleep_hours?: number }) => void;
}) {
  const [weightText, setWeight] = useState(weight != null ? String(weight) : "");
  const [sleepText, setSleep] = useState(sleep != null ? String(sleep) : "");

  return (
    <div className="grid grid-cols-3 gap-2">
      <label className="rounded-2xl bg-white border-2 border-[#282828]/10 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Weight</p>
        <input
          type="number"
          inputMode="decimal"
          placeholder="kg"
          value={weightText}
          onChange={(e) => setWeight(e.target.value)}
          onBlur={() => {
            const n = Number(weightText);
            if (n > 0) onSave({ weight_kg: n });
          }}
          className="w-full mt-1 text-lg font-bold text-[#282828] outline-none bg-transparent"
        />
      </label>
      <button
        type="button"
        onClick={onWater}
        className="rounded-2xl bg-white border-2 border-[#282828]/10 p-3 text-left"
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Water</p>
        <p className="text-lg font-bold text-[#282828] mt-1 flex items-center gap-1">
          <Droplets size={16} /> {water}
        </p>
        <p className="text-[10px] text-slate-400">tap +250 ml</p>
      </button>
      <label className="rounded-2xl bg-white border-2 border-[#282828]/10 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Sleep</p>
        <input
          type="number"
          inputMode="decimal"
          placeholder="hrs"
          value={sleepText}
          onChange={(e) => setSleep(e.target.value)}
          onBlur={() => {
            const n = Number(sleepText);
            if (n > 0) onSave({ sleep_hours: n });
          }}
          className="w-full mt-1 text-lg font-bold text-[#282828] outline-none bg-transparent"
        />
      </label>
    </div>
  );
}
