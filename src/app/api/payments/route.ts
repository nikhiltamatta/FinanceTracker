import { NextResponse } from "next/server";
import { isSession, requireApiSession } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { ensureMonthlyPaidReset } from "@/lib/payments";

export async function GET(request: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  await ensureMonthlyPaidReset(session.id);

  const { searchParams } = new URL(request.url);
  const monthParam = searchParams.get("month");
  const month = monthParam ? new Date(monthParam) : new Date();

  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59);

  const payments = await prisma.payment.findMany({
    where: {
      paidAt: { gte: start, lte: end },
      obligation: { userId: session.id },
    },
    include: { obligation: true },
    orderBy: { paidAt: "desc" },
  });

  return NextResponse.json(payments);
}
