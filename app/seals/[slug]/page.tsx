"use client";

import { use, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import SealEarnedOverlay from "@/app/components/SealEarnedOverlay";

type Seal = { id: string; slug: string; name: string; description: string | null };
type Obj = { id: string; title: string; description: string | null; sort_order: number };

export default function SealDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [seal, setSeal] = useState<Seal | null>(null);
  const [objs, setObjs] = useState<Obj[]>([]);
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [showEarned, setShowEarned] = useState(false);

  const progressCount = useMemo(
    () => objs.filter((o) => completedMap[o.id]).length,
    [objs, completedMap]
  );
  const isEarned = objs.length > 0 && progressCount === objs.length;

  // Show full-screen effect when the seal becomes completed.
  // DEV TIP: set SHOW_EVERY_TIME=true to always show while testing.
  const SHOW_EVERY_TIME = false;

  useEffect(() => {
    if (!seal) return;
    if (!isEarned) return;

    if (SHOW_EVERY_TIME) {
      setShowEarned(true);
      return;
    }

    const key = `seal-earned:${seal.slug}`;
    const already = localStorage.getItem(key);
    if (!already) {
      localStorage.setItem(key, "1");
      setShowEarned(true);
    }
  }, [isEarned, seal]);

  useEffect(() => {
    (async () => {
      setMsg(null);

      const { data: session } = await supabase.auth.getSession();
      const user = session.session?.user;
      if (!user) {
        window.location.href = "/login";
        return;
      }

      const sealRes = await supabase
        .from("seals")
        .select("id,slug,name,description")
        .eq("slug", slug)
        .single();

      if (sealRes.error) { setMsg(sealRes.error.message); return; }
      setSeal(sealRes.data);

      const objRes = await supabase
        .from("seal_objectives")
        .select("id,title,description,sort_order")
        .eq("seal_id", sealRes.data.id)
        .order("sort_order", { ascending: true });

      if (objRes.error) { setMsg(objRes.error.message); return; }
      setObjs(objRes.data ?? []);

      const ids = (objRes.data ?? []).map((o) => o.id);
      if (ids.length === 0) return;

      const progRes = await supabase
        .from("user_objective_progress")
        .select("objective_id, completed")
        .eq("user_id", user.id)
        .in("objective_id", ids);

      if (progRes.error) { setMsg(progRes.error.message); return; }

      const map: Record<string, boolean> = {};
      for (const row of progRes.data ?? []) map[row.objective_id] = !!row.completed;
      setCompletedMap(map);
    })();
  }, [slug]);
  

  async function toggleObjective(objectiveId: string, newVal: boolean) {
      if (completedMap[objectiveId] && newVal === false) {
  // Already completed -> do not allow unchecking
  return;
  }
    setMsg(null);

    const { data: session } = await supabase.auth.getSession();
    const user = session.session?.user;
    if (!user) { window.location.href = "/login"; return; }

    setCompletedMap((prev) => ({ ...prev, [objectiveId]: newVal }));

    const payload = {
      user_id: user.id,
      objective_id: objectiveId,
      completed: newVal,
      completed_at: newVal ? new Date().toISOString() : null,
    };

    const { error } = await supabase
      .from("user_objective_progress")
      .upsert(payload, { onConflict: "user_id,objective_id" });

    if (error) setMsg(error.message);
  }

  return (
    <main className="text-white">
      {showEarned && seal && (
        <SealEarnedOverlay sealName={seal.name} onClose={() => setShowEarned(false)} />
      )}

      <div className="flex items-center justify-between gap-3">
        <a className="text-sm text-white/70 hover:text-white" href="/seals">
          ← Back to Seals
        </a>
        <a className="text-sm text-white/70 hover:text-white" href="/leaderboard">
          Leaderboard
        </a>
      </div>

      {seal && (
        <div className="mt-4 rounded-3xl bg-white/3 border border-white/10 p-5 shadow-xl backdrop-blur">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight">{seal.name}</h1>
            {isEarned && (
              <span className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-200">
                Seal Earned
              </span>
            )}
          </div>
          {seal.description && <p className="mt-2 text-sm text-white/60">{seal.description}</p>}
          <p className="mt-3 text-sm text-white/70">
            Progress: <b>{progressCount}/{objs.length}</b>
          </p>
        </div>
      )}

      {msg && (
        <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {msg}
        </div>
      )}

      <ul className="mt-5 grid gap-3">
        {objs.map((o) => (
          <li key={o.id} className="rounded-2xl bg-white/3 border border-white/10 p-4 backdrop-blur">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={!!completedMap[o.id]}
                disabled={!!completedMap[o.id]} // lock once completed
                onChange={(e) => toggleObjective(o.id, e.target.checked)}
                className="mt-1 h-4 w-4 accent-amber-300 disabled:opacity-60 disabled:cursor-not-allowed"
      />

              <div className="min-w-0">
                <div className="font-semibold text-white">{o.title}</div>
                {o.description && <div className="mt-1 text-sm text-white/60">{o.description}</div>}
              </div>
            </label>
          </li>
        ))}
      </ul>
    </main>
  );
}
