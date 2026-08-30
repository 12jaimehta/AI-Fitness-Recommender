"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import type { CurrentDietPlan, MealLogRow } from "@/shared/types";
import SurfaceCard from "@/components/shared/SurfaceCard";

export default function PlannedMealChecklist({
  plan,
  logs,
  busy,
  onCheck,
  onAiLog,
}: {
  plan: CurrentDietPlan | null;
  logs: MealLogRow[];
  busy: string;
  onCheck: (slot: string) => void;
  onAiLog: (slot: string) => void;
}) {
  if (!plan) {
    return (
      <SurfaceCard>
        <p className="font-bold text-[#282828]">No diet plan yet</p>
        <p className="text-sm text-slate-500 mt-2">
          Generate a diet plan. Tracking is one tap on those meals.
        </p>
        <Link
          href="/diet"
          className="mt-4 inline-flex w-full items-center justify-center py-3 rounded-2xl bg-[#282828] text-white font-semibold"
        >
          Create diet plan
        </Link>
      </SurfaceCard>
    );
  }

  const extras = logs.filter((log) => log.source_type !== "plan_checkoff");

  return (
    <SurfaceCard>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-[#282828]">Today’s meals</p>
          <p className="text-xs text-slate-500 mt-0.5">{plan.plan_name}</p>
        </div>
        <p className="text-sm font-semibold text-[#282828]">
          {logs.filter((log) => log.source_type === "plan_checkoff").length}/{plan.meals.length}
        </p>
      </div>
      <div className="space-y-2">
        {plan.meals.map((meal) => {
          const checked = logs.some(
            (log) => log.meal_slot === meal.slot && log.source_type === "plan_checkoff"
          );
          const item = meal.items[0];
          return (
            <div key={meal.meal_id} className="flex gap-2">
              <button
                type="button"
                onClick={() => onCheck(meal.slot)}
                disabled={busy === meal.slot}
                className={`flex-1 rounded-2xl border-2 px-4 py-3 text-left transition ${
                  checked
                    ? "bg-[#282828] text-white border-[#282828]"
                    : "bg-white text-[#282828] border-[#282828]/15"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className={`text-[11px] font-semibold uppercase tracking-wider ${checked ? "text-white/70" : "text-slate-400"}`}>
                      {meal.meal_name} · {meal.recommended_time}
                    </p>
                    <p className="font-semibold truncate mt-0.5">{item?.name}</p>
                    <p className={`text-xs mt-0.5 ${checked ? "text-white/70" : "text-slate-500"}`}>
                      {meal.total_meal_calories} kcal · {meal.total_meal_protein}g protein
                    </p>
                  </div>
                  {checked ? <Check size={18} /> : <span className="text-xs font-semibold">Ate it</span>}
                </div>
              </button>
              <button
                type="button"
                onClick={() => onAiLog(meal.slot)}
                className="px-3 rounded-2xl border-2 border-[#282828]/15 text-xs font-semibold text-[#282828]"
              >
                Else
              </button>
            </div>
          );
        })}
      </div>
      {extras.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Also logged</p>
          {extras.map((log) => (
            <div key={log.id} className="text-sm text-[#282828]">
              <p className="font-semibold">{log.meal_name}</p>
              <p className="text-xs text-slate-500">
                {log.total_calories} kcal · {log.total_protein_g}g protein
              </p>
            </div>
          ))}
        </div>
      )}
    </SurfaceCard>
  );
}
