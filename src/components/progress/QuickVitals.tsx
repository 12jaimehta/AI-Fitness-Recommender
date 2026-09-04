"use client";

import { useEffect, useState } from "react";
import { FillY } from "@/components/shared/Motion";

const WATER_STEP_ML = 250;

export default function QuickVitals({
  weight,
  water,
  sleep,
  waterTarget = 3000,
  onWater,
  onSave,
}: {
  weight: number | null;
  water: number;
  sleep: number | null;
  waterTarget?: number;
  onWater: (deltaMl: number) => void;
  onSave: (patch: { weight_kg?: number; sleep_hours?: number }) => void;
}) {
  const [weightText, setWeightText] = useState(weight != null ? String(weight) : "");
  const [sleepText, setSleepText] = useState(sleep != null ? String(sleep) : "");
  const [localWater, setLocalWater] = useState(water);

  useEffect(() => {
    setWeightText(weight != null ? String(weight) : "");
  }, [weight]);

  useEffect(() => {
    setSleepText(sleep != null ? String(sleep) : "");
  }, [sleep]);

  useEffect(() => {
    setLocalWater(water);
  }, [water]);

  const blocks = Math.max(1, Math.round(waterTarget / WATER_STEP_ML));
  const filled = Math.min(blocks, Math.round(localWater / WATER_STEP_ML));
  const fillPct = Math.min(100, Math.round((localWater / waterTarget) * 100));

  const saveWeight = () => {
    const n = Number(weightText);
    if (n > 0) onSave({ weight_kg: n });
  };

  const saveSleep = () => {
    const n = Number(sleepText);
    if (n > 0) onSave({ sleep_hours: n });
  };

  const addWater = () => {
    setLocalWater((current) => current + WATER_STEP_ML);
    onWater(WATER_STEP_ML);
  };

  const removeWater = () => {
    if (localWater < WATER_STEP_ML) return;
    setLocalWater((current) => Math.max(0, current - WATER_STEP_ML));
    onWater(-WATER_STEP_ML);
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-[#282828]">Today's check-in</h2>
      <p className="mt-1 text-sm text-gray-600">Type weight and sleep. Tap the glass to add water.</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#282828]">Weight (kg)</span>
            <span className="mb-2 block text-xs text-gray-500">Type your weight, then tap Save.</span>
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="decimal"
                min={1}
                step="0.1"
                placeholder="e.g. 72.4"
                value={weightText}
                onChange={(event) => setWeightText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") saveWeight();
                }}
                className="w-full rounded-xl border-2 border-[#282828] bg-white px-4 py-3 text-base font-semibold text-[#282828] outline-none placeholder:font-normal placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={saveWeight}
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-[#282828] px-5 text-sm font-semibold text-white"
              >
                Save
              </button>
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#282828]">Sleep (hours)</span>
            <span className="mb-2 block text-xs text-gray-500">Type how long you slept last night.</span>
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                max={24}
                step="0.5"
                placeholder="e.g. 7.5"
                value={sleepText}
                onChange={(event) => setSleepText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") saveSleep();
                }}
                className="w-full rounded-xl border-2 border-[#282828] bg-white px-4 py-3 text-base font-semibold text-[#282828] outline-none placeholder:font-normal placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={saveSleep}
                className="shrink-0 rounded-xl bg-[#282828] px-4 text-sm font-semibold text-white"
              >
                Save
              </button>
            </div>
          </label>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-semibold text-[#282828]">Water</p>
          <p className="mt-1 text-xs text-gray-500">Each tap adds 250 ml. The stack grows from the bottom.</p>

          <div className="mt-4 flex items-end gap-4">
            <button
              type="button"
              onClick={addWater}
              className="relative h-48 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-[#282828] bg-gray-100"
              aria-label={`Add ${WATER_STEP_ML} millilitres of water`}
            >
              <FillY
                pct={fillPct}
                className="absolute bottom-0 left-0 right-0 bg-[#282828]"
              />
              <div className="absolute inset-1 flex flex-col-reverse gap-[3px]">
                {Array.from({ length: blocks }, (_, index) => (
                  <div
                    key={index}
                    className="min-h-0 flex-1 rounded-sm border border-white/40"
                  />
                ))}
              </div>
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-2xl font-bold text-[#282828]">{localWater} ml</p>
              <p className="mt-1 text-sm text-gray-600">
                {fillPct}% of {waterTarget} ml
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {filled} of {blocks} glasses
              </p>
              <button
                type="button"
                onClick={addWater}
                className="mt-4 inline-flex h-11 w-full max-w-[12rem] mr-2 items-center justify-center rounded-xl bg-[#282828] px-5 text-sm font-semibold text-white"
              >
                Add 250 ml
              </button>
              <button
                type="button"
                onClick={removeWater}
                disabled={localWater < WATER_STEP_ML}
                className="mt-2 inline-flex h-11 w-full max-w-[12rem] items-center justify-center rounded-xl border-2 border-[#282828] bg-white px-5 text-sm font-semibold text-[#282828] disabled:opacity-40"
              >
                Remove 250 ml
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
