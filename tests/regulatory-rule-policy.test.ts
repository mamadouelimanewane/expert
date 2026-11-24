import { describe, expect, it } from "vitest";
import { verifierReglePourDeclaration } from "@/lib/regulatory-rule-policy";

const rule = {
  country: "SN", declarationType: "TVA", periodicity: "MENSUELLE", dueDay: 15,
  dueMonth: null, effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
  effectiveUntil: null, status: "VERIFIED",
};

describe("liaison des règles validées aux déclarations", () => {
  it("accepte une déclaration mensuelle dans le pays, la période et la date d'effet", () => {
    expect(verifierReglePourDeclaration(rule, { country: "SN", type: "TVA", period: "2026-02", dueDate: new Date("2026-02-15T00:00:00.000Z") })).toBeNull();
  });

  it("refuse un mauvais pays, un mauvais type, une période hors effet ou une autre échéance", () => {
    const declaration = { country: "SN", type: "TVA", period: "2026-02", dueDate: new Date("2026-02-15T00:00:00.000Z") };
    expect(verifierReglePourDeclaration(rule, { ...declaration, country: "CI" })).toMatch(/pays/);
    expect(verifierReglePourDeclaration(rule, { ...declaration, type: "IS" })).toMatch(/type/);
    expect(verifierReglePourDeclaration(rule, { ...declaration, dueDate: new Date("2026-02-14T00:00:00.000Z") })).toMatch(/date d’échéance/);
    expect(verifierReglePourDeclaration({ ...rule, effectiveUntil: new Date("2026-01-31T00:00:00.000Z") }, declaration)).toMatch(/en vigueur/);
  });

  it("valide la place du mois d'échéance dans un trimestre", () => {
    const quarterly = { ...rule, periodicity: "TRIMESTRIELLE", dueMonth: 2 };
    expect(verifierReglePourDeclaration(quarterly, { country: "SN", type: "TVA", period: "2026-T2", dueDate: new Date("2026-05-15T00:00:00.000Z") })).toBeNull();
    expect(verifierReglePourDeclaration(quarterly, { country: "SN", type: "TVA", period: "2026-T2", dueDate: new Date("2026-04-15T00:00:00.000Z") })).toMatch(/mois prévu/);
  });

  it("conserve la traçabilité des anciennes déclarations sans réutiliser une règle après son retrait", () => {
    const retired = { ...rule, status: "RETIRED", retiredAt: new Date("2026-03-01T00:00:00.000Z") };
    expect(verifierReglePourDeclaration(retired, { country: "SN", type: "TVA", period: "2026-02", dueDate: new Date("2026-02-15T00:00:00.000Z") })).toBeNull();
    expect(verifierReglePourDeclaration(retired, { country: "SN", type: "TVA", period: "2026-03", dueDate: new Date("2026-03-15T00:00:00.000Z") })).toMatch(/retirée/);
  });
});
