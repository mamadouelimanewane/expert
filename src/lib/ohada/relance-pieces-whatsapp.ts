/**
 * Robot Relance Pièces Justificatives — WhatsApp Autonome (Karbon/TaxDome Standard)
 *
 * Gère le cycle complet de relance multicanal pour les pièces manquantes :
 * T+0 → WhatsApp, T+3 → SMS, T+7 → WhatsApp relance 2 + alerte cabinet, T+14 → Dernière chance.
 * Auto-stop dès réception de la pièce (marquerPieceRecue).
 */

export interface PieceManquante {
  pieceId: string;
  clientId: string;
  clientNom: string;
  clientTelephone: string;
  ecritureId: string;
  description: string;
  montantRef_XOF: number;
  compteOHADA: string;
  exercice: number;
  deadlineRelance: string;
  statut: "EN_ATTENTE" | "RELANCE_1_ENVOYEE" | "RELANCE_2_ENVOYEE" | "RELANCE_3_ENVOYEE" | "RECUE" | "ABANDONNEE";
}

export interface RelancePlanifiee {
  pieceId: string;
  canal: "WHATSAPP" | "SMS" | "EMAIL" | "ALERTE_CABINET";
  delaiJours: number;
  dateEnvoi: string;
  messagePret: string;
  envoye: boolean;
  annule: boolean;
}

export interface PlanRelanceComplet {
  piece: PieceManquante;
  relances: RelancePlanifiee[];
  prochainContact: string;
  urgence: "NORMAL" | "URGENT" | "CRITIQUE";
}

export interface ConfigRelance {
  cabinetNom: string;
  cabinetTelephone: string;
  expertComptableNom: string;
  delaiFinalAbandon_jours: number;
}

export function genererMessageWhatsApp(
  piece: PieceManquante,
  config: ConfigRelance,
  niveauRelance: 1 | 2 | 3
): string {
  const montantStr = piece.montantRef_XOF.toLocaleString("fr-FR") + " FCFA";
  const deadline = new Date(piece.deadlineRelance).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  if (niveauRelance === 1) {
    return [
      `Bonjour ${piece.clientNom},`,
      ``,
      `Dans le cadre de l'établissement de vos comptes annuels ${piece.exercice},`,
      `nous avons besoin du document suivant :`,
      ``,
      `📄 *${piece.description}*`,
      `💰 Montant de référence : ${montantStr}`,
      `📂 Compte SYSCOHADA : ${piece.compteOHADA}`,
      ``,
      `Merci de nous le faire parvenir avant le *${deadline}*.`,
      ``,
      `Cordialement,`,
      `${config.expertComptableNom} — ${config.cabinetNom}`,
    ].join("\n");
  }

  if (niveauRelance === 2) {
    return [
      `Bonjour ${piece.clientNom}, rappel important —`,
      ``,
      `Nous n'avons pas encore reçu : *${piece.description}* (${montantStr}).`,
      ``,
      `⚠️ Sans ce justificatif, nous ne pouvons pas finaliser vos états financiers SYSCOHADA ${piece.exercice}.`,
      `Délai impératif : *${deadline}*`,
      ``,
      `${config.expertComptableNom} — ${config.cabinetNom} — ${config.cabinetTelephone}`,
    ].join("\n");
  }

  return [
    `🚨 *DERNIER RAPPEL* — Pièce justificative manquante`,
    ``,
    `📄 ${piece.description} — ${montantStr}`,
    ``,
    `Faute de réception sous 48h, nous clôturerons le dossier avec mention aux états financiers.`,
    ``,
    `Contactez-nous immédiatement : ${config.cabinetTelephone}`,
    `${config.expertComptableNom} — ${config.cabinetNom}`,
  ].join("\n");
}

export function genererMessageSMS(piece: PieceManquante, config: ConfigRelance): string {
  const montantStr = piece.montantRef_XOF.toLocaleString("fr-FR") + " FCFA";
  return (
    `[${config.cabinetNom}] Rappel : justificatif manquant — ` +
    `${piece.description} (${montantStr}). ` +
    `Répondez sur WhatsApp ou appelez le ${config.cabinetTelephone}.`
  );
}

export function ajouterJours(dateISO: string, jours: number): string {
  const d = new Date(dateISO);
  d.setDate(d.getDate() + jours);
  return d.toISOString().slice(0, 10);
}

export function planifierRelances(
  pieces: PieceManquante[],
  config: ConfigRelance,
  dateDepart?: string
): PlanRelanceComplet[] {
  const today = dateDepart ?? new Date().toISOString().slice(0, 10);

  return pieces
    .filter((p) => p.statut !== "RECUE" && p.statut !== "ABANDONNEE")
    .map((piece) => {
      const relances: RelancePlanifiee[] = [
        {
          pieceId: piece.pieceId,
          canal: "WHATSAPP",
          delaiJours: 0,
          dateEnvoi: today,
          messagePret: genererMessageWhatsApp(piece, config, 1),
          envoye: false,
          annule: false,
        },
        {
          pieceId: piece.pieceId,
          canal: "SMS",
          delaiJours: 3,
          dateEnvoi: ajouterJours(today, 3),
          messagePret: genererMessageSMS(piece, config),
          envoye: false,
          annule: false,
        },
        {
          pieceId: piece.pieceId,
          canal: "WHATSAPP",
          delaiJours: 7,
          dateEnvoi: ajouterJours(today, 7),
          messagePret: genererMessageWhatsApp(piece, config, 2),
          envoye: false,
          annule: false,
        },
        {
          pieceId: piece.pieceId,
          canal: "ALERTE_CABINET",
          delaiJours: 7,
          dateEnvoi: ajouterJours(today, 7),
          messagePret: `[ALERTE CABINET] ${piece.clientNom} — ${piece.description} toujours manquante après 7 jours. Action requise par ${config.expertComptableNom}.`,
          envoye: false,
          annule: false,
        },
        {
          pieceId: piece.pieceId,
          canal: "WHATSAPP",
          delaiJours: 14,
          dateEnvoi: ajouterJours(today, 14),
          messagePret: genererMessageWhatsApp(piece, config, 3),
          envoye: false,
          annule: false,
        },
      ];

      const joursDepuisDeadline =
        (new Date(today).getTime() - new Date(piece.deadlineRelance).getTime()) /
        (1000 * 60 * 60 * 24);

      const urgence: PlanRelanceComplet["urgence"] =
        joursDepuisDeadline > 7 ? "CRITIQUE" : joursDepuisDeadline > 0 ? "URGENT" : "NORMAL";

      return {
        piece,
        relances,
        prochainContact: `WhatsApp immédiat → SMS le ${ajouterJours(today, 3)} → Relance finale le ${ajouterJours(today, 14)}`,
        urgence,
      };
    });
}

export function marquerPieceRecue(
  plans: PlanRelanceComplet[],
  pieceId: string
): PlanRelanceComplet[] {
  return plans.map((plan) => {
    if (plan.piece.pieceId !== pieceId) return plan;
    return {
      ...plan,
      piece: { ...plan.piece, statut: "RECUE" },
      relances: plan.relances.map((r) => ({ ...r, annule: !r.envoye })),
    };
  });
}
