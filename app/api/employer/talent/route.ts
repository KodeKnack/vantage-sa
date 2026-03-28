import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-options';
import { MOCK_GRADUATES } from '@/lib/mock-data';

async function getFromDB() {
  const { prisma } = await import('@/lib/prisma');
  const users = await prisma.user.findMany({
    where: { role: 'GRADUATE' },
    include: { verifiedSkills: true },
  });
  return users.map((u: any) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    vps: u.aptitudeScore ?? 0,
    location: '',
    university: '',
    skills: u.verifiedSkills ?? [],
    verifiedCount: u.verifiedSkills?.filter((s: any) => s.isVerified).length ?? 0,
  }));
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'EMPLOYER') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  try {
    const data = await getFromDB();
    return NextResponse.json(data);
  } catch {
    const fallback = MOCK_GRADUATES.map((g) => ({
      id: g.id,
      name: g.name,
      email: g.email,
      vps: g.vps,
      location: g.location,
      university: g.university,
      degree: g.degree,
      skills: g.skills,
      verifiedCount: g.skills.filter((s) => s.isVerified).length,
      aptitudeScore: g.aptitudeScore,
    }));
    return NextResponse.json(fallback);
  }
}

