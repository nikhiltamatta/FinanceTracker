import { endOfMonth, startOfMonth } from "date-fns";
import { buildAlerts, buildCalendarEvents, computePayPeriodPlan } from "@/lib/allocation";
import { prisma } from "@/lib/db";
import { toIncomeInput, toObligationInput } from "@/lib/mappers";
import { getRolloverAmount, saveAllocationSnapshot } from "@/lib/snapshots";
import { getOrCreateSettings, toSettingsInput } from "@/lib/settings";

async function getPaidByObligationThisMonth(userId: string) {
  const start = startOfMonth(new Date());
  const end = endOfMonth(new Date());

  const payments = await prisma.payment.findMany({
    where: {
      paidAt: { gte: start, lte: end },
      obligation: { userId },
    },
  });

  const map: Record<string, number> = {};
  for (const p of payments) {
    map[p.obligationId] = (map[p.obligationId] ?? 0) + p.amount;
  }
  return map;
}

export async function getPlanData(userId: string) {
  const settingsRow = await getOrCreateSettings(userId);
  const settings = toSettingsInput(settingsRow);

  const [obligations, incomeEntries, paidByObligation, rolloverAmount] =
    await Promise.all([
      prisma.obligation.findMany({
        where: { userId },
        orderBy: { name: "asc" },
      }),
      prisma.incomeEntry.findMany({
        where: { userId },
        orderBy: { date: "desc" },
      }),
      getPaidByObligationThisMonth(userId),
      getRolloverAmount(userId, settings.rolloverSafeToSpend),
    ]);

  const obligationInputs = obligations.map(toObligationInput);
  const incomeInputs = incomeEntries.map(toIncomeInput);
  const today = new Date();

  const plan = computePayPeriodPlan(
    today,
    settings,
    obligationInputs.filter((o) => o.active),
    incomeInputs,
    { rolloverAmount, paidByObligation },
  );

  const alerts = buildAlerts(today, plan, settings);

  await saveAllocationSnapshot(userId, plan).catch(() => {
    /* ignore duplicate rapid refreshes */
  });

  return {
    settings: settingsRow,
    plan,
    alerts,
    obligations,
    incomeEntries,
  };
}

export async function getCalendarData(userId: string, month: Date) {
  const monthDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const [obligations, incomeEntries, settingsRow] = await Promise.all([
    prisma.obligation.findMany({ where: { userId, active: true } }),
    prisma.incomeEntry.findMany({ where: { userId } }),
    getOrCreateSettings(userId),
  ]);

  const events = buildCalendarEvents(
    monthDate,
    obligations.map(toObligationInput),
    incomeEntries.map(toIncomeInput),
  );

  return { events, settings: settingsRow, month: monthDate };
}
