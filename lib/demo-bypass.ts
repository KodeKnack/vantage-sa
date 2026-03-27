import type { Role } from "@prisma/client";
import { cookies } from "next/headers";

export const DEMO_BYPASS_COOKIE = "vantage_demo_role";

export function isDemoBypassEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.DEMO_BYPASS_AUTH === "1";
}

export function getRoleFromCookie(): Role | null {
  if (!isDemoBypassEnabled()) return null;
  const value = cookies().get(DEMO_BYPASS_COOKIE)?.value ?? "";
  if (value === "GRADUATE" || value === "EMPLOYER" || value === "ADMIN") {
    return value as Role;
  }
  return null;
}

