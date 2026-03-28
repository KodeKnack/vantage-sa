import Link from "next/link";
import { redirect } from "next/navigation";
import { getSafeSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import VPSRing from "@/components/dashboard/VPSRing";
import { MOCK_GRADUATES } from '@/lib/mock-data';
import { Check } from "lucide-react";

export default async function GraduateDashboardPage() {
  const session = await getSafeSession();
  if (!session) redirect("/login");

  let aptitudeScore = 0;
  let verifiedSkillCount = 0;
  let totalSkillCount = 0;
  let skills: { id: string; name: string; isVerified: boolean; proofHash: string | null }[] = [];
  let graduateName = session.user.name ?? 'Graduate';
  let graduateEmail = session.user.email ?? '';

  try {
    const user = await prisma.user.findUnique({
      where: { email: graduateEmail },
      include: { verifiedSkills: true },
    });
    if (user) {
      aptitudeScore = user.aptitudeScore ?? 0;
      skills = user.verifiedSkills ?? [];
      verifiedSkillCount = skills.filter((s) => s.isVerified).length;
      totalSkillCount = skills.length;
    } else {
      throw new Error('User not found');
    }
  } catch {
    const mock = MOCK_GRADUATES.find((g) => g.email === graduateEmail) ?? MOCK_GRADUATES[0];
    aptitudeScore = mock.aptitudeScore;
    skills = mock.skills;
    verifiedSkillCount = mock.skills.filter((s) => s.isVerified).length;
    totalSkillCount = mock.skills.length;
    graduateName = mock.name;
    graduateEmail = mock.email;
  }

  const vps = Math.min(100, Math.round(
    0.6 * aptitudeScore +
    (totalSkillCount > 0 ? (verifiedSkillCount / totalSkillCount) : 0) * 100 * 0.4
  ));

  return (
    <main className="mx-auto max-w-6xl px-6 pt-28 pb-10 text-white">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Graduate dashboard</h1>
          <p className="mt-2 text-white/60">
            Signed in as {graduateName} ({graduateEmail})
          </p>
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

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
          <VPSRing vps={vps} />
          <div className="border-t border-white/10 px-6 py-4 text-sm text-white/70">
            Aptitude score: <span className="font-mono text-white">{aptitudeScore}</span>
            <div className="mt-1">
              Verified skills:{" "}
              <span className="font-mono text-white">
                {verifiedSkillCount}/{totalSkillCount || 0}
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

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {skills.length === 0 ? (
              <div className="text-sm text-white/50">No skills yet. Upload your CV.</div>
            ) : (
              skills.map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white/90">
                        {s.name}
                      </div>
                      {s.isVerified && s.proofHash ? (
                        <div className="mt-1 font-mono text-[11px] text-white/55">
                          proof: {s.proofHash.slice(0, 8)}
                        </div>
                      ) : null}
                    </div>

                    {s.isVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] font-medium text-emerald-200">
                        <Check className="h-3 w-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-1 text-[10px] font-medium text-white/70">
                        Unverified
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
