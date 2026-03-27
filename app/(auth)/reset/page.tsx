"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetAuthPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"working" | "done" | "error">("working");

  useEffect(() => {
    async function run() {
      try {
        const res = await fetch("/api/auth/clear", { method: "GET" });
        if (!res.ok) throw new Error("bad status");
        setStatus("done");
        router.replace("/login");
      } catch {
        setStatus("error");
      }
    }
    void run();
  }, [router]);

  return (
    <main className="mx-auto max-w-2xl px-6 pt-28 pb-10 text-white">
      <h1 className="text-2xl font-semibold">Reset session</h1>
      {status === "working" ? (
        <p className="mt-3 text-white/60">Clearing auth cookies…</p>
      ) : null}
      {status === "done" ? (
        <p className="mt-3 text-emerald-300">Done. Redirecting to login…</p>
      ) : null}
      {status === "error" ? (
        <p className="mt-3 text-red-300">
          Could not clear cookies. Open `/api/auth/clear` directly.
        </p>
      ) : null}
    </main>
  );
}

