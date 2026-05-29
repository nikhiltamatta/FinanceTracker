import { NextResponse } from "next/server";
import { isSession, requireApiSession } from "@/lib/api-auth";
import { prisma } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const { id } = await context.params;
  const body = await request.json();

  const result = await prisma.savingsGoal.updateMany({
    where: { id, userId: session.id },
    data: {
      name: body.name,
      targetAmount:
        body.targetAmount !== undefined ? Number(body.targetAmount) : undefined,
      currentAmount:
        body.currentAmount !== undefined
          ? Number(body.currentAmount)
          : undefined,
      targetDate:
        body.targetDate !== undefined
          ? body.targetDate
            ? new Date(body.targetDate)
            : null
          : undefined,
      active: body.active,
    },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const goal = await prisma.savingsGoal.findUnique({ where: { id } });
  return NextResponse.json({ goal });
}

export async function DELETE(_req: Request, context: Ctx) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const { id } = await context.params;
  await prisma.savingsGoal.deleteMany({ where: { id, userId: session.id } });
  return NextResponse.json({ ok: true });
}
