"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ProgressBar from "@/app/components/ProgressBar";

type Seal = { id: string; slug: string; name: string; description: string | null };
type ObjectiveRow = { id: string; seal_id: string };
type ProgressRow = { objective_id: string };

export default function SealsPage() {
  const [seals, setSeals] = useState<Seal[]>([]);
  const [objBySeal, setObjBySeal] = useState<Record<string, string[]>>({});
  const [completedByObj, setCompletedByObj] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const sealProgress = useMemo(() => {
    const map: Record<string, { total: number; done: number }> = {};
    for (const s of seals) {
      const objIds = objBySeal[s.id] ?? [];
      const total = objIds.length;
      const done = objIds.filter((id) => completedByObj[id]).length;
      map[s.id] = { total, done };
    }
    return map;
  }, [seals, objBySeal, completedByObj]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMsg(null);

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) {
        window.location.href = "/login";
        return;
      }

      const sealRes = await supabase
        .from("seals")
        .select("id,slug,name,description")
        .order("created_at", { ascending: true });

      if (sealRes.error) {
        setMsg(sealRes.error.message);
        setLoading(false);
        return;
      }

      const sealsData = (sealRes.data ?? []) as Seal[];
      setSeals(sealsData);

      const objRes = await supabase.from("seal_objectives").select("id,seal_id");
      if (objRes.error) {
        setMsg(objRes.error.message);
        setLoading(false);
        return;
      }

      const bySeal: Record<string, string[]> = {};
      for (const o of (objRes.data ?? []) as ObjectiveRow[]) {
        bySeal[o.seal_id] = bySeal[o.seal_id] ?? [];
        bySeal[o.seal_id].push(o.id);
      }
      setObjBySeal(bySeal);

      const progRes = await supabase
        .from("user_objective_progress")
        .select("objective_id")
        .eq("user_id", user.id)
        .eq("completed", true);

      if (progRes.error) {
        setMsg(progRes.error.message);
        setLoading(false);
        return;
      }

      const completed: Record<string, boolean> = {};
      for (const p of (progRes.data ?? []) as ProgressRow[]) completed[p.objective_id] = true;
      setCompletedByObj(completed);

      setLoading(false);
    })();
  }, []);

  return (
    <main className="min-h-[70vh] text-white">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            Seals <span className="text-amber-300/90">Tracker</span>
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Complete objectives to earn Seals — Destiny-style.
          </p>
        </div>

        <div className="flex items-center gap-2">
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

      {loading ? (
        <div className="mt-6 grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl bg-white/3 border border-white/10 p-5 animate-pulse"
            >
              <div className="h-4 w-52 rounded bg-white/10" />
              <div className="mt-3 h-3 w-80 rounded bg-white/10" />
              <div className="mt-4 h-2 w-full rounded bg-white/10" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <ul className="mt-6 grid gap-4">
            {seals.map((s) => {
              const prog = sealProgress[s.id] ?? { total: 0, done: 0 };
              const earned = prog.total > 0 && prog.done === prog.total;

              return (
                <li key={s.id}>
                  <div className="relative overflow-hidden rounded-3xl bg-white/3 border border-white/10 p-5 shadow-xl backdrop-blur">
                    <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-amber-300/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />

                    <div className="relative flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-semibold text-white truncate">
                            {s.name}
                          </h2>
                          {earned && (
                            <span className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-200">
                              Seal Earned
                            </span>
                          )}
                        </div>

                        {s.description && (
                          <p className="mt-1 text-sm text-white/60 leading-snug">
                            {s.description}
                          </p>
                        )}
                      </div>

                      <a
                        href={`/seals/${s.slug}`}
                        className="shrink-0 rounded-xl px-3 py-2 text-sm bg-amber-300/10 border border-amber-300/20 hover:bg-amber-300/15 text-amber-100 transition"
                      >
                        View →
                      </a>
                    </div>

                    <div className="relative">
                      <ProgressBar value={prog.done} max={prog.total} />
                      <div className="mt-3 flex items-center justify-between text-xs text-white/55">
                        <span className="uppercase tracking-widest">
                          {earned ? "Completed" : "In Progress"}
                        </span>
                        <span className="text-white/45">
                          {prog.total === 0 ? "No objectives yet" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {seals.length === 0 && (
            <div className="mt-6 rounded-3xl bg-white/3 border border-white/10 p-5 text-sm text-white/60">
              No seals found. Add a seal in Supabase → Table Editor → <b>seals</b>.
            </div>
          )}
        </>
      )}
    </main>
  );
}
