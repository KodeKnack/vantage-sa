import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/require-role";
import { prisma } from "@/lib/prisma";
import { parseCV } from "@/lib/affinda";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function POST(req: Request) {
  const session = await requireRole(Role.GRADUATE);

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Only PDF or DOCX supported" },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Max size is 5MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const parsed = await parseCV(buffer, file.name);

  const existing = await prisma.skill.findMany({
    where: { userId: session.user.id },
    select: { name: true },
  });
  const existingNames = new Set(existing.map((s) => s.name.toLowerCase()));

  const toCreate = parsed.skills.filter((s) => !existingNames.has(s.toLowerCase()));
  await prisma.skill.createMany({
    data: toCreate.map((name) => ({
      userId: session.user.id,
      name,
      isVerified: false,
    })),
  });

  return NextResponse.json({
    ok: true,
    fileName: file.name,
    parsed: {
      name: parsed.name,
      email: parsed.email,
      skillsFound: parsed.skills.length,
    },
    skillsCreated: toCreate.length,
    usedMockData: !process.env.AFFINDA_API_KEY,
  });
}
