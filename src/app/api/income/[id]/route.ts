import { NextResponse } from "next/server";
import { isSession, requireApiSession } from "@/lib/api-auth";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const { id } = await context.params;
  const body = await request.json();

  const result = await prisma.incomeEntry.updateMany({
    where: { id, userId: session.id },
    data: {
      date: body.date ? new Date(body.date) : undefined,
      amount: body.amount !== undefined ? Number(body.amount) : undefined,
      note: body.note !== undefined ? body.note : undefined,
    },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const entry = await prisma.incomeEntry.findUnique({ where: { id } });
  return NextResponse.json(entry);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const { id } = await context.params;
  const result = await prisma.incomeEntry.deleteMany({
    where: { id, userId: session.id },
  });
  if (result.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
