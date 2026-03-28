import { redirect } from "next/navigation";
import { getSafeSession } from "@/lib/auth";
import AptitudeGame from "@/components/game/AptitudeGame";

export default async function GraduateGamePage() {
  const session = await getSafeSession();
  if (!session) redirect("/login");
  if (session.user.role !== "GRADUATE") redirect("/");

  return <AptitudeGame />;
}
