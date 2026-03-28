"use client";

import { signIn } from "next-auth/react";
import { type FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bypassEnabled, setBypassEnabled] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/demo/enabled")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { enabled?: unknown } | null) => {
        if (cancelled) return;
        setBypassEnabled(data?.enabled === true);
      })
      .catch(() => {
        if (cancelled) return;
        setBypassEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function bypassLogin(role: "GRADUATE" | "EMPLOYER") {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/demo/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        setError("Demo bypass is disabled.");
        return;
      }
      router.push(role === "GRADUATE" ? "/graduate/dashboard" : "/employer/dashboard");
    } catch {
      setError("Demo bypass failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const callbackUrl = searchParams.get("callbackUrl") ?? "/";
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setIsSubmitting(false);
      return;
    }
    router.push(result?.url ?? callbackUrl);
    setIsSubmitting(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black px-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950"
      >
        <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          Sign in
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Use your demo account credentials.
        </p>

        {bypassEnabled ? (
          <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
            <div className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-300">
              Demo bypass enabled
            </div>
            <div className="mt-2 grid gap-2">
              <button
                type="button"
                onClick={() => bypassLogin("GRADUATE")}
                disabled={isSubmitting}
                className="w-full rounded-lg bg-emerald-400 px-3 py-2 text-sm font-semibold text-black disabled:opacity-60"
              >
                {isSubmitting ? "Working…" : "Enter as Graduate"}
              </button>
              <button
                type="button"
                onClick={() => bypassLogin("EMPLOYER")}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 disabled:opacity-60 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
              >
                {isSubmitting ? "Working…" : "Enter as Employer"}
              </button>
            </div>
            <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
              This skips NextAuth + Prisma and avoids JWT cookie issues.
            </div>
          </div>
        ) : null}

        <div className="mt-5 space-y-3">
          <label className="block">
            <span className="text-sm text-zinc-700 dark:text-zinc-300">
              Email
            </span>
            <input
              className="mt-1 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-zinc-950 outline-none focus:ring-2 focus:ring-emerald-400/50 dark:border-white/10 dark:text-zinc-50"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="text-sm text-zinc-700 dark:text-zinc-300">
              Password
            </span>
            <input
              className="mt-1 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-zinc-950 outline-none focus:ring-2 focus:ring-emerald-400/50 dark:border-white/10 dark:text-zinc-50"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : null}

        <button
          className="mt-5 w-full rounded-lg bg-emerald-400 px-3 py-2 text-sm font-medium text-black disabled:opacity-60"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

