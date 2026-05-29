import { NextResponse } from "next/server";
import { isSession, requireApiSession } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { buildObligationCreate } from "@/lib/obligation-payload";

export async function GET() {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const obligations = await prisma.obligation.findMany({
    where: { userId: session.id },
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });
  return NextResponse.json(obligations);
}

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const body = await request.json();
  const obligation = await prisma.obligation.create({
    data: buildObligationCreate(session.id, body),
  });

  return NextResponse.json(obligation, { status: 201 });
}
