import { NextResponse } from "next/server";
import { isSession, requireApiSession } from "@/lib/api-auth";
import {
  previewBankCsv,
  previewIncomeCsv,
  previewObligationsCsv,
} from "@/lib/csv-import";

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const body = await request.json();
  const { type, csv, mapping } = body as {
    type: "income" | "obligations" | "bank";
    csv: string;
    mapping?: { dateCol?: number; amountCol?: number; descCol?: number };
  };

  if (!csv || !type) {
    return NextResponse.json({ error: "type and csv required" }, { status: 400 });
  }

  if (type === "income") {
    return NextResponse.json(previewIncomeCsv(csv));
  }
  if (type === "bank") {
    return NextResponse.json(previewBankCsv(csv, mapping));
  }
  return NextResponse.json(previewObligationsCsv(csv));
}
