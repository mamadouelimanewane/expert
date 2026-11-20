import { describe, it, expect } from "vitest";
import {
  calculerDelaiReponse,
  analyserDossierControleFiscal,
  type DossierControleFiscal,
} from "@/lib/ohada/controle-fiscal-defense";

describe("Bouclier Fiscal & Défense en Contrôle Fiscal", () => {
  const dateRef = new Date("2025-05-10");

  const dossierExemple: DossierControleFiscal = {
    contribuableNom: "Société Industrielle du Cap Vert SA",
    nineaRccm: "SN-DKR-2018-B-1234",
    centreDesImpots: "Direction des Grandes Entreprises de Dakar (DGE)",
    inspecteurNom: "M. Ndiaye, Inspecteur Principal",
    dateReceptionNotification: "2025-05-01", // Échéance au 31 mai (30 jours)
    chefsRedressement: [
      {
        id: "CHEF-1",
        typeChef: "REJET_CHARGE_DEDUCTIBLE",
        exerciceConcerne: 2023,
        motifInspecteur: "Factures de sous-traitance sans NINEA mentionné.",
        baseRedressee: 80_000_000,
        tauxImposition: 30, // 30% IS
        droitsSimplesReclames: 24_000_000,
        degrePenalite: "MANQUEMENT_DELIBERE", // 50%
        estContestable: true,
        argumentsContestation: "Attestations de régularité fiscale fournies par les prestataires et preuve du virement bancaire effectif.",
        baseAccepteeParContribuable: 0,
      },
      {
        id: "CHEF-2",
        typeChef: "REINTEGRATION_TVA",
        exerciceConcerne: 2024,
        motifInspecteur: "TVA déduite sur carburant pour véhicules de tourisme.",
        baseRedressee: 15_000_000,
        tauxImposition: 18, // 18% TVA
        droitsSimplesReclames: 2_700_000,
        degrePenalite: "BONNE_FOI_STANDARD", // 25%
        estContestable: false, // Admis
        argumentsContestation: "Dépense admise non contestée.",
        baseAccepteeParContribuable: 15_000_000,
      },
    ],
  };

  it("calcule avec exactitude le délai légal impératif de 30 jours pour répondre", () => {
    const { dateEcheance, joursRestants, estHorsDelai } = calculerDelaiReponse(
      dossierExemple.dateReceptionNotification,
      dateRef
    );

    expect(dateEcheance).toBe("2025-05-31");
    expect(joursRestants).toBe(21);
    expect(estHorsDelai).toBe(false);
  });

  it("calcule le montant total des réclamations initiales (droits simples + pénalités)", () => {
    const analyse = analyserDossierControleFiscal(dossierExemple, dateRef);

    // Droits simples = 24M (Chef 1) + 2.7M (Chef 2) = 26.7M
    expect(analyse.totalDroitsSimples).toBe(26_700_000);

    // Pénalités = 24M * 50% (12M) + 2.7M * 25% (675 000) = 12 675 000 FCFA
    expect(analyse.totalPenalitesReclamees).toBe(12_675_000);

    // Total réclamé par le fisc = 26.7M + 12.675M = 39 375 000 FCFA
    expect(analyse.totalReclameParFisc).toBe(39_375_000);
  });

  it("calcule les montants contestés et génère une proposition transactionnelle équilibrée", () => {
    const analyse = analyserDossierControleFiscal(dossierExemple, dateRef);

    // Chef 1 contesté totalement = 24M droits + 12M pénalités = 36M contestés
    expect(analyse.totalDroitsContestes).toBe(24_000_000);
    expect(analyse.totalPenalitesContestees).toBe(12_000_000);
    expect(analyse.montantTotalConteste).toBe(36_000_000);

    // Droits acceptés restants = 2.7M
    expect(analyse.propositionTransactionnelle.principalApresContestation).toBe(2_700_000);
    expect(analyse.propositionTransactionnelle.penalitesNegociees).toBe(270_000); // 10% de 2.7M
    expect(analyse.propositionTransactionnelle.economieTotaleRealisee).toBeGreaterThan(30_000_000);
  });

  it("génère le mémoire en réponse formel conforme à l'article 42 du LPF", () => {
    const analyse = analyserDossierControleFiscal(dossierExemple, dateRef);

    expect(analyse.memoireReponseFormel).toContain("MÉMOIRE EN RÉPONSE");
    expect(analyse.memoireReponseFormel).toContain("30 jours");
    expect(analyse.memoireReponseFormel).toContain("transaction fiscale");
    expect(analyse.memoireReponseFormel).toContain("Société Industrielle du Cap Vert SA");
  });
});
