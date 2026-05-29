import { NextResponse } from "next/server";
import { isSession, requireApiSession } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { syncRecurringIncome } from "@/lib/recurring-income";

export async function GET() {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const items = await prisma.recurringIncome.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const body = await request.json();
  const item = await prisma.recurringIncome.create({
    data: {
      userId: session.id,
      amount: Number(body.amount),
      payDayOfWeek: Number(body.payDayOfWeek),
      note: body.note ?? null,
      active: body.active ?? true,
    },
  });

  await syncRecurringIncome(session.id);

  return NextResponse.json({ item }, { status: 201 });
}
