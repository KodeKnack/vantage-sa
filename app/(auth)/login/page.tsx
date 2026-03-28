import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black px-6">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Loading…</div>
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}

