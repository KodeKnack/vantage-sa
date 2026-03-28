import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import { getSafeSession } from "@/lib/auth";

export async function requireRole(role: Role) {
  const session = await getSafeSession();
  if (!session?.user?.id || (session.user as { role?: unknown }).role !== role) {
    throw NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}

