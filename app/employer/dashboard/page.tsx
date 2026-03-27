import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function EmployerDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <main className="mx-auto max-w-5xl px-6 pt-28 pb-10 text-white">
      <h1 className="text-2xl font-semibold">Employer dashboard</h1>
      <p className="mt-2 text-white/60">Signed in as {session.user.email}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-sm font-medium">ROI API</div>
          <div className="mt-1 text-sm text-white/60">
            POST <span className="font-mono">/api/employer/roi</span>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-sm font-medium">Talent API</div>
          <div className="mt-1 text-sm text-white/60">
            GET <span className="font-mono">/api/employer/talent</span>
          </div>
        </div>
      </div>
    </main>
  );
}

