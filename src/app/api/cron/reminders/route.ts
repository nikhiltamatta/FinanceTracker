import { addDays } from "date-fns";
import { NextResponse } from "next/server";
import { collectUpcomingDues, computePayPeriodPlan } from "@/lib/allocation";
import { billReminderEmailHtml, sendEmail } from "@/lib/email";
import { prisma } from "@/lib/db";
import { toIncomeInput, toObligationInput } from "@/lib/mappers";
import { toSettingsInput } from "@/lib/settings";
import { formatDate, formatMoney } from "@/lib/format";

export async function GET(request: Request) {
  const secret = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || secret !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { settings: { emailReminders: true } },
    include: { settings: true, obligations: true, incomeEntries: true },
  });

  let sent = 0;
  const today = new Date();

  for (const user of users) {
    if (!user.settings) continue;

    const settings = toSettingsInput(user.settings);
    const obligations = user.obligations
      .filter((o) => o.active)
      .map(toObligationInput);
    const income = user.incomeEntries.map(toIncomeInput);

    const plan = computePayPeriodPlan(today, settings, obligations, income);
    const threeDays = addDays(today, 3);

    const dues = collectUpcomingDues(
      obligations,
      today,
      threeDays,
      {},
    ).filter((d) => (d.paidAmount ?? 0) < d.amount);

    if (dues.length === 0) continue;

    const currency = user.settings?.currency ?? "EUR";
    const lines = dues.map((d) => ({
      name: d.name,
      amount: formatMoney(d.amount, currency),
      due: formatDate(d.dueDate),
    }));

    const result = await sendEmail({
      to: user.email,
      subject: "FinanceTracker — bills due soon",
      html: billReminderEmailHtml(lines),
    });

    if (result.sent) sent++;
  }

  return NextResponse.json({ ok: true, sent, checked: users.length });
}
