import type { ObligationInput } from "@/lib/types";

/** Amount due for planning (card minimum vs full EMI). */
export function getPlanningAmount(obligation: ObligationInput): number {
  if (
    obligation.category === "card" &&
    obligation.minimumDue != null &&
    obligation.minimumDue > 0
  ) {
    return obligation.minimumDue;
  }
  return obligation.amount;
}
