import { NextResponse } from "next/server";
import { isSession, requireApiSession } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { projectLoanPayoffs } from "@/lib/loan-payoff";
import { toObligationInput } from "@/lib/mappers";

export async function GET() {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const obligations = await prisma.obligation.findMany({
    where: { userId: session.id, active: true },
  });

  const projections = projectLoanPayoffs(obligations.map(toObligationInput));
  return NextResponse.json({ projections });
}
