import { NextResponse } from "next/server";
import { isDemoBypassEnabled } from "@/lib/demo-bypass";

export async function GET() {
  return NextResponse.json({ enabled: isDemoBypassEnabled() });
}

