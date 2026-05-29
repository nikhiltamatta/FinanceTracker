import { CalendarView } from "@/components/CalendarView";
import { AlertList } from "@/components/AlertList";
import { getCalendarData, getPlanData } from "@/lib/data";
import { requireUser } from "@/lib/page-auth";

export default async function CalendarPage() {
  const user = await requireUser();
  const today = new Date();
  const [{ events, settings }, { alerts, obligations }] = await Promise.all([
    getCalendarData(user.id, today),
    getPlanData(user.id),
  ]);

  const paidMap: Record<string, boolean> = {};
  for (const o of obligations) {
    paidMap[o.id] = o.paidThisMonth;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Pay days and due dates at a glance. Green = income, red = must-pay
          bills.
        </p>
      </header>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 font-medium">Due-date alerts</h2>
        <AlertList alerts={alerts} />
      </section>

      <CalendarView
        initialMonth={today.toISOString()}
        initialEvents={events.map((e) => ({
          ...e,
          date: e.date.toISOString(),
        }))}
        currency={settings.currency}
        paidMap={paidMap}
      />
    </div>
  );
}
