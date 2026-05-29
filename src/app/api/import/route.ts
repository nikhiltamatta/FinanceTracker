import { NextResponse } from "next/server";
import { isSession, requireApiSession } from "@/lib/api-auth";
import { parseIncomeCsv, parseObligationsCsv } from "@/lib/csv-import";
import { prisma } from "@/lib/db";
import { buildObligationCreate } from "@/lib/obligation-payload";

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const body = await request.json();
  const { type, csv } = body as { type: "income" | "obligations"; csv: string };

  if (!csv || !type) {
    return NextResponse.json({ error: "type and csv required" }, { status: 400 });
  }

  if (type === "income") {
    const rows = parseIncomeCsv(csv);
    let count = 0;
    for (const row of rows) {
      await prisma.incomeEntry.create({
        data: {
          userId: session.id,
          date: new Date(row.date),
          amount: row.amount,
          note: row.note ?? null,
        },
      });
      count++;
    }
    return NextResponse.json({ ok: true, imported: count });
  }

  const rows = parseObligationsCsv(csv);
  let count = 0;
  for (const row of rows) {
    await prisma.obligation.create({
      data: buildObligationCreate(session.id, {
        name: row.name,
        category: row.category,
        amount: row.amount,
        dueRuleType: "day_of_month",
        dueDayOfMonth: row.dueDayOfMonth ?? 1,
        priority: row.priority ?? "must_pay",
      }),
    });
    count++;
  }
  return NextResponse.json({ ok: true, imported: count });
}
