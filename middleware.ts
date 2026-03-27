import { withAuth } from "next-auth/middleware";

function isRoleAllowed(pathname: string, role: unknown) {
  if (typeof role !== "string") return false;
  if (pathname.startsWith("/graduate")) return role === "GRADUATE";
  if (pathname.startsWith("/employer")) return role === "EMPLOYER";
  return true;
}

export default withAuth(
  function middleware() {},
  {
    pages: { signIn: "/login" },
    callbacks: {
      authorized: ({ token, req }) => {
        if (!token) return false;
        return isRoleAllowed(req.nextUrl.pathname, token.role);
      },
    },
  },
);

export const config = {
  matcher: ["/graduate/:path*", "/employer/:path*"],
};
