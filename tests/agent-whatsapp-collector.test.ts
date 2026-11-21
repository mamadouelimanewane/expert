import { describe, it, expect } from "vitest";
import {
  traiterCollecteWhatsApp,
  type PieceAttendueDossier,
  type MessageWhatsAppPiece,
} from "../src/lib/ohada/agent-whatsapp-collector";

describe("Agent IA WhatsApp Collector — Collecte & Lettrage Justificatifs Mobile", () => {
  it("lettre automatiquement une quittance Wave avec écriture 401 / 572", () => {
    const pieces: PieceAttendueDossier[] = [
      {
        idPiece: "PC-01",
        typePiece: "QUITTANCE_WAVE_ORANGE_MONEY",
        libelle: "Quittance Wave règlement Sodatel",
        montantPrevu_XOF: 1_250_000,
        statut: "EN_ATTENTE_RELANCE",
        dateEcheance: "2024-11-25",
        nbRelancesEnvoyees: 0,
      },
    ];

    const messageWave: MessageWhatsAppPiece = {
      idMessage: "MSG-001",
      expediteurNom: "M. Diop Comptable",
      telephone: "+221 77 123 45 67",
      dateReception: "2024-11-20 14:20",
      texteMessage: "Voici la quittance Wave pour le paiement Sodatel",
      donneesOCR: {
        typePieceDetectee: "QUITTANCE_WAVE_ORANGE_MONEY",
        montantExtrait_XOF: 1_250_000,
        referenceFactureOuTx: "WV-88912-SN",
        tiersDetecte: "SODATEL",
        scoreConfianceOCR_pct: 94,
      },
    };

    const res = traiterCollecteWhatsApp("AFRIQUE TRANSIT LOGISTIQUE SA", 2024, "Novembre 2024", pieces, [messageWave]);
    expect(res.piecesCollectees).toBe(1);
    expect(res.piecesManquantes).toBe(0);
    expect(res.tauxCompletude_pct).toBe(100);

    const pieceTraitee = res.pieces[0];
    expect(pieceTraitee.statut).toBe("RECUE_TRAITEE");
    expect(pieceTraitee.propositionEcriture?.journal).toBe("TRESORERIE");
    expect(pieceTraitee.propositionEcriture?.debitCompte).toBe("401100");
    expect(pieceTraitee.propositionEcriture?.creditCompte).toBe("572100");
    expect(pieceTraitee.propositionEcriture?.montant_XOF).toBe(1_250_000);
  });

  it("génère une proposition d'écriture Journal Achats pour une facture fournisseur reçue", () => {
    const pieces: PieceAttendueDossier[] = [
      {
        idPiece: "PC-02",
        typePiece: "FACTURE_ACHAT_FOURNISSEUR",
        libelle: "Facture matériel bureau Bureau Center",
        montantPrevu_XOF: 450_000,
        statut: "EN_ATTENTE_RELANCE",
        dateEcheance: "2024-11-28",
        nbRelancesEnvoyees: 0,
      },
    ];

    const messageFacture: MessageWhatsAppPiece = {
      idMessage: "MSG-002",
      expediteurNom: "Bureau Center",
      telephone: "+221 77 234 56 78",
      dateReception: "2024-11-20 15:00",
      texteMessage: "Facture n° BC-9942",
      donneesOCR: {
        typePieceDetectee: "FACTURE_ACHAT_FOURNISSEUR",
        montantExtrait_XOF: 450_000,
        referenceFactureOuTx: "BC-9942",
        tiersDetecte: "Bureau Center",
        scoreConfianceOCR_pct: 90,
      },
    };

    const res = traiterCollecteWhatsApp("BAOBAB SA", 2024, "Novembre 2024", pieces, [messageFacture]);
    const piece = res.pieces[0];
    expect(piece.propositionEcriture?.journal).toBe("ACHATS");
    expect(piece.propositionEcriture?.debitCompte).toBe("601100");
    expect(piece.propositionEcriture?.creditCompte).toBe("401100");
  });

  it("génère un message WhatsApp de relance pour les pièces manquantes", () => {
    const pieces: PieceAttendueDossier[] = [
      {
        idPiece: "PC-03",
        typePiece: "QUITTANCE_BRS_OU_TVA",
        libelle: "Quittance BRS Trésor Public",
        montantPrevu_XOF: 2_400_000,
        statut: "EN_ATTENTE_RELANCE",
        dateEcheance: "2024-11-15",
        nbRelancesEnvoyees: 2,
      },
    ];

    const res = traiterCollecteWhatsApp("SAHEL ENERGIE SA", 2024, "Octobre 2024", pieces, []);
    expect(res.piecesManquantes).toBe(1);
    expect(res.tauxCompletude_pct).toBe(0);
    expect(res.messagesRelanceGeneres).toHaveLength(1);

    const relance = res.messagesRelanceGeneres[0];
    expect(relance.destinataire).toBe("SAHEL ENERGIE SA");
    expect(relance.niveauUrgence).toBe("URGENT"); // Car nbRelancesEnvoyees >= 2
    expect(relance.texteMessageWhatsApp).toContain("SAHEL ENERGIE SA");
    expect(relance.texteMessageWhatsApp).toContain("Quittance BRS Trésor Public");
    expect(relance.texteMessageWhatsApp).toContain("WhatsApp");
  });

  it("gère un dossier déjà complet sans générer de relance superflue", () => {
    const pieces: PieceAttendueDossier[] = [
      {
        idPiece: "PC-04",
        typePiece: "RELEVE_BANCAIRE_PDF",
        libelle: "Relevé bancaire CBAO Octobre",
        statut: "RECUE_TRAITEE",
        dateEcheance: "2024-11-10",
        nbRelancesEnvoyees: 0,
      },
    ];

    const res = traiterCollecteWhatsApp("SAHEL ENERGIE SA", 2024, "Octobre 2024", pieces, []);
    expect(res.tauxCompletude_pct).toBe(100);
    expect(res.piecesManquantes).toBe(0);
    expect(res.messagesRelanceGeneres).toHaveLength(0);
  });
});
