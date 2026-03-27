import Link from "next/link";

export default function EmployersPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 pt-28 pb-10 text-white">
      <h1 className="text-3xl font-semibold">For employers</h1>
      <p className="mt-3 text-white/60">
        Hire with confidence using verified skill proof and a clear ROI estimate.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/employer-portal"
          className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-black"
        >
          Open employer portal
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-white hover:bg-white/[0.06]"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
