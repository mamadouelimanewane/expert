import { describe, it, expect } from "vitest";
import {
  genererMessageWhatsApp,
  genererMessageSMS,
  planifierRelances,
  marquerPieceRecue,
  ajouterJours,
  type PieceManquante,
  type ConfigRelance,
} from "../src/lib/ohada/relance-pieces-whatsapp";

const CONFIG_CABINET: ConfigRelance = {
  cabinetNom: "Cabinet EXPERTISE OHADA",
  cabinetTelephone: "+221 33 XXX XX XX",
  expertComptableNom: "M. Ibrahima FALL, EC",
  delaiFinalAbandon_jours: 21,
};

const PIECE_MANQUANTE: PieceManquante = {
  pieceId: "PM-001",
  clientId: "CLI-42",
  clientNom: "SOCIÉTÉ COMMERCIALE SA",
  clientTelephone: "+221771234567",
  ecritureId: "ECR-2024-00891",
  description: "Facture fournisseur SODATEL N°2024-0891",
  montantRef_XOF: 3_500_000,
  compteOHADA: "401100",
  exercice: 2024,
  deadlineRelance: "2024-12-15",
  statut: "EN_ATTENTE",
};

describe("Robot Relance Pièces WhatsApp Autonome (Karbon/TaxDome Standard)", () => {
  it("génère un message WhatsApp niveau 1 contextualisé avec le nom client et le montant FCFA", () => {
    const msg = genererMessageWhatsApp(PIECE_MANQUANTE, CONFIG_CABINET, 1);
    expect(msg).toContain("SOCIÉTÉ COMMERCIALE SA");
    // Le montant formaté contient "000" (toLocaleString peut varier selon l'OS)
    expect(msg).toContain("000");
    expect(msg).toContain("FCFA");
    expect(msg).toContain("401100");
    expect(msg).toContain("Cordialement");
    expect(msg).toContain("Cabinet EXPERTISE OHADA");
  });

  it("génère un SMS court (< 300 caractères) pour relance T+3", () => {
    const sms = genererMessageSMS(PIECE_MANQUANTE, CONFIG_CABINET);
    expect(sms).toContain("Cabinet EXPERTISE OHADA");
    // Le montant formaté contient "FCFA" et "000" (format varie selon OS)
    expect(sms).toContain("FCFA");
    expect(sms).toContain("000");
    expect(sms.length).toBeLessThan(300);
  });

  it("planifie 5 relances avec bons canaux et délais croissants (T0, T3, T7, T7, T14)", () => {
    const plans = planifierRelances([PIECE_MANQUANTE], CONFIG_CABINET, "2024-12-01");
    expect(plans).toHaveLength(1);
    const relances = plans[0].relances;
    expect(relances).toHaveLength(5);

    expect(relances[0].canal).toBe("WHATSAPP");
    expect(relances[0].delaiJours).toBe(0);
    expect(relances[0].dateEnvoi).toBe("2024-12-01");

    expect(relances[1].canal).toBe("SMS");
    expect(relances[1].delaiJours).toBe(3);
    expect(relances[1].dateEnvoi).toBe("2024-12-04");

    expect(relances[3].canal).toBe("ALERTE_CABINET");
    expect(relances[4].delaiJours).toBe(14);
    expect(relances[4].dateEnvoi).toBe("2024-12-15");
  });

  it("annule toutes les relances non envoyées dès que la pièce est marquée reçue", () => {
    const plans = planifierRelances([PIECE_MANQUANTE], CONFIG_CABINET, "2024-12-01");
    const plansAjoursRecue = marquerPieceRecue(plans, "PM-001");

    expect(plansAjoursRecue[0].piece.statut).toBe("RECUE");
    // Toutes les relances non envoyées doivent être annulées
    const nonEnvoyees = plansAjoursRecue[0].relances.filter((r) => !r.envoye);
    expect(nonEnvoyees.every((r) => r.annule)).toBe(true);
    // Les plans d'autres pièces ne sont pas touchés (aucune ici)
    expect(plansAjoursRecue).toHaveLength(1);
  });
});
