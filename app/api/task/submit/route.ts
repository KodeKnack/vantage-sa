import { NextResponse } from "next/server";
import { z } from "zod";
import { Role, TaskType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { hmacSha256 } from "@/lib/hmac";

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

  const { taskId, title, type, skillName, submission } = parsed.data;
  const isVerified = verifySubmission(type, submission);

  const microTask = await prisma.microTask.upsert({
    where: { id: taskId },
    create: {
      id: taskId,
      title,
      type,
      prompt: "",
      userId: session.user.id,
      submission,
      isVerified,
    },
    update: {
      title,
      type,
      submission,
      isVerified,
    },
  });

  let proofHash: string | null = null;
  if (isVerified) {
    proofHash = hmacSha256(`${session.user.id}:${microTask.id}:${submission}`);
    const existingSkill = await prisma.skill.findFirst({
      where: { userId: session.user.id, name: skillName },
      orderBy: { id: "desc" },
    });

    if (existingSkill) {
      await prisma.skill.update({
        where: { id: existingSkill.id },
        data: { isVerified: true, proofHash, proofLink: microTask.id },
      });
    } else {
      await prisma.skill.create({
        data: {
          userId: session.user.id,
          name: skillName,
          isVerified: true,
          proofHash,
          proofLink: microTask.id,
        },
      });
    }
  }

  return NextResponse.json({
    ok: true,
    microTaskId: microTask.id,
    isVerified,
    proofHash,
  });
}
