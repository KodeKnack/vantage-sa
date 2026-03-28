import type { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import {
  MOCK_CHALLENGES,
  MOCK_EMPLOYER,
  MOCK_GRADUATES,
  MOCK_ROI_DEFAULTS,
} from "@/lib/mock-data";

type AuthedUser = { id: string; name: string; email: string; role: Role };

const MOCK_USERS: Array<AuthedUser & { passwordHash: string }> = [
  {
    id: 'grad-1',
    email: 'thabo@demo.vantage.co.za',
    name: 'Thabo Nkosi',
    role: 'GRADUATE',
    passwordHash: '$2b$10$5d0mxS49GrVEXNQ9aqtxYOmoJYmsc5c74nBsKr6LuM//2eimHmpvK',
  },
  {
    id: 'emp-1',
    email: 'employer@demo.vantage.co.za',
    name: 'Acme Corp',
    role: 'EMPLOYER',
    passwordHash: '$2b$10$5d0mxS49GrVEXNQ9aqtxYOmoJYmsc5c74nBsKr6LuM//2eimHmpvK',
  },
  {
    id: 'admin-1',
    email: 'admin@demo.vantage.co.za',
    name: 'Demo Admin',
    role: 'ADMIN',
    passwordHash: '$2b$10$5d0mxS49GrVEXNQ9aqtxYOmoJYmsc5c74nBsKr6LuM//2eimHmpvK',
  },
];

export const MOCK_DATA = {
  graduates: MOCK_GRADUATES,
  employer: MOCK_EMPLOYER,
  challenges: MOCK_CHALLENGES,
  roiDefaults: MOCK_ROI_DEFAULTS,
} as const;

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

        let user:
          | ({ id: string; email: string; name: string; role: Role; passwordHash: string } | null)
          | (AuthedUser & { passwordHash: string })
          | null = null;
        try {
          user = await prisma.user.findUnique({ where: { email } });
        } catch {
          // DB is unreachable/misconfigured in dev. Fall back to local mock users.
          user = MOCK_USERS.find((u) => u.email.toLowerCase() === email) ?? null;
        }
        if (!user) {
          user = MOCK_USERS.find((u) => u.email.toLowerCase() === email) ?? null;
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
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export const nextAuthHandler = NextAuth(authOptions);
