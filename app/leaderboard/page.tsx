"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Row = {
  username: string;
  seals_earned: number;
  objectives_completed: number;
};

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        window.location.href = "/login";
        return;
      }

      const res = await supabase
        .from("leaderboard")
        .select("username,seals_earned,objectives_completed")
        .order("seals_earned", { ascending: false })
        .order("objectives_completed", { ascending: false })
        .order("username", { ascending: true });

      if (res.error) {
        setMsg(res.error.message);
        return;
      }

      setRows((res.data ?? []) as Row[]);
    })();
  }, []);

  return (
    <main className="text-white">
      <a className="text-sm text-white/70 hover:text-white" href="/seals">
        ← Back to Seals
      </a>

      <h1 className="mt-4 text-3xl font-black tracking-tight">Leaderboard</h1>
      <p className="mt-1 text-sm text-white/60">
        Ranked by <b>Seals Earned</b>, then <b>Objectives Completed</b>.
      </p>

      {msg && (
        <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {msg}
        </div>
      )}

      <div className="mt-6 rounded-3xl bg-white/3 border border-white/10 p-5 shadow-xl backdrop-blur">
        <div className="grid grid-cols-12 gap-3 text-xs uppercase tracking-widest text-white/45 px-2">
          <div className="col-span-6">Player</div>
          <div className="col-span-3 text-right">Seals</div>
          <div className="col-span-3 text-right">Objectives</div>
        </div>

        <ol className="mt-3 grid gap-2">
          {rows.map((r, idx) => (
            <li
              key={r.username}
              className="grid grid-cols-12 items-center gap-3 rounded-2xl border border-white/10 bg-black/10 px-4 py-3"
            >
              <div className="col-span-6 flex items-center gap-3 min-w-0">
                <span className="text-xs font-bold text-white/50">#{idx + 1}</span>
                <span className="font-semibold truncate">{r.username}</span>
              </div>

              <div className="col-span-3 text-right font-semibold text-emerald-200">
                {r.seals_earned}
              </div>

              <div className="col-span-3 text-right text-white/70">
                {r.objectives_completed}
              </div>
            </li>
          ))}

          {rows.length === 0 && (
            <div className="text-sm text-white/60 mt-2">No progress yet.</div>
          )}
        </ol>
      </div>
    </main>
  );
}
