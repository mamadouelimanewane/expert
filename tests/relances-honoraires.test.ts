import { describe, it, expect } from "vitest";
import {
  calculerJoursRetard,
  determinerNiveauRelance,
  calculerPlanRelance,
  analyserPortefeuilleCreances,
  type FactureCreance,
} from "@/lib/ohada/relances-honoraires";

describe("Relances Honoraires & Recouvrement AUPSRVE", () => {
  const dateRef = new Date("2025-06-30");

  const factureRecente: FactureCreance = {
    id: "FAC-1",
    numeroFacture: "FAC-2025-001",
    clientNom: "Entreprise Alpha",
    dateEmission: "2025-06-01",
    dateEcheance: "2025-06-25", // 5 jours de retard au 30 juin
    montantTTC: 1_000_000,
    montantDejaRegle: 0,
    soldeRestantDu: 1_000_000,
  };

  const factureMoyenne: FactureCreance = {
    id: "FAC-2",
    numeroFacture: "FAC-2025-002",
    clientNom: "Société Beta",
    dateEmission: "2025-04-15",
    dateEcheance: "2025-05-15", // ~46 jours de retard
    montantTTC: 3_000_000,
    montantDejaRegle: 1_000_000,
    soldeRestantDu: 2_000_000,
  };

  const factureCritique: FactureCreance = {
    id: "FAC-3",
    numeroFacture: "FAC-2025-003",
    clientNom: "Holding Gamma",
    dateEmission: "2025-01-10",
    dateEcheance: "2025-02-10", // > 130 jours de retard
    montantTTC: 5_000_000,
    montantDejaRegle: 0,
    soldeRestantDu: 5_000_000,
  };

  it("calcule avec exactitude les jours de retard", () => {
    const jours1 = calculerJoursRetard(factureRecente.dateEcheance, dateRef);
    expect(jours1).toBe(5);

    const joursCritique = calculerJoursRetard(factureCritique.dateEcheance, dateRef);
    expect(joursCritique).toBeGreaterThan(100);
  });

  it("détermine le niveau de relance selon le barème", () => {
    expect(determinerNiveauRelance(5)).toBe("RAPPEL_AMICAL");
    expect(determinerNiveauRelance(20)).toBe("PREMIERE_RELANCE");
    expect(determinerNiveauRelance(45)).toBe("DEUXIEME_RELANCE");
    expect(determinerNiveauRelance(90)).toBe("MISE_EN_DEMEURE");
  });

  it("génère le plan de relance avec intérêts moratoires et proposition de blocage des travaux", () => {
    const plan = calculerPlanRelance(factureMoyenne, dateRef);
    expect(plan.niveauRecommande).toBe("DEUXIEME_RELANCE");
    expect(plan.bloquerTravaux).toBe(true);
    expect(plan.interetsMoratoires).toBeGreaterThan(0);
    expect(plan.indemniteForfaitaire).toBe(40_000);
    expect(plan.messageGenere.objet).toContain("DEUXIÈME AVERTISSEMENT");
    expect(plan.messageGenere.corpsEmail).toContain("suspendre les travaux");
  });

  it("génère une lettre de mise en demeure AUPSRVE pour retard critique", () => {
    const plan = calculerPlanRelance(factureCritique, dateRef);
    expect(plan.niveauRecommande).toBe("MISE_EN_DEMEURE");
    expect(plan.bloquerTravaux).toBe(true);
    expect(plan.messageGenere.lettreMiseEnDemeure).toBeDefined();
    expect(plan.messageGenere.lettreMiseEnDemeure).toContain("Injonction de Payer");
    expect(plan.messageGenere.lettreMiseEnDemeure).toContain("AUPSRVE");
  });

  it("établit la balance âgée et les statistiques de recouvrement du portefeuille", () => {
    const bilan = analyserPortefeuilleCreances(
      [factureRecente, factureMoyenne, factureCritique],
      dateRef
    );

    expect(bilan.montantTotalCreances).toBe(8_000_000); // 1M + 2M + 5M
    expect(bilan.montantEchu).toBe(8_000_000);
    expect(bilan.nbFacturesEnRetard).toBe(3);
    expect(bilan.repartitionParTranche.tranche0_15).toBe(1_000_000);
    expect(bilan.repartitionParTranche.tranche31_60).toBe(2_000_000);
    expect(bilan.repartitionParTranche.tranche60_plus).toBe(5_000_000);
  });
});
