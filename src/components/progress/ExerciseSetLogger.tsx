"use client";

import { useEffect, useRef, useState } from "react";
import { PersonStanding, Trash2, X } from "lucide-react";
import type { ExerciseLogEntry, WorkoutSetEntry, WorkoutSetKind } from "@/shared/types";
import { formatVolume, workingSetStats } from "@/shared/lib/current-plans";

function newSet(kind: WorkoutSetKind): WorkoutSetEntry {
  return {
    id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    kind,
    weight_kg: 0,
    reps: 0,
  };
}

function SetRow({
  set,
  index,
  isPr,
  onChange,
  onRemove,
  onBlur,
}: {
  set: WorkoutSetEntry;
  index: number;
  isPr: boolean;
  onChange: (next: WorkoutSetEntry) => void;
  onRemove: () => void;
  onBlur: () => void;
}) {
  const warmup = set.kind === "warmup";
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="w-10 shrink-0 flex flex-col items-center">
        {isPr && <span className="text-[9px] font-bold text-[#282828] mb-0.5">PR</span>}
        {warmup ? (
          <PersonStanding size={18} className="text-slate-400" />
        ) : (
          <span className="text-sm font-bold text-[#282828]">{index}</span>
        )}
      </div>
      <label className="flex-1">
        <input
          type="number"
          inputMode="decimal"
          value={set.weight_kg || ""}
          placeholder="0"
          onChange={(e) => onChange({ ...set, weight_kg: Number(e.target.value) || 0 })}
          onBlur={onBlur}
          className="w-full text-base font-semibold text-[#282828] outline-none bg-transparent"
        />
        <span className="text-xs text-slate-400">kg</span>
      </label>
      <label className="flex-1">
        <input
          type="number"
          inputMode="numeric"
          value={set.reps || ""}
          placeholder="0"
          onChange={(e) => onChange({ ...set, reps: Number(e.target.value) || 0 })}
          onBlur={onBlur}
          className="w-full text-base font-semibold text-[#282828] outline-none bg-transparent"
        />
        <span className="text-xs text-slate-400">reps</span>
      </label>
      <button type="button" onClick={onRemove} className="p-2 text-slate-400 hover:text-[#282828]">
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export default function ExerciseSetLogger({
  exercise,
  sessionExercises,
  sessionTitle,
  onChange,
  onBack,
  onAddExercise,
}: {
  exercise: ExerciseLogEntry;
  sessionExercises: ExerciseLogEntry[];
  sessionTitle: string;
  onChange: (next: ExerciseLogEntry) => void;
  onBack: () => void;
  onAddExercise: () => void;
}) {
  const [local, setLocal] = useState(exercise);
  const localRef = useRef(local);

  useEffect(() => {
    setLocal(exercise);
  }, [exercise.exercise_id]);

  useEffect(() => {
    localRef.current = local;
  }, [local]);

  const warmups = local.sets.filter((set) => set.kind === "warmup");
  const working = local.sets.filter((set) => set.kind !== "warmup");
  const stats = workingSetStats(local.sets);
  const maxWeight = Math.max(0, ...working.map((set) => set.weight_kg));
  const sessionStats = workingSetStats(sessionExercises.flatMap((item) => item.sets));
  const sessionSets = sessionExercises.reduce(
    (sum, item) => sum + item.sets.filter((set) => set.kind !== "warmup" && set.reps > 0).length,
    0
  );

  const patchSets = (sets: WorkoutSetEntry[]) => {
    const next = { ...local, sets };
    setLocal(next);
    onChange(next);
  };

  const add = (kind: WorkoutSetKind) => patchSets([...local.sets, newSet(kind)]);
  const updateSet = (id: string, next: WorkoutSetEntry) => {
    setLocal((prev) => ({ ...prev, sets: prev.sets.map((row) => (row.id === id ? next : row)) }));
  };
  const commit = () => onChange(localRef.current);
  const removeSet = (id: string) => patchSets(local.sets.filter((set) => set.id !== id));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[#282828]">{exercise.exercise_name}</h1>
          <button type="button" onClick={() => { commit(); onBack(); }} className="p-2 rounded-xl hover:bg-white">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        {exercise.muscle_group && (
          <p className="text-sm text-slate-500 mb-4">
            {exercise.muscle_group} · {exercise.target_sets} × {exercise.target_reps}
          </p>
        )}

        <div className="bg-white rounded-2xl px-4">
          <button
            type="button"
            onClick={() => add("warmup")}
            className="py-3 text-sm font-semibold text-[#282828]"
          >
            + Warm-up
          </button>
          {warmups.map((set) => (
            <SetRow
              key={set.id}
              set={set}
              index={0}
              isPr={false}
              onChange={(next) => updateSet(set.id, next)}
              onRemove={() => removeSet(set.id)}
              onBlur={commit}
            />
          ))}
          {working.map((set, i) => (
            <SetRow
              key={set.id}
              set={set}
              index={i + 1}
              isPr={set.weight_kg > 0 && set.weight_kg === maxWeight && set.reps >= 5 && working.length > 1}
              onChange={(next) => updateSet(set.id, next)}
              onRemove={() => removeSet(set.id)}
              onBlur={commit}
            />
          ))}
          <button type="button" onClick={() => add("working")} className="py-3 text-sm font-semibold text-[#282828]">
            + Set
          </button>
        </div>

        <div className="mt-4 bg-white rounded-2xl p-5 grid grid-cols-3 text-center">
          <div>
            <p className="text-[11px] text-slate-400">Total weight</p>
            <p className="text-lg font-bold text-[#282828] mt-1">{formatVolume(stats.volume)}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Total reps</p>
            <p className="text-lg font-bold text-[#282828] mt-1">{stats.totalReps} reps</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Average weight</p>
            <p className="text-lg font-bold text-[#282828] mt-1">{stats.avgWeight ? `${stats.avgWeight.toFixed(1)} kg` : "—"}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onAddExercise}
            className="py-4 rounded-2xl bg-[#282828] text-white font-semibold"
          >
            + Exercise
          </button>
          <button
            type="button"
            onClick={() => add("special")}
            className="py-4 rounded-2xl bg-[#282828] text-white font-semibold"
          >
            + Special set
          </button>
        </div>

        <div className="mt-4 bg-white rounded-2xl p-5">
          <p className="text-center text-sm font-semibold text-[#282828] mb-3">Summary</p>
          <p className="text-xs text-slate-500 mb-3">{sessionTitle}</p>
          <div className="grid grid-cols-3 text-center">
            <div>
              <p className="text-[11px] text-slate-400">Total weight</p>
              <p className="font-bold text-[#282828]">{formatVolume(sessionStats.volume)}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Total sets</p>
              <p className="font-bold text-[#282828]">{sessionSets}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Total reps</p>
              <p className="font-bold text-[#282828]">{sessionStats.totalReps}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
