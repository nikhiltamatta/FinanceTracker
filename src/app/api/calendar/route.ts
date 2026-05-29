import { NextResponse } from "next/server";
import { buildCalendarEvents } from "@/lib/allocation";
import { isSession, requireApiSession } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { toIncomeInput, toObligationInput } from "@/lib/mappers";

export async function GET(request: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const { searchParams } = new URL(request.url);
  const monthParam = searchParams.get("month");

  const month = monthParam ? new Date(monthParam) : new Date();
  const monthDate = new Date(month.getFullYear(), month.getMonth(), 1);

  const [obligations, incomeEntries] = await Promise.all([
    prisma.obligation.findMany({
      where: { userId: session.id, active: true },
    }),
    prisma.incomeEntry.findMany({ where: { userId: session.id } }),
  ]);

  const events = buildCalendarEvents(
    monthDate,
    obligations.map(toObligationInput),
    incomeEntries.map(toIncomeInput),
  );

  return NextResponse.json({
    month: monthDate.toISOString(),
    events,
  });
}
