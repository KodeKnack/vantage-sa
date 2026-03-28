import { NextResponse } from "next/server";
import { z } from "zod";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/require-role";
import { calculateROI } from "@/lib/bbee";

const BodySchema = z.object({
  hireCount: z.number().int().min(1).max(1000),
  annualPayroll: z.number().int().min(0).max(1_000_000_000).default(2_000_000),
});

export async function POST(req: Request) {
  await requireRole(Role.EMPLOYER);
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { hireCount, annualPayroll } = parsed.data;
  return NextResponse.json(calculateROI(hireCount, annualPayroll));
}
