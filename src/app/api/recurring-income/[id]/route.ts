import { NextResponse } from "next/server";
import { isSession, requireApiSession } from "@/lib/api-auth";
import { prisma } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const { id } = await context.params;
  const body = await request.json();

  const result = await prisma.recurringIncome.updateMany({
    where: { id, userId: session.id },
    data: {
      amount: body.amount !== undefined ? Number(body.amount) : undefined,
      payDayOfWeek:
        body.payDayOfWeek !== undefined
          ? Number(body.payDayOfWeek)
          : undefined,
      note: body.note,
      active: body.active,
    },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const item = await prisma.recurringIncome.findUnique({ where: { id } });
  return NextResponse.json({ item });
}

export async function DELETE(_req: Request, context: Ctx) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;
  const { id } = await context.params;
  await prisma.recurringIncome.deleteMany({
    where: { id, userId: session.id },
  });
  return NextResponse.json({ ok: true });
}
