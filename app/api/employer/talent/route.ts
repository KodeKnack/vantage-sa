import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-options';
import { MOCK_GRADUATES } from '@/lib/mock-data';

export async function GET() {
  const session = await getServerSession(authOptions).catch(() => null);
  if (!session || (session.user as any).role !== 'EMPLOYER') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  try {
    const { prisma } = await import('@/lib/prisma');
    const users = await prisma.user.findMany({
      where: { role: 'GRADUATE' },
      include: { verifiedSkills: true },
    });
    if (!users.length) throw new Error('empty');

    return NextResponse.json(users.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      vps: u.aptitudeScore ?? 0,
      skills: u.verifiedSkills ?? [],
      verifiedCount: (u.verifiedSkills ?? []).filter((s: any) => s.isVerified).length,
    })));
  } catch {
    return NextResponse.json(
      MOCK_GRADUATES.map((g) => ({
        id: g.id,
        name: g.name,
        email: g.email,
        vps: g.vps,
        aptitudeScore: g.aptitudeScore,
        location: g.location,
        university: g.university,
        degree: g.degree,
        bio: g.bio,
        skills: g.skills,
        verifiedCount: g.skills.filter((s) => s.isVerified).length,
        cvSummary: g.cvSummary,
        challenges: g.challenges,
      }))
    );
  }
}

