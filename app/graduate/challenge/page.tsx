import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ChallengeCard from "@/components/dashboard/ChallengeCard";
import { TASKS } from "@/lib/tasks";

export default async function GraduateChallengeIndexPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "GRADUATE") redirect("/");

  return (
    <main className="mx-auto max-w-4xl px-6 pt-28 pb-10 text-white">
      <h1 className="text-2xl font-semibold">Challenges</h1>
      <p className="mt-2 text-white/60">
        Complete a micro-task to verify a skill (proof-of-work HMAC hash).
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {TASKS.map((t) => (
          <ChallengeCard key={t.id} task={t} />
        ))}
      </div>
    </main>
  );
}

