import { NextResponse } from "next/server";
import { computeWhatIf } from "@/lib/allocation";
import { isSession, requireApiSession } from "@/lib/api-auth";
import { getPlanData } from "@/lib/data";
import { getPlanningAmount } from "@/lib/obligations";
import { toObligationInput } from "@/lib/mappers";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (!isSession(session)) return session;

  const body = await request.json();
  const { extraCut, obligationId, scenario, customAmount } = body;
  const { plan } = await getPlanData(session.id);

  let context:
    | {
        obligationId: string;
        obligationName: string;
        scenario: "cut" | "skip" | "minimum" | "custom";
        obligationAmount: number;
        minimumDue?: number | null;
      }
    | undefined;

  if (obligationId) {
    const ob = await prisma.obligation.findFirst({
      where: { id: obligationId, userId: session.id },
    });
    if (ob) {
      const input = toObligationInput(ob);
      context = {
        obligationId: ob.id,
        obligationName: ob.name,
        scenario: scenario ?? "skip",
        obligationAmount: getPlanningAmount(input),
        minimumDue: ob.minimumDue,
      };
    }
  }

  const cut =
    scenario === "custom" && customAmount !== undefined
      ? Number(customAmount)
      : Number(extraCut) || 0;

  const result = computeWhatIf(plan, cut, context);

  return NextResponse.json(result);
}
