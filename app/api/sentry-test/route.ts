import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  Sentry.captureMessage("Vantage SA Sentry test message");
  return NextResponse.json({ ok: true });
}

