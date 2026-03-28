import { getSafeSession } from "@/lib/auth";
import ROIDashboard from "@/components/employer/ROIDashboard";
import { MOCK_GRADUATES, MOCK_EMPLOYER, MOCK_ROI_DEFAULTS } from '@/lib/mock-data';

type GraduateLike = {
  id: string;
  name: string;
  email: string;
  aptitudeScore?: number | null;
  vps?: number;
  location?: string;
  university?: string;
  degree?: string;
  verifiedSkills?: Array<{ name: string; isVerified: boolean }>;
  skills?: Array<{ name: string; isVerified: boolean }>;
};

export default async function EmployerDashboardPage() {
  const session = await getSafeSession();
  if (!session) {
    return (
      <main className="mx-auto max-w-4xl px-6 pt-28 pb-10 text-white">
        <h1 className="text-2xl font-semibold">Employer dashboard</h1>
        <p className="mt-2 text-white/60">
          Please sign in to view the talent pool and ROI calculator.
        </p>
      </main>
    );
  }

  let graduates: GraduateLike[] = [];
  try {
    const { prisma } = await import('@/lib/prisma');
    graduates = (await prisma.user.findMany({
      where: { role: 'GRADUATE' },
      include: { verifiedSkills: true },
    })) as unknown as GraduateLike[];
    if (!graduates.length) throw new Error('empty');
  } catch {
    graduates = MOCK_GRADUATES.map((g) => ({
      ...g,
      verifiedSkills: g.skills,
    }));
  }

  return (
    <main className="mx-auto max-w-6xl px-6 pt-28 pb-10 text-white">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Employer dashboard</h1>
          <p className="mt-2 text-white/60">
            Signed in as {session.user.email} · {MOCK_EMPLOYER.name}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <ROIDashboard />
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold">Quick demo path</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-white/60">
              <li>Seed demo data: <span className="font-mono">npm run db:setup</span></li>
              <li>Open the Talent Pool and click Thabo.</li>
              <li>Download passport PDF from the drawer.</li>
            </ol>
            <p className="mt-4 text-xs text-white/40">
              ROI defaults:{" "}
              <span className="font-mono">
                avgSalary={MOCK_ROI_DEFAULTS.avgSalary} hiringCost={MOCK_ROI_DEFAULTS.hiringCost}
              </span>
            </p>
            <p className="mt-4 text-xs text-white/40">
              Estimates only. Consult a registered tax practitioner.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold">Talent pool</h2>
          <p className="mt-2 text-sm text-white/60">
            Verified graduates with VPS and skills.
          </p>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[960px] text-sm">
              <thead className="text-left text-white/60">
                <tr className="border-b border-white/10">
                  <th className="py-3 pr-4 font-medium">Name</th>
                  <th className="py-3 pr-4 font-medium">University</th>
                  <th className="py-3 pr-4 font-medium">Degree</th>
                  <th className="py-3 pr-4 font-medium">Location</th>
                  <th className="py-3 pr-4 font-medium">VPS</th>
                  <th className="py-3 pr-4 font-medium">Aptitude</th>
                  <th className="py-3 pr-4 font-medium">Verified skills</th>
                  <th className="py-3 pr-4 font-medium">Top skills</th>
                  <th className="py-3 pr-0 font-medium">Passport</th>
                </tr>
              </thead>
              <tbody className="text-white/80">
                {graduates.map((g) => {
                  const allSkills = (g.verifiedSkills ?? g.skills ?? []) as Array<{
                    name: string;
                    isVerified: boolean;
                  }>;
                  const verifiedCount = allSkills.filter((s) => s.isVerified).length;
                  const top3 = allSkills.slice(0, 3);
                  const vps = typeof g.vps === "number" ? g.vps : (g.aptitudeScore ?? 0);

                  return (
                    <tr key={g.id} className="border-b border-white/10 last:border-0">
                      <td className="py-3 pr-4 font-medium text-white">{g.name}</td>
                      <td className="py-3 pr-4 text-white/70">{g.university ?? ""}</td>
                      <td className="py-3 pr-4 text-white/70">{g.degree ?? ""}</td>
                      <td className="py-3 pr-4 text-white/70">{g.location ?? ""}</td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-200">
                          {vps}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-mono">{g.aptitudeScore ?? ""}</td>
                      <td className="py-3 pr-4 font-mono">{verifiedCount}</td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-2">
                          {top3.map((s) => (
                            <span
                              key={`${g.id}:${s.name}`}
                              className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-white/80"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 pr-0">
                        <a
                          href={`/api/passport/generate?graduateId=${encodeURIComponent(g.id)}`}
                          className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-semibold text-black"
                        >
                          Download
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
