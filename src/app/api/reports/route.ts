import { NextResponse } from "next/server";
import { isSession, requireApiSession } from "@/lib/api-auth";
import { buildMonthlyReport, reportToCsv } from "@/lib/reports";

export async function GET(request: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const { searchParams } = new URL(request.url);
  const monthParam = searchParams.get("month");
  const format = searchParams.get("format") ?? "json";
  const month = monthParam ? new Date(monthParam) : new Date();

  const report = await buildMonthlyReport(session.id, month);

  if (format === "csv") {
    const csv = reportToCsv(report);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="finance-report-${report.monthLabel.replace(/\s/g, "-")}.csv"`,
      },
    });
  }

  return NextResponse.json(report);
}
