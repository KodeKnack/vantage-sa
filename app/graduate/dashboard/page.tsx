import { getServerSession } from "next-auth";
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
      </div>
    </main>
  );
}

