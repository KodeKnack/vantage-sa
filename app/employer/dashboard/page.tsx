import { getSafeSession } from "@/lib/auth";
import ROIDashboard from "@/components/employer/ROIDashboard";
import TalentTable from "@/components/employer/TalentTable";

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

  return (
    <main className="mx-auto max-w-6xl px-6 pt-28 pb-10 text-white">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Employer dashboard</h1>
          <p className="mt-2 text-white/60">Signed in as {session.user.email}</p>
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
              Estimates only. Consult a registered tax practitioner.
            </p>
          </div>
        </div>

        <TalentTable />
      </div>
    </main>
  );
}
