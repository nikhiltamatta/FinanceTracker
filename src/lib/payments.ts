import {
  endOfMonth,
  format,
  startOfMonth,
} from "date-fns";
import { prisma } from "@/lib/db";
import { getPlanningAmount } from "@/lib/obligations";
import { toObligationInput } from "@/lib/mappers";

export function getYearMonthKey(date: Date = new Date()): string {
  return format(date, "yyyy-MM");
}

export async function ensureMonthlyPaidReset(userId: string) {
  const currentKey = getYearMonthKey();

  await prisma.userSettings.upsert({
    where: { userId },
    create: { userId, paidResetYearMonth: currentKey },
    update: {},
  });

  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  if (!settings || settings.paidResetYearMonth === currentKey) {
    return;
  }

  await prisma.$transaction([
    prisma.obligation.updateMany({
      where: { userId },
      data: { paidThisMonth: false },
    }),
    prisma.userSettings.update({
      where: { userId },
      data: { paidResetYearMonth: currentKey },
    }),
  ]);
}

export async function getPaidTotalThisMonth(
  userId: string,
  obligationId: string,
): Promise<number> {
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());

  const payments = await prisma.payment.findMany({
    where: {
      obligationId,
      paidAt: { gte: monthStart, lte: monthEnd },
      obligation: { userId },
    },
  });

  return payments.reduce((s, p) => s + p.amount, 0);
}

export async function markObligationPaid(
  userId: string,
  obligationId: string,
  options?: { amount?: number; paidAt?: Date; dueDate?: Date; note?: string },
) {
  await ensureMonthlyPaidReset(userId);

  const obligation = await prisma.obligation.findFirst({
    where: { id: obligationId, userId },
  });

  if (!obligation) {
    throw new Error("Obligation not found");
  }

  const paidAt = options?.paidAt ?? new Date();
  const amount = options?.amount ?? getPlanningAmount(toObligationInput(obligation));
  const planningAmount = getPlanningAmount(toObligationInput(obligation));

  const [payment] = await prisma.$transaction([
    prisma.payment.create({
      data: {
        obligationId,
        amount,
        paidAt,
        dueDate: options?.dueDate ?? null,
        note: options?.note ?? null,
      },
    }),
    prisma.obligation.update({
      where: { id: obligationId },
      data: {
        paidThisMonth: amount >= planningAmount * 0.99,
      },
    }),
  ]);

  const totalPaid = await getPaidTotalThisMonth(userId, obligationId);
  if (totalPaid >= planningAmount * 0.99) {
    await prisma.obligation.update({
      where: { id: obligationId },
      data: { paidThisMonth: true },
    });
  }

  return payment;
}

export async function unmarkObligationPaid(
  userId: string,
  obligationId: string,
) {
  const obligation = await prisma.obligation.findFirst({
    where: { id: obligationId, userId },
  });
  if (!obligation) {
    throw new Error("Obligation not found");
  }

  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());

  await prisma.$transaction([
    prisma.payment.deleteMany({
      where: {
        obligationId,
        paidAt: { gte: monthStart, lte: monthEnd },
      },
    }),
    prisma.obligation.update({
      where: { id: obligationId },
      data: { paidThisMonth: false },
    }),
  ]);
}

export async function getPaymentsForMonth(userId: string, month: Date) {
  const start = startOfMonth(month);
  const end = endOfMonth(month);

  return prisma.payment.findMany({
    where: {
      paidAt: { gte: start, lte: end },
      obligation: { userId },
    },
    include: { obligation: true },
    orderBy: { paidAt: "desc" },
  });
}
