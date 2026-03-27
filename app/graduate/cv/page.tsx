import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import CVUpload from "@/components/dashboard/CVUpload";

export default async function GraduateCVPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "GRADUATE") redirect("/");

  return (
    <main className="mx-auto max-w-4xl px-6 pt-28 pb-10 text-white">
      <h1 className="text-2xl font-semibold">CV import</h1>
      <p className="mt-2 text-white/60">
        Upload a CV to import skills into your profile.
      </p>
      <div className="mt-6">
        <CVUpload />
      </div>
    </main>
  );
}

