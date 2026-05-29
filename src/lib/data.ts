import { endOfMonth, startOfMonth } from "date-fns";
import { buildAlerts, buildCalendarEvents, computePayPeriodPlan } from "@/lib/allocation";
import { prisma } from "@/lib/db";
import { getActiveGoalsReserve } from "@/lib/goals";
import { getHouseholdObligations } from "@/lib/household";
import { toIncomeInput, toObligationInput } from "@/lib/mappers";
import { syncRecurringIncome } from "@/lib/recurring-income";
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
  await syncRecurringIncome(userId).catch(() => {});

  const settingsRow = await getOrCreateSettings(userId);
  const settings = toSettingsInput(settingsRow);

  const [obligations, householdObligations, incomeEntries, paidByObligation, rolloverAmount, goalsReserve] =
    await Promise.all([
      prisma.obligation.findMany({
        where: { userId },
        orderBy: { name: "asc" },
      }),
      getHouseholdObligations(userId),
      prisma.incomeEntry.findMany({
        where: { userId },
        orderBy: { date: "desc" },
      }),
      getPaidByObligationThisMonth(userId),
      getRolloverAmount(userId, settings.rolloverSafeToSpend),
      getActiveGoalsReserve(userId),
    ]);

  const allObligations = [
    ...obligations.map(toObligationInput),
    ...householdObligations.map(toObligationInput),
  ];

  const obligationInputs = allObligations.filter((o) => o.active);
  const incomeInputs = incomeEntries.map(toIncomeInput);
  const today = new Date();

  const plan = computePayPeriodPlan(
    today,
    settings,
    obligationInputs,
    incomeInputs,
    { rolloverAmount, paidByObligation, goalsReserve },
  );

  const alerts = buildAlerts(today, plan, settings);

  await saveAllocationSnapshot(userId, plan).catch(() => {});

  return {
    settings: settingsRow,
    plan,
    alerts,
    obligations,
    householdObligations,
    incomeEntries,
    paidByObligation,
  };
}

export async function getCalendarData(userId: string, month: Date) {
  const monthDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const [obligations, householdObligations, incomeEntries, settingsRow] =
    await Promise.all([
      prisma.obligation.findMany({ where: { userId, active: true } }),
      getHouseholdObligations(userId),
      prisma.incomeEntry.findMany({ where: { userId } }),
      getOrCreateSettings(userId),
    ]);

  const allObligations = [
    ...obligations.map(toObligationInput),
    ...householdObligations.map(toObligationInput),
  ];

  const events = buildCalendarEvents(
    monthDate,
    allObligations,
    incomeEntries.map(toIncomeInput),
  );

  return { events, settings: settingsRow, month: monthDate };
}
