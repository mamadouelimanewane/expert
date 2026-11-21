import { describe, it, expect } from "vitest";
import {
  verifierConformiteStatutsOHADA,
  type StatutsSocieteInput,
} from "../src/lib/ohada/controleur-legalite-ohada";

const STATUTS_CONFORMES_SA: StatutsSocieteInput = {
  raisonSociale: "SOCIÉTÉ COMMERCIALE D'AFRIQUE DE L'OUEST SA",
  formeJuridique: "SA",
  paysSiege: "SN",
  capitalSocial_XOF: 50_000_000,
  valeurNominaleTitre_XOF: 10_000,
  nombreAssocies: 7,
  chiffreAffaires_XOF: 450_000_000,
  effectifPermanent: 65,
  totalBilan_XOF: 320_000_000,
  presenceCAC: true,
  clauseExclusionBenefice: false,
  dureeSocieteAnnees: 99,
  revocationDirigeantAdNutum: false,
  capitauxPropres_XOF: 55_000_000,
};

describe("Contrôleur de Légalité Statutaire & Actes Uniformes OHADA", () => {
  it("valide des statuts SA conformes avec score 100", () => {
    const res = verifierConformiteStatutsOHADA(STATUTS_CONFORMES_SA);
    expect(res.conformeGlobalement).toBe(true);
    expect(res.scoreConformite_100).toBe(100);
    expect(res.nbNonConformitesBloquantes).toBe(0);
    expect(res.obligationCAC.obligatoire).toBe(true);
    expect(res.obligationCAC.respecte).toBe(true);
  });

  it("détecte une nullité absolue pour capital SA inférieur à 10 000 000 FCFA (Art. 387)", () => {
    const statutsInvalides: StatutsSocieteInput = {
      ...STATUTS_CONFORMES_SA,
      capitalSocial_XOF: 5_000_000, // < 10M
    };
    const res = verifierConformiteStatutsOHADA(statutsInvalides);
    expect(res.conformeGlobalement).toBe(false);
    expect(res.anomalies.some((a) => a.code === "CAPITAL_INSUFFISANT_SA_ART387")).toBe(true);
    expect(res.scoreConformite_100).toBeLessThan(70);
  });

  it("détecte une clause léonine prohibée (Art. 54 AUSCGIE)", () => {
    const statutsLeonins: StatutsSocieteInput = {
      ...STATUTS_CONFORMES_SA,
      clauseExclusionBenefice: true,
    };
    const res = verifierConformiteStatutsOHADA(statutsLeonins);
    expect(res.anomalies.some((a) => a.code === "CLAUSE_LEONINE_ART54")).toBe(true);
  });

  it("déclenche la procédure Art. 664 quand les capitaux propres sont inférieurs à la moitié du capital", () => {
    const statutsPertes: StatutsSocieteInput = {
      ...STATUTS_CONFORMES_SA,
      capitalSocial_XOF: 50_000_000,
      capitauxPropres_XOF: 15_000_000, // < 25M (moitié)
    };
    const res = verifierConformiteStatutsOHADA(statutsPertes);
    expect(res.situationCapitauxPropres.perteSuperieureMoitieCapital).toBe(true);
    expect(res.anomalies.some((a) => a.code === "CAPITAUX_PROPRES_INFERIEURS_MOITIE_ART664")).toBe(true);
  });
});
