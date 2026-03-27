import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function GraduateDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <main className="mx-auto max-w-4xl px-6 pt-28 pb-10 text-white">
      <h1 className="text-2xl font-semibold">Graduate dashboard</h1>
      <p className="mt-2 text-white/60">Signed in as {session.user.email}</p>
      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="text-sm text-white/70">
          Next steps: upload CV, play the game, complete a micro-task, download passport.
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            className="rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-white hover:bg-white/[0.06]"
            href="/graduate/cv"
          >
            Upload CV
          </Link>
          <Link
            className="rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-white hover:bg-white/[0.06]"
            href="/graduate/game"
          >
            Play game
          </Link>
          <Link
            className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-black"
            href="/graduate/challenge"
          >
            Start challenge
          </Link>
          <a
            className="rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-white hover:bg-white/[0.06]"
            href="/api/passport/generate"
          >
            Download passport (PDF)
          </a>
        </div>
      </div>
    </main>
  );
}
