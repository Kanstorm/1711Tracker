"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AuthShell from "@/app/components/AuthShell";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSignup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setBusy(false);
      setMsg(error.message);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setBusy(false);
      setMsg("Signup succeeded, but no user id returned.");
      return;
    }

    const { error: profileErr } = await supabase
      .from("profiles")
      .insert({ id: userId, username });

    setBusy(false);

    if (profileErr) {
      setMsg(profileErr.message);
      return;
    }

    // If email confirmation is ON, user may need to confirm before session exists.
    window.location.href = "/seals";
  }

  return (
    <AuthShell title="Create account" subtitle="Start earning Seals.">
      <form onSubmit={onSignup} className="grid gap-3">
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
        <input
          className="rounded-xl bg-black/20 border border-white/10 px-4 py-2 text-white placeholder:text-white/40 outline-none focus:border-amber-300/40"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <button
          disabled={busy}
          type="submit"
          className="rounded-xl px-4 py-2 font-semibold bg-amber-300/10 hover:bg-amber-300/15 border border-amber-300/20 text-amber-100 transition disabled:opacity-60"
        >
          {busy ? "Creating..." : "Sign up"}
        </button>
      </form>

      {msg && (
        <div className="mt-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {msg}
        </div>
      )}

      <p className="mt-4 text-center text-sm text-white/60">
        Already have an account?{" "}
        <a className="text-amber-200 hover:text-amber-100" href="/login">
          Log in
        </a>
      </p>
    </AuthShell>
  );
}
