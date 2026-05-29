import { redirect } from "next/navigation";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { LoanPayoffSection } from "@/components/LoanPayoffSection";
import { MoneyCard } from "@/components/MoneyCard";
import { ShortfallHistory } from "@/components/ShortfallHistory";
import { computeAnalytics } from "@/lib/analytics";
import { formatMoney } from "@/lib/format";
import { requireUser } from "@/lib/page-auth";
import { getOrCreateSettings } from "@/lib/settings";

export default async function AnalyticsPage() {
  const user = await requireUser();
  const settings = await getOrCreateSettings(user.id);

  if (!settings.onboardingComplete) {
    redirect("/onboarding");
  }

  const analytics = await computeAnalytics(user.id, new Date());
  const currency = settings.currency;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {analytics.monthLabel} — income, payments, and obligations at a glance.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MoneyCard
          label="Income"
          amount={formatMoney(analytics.totalIncome, currency)}
        />
        <MoneyCard
          label="Paid"
          amount={formatMoney(analytics.totalPaid, currency)}
        />
        <MoneyCard
          label="Due this month"
          amount={formatMoney(analytics.totalDue, currency)}
        />
        <MoneyCard
          label="Bills status"
          amount={`${analytics.paidCount} / ${analytics.paidCount + analytics.unpaidCount}`}
          hint={`${analytics.unpaidCount} unpaid`}
        />
      </section>

      <AnalyticsCharts analytics={analytics} currency={currency} />

      <div className="grid gap-6 lg:grid-cols-2">
        <LoanPayoffSection userId={user.id} currency={currency} />
        <ShortfallHistory userId={user.id} currency={currency} />
      </div>
    </div>
  );
}
