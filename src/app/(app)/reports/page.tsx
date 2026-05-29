import { redirect } from "next/navigation";
import { ReportsClient } from "@/components/ReportsClient";
import { requireUser } from "@/lib/page-auth";
import { buildMonthlyReport } from "@/lib/reports";
import { getOrCreateSettings } from "@/lib/settings";

export default async function ReportsPage() {
  const user = await requireUser();
  const settings = await getOrCreateSettings(user.id);

  if (!settings.onboardingComplete) {
    redirect("/onboarding");
  }

  const report = await buildMonthlyReport(user.id, new Date());

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="mt-1 text-sm text-zinc-500">
          View your monthly summary and download CSV or PDF.
        </p>
      </header>
      <ReportsClient initialReport={report} />
    </div>
  );
}
