import { describe, it, expect } from "vitest";
import {
  etablirRegistreBeneficiairesEffectifs,
  calculerDetentionIndirecte,
  type ActionnaireEntite,
} from "../src/lib/ohada/registre-beneficiaires-effectifs";

describe("Moteur du Registre des Bénéficiaires Effectifs (RBE OHADA)", () => {
  it("identifie un bénéficiaire effectif direct détenant plus de 25% du capital", () => {
    const actionnaires: ActionnaireEntite[] = [
      {
        id: "ACT-01",
        nomOuRaisonSociale: "Amadou DIOP",
        type: "PERSONNE_PHYSIQUE",
        nationaliteOuPaysImmatriculation: "Sénégalaise",
        partCapitalDirect_pct: 60,
        partDroitsVoteDirect_pct: 60,
      },
      {
        id: "ACT-02",
        nomOuRaisonSociale: "Fatou SALL",
        type: "PERSONNE_PHYSIQUE",
        nationaliteOuPaysImmatriculation: "Sénégalaise",
        partCapitalDirect_pct: 20, // < 25%
        partDroitsVoteDirect_pct: 20,
      },
      {
        id: "ACT-03",
        nomOuRaisonSociale: "Ibrahima NDIAYE",
        type: "PERSONNE_PHYSIQUE",
        nationaliteOuPaysImmatriculation: "Sénégalaise",
        partCapitalDirect_pct: 20, // < 25%
        partDroitsVoteDirect_pct: 20,
      },
    ];

    const rbe = etablirRegistreBeneficiairesEffectifs(
      "DAKAR LOGISTIQUE SAS",
      "SAS",
      "SN.DKR.2024.B.1920",
      "Sénégal",
      actionnaires
    );

    expect(rbe.nbBeneficiairesEffectifs).toBe(1);
    const b = rbe.beneficiairesIdentifies[0];
    expect(b.nom).toBe("DIOP");
    expect(b.natureControle).toBe("DETENTION_DIRECTE");
    expect(b.pourcentageCapitalEffectif_pct).toBe(60);
  });

  it("calcule la détention indirecte à travers une société holding", () => {
    const holding: ActionnaireEntite = {
      id: "HOLD-01",
      nomOuRaisonSociale: "INVEST SAHEL HOLDING SA",
      type: "PERSONNE_MORALE",
      nationaliteOuPaysImmatriculation: "Côte d'Ivoire",
      partCapitalDirect_pct: 50, // Détient 50% de la société cible
      partDroitsVoteDirect_pct: 50,
      actionnairesParent: [
        {
          id: "PP-01",
          nomOuRaisonSociale: "Kouamé KOFFI",
          type: "PERSONNE_PHYSIQUE",
          nationaliteOuPaysImmatriculation: "Ivoirienne",
          partCapitalDirect_pct: 60, // Détient 60% de la holding -> 60% * 50% = 30% effectif
          partDroitsVoteDirect_pct: 60,
        },
        {
          id: "PP-02",
          nomOuRaisonSociale: "Aya TRAORE",
          type: "PERSONNE_PHYSIQUE",
          nationaliteOuPaysImmatriculation: "Ivoirienne",
          partCapitalDirect_pct: 40, // 40% * 50% = 20% effectif (< 25%)
          partDroitsVoteDirect_pct: 40,
        },
      ],
    };

    const rbe = etablirRegistreBeneficiairesEffectifs(
      "AGRO CI SARL",
      "SARL",
      "CI.ABJ.2023.B.8821",
      "Côte d'Ivoire",
      [holding]
    );

    expect(rbe.nbBeneficiairesEffectifs).toBe(1);
    const b = rbe.beneficiairesIdentifies[0];
    expect(b.nom).toBe("KOFFI");
    expect(b.natureControle).toBe("DETENTION_INDIRECTE");
    expect(b.pourcentageCapitalEffectif_pct).toBe(30);
  });

  it("désigne le représentant légal par défaut si aucun actionnaire n'atteint le seuil de 25%", () => {
    const actionnairesDilues: ActionnaireEntite[] = [
      {
        id: "ACT-01",
        nomOuRaisonSociale: "Jean DUPONT",
        type: "PERSONNE_PHYSIQUE",
        nationaliteOuPaysImmatriculation: "Française",
        partCapitalDirect_pct: 15,
        partDroitsVoteDirect_pct: 15,
      },
      {
        id: "ACT-02",
        nomOuRaisonSociale: "Ali BABA",
        type: "PERSONNE_PHYSIQUE",
        nationaliteOuPaysImmatriculation: "Nigérienne",
        partCapitalDirect_pct: 15,
        partDroitsVoteDirect_pct: 15,
        estRepresentantLegal: true, // DG
      },
    ];

    const rbe = etablirRegistreBeneficiairesEffectifs(
      "DILUE INVEST SA",
      "SA",
      "SN.DKR.2024.B.5544",
      "Sénégal",
      actionnairesDilues
    );

    expect(rbe.nbBeneficiairesEffectifs).toBe(1);
    const b = rbe.beneficiairesIdentifies[0];
    expect(b.nom).toBe("BABA");
    expect(b.natureControle).toBe("POUVOIR_DIRECTION_PAR_DEFAUT");
    expect(rbe.alertesLCBFT.some((a) => a.includes("dirigeant principal"))).toBe(true);
  });

  it("déclenche une alerte LCB-FT en présence d'actionnaires dans des juridictions à risque", () => {
    const actionnairesOffshore: ActionnaireEntite[] = [
      {
        id: "ACT-OFFSHORE",
        nomOuRaisonSociale: "CARIBBEAN TRADE LTD",
        type: "PERSONNE_MORALE",
        nationaliteOuPaysImmatriculation: "Iles Vierges Britanniques",
        partCapitalDirect_pct: 80,
        partDroitsVoteDirect_pct: 80,
      },
    ];

    const rbe = etablirRegistreBeneficiairesEffectifs(
      "GLOBAL HOLDING SAS",
      "SAS",
      "SN.DKR.2024.B.7777",
      "Sénégal",
      actionnairesOffshore
    );

    expect(rbe.alertesLCBFT.length).toBeGreaterThanOrEqual(1);
    expect(rbe.alertesLCBFT.some((a) => a.includes("surveillance renforcée GAFI"))).toBe(true);
  });
});
