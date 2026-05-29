"use client";

import { useMemo, useState } from "react";
import { MarkPaidButton } from "@/components/MarkPaidButton";
import { formatDateShort, formatMoney, formatMonthYear } from "@/lib/format";

type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  amount: number;
  type: "income" | "obligation";
  category?: string;
  priority?: string;
  obligationId?: string;
};

export function CalendarView({
  initialMonth,
  initialEvents,
  currency,
  paidMap = {},
}: {
  initialMonth: string;
  initialEvents: CalendarEvent[];
  currency: string;
  paidMap?: Record<string, boolean>;
}) {
  const [month, setMonth] = useState(new Date(initialMonth));
  const [events, setEvents] = useState(initialEvents);
  const [loading, setLoading] = useState(false);

  const daysInMonth = useMemo(() => {
    const year = month.getFullYear();
    const m = month.getMonth();
    return new Date(year, m + 1, 0).getDate();
  }, [month]);

  const firstWeekday = useMemo(() => {
    return new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  }, [month]);

  async function changeMonth(offset: number) {
    const next = new Date(month.getFullYear(), month.getMonth() + offset, 1);
    setLoading(true);
    const res = await fetch(
      `/api/calendar?month=${encodeURIComponent(next.toISOString())}`,
    );
    const data = await res.json();
    setMonth(next);
    setEvents(data.events);
    setLoading(false);
  }

  function eventsForDay(day: number) {
    return events.filter((event) => {
      const d = new Date(event.date);
      return (
        d.getFullYear() === month.getFullYear() &&
        d.getMonth() === month.getMonth() &&
        d.getDate() === day
      );
    });
  }

  const monthLabel = formatMonthYear(month);

  const blanks = Array.from({ length: firstWeekday });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          disabled={loading}
          className="rounded-lg border px-3 py-1 text-sm dark:border-zinc-700"
        >
          Previous
        </button>
        <h2 className="font-semibold">{monthLabel}</h2>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          disabled={loading}
          className="rounded-lg border px-3 py-1 text-sm dark:border-zinc-700"
        >
          Next
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-zinc-500">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className="min-h-20 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/30" />
        ))}
        {days.map((day) => {
          const dayEvents = eventsForDay(day);
          return (
            <div
              key={day}
              className="min-h-20 rounded-lg border border-zinc-200 bg-white p-1 text-left dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span className="text-xs font-medium text-zinc-500">{day}</span>
              <ul className="mt-0.5 space-y-0.5">
                {dayEvents.slice(0, 2).map((event) => (
                  <li
                    key={event.id}
                    className={`truncate rounded px-0.5 text-[10px] leading-tight ${
                      event.type === "income"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : event.priority === "must_pay"
                          ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                    title={`${event.title} · ${formatMoney(event.amount, currency)}`}
                  >
                    {event.title}
                  </li>
                ))}
                {dayEvents.length > 2 ? (
                  <li className="text-[10px] text-zinc-400">
                    +{dayEvents.length - 2} more
                  </li>
                ) : null}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-2 font-medium">Upcoming this month</h3>
        <ul className="space-y-2 text-sm">
          {events.length === 0 ? (
            <li className="text-zinc-500">No events this month.</li>
          ) : (
            events.map((event) => (
              <li
                key={event.id}
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <span>
                  {formatDateShort(new Date(event.date))} · {event.title}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={
                      event.type === "income"
                        ? "text-emerald-600"
                        : "text-zinc-700 dark:text-zinc-300"
                    }
                  >
                    {event.type === "income" ? "+" : "-"}
                    {formatMoney(event.amount, currency)}
                  </span>
                  {event.type === "obligation" && event.obligationId ? (
                    <MarkPaidButton
                      obligationId={event.obligationId}
                      amount={event.amount}
                      dueDate={event.date}
                      paidThisMonth={paidMap[event.obligationId] ?? false}
                    />
                  ) : null}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
