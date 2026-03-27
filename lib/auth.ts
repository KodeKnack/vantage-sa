import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getRoleFromCookie, isDemoBypassEnabled } from "@/lib/demo-bypass";

export async function getSession() {
  if (isDemoBypassEnabled()) {
    const role = getRoleFromCookie();
    if (!role) return null;
    return {
      user: {
        id: `demo-${role.toLowerCase()}`,
        email: `${role.toLowerCase()}@demo.local`,
        name: `Demo ${role}`,
        role,
      },
      expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };
  }
  return getServerSession(authOptions);
}

export async function requireRole(role: Role) {
  const session = await getSession();
  if (!session?.user?.id || session.user.role !== role) {
    throw NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}
