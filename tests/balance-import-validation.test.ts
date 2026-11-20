import { describe, expect, it } from "vitest";
import { analyserLignesBalance } from "@/lib/ohada/balance-import-validation";

describe("validation d'import de balance", () => {
  it("refuse le lot entier si une ligne est mal formée", () => {
    expect(analyserLignesBalance([
      { numero: "101", intitule: "Capital", debit: 0, credit: 100 },
      null,
    ])).toMatchObject({ ok: false, rejets: ["Ligne 2 : format de ligne invalide."] });
  });

  it("cumule les doublons mais les signale avant ventilation", () => {
    const result = analyserLignesBalance([
      { numero: "401100", intitule: "Fournisseurs A", debit: 0, credit: 60 },
      { numero: "401100", intitule: "Fournisseurs B", debit: 0, credit: 40 },
    ]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.lignes).toHaveLength(1);
    expect(result.lignes[0]).toMatchObject({ numero: "401100", credit: 100 });
    expect(result.avertissements).toContain("Compte 401100 présent aux lignes 1, 2 : les montants ont été cumulés.");
  });

  it("préserve et signale un compte sans règle d'affectation", () => {
    const result = analyserLignesBalance([
      { numero: "999000", intitule: "Compte local", debit: 125, credit: 0 },
    ]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.lignes[0].numero).toBe("999000");
    expect(result.avertissements.join(" ")).toContain("absent des règles d'affectation SYSCOHADA");
  });

  it("garde les comptes soldés hors du résultat sans les traiter comme erreur", () => {
    expect(analyserLignesBalance([
      { numero: "401100", intitule: "Fournisseurs", debit: 0, credit: 0 },
      { numero: "411100", intitule: "Clients", debit: 30, credit: 0 },
    ])).toMatchObject({ ok: true, lignes: [{ numero: "411100", debit: 30 }] });
  });
});
