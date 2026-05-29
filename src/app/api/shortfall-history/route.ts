import { NextResponse } from "next/server";
import { isSession, requireApiSession } from "@/lib/api-auth";
import { getShortfallHistory } from "@/lib/snapshots";

export async function GET() {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const history = await getShortfallHistory(session.id);
  return NextResponse.json({ history });
}
