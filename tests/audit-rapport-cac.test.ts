import { describe, it, expect } from "vitest";
import { genererRapportsCAC, DonneesRapportCAC } from "@/lib/ohada/audit-rapport-cac";

describe("genererRapportsCAC", () => {
  const baseData: DonneesRapportCAC = {
    societe: {
      denomination: "AGRO-INDUSTRIES SAHEL SA",
      formeJuridique: "Société Anonyme",
      rccm: "SN-DKR-2015-B-1122",
      siegeSocial: "Zone Industrielle de Dakar",
      capitalSocial: 500_000_000,
    },
    exerciceClos: "31 décembre 2025",
    chiffreAffaires: 4_500_000_000,
    resultatNet: 280_000_000,
    totalBilan: 3_200_000_000,
    opinion: "CERTIFICATION_SANS_RESERVE",
    reserves: [],
    pointsClesAudit: [
      {
        titre: "Évaluation et dépréciation des stocks de matières premières",
        risqueIdentifie: "Risque de surévaluation des stocks à rotation lente",
        reponseAuditApportee: "Test des coûts unitaires moyens pondérés et rapprochement avec l'inventaire physique",
      },
    ],
    conventionsReglementeesMentionnees: [
      {
        beneficiaire: "Société Holding Africaine (Actionnaire majoritaire)",
        natureConvention: "Contrat d'assistance technique et management fees",
        montantExercice: 45_000_000,
        autorisationPrealableConseil: true,
      },
    ],
    cabinet: {
      denomination: "Cabinet 360 Audit & Advisory",
      ville: "Dakar",
      associeSignataire: "Mamadou Sow, Expert-Comptable Diplômé",
      ordreNational: "ONECCA Sénégal",
    },
    dateRapport: "2026-04-15",
  };

  it("génère un rapport de certification sans réserve avec Points Clés d'Audit (KAM)", () => {
    const res = genererRapportsCAC(baseData);
    expect(res.opinionRetenue).toBe("CERTIFICATION_SANS_RESERVE");
    expect(res.rapportGeneralTexte).toContain("réguliers et sincères et donnent une image fidèle");
    expect(res.rapportGeneralTexte).toContain("POINTS CLÉS DE L'AUDIT - ISA 701");
    expect(res.rapportGeneralTexte).toContain("Évaluation et dépréciation des stocks");
    expect(res.rapportSpecialConventionsTexte).toContain("RAPPORT SPÉCIAL DU COMMISSAIRE AUX COMPTES");
    expect(res.rapportSpecialConventionsTexte).toContain("Contrat d'assistance technique");
  });

  it("génère un rapport avec réserves chiffrées lorsqu'une réserve est formulée", () => {
    const res = genererRapportsCAC({
      ...baseData,
      opinion: "CERTIFICATION_AVEC_RESERVES",
      reserves: [
        {
          titre: "Absence de dépréciation de créances douteuses",
          motif: "Le client XYZ fait l'objet d'une procédure collective sans constitution de provision",
          incidenceChiffree: 50_000_000,
          compteSYSCOHADA: "416 / 659",
        },
      ],
    });

    expect(res.opinionRetenue).toBe("CERTIFICATION_AVEC_RESERVES");
    expect(res.rapportGeneralTexte).toContain("FONDEMENT DE L'OPINION AVEC RÉSERVES");
    expect(res.rapportGeneralTexte.replace(/\u202F|\u00A0/g, " ")).toContain("50 000 000 F CFA");
  });
});
