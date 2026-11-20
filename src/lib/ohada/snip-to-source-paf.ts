/**
 * Moteur « Snip-to-Source » & Piste d'Audit Fiable (PAF)
 * Inspiré de DataSnipper (standard Big 4).
 * Permet la traçabilité visuelle immédiate entre chaque écriture comptable SYSCOHADA
 * et la pièce justificative d'origine (facture, quittance, extrait bancaire).
 */

export type TypeDocumentSource =
  | "FACTURE_FOURNISSEUR"
  | "FACTURE_CLIENT"
  | "RELEVE_BANCAIRE"
  | "QUITTANCE_FISCALE_BRS"
  | "BORDEREAU_SOCIAL_IPRES_CNPS"
  | "CONTRAT_JURIDIQUE";

export interface DocumentSource {
  id: string;
  titre: string;
  typeDocument: TypeDocumentSource;
  nomFichier: string;
  datePiece: string;
  emetteur: string;
  montantTotal_XOF: number;
}

export interface SnipCoordonnees {
  pageNumero: number;
  boundingBox: {
    x: number; // en % ou pixels relatifs
    y: number;
    width: number;
    height: number;
  };
  texteExtrait: string;
  valeurNumerique_XOF: number;
}

export interface LiaisonEcritureSource {
  idEcriture: string;
  dateEcriture: string;
  journalCode: string; // "ACH", "VTE", "BQ", "OD"
  compteNumero: string; // Ex: "601100", "401100"
  compteLibelle: string;
  montantEcriture_XOF: number;
  sens: "DEBIT" | "CREDIT";
  documentSource?: DocumentSource;
  snip?: SnipCoordonnees;
}

export interface VerificationLiaison {
  liaison: LiaisonEcritureSource;
  statutConcordance: "CONCORDANCE_EXACTE" | "ECART_DETECTE" | "PIECE_MANQUANTE";
  ecart_XOF: number;
  observationPAF: string;
}

export interface DossierPisteAuditFiable {
  exercice: number;
  societeRaisonSociale: string;
  totalLignesGrandLivre: number;
  lignesJustifiees: number;
  lignesSansJustificatif: number;
  lignesEnEcart: number;
  tauxCouverturePAF_pct: number;
  montantTotalVerifie_XOF: number;
  montantTotalEcart_XOF: number;
  statutGlobalPAF: "CONFORME_IRREPROCHABLE" | "CONFORME_AVEC_RESERVES" | "RISQUE_REJET_COMPTABILITE";
  verifications: VerificationLiaison[];
  syntheseInspecteurFiscal: string;
}

export function verifierLiaisonEcriture(item: LiaisonEcritureSource): VerificationLiaison {
  if (!item.documentSource || !item.snip) {
    return {
      liaison: item,
      statutConcordance: "PIECE_MANQUANTE",
      ecart_XOF: item.montantEcriture_XOF,
      observationPAF: "Aucune pièce justificative numérisée rattachée à cette écriture (Défaut de pièce - Art. 17 AUDCIF).",
    };
  }

  const ecart = Math.abs(item.montantEcriture_XOF - item.snip.valeurNumerique_XOF);
  if (ecart === 0) {
    return {
      liaison: item,
      statutConcordance: "CONCORDANCE_EXACTE",
      ecart_XOF: 0,
      observationPAF: `Concordance parfaite vérifiée par Snip (Page ${item.snip.pageNumero} du document ${item.documentSource.nomFichier}).`,
    };
  }

  return {
    liaison: item,
    statutConcordance: "ECART_DETECTE",
    ecart_XOF: ecart,
    observationPAF: `Écart de ${ecart.toLocaleString("fr-FR")} XOF entre l'écriture (${item.montantEcriture_XOF.toLocaleString("fr-FR")} XOF) et le montant surligné sur la pièce (${item.snip.valeurNumerique_XOF.toLocaleString("fr-FR")} XOF).`,
  };
}

export function genererDossierPAF(
  societeRaisonSociale: string,
  exercice: number,
  lignes: LiaisonEcritureSource[]
): DossierPisteAuditFiable {
  const verifications = lignes.map(verifierLiaisonEcriture);

  const totalLignes = lignes.length;
  const lignesJustifiees = verifications.filter((v) => v.statutConcordance === "CONCORDANCE_EXACTE").length;
  const lignesSansJustificatif = verifications.filter((v) => v.statutConcordance === "PIECE_MANQUANTE").length;
  const lignesEnEcart = verifications.filter((v) => v.statutConcordance === "ECART_DETECTE").length;

  const tauxCouverture = totalLignes > 0 ? Number(((lignesJustifiees / totalLignes) * 100).toFixed(2)) : 0;
  const montantVerifie = verifications
    .filter((v) => v.statutConcordance === "CONCORDANCE_EXACTE")
    .reduce((acc, v) => acc + v.liaison.montantEcriture_XOF, 0);
  const montantEcart = verifications.reduce((acc, v) => acc + v.ecart_XOF, 0);

  let statutGlobal: DossierPisteAuditFiable["statutGlobalPAF"] = "CONFORME_IRREPROCHABLE";
  if (tauxCouverture < 70 || lignesEnEcart > 5) {
    statutGlobal = "RISQUE_REJET_COMPTABILITE";
  } else if (tauxCouverture < 95 || lignesEnEcart > 0) {
    statutGlobal = "CONFORME_AVEC_RESERVES";
  }

  const syntheseInspecteur = `Le dossier de Piste d'Audit Fiable (PAF) de ${societeRaisonSociale} pour l'exercice ${exercice} présente un taux de couverture probante de ${tauxCouverture}%. ${lignesJustifiees} écritures sur ${totalLignes} sont rattachées directement à leur source documentaire visuelle. Montant vérifié : ${montantVerifie.toLocaleString("fr-FR")} XOF. Statut : ${statutGlobal.replace(/_/g, " ")}.`;

  return {
    exercice,
    societeRaisonSociale,
    totalLignesGrandLivre: totalLignes,
    lignesJustifiees,
    lignesSansJustificatif,
    lignesEnEcart,
    tauxCouverturePAF_pct: tauxCouverture,
    montantTotalVerifie_XOF: montantVerifie,
    montantTotalEcart_XOF: montantEcart,
    statutGlobalPAF: statutGlobal,
    verifications,
    syntheseInspecteurFiscal: syntheseInspecteur,
  };
}
