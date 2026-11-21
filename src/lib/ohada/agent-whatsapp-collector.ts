/**
 * Agent IA WhatsApp Collector — Cabinet Expert OHADA 360
 * Relance autonome des justificatifs, OCR mobile & lettrage automatique
 * Inspiré des plateformes Karbon, TaxDome et Plaid/Bridge
 */

export type TypePieceComptable =
  | "QUITTANCE_WAVE_ORANGE_MONEY"
  | "FACTURE_ACHAT_FOURNISSEUR"
  | "AVOIR_FOURNISSEUR"
  | "QUITTANCE_BRS_OU_TVA"
  | "RELEVE_BANCAIRE_PDF";

export type StatutPieceDossier = "RECUE_TRAITEE" | "RECUE_A_CONFIRMER" | "EN_ATTENTE_RELANCE";

export interface MessageWhatsAppPiece {
  idMessage: string;
  expediteurNom: string;
  telephone: string;
  dateReception: string;
  texteMessage: string;
  donneesOCR: {
    typePieceDetectee: TypePieceComptable;
    montantExtrait_XOF: number;
    referenceFactureOuTx?: string;
    tiersDetecte?: string;
    datePiece?: string;
    scoreConfianceOCR_pct: number;
  };
}

export interface PieceAttendueDossier {
  idPiece: string;
  typePiece: TypePieceComptable;
  libelle: string;
  montantPrevu_XOF?: number;
  statut: StatutPieceDossier;
  dateEcheance: string;
  nbRelancesEnvoyees: number;
  messageAssocie?: MessageWhatsAppPiece;
  propositionEcriture?: {
    journal: string;
    debitCompte: string;
    creditCompte: string;
    montant_XOF: number;
    libelle: string;
  };
}

export interface RapportWhatsAppCollector {
  clientNom: string;
  exercice: number;
  periode: string;
  tauxCompletude_pct: number;
  totalPiecesAttendues: number;
  piecesCollectees: number;
  piecesManquantes: number;
  pieces: PieceAttendueDossier[];
  messagesRelanceGeneres: {
    destinataire: string;
    telephone: string;
    texteMessageWhatsApp: string;
    niveauUrgence: "URGENT" | "RAPPEL_COURTOIS";
  }[];
}

export function traiterCollecteWhatsApp(
  clientNom: string,
  exercice: number,
  periode: string,
  piecesAttendues: PieceAttendueDossier[],
  messagesRecus: MessageWhatsAppPiece[]
): RapportWhatsAppCollector {
  const piecesMisesAJour: PieceAttendueDossier[] = piecesAttendues.map((p) => ({ ...p }));
  const relances: RapportWhatsAppCollector["messagesRelanceGeneres"] = [];

  // 1. Tenter d'associer chaque message reçu à une pièce attendue
  for (const msg of messagesRecus) {
    const ocr = msg.donneesOCR;
    // Recherche de correspondance sur le type de pièce et montant (ou référence)
    const indexPiece = piecesMisesAJour.findIndex(
      (p) =>
        p.statut === "EN_ATTENTE_RELANCE" &&
        p.typePiece === ocr.typePieceDetectee &&
        (!p.montantPrevu_XOF || Math.abs(p.montantPrevu_XOF - ocr.montantExtrait_XOF) < 100)
    );

    if (indexPiece >= 0) {
      const piece = piecesMisesAJour[indexPiece];
      piece.statut = ocr.scoreConfianceOCR_pct >= 85 ? "RECUE_TRAITEE" : "RECUE_A_CONFIRMER";
      piece.messageAssocie = msg;

      // Déduire l'écriture comptable
      let debit = "401100";
      let credit = "572100"; // Mobile Money Wave / Orange Money
      if (ocr.typePieceDetectee === "FACTURE_ACHAT_FOURNISSEUR") {
        debit = "601100"; // Achat
        credit = "401100"; // Fournisseur
      } else if (ocr.typePieceDetectee === "QUITTANCE_BRS_OU_TVA") {
        debit = "447200"; // Impôts retenus à la source
        credit = "521100"; // Banque
      }

      piece.propositionEcriture = {
        journal: ocr.typePieceDetectee === "FACTURE_ACHAT_FOURNISSEUR" ? "ACHATS" : "TRESORERIE",
        debitCompte: debit,
        creditCompte: credit,
        montant_XOF: ocr.montantExtrait_XOF,
        libelle: `Règlement ${ocr.typePieceDetectee} - Réf ${ocr.referenceFactureOuTx || "N/A"} (${msg.expediteurNom})`,
      };
    }
  }

  // 2. Identifier les pièces manquantes et formuler les relances WhatsApp intelligentes
  const manquantes = piecesMisesAJour.filter((p) => p.statut === "EN_ATTENTE_RELANCE");
  const collectees = piecesMisesAJour.filter((p) => p.statut !== "EN_ATTENTE_RELANCE").length;
  const total = piecesMisesAJour.length;
  const taux = total > 0 ? Math.round((collectees / total) * 100) : 100;

  if (manquantes.length > 0) {
    const lignesPieces = manquantes
      .map(
        (m) =>
          `• ${m.libelle}${m.montantPrevu_XOF ? ` (${m.montantPrevu_XOF.toLocaleString("fr-FR")} XOF)` : ""}`
      )
      .join("\n");

    relances.push({
      destinataire: clientNom,
      telephone: "+221 77 000 00 00",
      niveauUrgence: manquantes.some((m) => m.nbRelancesEnvoyees >= 2) ? "URGENT" : "RAPPEL_COURTOIS",
      texteMessageWhatsApp: `Bonjour ${clientNom},\n\nDans le cadre de la clôture comptable de la période ${periode} (${exercice}), notre assistant a identifié les pièces justificatives manquantes suivantes :\n${lignesPieces}\n\nMerci de bien vouloir photographier ou transférer ces reçus directement dans cette discussion WhatsApp pour intégration immédiate dans vos comptes.\n\nCordialement,\nCabinet Expert OHADA 360.`,
    });
  }

  return {
    clientNom,
    exercice,
    periode,
    tauxCompletude_pct: taux,
    totalPiecesAttendues: total,
    piecesCollectees: collectees,
    piecesManquantes: manquantes.length,
    pieces: piecesMisesAJour,
    messagesRelanceGeneres: relances,
  };
}
