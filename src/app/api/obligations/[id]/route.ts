import { NextResponse } from "next/server";
import { isSession, requireApiSession } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { parseObligationBody } from "@/lib/obligation-payload";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const { id } = await context.params;
  const existing = await prisma.obligation.findFirst({
    where: { id, userId: session.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const p = parseObligationBody(body);

  const obligation = await prisma.obligation.update({
    where: { id },
    data: p,
  });

  return NextResponse.json(obligation);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const { id } = await context.params;
  const result = await prisma.obligation.deleteMany({
    where: { id, userId: session.id },
  });
  if (result.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
