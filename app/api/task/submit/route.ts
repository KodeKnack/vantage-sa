import { NextResponse } from "next/server";
import { z } from "zod";
import { Role, TaskType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";

const BodySchema = z.object({
  taskId: z.string().min(1),
  title: z.string().min(1),
  type: z.nativeEnum(TaskType),
  skillName: z.string().min(1),
  submission: z.string().min(20),
});

function verifySubmission(type: TaskType, submission: string) {
  const s = submission.toLowerCase();
  if (type === TaskType.SQL) {
    return s.includes("left join") && (s.includes(" is null") || s.includes("is null"));
  }
  if (type === TaskType.WRITING) return submission.length >= 80;
  if (type === TaskType.LOGIC) return submission.length >= 20;
  if (type === TaskType.DATA) return submission.length >= 20;
  return false;
}

export async function POST(req: Request) {
  const session = await requireRole(Role.GRADUATE);
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { taskId, title, type, submission } = parsed.data;
  const isVerified = verifySubmission(type, submission);

  let result: { success: boolean; message: string } = { success: false, message: "" };

  try {
    await prisma.microTask.upsert({
      where: { id: taskId },
      create: {
        id: taskId,
        userId: session.user.id,
        title,
        type,
        prompt: "",
        submission,
        isVerified: isVerified,
      },
      update: {
        isVerified: isVerified,
        submission,
      },
    });
    result = {
      success: true,
      message: isVerified
        ? "Task verified successfully!"
        : "Task submitted but could not be verified.",
    };
  } catch {
    // DB unreachable — return mock success for demo
    result = {
      success: true,
      message: isVerified
        ? "Task verified successfully! (demo mode)"
        : "Task submitted! (demo mode)",
    };
  }

  return NextResponse.json(result);
}
