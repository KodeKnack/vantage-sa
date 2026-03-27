import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateTrustScore } from "@/lib/trust-score";
import VPSRing from "@/components/dashboard/VPSRing";

export default async function GraduateDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  let aptitudeScore = 0;
  let verified = 0;
  let total = 0;
  let skills: Array<{ id: string; name: string; isVerified: boolean }> = [];
  let dbError: string | null = null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { verifiedSkills: true },
    });
    if (user) {
      aptitudeScore = user.aptitudeScore ?? 0;
      total = user.verifiedSkills.length;
      verified = user.verifiedSkills.filter((s) => s.isVerified).length;
      skills = user.verifiedSkills.map((s) => ({
        id: s.id,
        name: s.name,
        isVerified: s.isVerified,
      }));
    } else {
      dbError = "User not found in database (run `npm run db:setup`).";
    }
  } catch {
    dbError = "Database not connected. Set DATABASE_URL and run migrations.";
  }

  const trustScore = calculateTrustScore({
    aptitudeScore,
    verifiedSkillCount: verified,
    totalSkillCount: total,
  });

  return (
    <main className="mx-auto max-w-6xl px-6 pt-28 pb-10 text-white">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Graduate dashboard</h1>
          <p className="mt-2 text-white/60">Signed in as {session.user.email}</p>
        </div>
        <div className="flex flex-wrap gap-3">
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
            Challenges
          </Link>
          <a
            className="rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-white hover:bg-white/[0.06]"
            href="/api/passport/generate"
          >
            Download passport
          </a>
        </div>
      </div>

      {dbError ? (
        <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {dbError}
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
          <VPSRing vps={trustScore} />
          <div className="border-t border-white/10 px-6 py-4 text-sm text-white/70">
            Aptitude score: <span className="font-mono text-white">{aptitudeScore}</span>
            <div className="mt-1">
              Verified skills:{" "}
              <span className="font-mono text-white">
                {verified}/{total || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-white/40">
            Verified skills
          </div>
          <div className="mt-2 text-sm text-white/60">
            Complete challenges to verify skills and earn proof hashes on your passport.
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {skills.length === 0 ? (
              <div className="text-sm text-white/50">No skills yet. Upload your CV.</div>
            ) : (
              skills.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
                    s.isVerified
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-amber-500/20 bg-amber-500/5"
                  }`}
                >
                  <span className="text-white/90">{s.name}</span>
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                      s.isVerified
                        ? "bg-emerald-500/15 text-emerald-200"
                        : "bg-amber-500/15 text-amber-200"
                    }`}
                  >
                    {s.isVerified ? "✓ Verified" : "⏳ Untested"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
