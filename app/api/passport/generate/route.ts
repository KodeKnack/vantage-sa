import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { getSafeSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MOCK_GRADUATES } from "@/lib/mock-data";
import { calculateTrustScore } from "@/lib/trust-score";
import { renderToBuffer } from "@react-pdf/renderer";
import { createPassportDoc } from "@/components/passport/VantagePassport";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await getSafeSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const graduateId = url.searchParams.get("graduateId") ?? url.searchParams.get("userId");

  let targetUserId: string | null = null;
  if (session.user.role === Role.GRADUATE) {
    targetUserId = session.user.id;
  } else {
    // Employers/admins must specify which graduate to download
    if (!graduateId) {
      return NextResponse.json(
        { error: "Missing graduateId" },
        { status: 400 },
      );
    }
    targetUserId = graduateId;
  }

  let user: {
    id: string;
    name: string;
    email: string;
    aptitudeScore: number | null;
    verifiedSkills: Array<{ name: string; isVerified: boolean; proofHash: string | null }>;
  } | null = null;
  try {
    user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { verifiedSkills: true },
    });
  } catch {
    user = null;
  }

  if (!user) {
    const mock =
      MOCK_GRADUATES.find((g) => g.id === targetUserId) ??
      MOCK_GRADUATES.find((g) => g.email === targetUserId) ??
      null;
    if (!mock) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const issuedDateISO = new Date().toISOString().slice(0, 10);
    const verifyUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/graduates`;
    const doc = createPassportDoc({
      name: mock.name,
      email: mock.email,
      vps: mock.vps,
      skills: mock.skills.map((s) => ({
        name: s.name,
        isVerified: s.isVerified,
        proofHash: s.proofHash,
      })),
      issuedDateISO,
      verifyUrl,
    });

    const pdfBuffer = await renderToBuffer(doc);
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="vantage-passport.pdf"',
      },
    });
  }

  const totalSkillCount = user.verifiedSkills.length;
  const verifiedSkillCount = user.verifiedSkills.filter((s) => s.isVerified).length;
  const trustScore = calculateTrustScore({
    aptitudeScore: user.aptitudeScore ?? 0,
    verifiedSkillCount,
    totalSkillCount,
  });

  const issuedDateISO = new Date().toISOString().slice(0, 10);
  const verifyUrl = `https://vantage-sa.vercel.app/profile/${user.id}`;
  const doc = createPassportDoc({
    name: user.name,
    email: user.email,
    vps: trustScore,
    skills: user.verifiedSkills.map((s) => ({
      name: s.name,
      isVerified: s.isVerified,
      proofHash: s.proofHash,
    })),
    issuedDateISO,
    verifyUrl,
  });

  const pdfBuffer = await renderToBuffer(doc);
  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="vantage-passport.pdf"',
    },
  });
}
