"use client";

interface WeightEntry {
  weight: number;
  date: string;
}

export default function WeightChart({ data }: { data: WeightEntry[] }) {
  const chartData = data.slice(0, 10).reverse();
  const maxWeight = Math.max(...chartData.map(d => Number(d.weight)), 100);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full">
      <h3 className="text-lg font-bold text-slate-800 mb-6">Weight Trend</h3>
      
      {chartData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-100">
          <p className="text-sm font-medium">No weight data logged yet</p>
        </div>
      ) : (
        <div className="h-48 flex items-end gap-2 md:gap-4">
          {chartData.map((entry, i) => {
            const heightPercent = (Number(entry.weight) / maxWeight) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                <div className="relative w-full flex items-end justify-center h-full">
                    {/* Bar */}
                    <div 
                        className="w-full max-w-[40px] bg-[#282828] opacity-80 group-hover:opacity-100 rounded-t-md transition-all duration-300 relative" 
                        style={{ height: `${heightPercent}%` }}
                    >
                         {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 pointer-events-none whitespace-nowrap z-10">
                            {entry.weight} kg
                            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                        </div>
                    </div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}