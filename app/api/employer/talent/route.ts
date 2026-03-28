import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/require-role";
import { prisma } from "@/lib/prisma";
import { calculateTrustScore } from "@/lib/trust-score";

export async function GET() {
  await requireRole(Role.EMPLOYER);

  const graduates = await prisma.user.findMany({
    where: { role: Role.GRADUATE },
    include: { verifiedSkills: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const rows = graduates.map((g) => {
    const totalSkillCount = g.verifiedSkills.length;
    const verifiedSkillCount = g.verifiedSkills.filter((s) => s.isVerified).length;
    const trustScore = calculateTrustScore({
      aptitudeScore: g.aptitudeScore ?? 0,
      verifiedSkillCount,
      totalSkillCount,
    });

    return {
      id: g.id,
      name: g.name,
      email: g.email,
      aptitudeScore: g.aptitudeScore,
      trustScore,
      skills: g.verifiedSkills.map((s) => ({
        id: s.id,
        name: s.name,
        isVerified: s.isVerified,
        proofHash: s.proofHash,
      })),
    };
  });

  return NextResponse.json({ rows });
}
