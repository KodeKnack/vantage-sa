import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTaskById } from "@/lib/tasks";
import ChallengeRunner from "./runner";

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "GRADUATE") redirect("/");

  const { taskId } = await params;
  const task = getTaskById(taskId);
  if (!task) redirect("/graduate/challenge");

  return <ChallengeRunner task={task} />;
}

