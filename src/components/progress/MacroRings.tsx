"use client";

function Ring({
  value,
  target,
  label,
}: {
  value: number;
  target: number;
  label: string;
}) {
  const pct = target > 0 ? Math.min(value / target, 1) : 0;
  const r = 36;
  const c = 2 * Math.PI * r;
  const dash = c * pct;

  return (
    <div className="flex flex-col items-center">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#ececec" strokeWidth="8" />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="#282828"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform="rotate(-90 48 48)"
        />
        <text x="48" y="46" textAnchor="middle" className="fill-[#282828]" fontSize="13" fontWeight="700">
          {Math.round(value)}
        </text>
        <text x="48" y="62" textAnchor="middle" className="fill-slate-400" fontSize="9">
          / {target || 0}
        </text>
      </svg>
      <p className="text-xs font-semibold text-slate-500 mt-1">{label}</p>
    </div>
  );
}

export default function MacroRings({
  calories,
  calorieTarget,
  protein,
  proteinTarget,
  water,
  waterTarget,
}: {
  calories: number;
  calorieTarget: number;
  protein: number;
  proteinTarget: number;
  water: number;
  waterTarget: number;
}) {
  return (
    <div className="flex justify-around py-2">
      <Ring value={calories} target={calorieTarget} label="kcal" />
      <Ring value={protein} target={proteinTarget} label="protein" />
      <Ring value={water} target={waterTarget} label="water ml" />
    </div>
  );
}
