import { describe, it, expect } from "vitest";
import {
  verifierLiaisonEcriture,
  genererDossierPAF,
  type LiaisonEcritureSource,
} from "../src/lib/ohada/snip-to-source-paf";

const ecritureAvecFactureConforme: LiaisonEcritureSource = {
  idEcriture: "ECR-101",
  dateEcriture: "2024-04-12",
  journalCode: "ACH",
  compteNumero: "601100",
  compteLibelle: "Achats de marchandises",
  montantEcriture_XOF: 15_000_000,
  sens: "DEBIT",
  documentSource: {
    id: "DOC-01",
    titre: "Facture Fournisseur SARL DAKAR",
    typeDocument: "FACTURE_FOURNISSEUR",
    nomFichier: "facture_dakar_101.pdf",
    datePiece: "2024-04-10",
    emetteur: "SARL DAKAR",
    montantTotal_XOF: 15_000_000,
  },
  snip: {
    pageNumero: 1,
    boundingBox: { x: 350, y: 520, width: 80, height: 20 },
    texteExtrait: "Total Net à Payer : 15 000 000 XOF",
    valeurNumerique_XOF: 15_000_000,
  },
};

const ecritureAvecEcart: LiaisonEcritureSource = {
  idEcriture: "ECR-102",
  dateEcriture: "2024-05-18",
  journalCode: "ACH",
  compteNumero: "624100",
  compteLibelle: "Transports sur achats",
  montantEcriture_XOF: 3_500_000,
  sens: "DEBIT",
  documentSource: {
    id: "DOC-02",
    titre: "Facture Transporteur EXPRESS",
    typeDocument: "FACTURE_FOURNISSEUR",
    nomFichier: "facture_express_202.pdf",
    datePiece: "2024-05-17",
    emetteur: "EXPRESS LOGISTIQUE",
    montantTotal_XOF: 3_000_000,
  },
  snip: {
    pageNumero: 1,
    boundingBox: { x: 300, y: 400, width: 90, height: 22 },
    texteExtrait: "Montant TTC: 3 000 000 XOF",
    valeurNumerique_XOF: 3_000_000, // Écart de 500k
  },
};

const ecritureSansPiece: LiaisonEcritureSource = {
  idEcriture: "ECR-103",
  dateEcriture: "2024-06-25",
  journalCode: "OD",
  compteNumero: "632400",
  compteLibelle: "Honoraires de conseil",
  montantEcriture_XOF: 8_000_000,
  sens: "DEBIT",
};

describe("Moteur Snip-to-Source & Piste d'Audit Fiable (DataSnipper Standard)", () => {
  it("valide la concordance exacte entre écriture comptable et pièce numérisée", () => {
    const verif = verifierLiaisonEcriture(ecritureAvecFactureConforme);
    expect(verif.statutConcordance).toBe("CONCORDANCE_EXACTE");
    expect(verif.ecart_XOF).toBe(0);
    expect(verif.observationPAF).toContain("Concordance parfaite");
  });

  it("détecte et chiffre un écart entre montant comptabilisé et montant snipé", () => {
    const verif = verifierLiaisonEcriture(ecritureAvecEcart);
    expect(verif.statutConcordance).toBe("ECART_DETECTE");
    expect(verif.ecart_XOF).toBe(500_000);
    expect(verif.observationPAF).toContain("Écart de 500");
  });

  it("signale l'absence de pièce justificative (Défaut de pièce justificative)", () => {
    const verif = verifierLiaisonEcriture(ecritureSansPiece);
    expect(verif.statutConcordance).toBe("PIECE_MANQUANTE");
    expect(verif.ecart_XOF).toBe(8_000_000);
    expect(verif.observationPAF).toContain("Art. 17 AUDCIF");
  });

  it("génère le dossier de Piste d'Audit Fiable complet avec calcul du taux de couverture", () => {
    const dossier = genererDossierPAF("SOCIÉTÉ COMMERCIALE SA", 2024, [
      ecritureAvecFactureConforme,
      ecritureAvecEcart,
      ecritureSansPiece,
    ]);

    expect(dossier.totalLignesGrandLivre).toBe(3);
    expect(dossier.lignesJustifiees).toBe(1);
    expect(dossier.lignesEnEcart).toBe(1);
    expect(dossier.lignesSansJustificatif).toBe(1);
    expect(dossier.tauxCouverturePAF_pct).toBeCloseTo(33.33, 1);
    expect(dossier.statutGlobalPAF).toBe("RISQUE_REJET_COMPTABILITE");
    expect(dossier.syntheseInspecteurFiscal).toContain("33.33%");
  });
});
