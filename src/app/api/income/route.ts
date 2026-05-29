import { NextResponse } from "next/server";
import { isSession, requireApiSession } from "@/lib/api-auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const entries = await prisma.incomeEntry.findMany({
    where: { userId: session.id },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const body = await request.json();

  const entry = await prisma.incomeEntry.create({
    data: {
      userId: session.id,
      date: new Date(body.date),
      amount: Number(body.amount),
      note: body.note ?? null,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
