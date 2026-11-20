import { describe, expect, it } from "vitest";
import { peutVerrouillerPeriode } from "@/lib/accounting-period-lock-rules";

describe("verrouillage de période comptable", () => {
  it("autorise la clôture seulement si aucune écriture n'attend de revue ou de comptabilisation", () => {
    expect(peutVerrouillerPeriode(0)).toBe(true);
    expect(peutVerrouillerPeriode(1)).toBe(false);
    expect(peutVerrouillerPeriode(-1)).toBe(false);
    expect(peutVerrouillerPeriode(Number.NaN)).toBe(false);
  });
});
