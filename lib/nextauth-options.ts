import type { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

type AuthedUser = { id: string; name: string; email: string; role: Role };

// NextAuth will crash with a JWT_SESSION_ERROR if NEXTAUTH_SECRET is set to "".
// Sanitize the env var so an accidentally-empty value can’t break dev sessions.
if ((process.env.NEXTAUTH_SECRET ?? "").trim() === "") {
  delete process.env.NEXTAUTH_SECRET;
}

const nextAuthSecret =
  process.env.NEXTAUTH_SECRET?.trim() ||
  (process.env.NODE_ENV === "production" ? undefined : "dev-secret-change-me");

export const authOptions: NextAuthOptions = {
  secret: nextAuthSecret,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString().trim().toLowerCase();
        const password = credentials?.password?.toString() ?? "";
        if (!email || !password) return null;

        let user: { id: string; email: string; name: string; role: Role; passwordHash: string } | null =
          null;
        try {
          user = await prisma.user.findUnique({ where: { email } });
        } catch {
          // DB is unreachable/misconfigured in dev. Avoid crashing NextAuth.
          return null;
        }
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        const authedUser: AuthedUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
        return authedUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as AuthedUser;
        token.id = u.id;
        token.role = u.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export const nextAuthHandler = NextAuth(authOptions);
