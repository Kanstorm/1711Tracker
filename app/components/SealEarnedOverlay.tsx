"use client";

import { useEffect } from "react";

export default function SealEarnedOverlay({
  sealName,
  onClose,
}: {
  sealName: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [onClose]);

  const particles = Array.from({ length: 42 });

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),rgba(0,0,0,0.92)_70%)]" />

      {/* Glow blobs */}
      <div className="pointer-events-none absolute -top-48 -left-48 h-[640px] w-[640px] rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -top-48 -right-48 h-[640px] w-[640px] rounded-full bg-sky-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-56 left-1/2 h-[720px] w-[720px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Center card */}
      <div className="absolute inset-0 grid place-items-center px-6">
        <div className="relative w-full max-w-2xl">
          {/* spinning ring */}
          <div className="pointer-events-none absolute -inset-20 mx-auto rounded-full bg-[conic-gradient(from_180deg,rgba(251,191,36,0.0),rgba(251,191,36,0.55),rgba(251,191,36,0.0))] blur-sm animate-[spin_2.2s_linear_infinite]" />

          <div className="relative rounded-3xl border border-amber-300/25 bg-white/5 p-8 shadow-2xl backdrop-blur">
            <div className="text-center">
              <div className="text-xs font-extrabold tracking-[0.35em] text-amber-200/90">
                SEAL EARNED
              </div>
              <div className="mt-3 text-4xl font-black tracking-tight text-white drop-shadow-[0_18px_35px_rgba(0,0,0,0.55)]">
                {sealName}
              </div>
              <div className="mt-3 text-sm text-white/65">
                Progress recorded. Keep going.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Particle burst */}
      <div className="pointer-events-none absolute inset-0">
        {particles.map((_, i) => (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-200 shadow-[0_0_18px_rgba(251,191,36,0.45)] animate-[burst_1.1s_ease-out_forwards]"
            style={particleStyle(i)}
          />
        ))}
      </div>

      <style>{css}</style>
    </div>
  );
}

function particleStyle(i: number): React.CSSProperties {
  const angle = (i / 42) * Math.PI * 2;
  const dist = 240 + (i % 7) * 14;
  const dx = Math.cos(angle) * dist;
  const dy = Math.sin(angle) * dist;
  const delay = (i % 14) * 18;

  return {
    animationDelay: `${delay}ms`,
    ["--dx" as any]: `${dx}px`,
    ["--dy" as any]: `${dy}px`,
  };
}

const css = `
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes burst {
  0% { opacity: 0; transform: translate(-50%,-50%) scale(0.6); }
  12% { opacity: 1; }
  100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1.15); }
}
`;
