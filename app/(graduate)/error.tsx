"use client";

export default function GraduateError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-3xl px-6 pt-28 pb-10 text-white">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-3 text-white/60">{error.message}</p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-black"
      >
        Retry
      </button>
    </main>
  );
}

