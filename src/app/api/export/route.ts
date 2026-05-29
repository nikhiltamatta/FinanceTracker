import { NextResponse } from "next/server";
import { isSession, requireApiSession } from "@/lib/api-auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const [user, settings, obligations, incomeEntries, payments, goals, recurring] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: session.id },
        select: { id: true, email: true, name: true, createdAt: true },
      }),
      prisma.userSettings.findUnique({ where: { userId: session.id } }),
      prisma.obligation.findMany({ where: { userId: session.id } }),
      prisma.incomeEntry.findMany({ where: { userId: session.id } }),
      prisma.payment.findMany({
        where: { obligation: { userId: session.id } },
        include: { obligation: { select: { name: true } } },
      }),
      prisma.savingsGoal.findMany({ where: { userId: session.id } }),
      prisma.recurringIncome.findMany({ where: { userId: session.id } }),
    ]);

  const backup = {
    exportedAt: new Date().toISOString(),
    version: 1,
    user,
    settings,
    obligations,
    incomeEntries,
    payments,
    goals,
    recurringIncomes: recurring,
  };

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="finance-tracker-backup-${session.id}.json"`,
    },
  });
}
