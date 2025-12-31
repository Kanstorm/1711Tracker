"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AuthShell from "@/app/components/AuthShell";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);

    if (error) {
      setMsg(error.message);
      return;
    }
    window.location.href = "/seals";
  }

  return (
    <AuthShell title="Log in" subtitle="Welcome back.">
      <form onSubmit={onLogin} className="grid gap-3">
        <input
          className="rounded-xl bg-black/20 border border-white/10 px-4 py-2 text-white placeholder:text-white/40 outline-none focus:border-amber-300/40"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="rounded-xl bg-black/20 border border-white/10 px-4 py-2 text-white placeholder:text-white/40 outline-none focus:border-amber-300/40"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          disabled={busy}
          type="submit"
          className="rounded-xl px-4 py-2 font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-white/85 transition disabled:opacity-60"
        >
          {busy ? "Logging in..." : "Log in"}
        </button>
      </form>

      {msg && (
        <div className="mt-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {msg}
        </div>
      )}

      <p className="mt-4 text-center text-sm text-white/60">
        Need an account?{" "}
        <a className="text-amber-200 hover:text-amber-100" href="/signup">
          Sign up
        </a>
      </p>
    </AuthShell>
  );
}
