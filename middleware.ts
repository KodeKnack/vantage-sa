import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const DEMO_COOKIE = "vantage_demo_role";

function isDemoBypassEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.DEMO_BYPASS_AUTH === "1";
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

export default withAuth(
  function middleware(req) {
    if (!isDemoBypassEnabled()) return;

    const required = roleForPath(req.nextUrl.pathname);
    if (!required) return;

    const current = req.cookies.get(DEMO_COOKIE)?.value;
    if (current === required) return;

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
  },
  {
    pages: { signIn: "/login" },
    callbacks: {
      authorized: ({ token, req }) => {
        if (isDemoBypassEnabled()) return true;
        if (!token) return false;
        return isRoleAllowed(req.nextUrl.pathname, token.role);
      },
    },
  },
);

export const config = {
  matcher: ["/graduate/:path*", "/employer/:path*"],
};
