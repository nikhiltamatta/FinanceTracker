import { addDays, isBefore, startOfDay } from "date-fns";
import { prisma } from "@/lib/db";

/** Create missing paycheck entries from active recurring templates (last 8 weeks). */
export async function syncRecurringIncome(userId: string) {
  const templates = await prisma.recurringIncome.findMany({
    where: { userId, active: true },
  });

  if (templates.length === 0) return { created: 0 };

  const since = addDays(new Date(), -56);
  let created = 0;

  for (const template of templates) {
    let cursor = startOfDay(since);
    const today = startOfDay(new Date());

    while (isBefore(cursor, today) || cursor.getTime() === today.getTime()) {
      if (cursor.getDay() === template.payDayOfWeek) {
        const dayStart = startOfDay(cursor);
        const dayEnd = addDays(dayStart, 1);

        const exists = await prisma.incomeEntry.findFirst({
          where: {
            userId,
            date: { gte: dayStart, lt: dayEnd },
            amount: template.amount,
            note: template.note ?? "Recurring paycheck",
          },
        });

        if (!exists) {
          await prisma.incomeEntry.create({
            data: {
              userId,
              date: dayStart,
              amount: template.amount,
              note: template.note ?? "Recurring paycheck",
            },
          });
          created++;
        }
      }
      cursor = addDays(cursor, 1);
    }
  }

  return { created };
}
