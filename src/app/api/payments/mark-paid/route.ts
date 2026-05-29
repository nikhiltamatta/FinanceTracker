import { NextResponse } from "next/server";
import { isSession, requireApiSession } from "@/lib/api-auth";
import { markObligationPaid, unmarkObligationPaid } from "@/lib/payments";

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  try {
    const body = await request.json();
    const { obligationId, amount, paidAt, dueDate, note, action } = body;

    if (!obligationId) {
      return NextResponse.json(
        { error: "obligationId is required" },
        { status: 400 },
      );
    }

    if (action === "unmark") {
      await unmarkObligationPaid(session.id, obligationId);
      return NextResponse.json({ ok: true, paid: false });
    }

    const payment = await markObligationPaid(session.id, obligationId, {
      amount: amount !== undefined ? Number(amount) : undefined,
      paidAt: paidAt ? new Date(paidAt) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      note,
    });

    return NextResponse.json({ ok: true, paid: true, payment });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to mark payment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
