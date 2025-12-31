"use client";

export default function ProgressBar({
  value,
  max,
}: {
  value: number;
  max: number;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs text-white/60">
        <span>
          {value}/{max} objectives
        </span>
        <span>{pct}%</span>
      </div>

      <div className="mt-2 w-full h-2 rounded-full bg-white/5 border border-white/10 overflow-hidden">
        <div
          className={pct === 100 ? "h-full bg-emerald-300/80" : "h-full bg-amber-300/80"}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
