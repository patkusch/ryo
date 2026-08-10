import { NextResponse } from "next/server";
import { runBriefing } from "@/lib/agents/orchestrator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const brief = await runBriefing();
  return NextResponse.json(brief);
}
