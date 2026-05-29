import { NextResponse } from "next/server";
import { isSession, requireApiSession } from "@/lib/api-auth";
import { listGoals } from "@/lib/goals";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await requireApiSession();
  if (!isSession(session)) return session;
  const goals = await listGoals(session.id);
  return NextResponse.json({ goals });
}

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const body = await request.json();
  const goal = await prisma.savingsGoal.create({
    data: {
      userId: session.id,
      name: body.name,
      targetAmount: Number(body.targetAmount),
      currentAmount: Number(body.currentAmount) || 0,
      targetDate: body.targetDate ? new Date(body.targetDate) : null,
      active: body.active ?? true,
    },
  });
  return NextResponse.json({ goal }, { status: 201 });
}
