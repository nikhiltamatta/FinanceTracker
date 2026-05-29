import { NextResponse } from "next/server";
import { computeWhatIf } from "@/lib/allocation";
import { isSession, requireApiSession } from "@/lib/api-auth";
import { getPlanData } from "@/lib/data";

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const { extraCut } = await request.json();
  const { plan } = await getPlanData(session.id);
  const result = computeWhatIf(plan, Number(extraCut) || 0);

  return NextResponse.json(result);
}
