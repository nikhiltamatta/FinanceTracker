import { NextResponse } from "next/server";
import { buildAlerts, computePayPeriodPlan } from "@/lib/allocation";
import { isSession, requireApiSession } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { toIncomeInput, toObligationInput } from "@/lib/mappers";
import { getOrCreateSettings, toSettingsInput } from "@/lib/settings";

export async function GET() {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const settingsRow = await getOrCreateSettings(session.id);
  const settings = toSettingsInput(settingsRow);

  const [obligations, incomeEntries] = await Promise.all([
    prisma.obligation.findMany({
      where: { userId: session.id, active: true },
    }),
    prisma.incomeEntry.findMany({ where: { userId: session.id } }),
  ]);

  const today = new Date();
  const plan = computePayPeriodPlan(
    today,
    settings,
    obligations.map(toObligationInput),
    incomeEntries.map(toIncomeInput),
  );

  const alerts = buildAlerts(today, plan, settings);

  return NextResponse.json({ alerts });
}
