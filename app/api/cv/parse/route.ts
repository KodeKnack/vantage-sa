import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const FALLBACK_SKILLS = [
  "SQL",
  "Python",
  "Data Analysis",
  "Communication",
  "React",
  "TypeScript",
];

export async function POST(req: Request) {
  const session = await requireRole(Role.GRADUATE);

  // MVP-safe fallback: accept a file upload, but do not rely on a third-party API during local build.
  // If/when AFFINDA_API_KEY is configured, wire in real parsing.
  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const existing = await prisma.skill.findMany({
    where: { userId: session.user.id },
    select: { name: true },
  });
  const existingNames = new Set(existing.map((s) => s.name.toLowerCase()));

  const toCreate = FALLBACK_SKILLS.filter((s) => !existingNames.has(s.toLowerCase()));
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
    skillsCreated: toCreate.length,
    note:
      process.env.AFFINDA_API_KEY
        ? "AFFINDA_API_KEY is set but parsing is not wired yet."
        : "AFFINDA_API_KEY not set; used fallback skills.",
  });
}

