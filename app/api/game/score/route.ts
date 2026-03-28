import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { Role } from "@prisma/client";

const BodySchema = z.object({
  score: z.number().int().min(0).max(100),
});

export async function POST(req: Request) {
  const session = await requireRole(Role.GRADUATE);
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { aptitudeScore: parsed.data.score },
  });

  return NextResponse.json({ ok: true });
}
