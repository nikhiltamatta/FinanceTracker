import { IncomeForm } from "@/components/IncomeForm";
import { IncomeList } from "@/components/IncomeList";
import { getPlanData } from "@/lib/data";
import { requireUser } from "@/lib/page-auth";

export default async function IncomePage() {
  const user = await requireUser();
  const { incomeEntries, settings } = await getPlanData(user.id);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Income</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Log each paycheck. Irregular amounts are fine — the plan uses actual
          pay when available.
        </p>
      </header>
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
