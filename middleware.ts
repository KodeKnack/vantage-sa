import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

const DEMO_COOKIE = "vantage_demo_role";

function isDemoBypassEnabled() {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.DEMO_BYPASS_AUTH === "1") return true;
  const url = process.env.DATABASE_URL ?? "";
  if (url.includes("@HOST:5432") || url.includes("USER:PASSWORD@HOST")) return true;
  return false;
}

function roleForPath(pathname: string) {
  if (pathname.startsWith("/graduate")) return "GRADUATE";
  if (pathname.startsWith("/employer")) return "EMPLOYER";
  return null;
}

function isRoleAllowed(pathname: string, role: unknown) {
  if (typeof role !== "string") return false;
  if (pathname.startsWith("/graduate")) return role === "GRADUATE";
  if (pathname.startsWith("/employer")) return role === "EMPLOYER";
  return true;
}

const nextAuthMiddleware = withAuth({
  pages: { signIn: "/login" },
  callbacks: {
    authorized: ({ token, req }) => {
      if (!token) return false;
      return isRoleAllowed(req.nextUrl.pathname, token.role);
    },
  },
});

export default function middleware(
  req: Parameters<typeof nextAuthMiddleware>[0],
  event: Parameters<typeof nextAuthMiddleware>[1],
) {
  if (isDemoBypassEnabled()) {
    const required = roleForPath(req.nextUrl.pathname);
    if (!required) return NextResponse.next();

    const current = req.cookies.get(DEMO_COOKIE)?.value;
    if (current === required) return NextResponse.next();

    const res = NextResponse.next();
    res.cookies.set({
      name: DEMO_COOKIE,
      value: required,
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });
    return res;
  }

  return nextAuthMiddleware(req, event);
}

export const config = {
  matcher: ["/graduate/:path*", "/employer/:path*"],
};
