import { describe, expect, it } from "vitest";
import { calculerStatutSuiviObligation } from "@/lib/compliance-obligation-tracker";

describe("suivi des obligations à partir des dossiers enregistrés", () => {
  it("ne signale pas d'obligation pour un profil non concerné", () => {
    expect(calculerStatutSuiviObligation([], 0)).toBe("NON_CONCERNE");
  });

  it("distingue l'absence de saisie d'une déclaration déposée", () => {
    expect(calculerStatutSuiviObligation([], 2)).toBe("A_SAISIR_DANS_OUTIL");
    expect(calculerStatutSuiviObligation(["SUBMITTED", "VALIDATED"], 2)).toBe("DEPOSEE");
  });

  it("signale un suivi partiel, un rejet ou un brouillon sans les transformer en pénalité", () => {
    expect(calculerStatutSuiviObligation(["SUBMITTED"], 2)).toBe("PARTIEL");
    expect(calculerStatutSuiviObligation(["REJECTED"], 1)).toBe("REJETEE");
    expect(calculerStatutSuiviObligation(["DRAFT"], 1)).toBe("EN_COURS");
  });
});
