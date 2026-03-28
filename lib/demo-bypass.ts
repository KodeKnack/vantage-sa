import type { Role } from "@prisma/client";
import { cookies } from "next/headers";

export const DEMO_BYPASS_COOKIE = "vantage_demo_role";

export function isDemoBypassEnabled() {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.DEMO_BYPASS_AUTH === "1") return true;

  // Safety net: if DATABASE_URL is still the template placeholder, NextAuth + Prisma login will fail.
  // Auto-enable bypass in this misconfigured dev state so the app remains usable.
  const url = process.env.DATABASE_URL ?? "";
  if (url.includes("@HOST:5432") || url.includes("USER:PASSWORD@HOST")) return true;

  return false;
}

export async function getRoleFromCookie(): Promise<Role | null> {
  if (!isDemoBypassEnabled()) return null;
  const jar = await cookies();
  const value = jar.get(DEMO_BYPASS_COOKIE)?.value ?? "";
  if (value === "GRADUATE" || value === "EMPLOYER" || value === "ADMIN") {
    return value as Role;
  }
  return null;
}
