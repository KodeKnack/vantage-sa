import { NextResponse } from "next/server";
import { DEMO_BYPASS_COOKIE, isDemoBypassEnabled } from "@/lib/demo-bypass";

export async function POST() {
  if (!isDemoBypassEnabled()) {
    return NextResponse.json({ error: "Demo bypass disabled" }, { status: 404 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: DEMO_BYPASS_COOKIE,
    value: "",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
  });
  return res;
}

