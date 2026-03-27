import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function EmployerPortalPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role === "EMPLOYER") redirect("/employer/dashboard");
  if (session?.user?.role === "GRADUATE") redirect("/graduate/dashboard");

  return (
    <main className="mx-auto max-w-4xl px-6 pt-28 pb-10 text-white">
      <h1 className="text-3xl font-semibold">Employer portal</h1>
      <p className="mt-3 text-white/60">
        Sign in to access the ROI calculator and verified talent pool.
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
