"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type LeaderRow = {
  user_id?: string;
  username: string;
  seals_earned: number;
  objectives_completed: number;
};

export default function DashboardPage() {
  const [me, setMe] = useState<{ id: string; username: string } | null>(null);
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const myRank = useMemo(() => {
    if (!me) return null;
    const idx = rows.findIndex((r) => r.username === me.username);
    return idx >= 0 ? idx + 1 : null;
  }, [rows, me]);

  const myStats = useMemo(() => {
    if (!me) return null;
    return rows.find((r) => r.username === me.username) ?? null;
  }, [rows, me]);

  useEffect(() => {
    (async () => {
      setMsg(null);

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        window.location.href = "/login";
        return;
      }

      // Get my profile
      const prof = await supabase
        .from("profiles")
        .select("id, username")
        .eq("id", user.id)
        .single();

      if (prof.error) {
        setMsg(prof.error.message);
        return;
      }

      setMe({ id: prof.data.id, username: prof.data.username });

      // Pull leaderboard rows (sorted)
      const lb = await supabase
        .from("leaderboard")
        .select("user_id, username, seals_earned, objectives_completed")
        .order("seals_earned", { ascending: false })
        .order("objectives_completed", { ascending: false })
        .order("username", { ascending: true });

      if (lb.error) {
        setMsg(lb.error.message);
        return;
      }

      setRows((lb.data ?? []) as LeaderRow[]);
    })();
  }, []);

  return (
    <main className="text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-white/60">
            Your progress at a glance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/seals"
            className="rounded-xl px-3 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition"
          >
            Seals
          </a>
          <a
            href="/leaderboard"
            className="rounded-xl px-3 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition"
          >
            Leaderboard
          </a>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
            className="rounded-xl px-3 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition"
          >
            Log out
          </button>
        </div>
      </div>

      {msg && (
        <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {msg}
        </div>
      )}

      {/* Top cards */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-white/3 border border-white/10 p-5 shadow-xl backdrop-blur">
          <div className="text-xs uppercase tracking-widest text-white/45">
            Player
          </div>
          <div className="mt-2 text-xl font-extrabold">
            {me?.username ?? "—"}
          </div>
          <div className="mt-1 text-sm text-white/60">
            Welcome back.
          </div>
        </div>

        <div className="rounded-3xl bg-white/3 border border-white/10 p-5 shadow-xl backdrop-blur">
          <div className="text-xs uppercase tracking-widest text-white/45">
            Seals Earned
          </div>
          <div className="mt-2 text-4xl font-black text-emerald-200">
            {myStats ? myStats.seals_earned : "—"}
          </div>
          <div className="mt-1 text-sm text-white/60">
            Total completed Seals.
          </div>
        </div>

        <div className="rounded-3xl bg-white/3 border border-white/10 p-5 shadow-xl backdrop-blur">
          <div className="text-xs uppercase tracking-widest text-white/45">
            Objectives Completed
          </div>
          <div className="mt-2 text-4xl font-black text-amber-200">
            {myStats ? myStats.objectives_completed : "—"}
          </div>
          <div className="mt-1 text-sm text-white/60">
            Across all Seals.
          </div>
        </div>
      </div>

      {/* Rank + Top players */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-white/3 border border-white/10 p-5 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-widest text-white/45">
              Your Rank
            </div>
            <a className="text-sm text-white/70 hover:text-white" href="/leaderboard">
              View full →
            </a>
          </div>

          <div className="mt-3 text-5xl font-black">
            {myRank ? `#${myRank}` : "—"}
          </div>

          <div className="mt-2 text-sm text-white/60">
            Ranked by Seals earned, then objectives completed.
          </div>
        </div>

        <div className="rounded-3xl bg-white/3 border border-white/10 p-5 shadow-xl backdrop-blur">
          <div className="text-xs uppercase tracking-widest text-white/45">
            Top Players
          </div>

          <ol className="mt-3 grid gap-2">
            {rows.slice(0, 5).map((r, idx) => (
              <li
                key={`${r.username}-${idx}`}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-bold text-white/50">#{idx + 1}</span>
                  <span className="font-semibold truncate">{r.username}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-emerald-200 font-semibold">
                    {r.seals_earned}
                  </span>
                  <span className="text-white/50">|</span>
                  <span className="text-white/70">
                    {r.objectives_completed}
                  </span>
                </div>
              </li>
            ))}

            {rows.length === 0 && (
              <div className="text-sm text-white/60">No progress yet.</div>
            )}
          </ol>

          <div className="mt-3 text-xs text-white/45">
            (Green = Seals, Gold = Objectives)
          </div>
        </div>
      </div>
    </main>
  );
}
