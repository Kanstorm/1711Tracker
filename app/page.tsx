export default function Home() {
  return (
    <main className="min-h-[60vh] grid place-items-center text-white">
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-tight">
          1711<span className="text-amber-300/90">Tracker</span>
        </h1>
        <p className="mt-2 text-white/60">Track progress. Earn Seals.</p>
        <div className="mt-5 flex items-center justify-center gap-2">
          <a className="rounded-xl px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 transition" href="/login">Log in</a>
          <a className="rounded-xl px-4 py-2 bg-amber-300/10 border border-amber-300/20 hover:bg-amber-300/15 text-amber-100 transition" href="/signup">Sign up</a>
        </div>
      </div>
    </main>
  );
}
