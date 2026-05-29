import { NextResponse } from "next/server";
import { isSession, requireApiSession } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { getOrCreateSettings } from "@/lib/settings";

export async function GET() {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const settings = await getOrCreateSettings(session.id);
  return NextResponse.json(settings);
}

export async function PATCH(request: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const body = await request.json();
  await getOrCreateSettings(session.id);

  const settings = await prisma.userSettings.update({
    where: { userId: session.id },
    data: {
      payFrequency: body.payFrequency,
      payDayOfWeek:
        body.payDayOfWeek !== undefined
          ? Number(body.payDayOfWeek)
          : undefined,
      expectedPayAmount:
        body.expectedPayAmount !== undefined
          ? Number(body.expectedPayAmount)
          : undefined,
      bufferAmount:
        body.bufferAmount !== undefined
          ? Number(body.bufferAmount)
          : undefined,
      savingsPercent:
        body.savingsPercent !== undefined
          ? Number(body.savingsPercent)
          : undefined,
      viewMode: body.viewMode,
      planningHorizonWeeks:
        body.planningHorizonWeeks !== undefined
          ? Number(body.planningHorizonWeeks)
          : undefined,
      currency: body.currency,
      accountBalance:
        body.accountBalance !== undefined
          ? Number(body.accountBalance)
          : undefined,
      onboardingComplete: body.onboardingComplete,
      rolloverSafeToSpend: body.rolloverSafeToSpend,
      incomeAverageWeeks:
        body.incomeAverageWeeks !== undefined
          ? Number(body.incomeAverageWeeks)
          : undefined,
      emailReminders: body.emailReminders,
    },
  });

  return NextResponse.json(settings);
}
