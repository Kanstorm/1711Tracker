"use client";

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-[70vh] grid place-items-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
        <div className="text-center">
          <div className="text-2xl font-black tracking-tight text-white">
            {title}
          </div>
          {subtitle && <div className="mt-1 text-sm text-white/60">{subtitle}</div>}
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
