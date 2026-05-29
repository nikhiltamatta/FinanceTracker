import { NextResponse } from "next/server";
import { computeAnalytics } from "@/lib/analytics";
import { isSession, requireApiSession } from "@/lib/api-auth";

export async function GET(request: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const { searchParams } = new URL(request.url);
  const monthParam = searchParams.get("month");
  const month = monthParam ? new Date(monthParam) : new Date();

  const analytics = await computeAnalytics(session.id, month);
  return NextResponse.json(analytics);
}
