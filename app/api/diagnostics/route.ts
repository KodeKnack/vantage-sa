import { NextResponse } from "next/server";
import { isDemoBypassEnabled } from "@/lib/demo-bypass";
import { prisma } from "@/lib/prisma";

function looksLikeDbTemplate(url: string) {
  return url.includes("@HOST:5432") || url.includes("USER:PASSWORD@HOST");
}

async function probeDb() {
  try {
    const timeoutMs = 1200;
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), timeoutMs),
      ),
    ]);
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: (err as Error)?.message ?? "unknown" };
  }
}

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const nextAuthSecret = process.env.NEXTAUTH_SECRET ?? "";

  const bypassEnabled = isDemoBypassEnabled();
  const dbTemplate = looksLikeDbTemplate(databaseUrl);

  const dbProbe =
    databaseUrl && !dbTemplate ? await probeDb() : { ok: false as const, error: "not_configured" };

  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV ?? "unknown",
    bypassEnabled,
    database: {
      configured: Boolean(databaseUrl) && !dbTemplate,
      templatePlaceholder: dbTemplate,
      reachable: dbProbe.ok,
      error: dbProbe.ok ? null : dbProbe.error,
    },
    nextAuth: {
      secretPresent: Boolean(nextAuthSecret.trim()),
      secretEmptyString: nextAuthSecret !== undefined && nextAuthSecret.trim() === "",
    },
  });
}

