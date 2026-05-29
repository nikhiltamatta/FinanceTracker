import { NextResponse } from "next/server";
import { isSession, requireApiSession } from "@/lib/api-auth";
import {
  previewIncomeCsv,
  previewObligationsCsv,
} from "@/lib/csv-import";
import { prisma } from "@/lib/db";
import { buildObligationCreate } from "@/lib/obligation-payload";

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const body = await request.json();
  const { type, csv, skipPreview } = body as {
    type: "income" | "obligations";
    csv: string;
    skipPreview?: boolean;
  };

  if (!csv || !type) {
    return NextResponse.json({ error: "type and csv required" }, { status: 400 });
  }

  if (type === "income") {
    const preview = previewIncomeCsv(csv);
    if (!skipPreview && preview.rows.some((r) => r.errors.length > 0)) {
      return NextResponse.json(
        { error: "Validation errors", preview },
        { status: 400 },
      );
    }
    let count = 0;
    for (const row of preview.valid) {
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
    return NextResponse.json({
      ok: true,
      imported: count,
      skippedDuplicates: preview.skippedDuplicates,
    });
  }

  const preview = previewObligationsCsv(csv);
  if (!skipPreview && preview.rows.some((r) => r.errors.length > 0)) {
    return NextResponse.json(
      { error: "Validation errors", preview },
      { status: 400 },
    );
  }

  let count = 0;
  for (const row of preview.valid) {
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
  return NextResponse.json({
    ok: true,
    imported: count,
    skippedDuplicates: preview.skippedDuplicates,
  });
}
