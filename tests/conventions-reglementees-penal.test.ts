import { describe, it, expect } from "vitest";
import {
  analyserConvention,
  genererRapportSpecialCAC,
  type ConventionSaisie,
} from "../src/lib/ohada/conventions-reglementees-penal";

const conventionConforme: ConventionSaisie = {
  id: "conv-1",
  beneficiaireNom: "M. Ibrahima FALL",
  qualite: "ADMINISTRATEUR",
  personnePhysique: true,
  typeOperation: "BAIL_COMMERCIAL",
  montant_XOF: 18_000_000,
  soldeDebiteur: false,
  autorisationPrealableCA: true,
  conditionsArmLength: true,
  dateConvention: "2024-03-15",
  interetSocialAvéré: true,
  description: "Bail commercial de bureaux conformes aux prix du marché dakarois",
};

const conventionCompteCourantDebiteur: ConventionSaisie = {
  id: "conv-2",
  beneficiaireNom: "M. Amadou SOW (Directeur Général)",
  qualite: "DIRECTEUR_GENERAL",
  personnePhysique: true,
  typeOperation: "COMPTE_COURANT_ASSOCIE",
  montant_XOF: 45_000_000,
  soldeDebiteur: true, // Découvert en compte courant
  autorisationPrealableCA: false,
  conditionsArmLength: false,
  dateConvention: "2024-06-30",
  interetSocialAvéré: false,
  description: "Avance de trésorerie personnelle en compte courant débiteur",
};

const conventionSansAutorisation: ConventionSaisie = {
  id: "conv-3",
  beneficiaireNom: "HOLDING SA (Actionnaire 25%)",
  qualite: "ACTIONNAIRE_SIGNIFICATIF",
  personnePhysique: false,
  typeOperation: "PRESTATION_HONORAIRES",
  montant_XOF: 25_000_000,
  soldeDebiteur: false,
  autorisationPrealableCA: false, // Oubli d'autorisation préalable
  conditionsArmLength: true,
  dateConvention: "2024-09-01",
  interetSocialAvéré: true,
  description: "Assistance technique et financière",
};

describe("Conventions Réglementées & Risque Pénal (AUSCGIE Art. 438-450 & 716)", () => {
  it("valide une convention autorisée conforme aux conditions de marché", () => {
    const analyse = analyserConvention(conventionConforme);
    expect(analyse.typeInfraction).toBe("CONFORME");
    expect(analyse.gravite).toBe("AUCUNE");
    expect(analyse.obligationCAC).toBe("MENTION_RAPPORT_SPECIAL");
  });

  it("détecte l'infraction pénale absolue sur compte courant débiteur d'une personne physique", () => {
    const analyse = analyserConvention(conventionCompteCourantDebiteur);
    expect(analyse.typeInfraction).toBe("INTERDICTION_ABSOLUE_ABS");
    expect(analyse.gravite).toBe("CRITIQUE_PENALE");
    expect(analyse.articleAUSCGIE).toContain("450");
    expect(analyse.obligationCAC).toBe("REVELATION_PROCUREUR_ART716");
    expect(analyse.risqueDirigeant).toContain("Abus de Biens Sociaux");
  });

  it("identifie le défaut d'autorisation préalable du Conseil d'Administration", () => {
    const analyse = analyserConvention(conventionSansAutorisation);
    expect(analyse.typeInfraction).toBe("DEFAUT_AUTORISATION_PREALABLE");
    expect(analyse.gravite).toBe("MOYENNE");
    expect(analyse.obligationCAC).toBe("MENTION_RAPPORT_SPECIAL");
  });

  it("génère le rapport spécial du CAC et déclenche l'avis défavorable avec révélation Procureur", () => {
    const rapport = genererRapportSpecialCAC(
      "SOCIÉTÉ COMMERCIALE SÉNÉGALAISE SA",
      2024,
      [conventionConforme, conventionCompteCourantDebiteur, conventionSansAutorisation]
    );

    expect(rapport.nombreConventionsTotales).toBe(3);
    expect(rapport.nombreConventionsInterdites).toBe(1);
    expect(rapport.avisGeneralCAC).toBe("DEFAVORABLE_REVELATION_PROCUREUR");
    expect(rapport.alertesPenales.length).toBeGreaterThan(0);
    expect(rapport.texteIntegralRapportSpecial).toContain("RAPPORT SPÉCIAL");
    expect(rapport.texteIntegralRapportSpecial).toContain("Procureur de la République");
  });
});
