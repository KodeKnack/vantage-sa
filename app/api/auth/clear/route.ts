import { NextResponse } from "next/server";

function clearCookie(
  res: NextResponse,
  name: string,
  opts?: { secure?: boolean },
) {
  res.cookies.set({
    name,
    value: "",
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: opts?.secure ?? false,
  });
}

export async function GET() {
  const res = NextResponse.json({
    ok: true,
    message:
      "Cleared NextAuth cookies. Reload the app and sign in again. (Useful after NEXTAUTH_SECRET changes.)",
  });

  // Common NextAuth v4 cookie names
  clearCookie(res, "next-auth.session-token");
  clearCookie(res, "__Secure-next-auth.session-token", { secure: true });

  clearCookie(res, "next-auth.csrf-token");
  clearCookie(res, "__Host-next-auth.csrf-token", { secure: true });

  clearCookie(res, "next-auth.callback-url");

  return res;
}

