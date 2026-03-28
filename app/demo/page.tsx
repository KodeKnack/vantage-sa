"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function DemoPage() {
  const [busy, setBusy] = useState<"graduate" | "employer" | null>(null);

  async function loginAs(role: "graduate" | "employer") {
    setBusy(role);
    // Prefer bypass when available; fall back to NextAuth credentials.
    const bypassRes = await fetch("/api/demo/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: role === "graduate" ? "GRADUATE" : "EMPLOYER" }),
    });

    if (bypassRes.ok) {
      window.location.href =
        role === "graduate" ? "/graduate/dashboard" : "/employer/dashboard";
      return;
    }

    await signIn("credentials", {
      email: role === "graduate" ? "graduate@demo.co.za" : "employer@demo.co.za",
      password: "Demo1234!",
      redirect: true,
      callbackUrl: role === "graduate" ? "/graduate/dashboard" : "/employer/dashboard",
    });
  }

  return (
    <main className="mx-auto max-w-3xl px-6 pt-28 pb-10 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <div className="text-xs uppercase tracking-widest text-emerald-300/80">
          Demo switchboard
        </div>
        <h1 className="mt-3 text-3xl font-semibold">Vantage SA</h1>
        <p className="mt-3 text-white/60">
          One-click role switching for judge demos.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => loginAs("graduate")}
            disabled={busy !== null}
            className="rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-black disabled:opacity-60"
          >
            {busy === "graduate" ? "Signing in…" : "Graduate view (Thabo Nkosi)"}
          </button>
          <button
            onClick={() => loginAs("employer")}
            disabled={busy !== null}
            className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white hover:bg-white/[0.06] disabled:opacity-60"
          >
            {busy === "employer" ? "Signing in…" : "Employer view (TechCorp SA)"}
          </button>
        </div>

        <div className="mt-6 text-xs text-white/50">
          If demo bypass is unavailable, configure <span className="font-mono">DATABASE_URL</span>{" "}
          and run <span className="font-mono">npm run db:setup</span>.
        </div>
      </div>
    </main>
  );
}
