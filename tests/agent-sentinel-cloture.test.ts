import { describe, it, expect } from "vitest";
import {
  executerAuditSentinelCloture,
  type CompteBalanceCloture,
} from "../src/lib/ohada/agent-sentinel-cloture";

const BALANCE_CONFORME: CompteBalanceCloture[] = [
  { compte: "101000", libelle: "Capital social", soldeDebiteur_XOF: 0, soldeCrediteur_XOF: 100_000_000 },
  { compte: "241100", libelle: "Matériel industriel", soldeDebiteur_XOF: 80_000_000, soldeCrediteur_XOF: 0 },
  { compte: "401100", libelle: "Fournisseur SODATEL", soldeDebiteur_XOF: 0, soldeCrediteur_XOF: 20_000_000 },
  { compte: "411100", libelle: "Client KOUAME", soldeDebiteur_XOF: 30_000_000, soldeCrediteur_XOF: 0 },
  { compte: "521100", libelle: "Banque BOA", soldeDebiteur_XOF: 10_000_000, soldeCrediteur_XOF: 0 },
];

describe("Agent IA Sentinel Clôture — Intégrité & Surveillance Clôture OHADA", () => {
  it("valide une balance parfaitement saine avec score 100 et statut CONFORME_POUR_LIASSE", () => {
    const res = executerAuditSentinelCloture("SAHEL DISTRIBUTION SA", 2024, BALANCE_CONFORME);
    expect(res.scoreIntegrite_100).toBe(100);
    expect(res.statutCloture).toBe("CONFORME_POUR_LIASSE");
    expect(res.totalAnomalies).toBe(0);
    expect(res.ecrituresRegularisation).toHaveLength(0);
  });

  it("bloque la clôture en cas de déséquilibre Débit / Crédit dans la balance", () => {
    const balanceDesequilibree: CompteBalanceCloture[] = [
      ...BALANCE_CONFORME,
      { compte: "521200", libelle: "Banque CBAO", soldeDebiteur_XOF: 5_000_000, soldeCrediteur_XOF: 0 },
    ];
    const res = executerAuditSentinelCloture("SAHEL DISTRIBUTION SA", 2024, balanceDesequilibree);
    expect(res.statutCloture).toBe("BLOQUEE");
    expect(res.anomaliesBloquantes).toBeGreaterThan(0);
    const anom = res.anomalies.find((a) => a.code === "ANOM_01_DESEQUILIBRE_BALANCE");
    expect(anom).toBeDefined();
    expect(anom?.montantAnomalie_XOF).toBe(5_000_000);
  });

  it("détecte une caisse créditrice et un compte d'attente 471 non soldé comme bloquants", () => {
    const balanceAvecSuspense: CompteBalanceCloture[] = [
      { compte: "101000", libelle: "Capital", soldeDebiteur_XOF: 0, soldeCrediteur_XOF: 10_000_000 },
      { compte: "471100", libelle: "Compte d'attente à régulariser", soldeDebiteur_XOF: 3_000_000, soldeCrediteur_XOF: 0 },
      { compte: "571100", libelle: "Caisse principale", soldeDebiteur_XOF: 0, soldeCrediteur_XOF: 1_500_000 },
      { compte: "521100", libelle: "Banque", soldeDebiteur_XOF: 8_500_000, soldeCrediteur_XOF: 0 },
    ];
    const res = executerAuditSentinelCloture("ENTREPRISE COMMERCIALE", 2024, balanceAvecSuspense);
    expect(res.statutCloture).toBe("BLOQUEE");
    expect(res.anomaliesBloquantes).toBe(2);
    expect(res.anomalies.some((a) => a.code === "ANOM_02_COMPTE_ATTENTE_NON_SOLDE")).toBe(true);
    expect(res.anomalies.some((a) => a.code === "ANOM_05_CAISSE_CREDITRICE")).toBe(true);
  });

  it("génère automatiquement des propositions d'OD de reclassement pour tiers non conformes", () => {
    const balanceTiersInverses: CompteBalanceCloture[] = [
      { compte: "101000", libelle: "Capital", soldeDebiteur_XOF: 0, soldeCrediteur_XOF: 20_000_000 },
      { compte: "401200", libelle: "Fournisseur Avoir non déduit", soldeDebiteur_XOF: 4_000_000, soldeCrediteur_XOF: 0 },
      { compte: "411300", libelle: "Client Acompte versé d'avance", soldeDebiteur_XOF: 0, soldeCrediteur_XOF: 6_000_000 },
      { compte: "521100", libelle: "Banque", soldeDebiteur_XOF: 22_000_000, soldeCrediteur_XOF: 0 },
    ];
    const res = executerAuditSentinelCloture("COMPAGNIE DU NIGER", 2024, balanceTiersInverses);
    expect(res.statutCloture).toBe("AJUSTEMENTS_REQUIS");
    expect(res.anomaliesMajeures).toBe(2);
    expect(res.ecrituresRegularisation).toHaveLength(2);

    const odFrn = res.ecrituresRegularisation.find((e) => e.idEcriture.includes("401200"));
    expect(odFrn?.lignes[0].compte).toBe("409100");
    expect(odFrn?.lignes[0].debit_XOF).toBe(4_000_000);

    const odClt = res.ecrituresRegularisation.find((e) => e.idEcriture.includes("411300"));
    expect(odClt?.lignes[1].compte).toBe("419100");
    expect(odClt?.lignes[1].credit_XOF).toBe(6_000_000);
  });
});
