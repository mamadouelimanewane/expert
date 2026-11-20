import { describe, expect, it } from "vitest";
import { validateAuditSample } from "@/lib/audit-sampling-policy";

const valid = {
  procedureReference: "Ventes / exhaustivité",
  populationDescription: "Factures de vente du quatrième trimestre",
  populationSize: 120,
  method: "RANDOM",
  sampleSize: 2,
  selectedItems: "FAC-001\nFAC-002",
  exceptionsCount: 0,
  conclusion: "NO_EXCEPTION",
};

describe("validation des échantillons d’audit", () => {
  it("accepte une sélection documentée dont les tailles sont cohérentes", () => {
    const result = validateAuditSample(valid);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.selectedItems).toEqual(["FAC-001", "FAC-002"]);
  });

  it("refuse un échantillon plus grand que sa population", () => {
    expect(validateAuditSample({ ...valid, sampleSize: 121 }).ok).toBe(false);
  });

  it("exige une conclusion qui concorde avec les exceptions", () => {
    expect(validateAuditSample({ ...valid, exceptionsCount: 1 }).ok).toBe(false);
    expect(validateAuditSample({ ...valid, exceptionsCount: 1, conclusion: "EXCEPTION", exceptionDetails: "Écart de pièce" }).ok).toBe(true);
  });

  it("refuse une méthode non prise en charge", () => {
    expect(validateAuditSample({ ...valid, method: "AUTOMATIC" }).ok).toBe(false);
  });
});
