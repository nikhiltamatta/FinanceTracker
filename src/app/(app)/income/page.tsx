import { IncomeForm } from "@/components/IncomeForm";
import { IncomeList } from "@/components/IncomeList";
import { RecurringIncomePanel } from "@/components/RecurringIncomePanel";
import { prisma } from "@/lib/db";
import { getPlanData } from "@/lib/data";
import { requireUser } from "@/lib/page-auth";

export default async function IncomePage() {
  const user = await requireUser();
  const { incomeEntries, settings } = await getPlanData(user.id);
  const recurring = await prisma.recurringIncome.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Income</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Log each paycheck. Irregular amounts are fine — the plan uses actual
          pay when available.
        </p>
      </header>
      <RecurringIncomePanel
        items={recurring}
        currency={settings.currency}
        defaultPayDay={settings.payDayOfWeek}
      />
      <IncomeForm />
      <IncomeList
        entries={incomeEntries.map((e) => ({
          ...e,
          date: e.date.toISOString(),
        }))}
        currency={settings.currency}
      />
    </div>
  );
}
