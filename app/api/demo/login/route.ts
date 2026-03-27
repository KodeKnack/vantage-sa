import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { DEMO_BYPASS_COOKIE, isDemoBypassEnabled } from "@/lib/demo-bypass";

export async function POST(req: Request) {
  if (!isDemoBypassEnabled()) {
    return NextResponse.json({ error: "Demo bypass disabled" }, { status: 404 });
  }

  const body = (await req.json().catch(() => null)) as { role?: unknown } | null;
  const role = body?.role;
  const value =
    role === Role.GRADUATE || role === Role.EMPLOYER || role === Role.ADMIN
      ? role
      : Role.GRADUATE;

  const res = NextResponse.json({ ok: true, role: value });
  res.cookies.set({
    name: DEMO_BYPASS_COOKIE,
    value,
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
  });
  return res;
}

