import { prisma } from "@/lib/db";
import { DEFAULT_CURRENCY } from "@/lib/format";
import { ensureMonthlyPaidReset } from "@/lib/payments";
import type { SettingsInput } from "@/lib/types";

export async function getOrCreateSettings(userId: string) {
  await ensureMonthlyPaidReset(userId);

  return prisma.userSettings.upsert({
    where: { userId },
    create: { userId, currency: DEFAULT_CURRENCY },
    update: {},
  });
}

export function toSettingsInput(
  settings: Awaited<ReturnType<typeof getOrCreateSettings>>,
): SettingsInput {
  return {
    payFrequency: settings.payFrequency as SettingsInput["payFrequency"],
    payDayOfWeek: settings.payDayOfWeek,
    bufferAmount: settings.bufferAmount,
    savingsPercent: settings.savingsPercent,
    accountBalance: settings.accountBalance,
    expectedPayAmount: settings.expectedPayAmount,
    planningHorizonWeeks: settings.planningHorizonWeeks,
    viewMode: settings.viewMode as SettingsInput["viewMode"],
    rolloverSafeToSpend: settings.rolloverSafeToSpend,
    incomeAverageWeeks: settings.incomeAverageWeeks,
  };
}
