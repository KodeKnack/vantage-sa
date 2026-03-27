import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AptitudeGame from "@/components/game/AptitudeGame";

export default async function GraduateGamePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "GRADUATE") redirect("/");

  return <AptitudeGame />;
}

