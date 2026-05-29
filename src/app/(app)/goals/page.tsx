import { GoalsPanel } from "@/components/GoalsPanel";
import { listGoals } from "@/lib/goals";
import { requireUser } from "@/lib/page-auth";
import { getOrCreateSettings } from "@/lib/settings";

export default async function GoalsPage() {
  const user = await requireUser();
  const [goals, settings] = await Promise.all([
    listGoals(user.id),
    getOrCreateSettings(user.id),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Savings goals</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Goals reserve part of your plan until you fund them.
        </p>
      </header>
      <GoalsPanel goals={goals} currency={settings.currency} />
    </div>
  );
}
