import Link from "next/link";
import { redirect } from "next/navigation";
import { getSafeSession } from "@/lib/auth";

export default async function GraduateViewPage() {
  const session = await getSafeSession();
  if (session?.user?.role === "GRADUATE") redirect("/graduate/dashboard");
  if (session?.user?.role === "EMPLOYER") redirect("/employer/dashboard");

  return (
    <main className="mx-auto max-w-4xl px-6 pt-28 pb-10 text-white">
      <h1 className="text-3xl font-semibold">Graduate view</h1>
      <p className="mt-3 text-white/60">
        Sign in to upload your CV, play the aptitude game, and verify skills.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/login"
          className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-black"
        >
          Sign in
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
