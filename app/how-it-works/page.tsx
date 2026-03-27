import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 pt-28 pb-10 text-white">
      <h1 className="text-3xl font-semibold">How it works</h1>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-white/70">
        <li>Graduate uploads a CV to import skills.</li>
        <li>Graduate plays the aptitude game to set an aptitude score.</li>
        <li>Graduate completes micro-tasks to verify skills (HMAC proof hash).</li>
        <li>Passport PDF is generated with verified skills.</li>
        <li>Employer views ROI and the verified talent pool.</li>
      </ol>
      <div className="mt-6 flex flex-wrap gap-3">
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

