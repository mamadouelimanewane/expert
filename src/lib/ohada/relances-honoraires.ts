// ─────────────────────────────────────────────────────────────────────────────
// Module de Relances Clients & Recouvrement des Honoraires — Cabinet 360
// Conforme au Code de Déontologie ONECCA et à l'AUPSRVE (Injonction de Payer)
// ─────────────────────────────────────────────────────────────────────────────

export type NiveauRelance =
  | "RAPPEL_AMICAL"        // J+1 à J+15
  | "PREMIERE_RELANCE"     // J+16 à J+30
  | "DEUXIEME_RELANCE"     // J+31 à J+60 (avertissement suspension des travaux)
  | "MISE_EN_DEMEURE"      // J>60 (injonction de payer AUPSRVE / saisine Ordre)
  | "CONTENTIEUX_AUPSRVE"; // Phase judiciaire

export type CanalCommunication = "EMAIL" | "WHATSAPP" | "COURRIER_RAR";

export interface FactureCreance {
  id: string;
  numeroFacture: string;
  clientNom: string;
  clientEmail?: string;
  clientTelephone?: string;
  dateEmission: string; // YYYY-MM-DD
  dateEcheance: string; // YYYY-MM-DD
  montantTTC: number; // FCFA
  montantDejaRegle: number; // FCFA
  soldeRestantDu: number; // FCFA
  derniereRelanceDate?: string;
  dernierNiveauRelance?: NiveauRelance;
}

export interface PlanRelance {
  factureId: string;
  numeroFacture: string;
  clientNom: string;
  joursRetard: number;
  soldeRestantDu: number;
  niveauRecommande: NiveauRelance;
  interetsMoratoires: number; // FCFA
  indemniteForfaitaire: number; // FCFA (frais recouvrement)
  montantTotalExigible: number;
  actionRecommandee: string;
  bloquerTravaux: boolean;
  messageGenere: {
    objet: string;
    corpsEmail: string;
    texteWhatsApp: string;
    lettreMiseEnDemeure?: string;
  };
}

export interface BilanRecouvrement {
  montantTotalCreances: number;
  montantEchu: number;
  montantNonEchu: number;
  nbFacturesEnRetard: number;
  repartitionParTranche: {
    tranche0_15: number;
    tranche16_30: number;
    tranche31_60: number;
    tranche60_plus: number;
  };
  tauxEfficaciteRecouvrement: number; // %
}

// Taux légal moratoire par défaut dans l'espace UEMOA/CEMAC (ex: 6% l'an)
const TAUX_INTERET_LEGAL_ANNUEL = 0.06;
const INDEMNITE_FORFAITAIRE_RECOUVREMENT = 40_000; // 40 000 FCFA forfait frais

export function calculerJoursRetard(dateEcheance: string, dateReference: Date = new Date()): number {
  const ech = new Date(dateEcheance);
  const diffTime = dateReference.getTime() - ech.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function determinerNiveauRelance(joursRetard: number): NiveauRelance {
  if (joursRetard <= 0) return "RAPPEL_AMICAL";
  if (joursRetard <= 15) return "RAPPEL_AMICAL";
  if (joursRetard <= 30) return "PREMIERE_RELANCE";
  if (joursRetard <= 60) return "DEUXIEME_RELANCE";
  return "MISE_EN_DEMEURE";
}

export function calculerPlanRelance(
  facture: FactureCreance,
  dateReference: Date = new Date()
): PlanRelance {
  const solde = facture.soldeRestantDu;
  const joursRetard = calculerJoursRetard(facture.dateEcheance, dateReference);
  const niveau = determinerNiveauRelance(joursRetard);

  // Intérêts moratoires au prorata temporis
  const interets =
    joursRetard > 0
      ? Math.round((solde * TAUX_INTERET_LEGAL_ANNUEL * joursRetard) / 365)
      : 0;

  // Indemnité forfaitaire applicable à partir du niveau 3 ou 4
  const fraisForfait = joursRetard > 30 ? INDEMNITE_FORFAITAIRE_RECOUVREMENT : 0;
  const montantTotalExigible = solde + interets + fraisForfait;

  let bloquerTravaux = false;
  let actionRecommandee = "";

  if (niveau === "RAPPEL_AMICAL") {
    actionRecommandee = "Envoi d'un rappel bienveillant par WhatsApp ou Email avant relance formelle.";
  } else if (niveau === "PREMIERE_RELANCE") {
    actionRecommandee = "Courriel de rappel formel avec relevé de compte et RIB du cabinet.";
  } else if (niveau === "DEUXIEME_RELANCE") {
    bloquerTravaux = true;
    actionRecommandee =
      "Notification d'interruption temporaire de la production comptable/fiscale (Art. déontologie ONECCA).";
  } else {
    bloquerTravaux = true;
    actionRecommandee =
      "Mise en demeure par lettre recommandée avec AR. Préparation de la requête en Injonction de Payer (AUPSRVE Art. 1 à 18).";
  }

  // Génération des messages types
  const fmt = (n: number) => n.toLocaleString("fr-FR");

  const objet =
    niveau === "RAPPEL_AMICAL"
      ? `Rappel de courtoisie — Facture N° ${facture.numeroFacture}`
      : niveau === "PREMIERE_RELANCE"
      ? `Relance d'impayé — Facture N° ${facture.numeroFacture} — Échéance dépassée`
      : niveau === "DEUXIEME_RELANCE"
      ? `DEUXIÈME AVERTISSEMENT — Suspension des travaux — Facture N° ${facture.numeroFacture}`
      : `MISE EN DEMEURE AVANT POURSUITE AUPSRVE — Facture N° ${facture.numeroFacture}`;

  const corpsEmail = `Cher(e) Client(e),

Sauf erreur ou omission de notre part, le règlement de la facture N° ${facture.numeroFacture} émise le ${facture.dateEmission} pour un montant de ${fmt(facture.montantTTC)} FCFA (solde dû : ${fmt(solde)} FCFA) présente à ce jour un retard de ${joursRetard} jours.

${
  bloquerTravaux
    ? "Conformément à nos conditions générales et aux règles régissant la profession comptable, nous serions contraints de suspendre les travaux de télé-déclaration et de révision sans règlement sous 48 heures."
    : "Nous vous prions de bien vouloir procéder à son règlement par virement bancaire ou chèque à l'ordre du cabinet."
}

Montant à régler : ${fmt(montantTotalExigible)} FCFA.

Restant à votre entière disposition,
Le Département Facturation & Recouvrement — Cabinet 360.`;

  const texteWhatsApp = `Bonjour ${facture.clientNom}, nous vous informons que la facture ${facture.numeroFacture} d'un montant de ${fmt(solde)} FCFA est arrivée à échéance depuis ${joursRetard} jours. Merci de nous transmettre la preuve de virement à votre convenance. Bien cordialement, Cabinet 360.`;

  let lettreMiseEnDemeure: string | undefined;
  if (niveau === "MISE_EN_DEMEURE" || niveau === "CONTENTIEUX_AUPSRVE") {
    lettreMiseEnDemeure = `LETTRE RECOMMANDÉE AVEC DEMANDE D'AVIS DE RÉCEPTION
Objet : MISE EN DEMEURE DE PAYER (Application des articles 1 à 18 de l'Acte Uniforme OHADA portant Organisation des Procédures Simplifiées de Recouvrement et des Voies d'Exécution - AUPSRVE)

Madame, Monsieur le Dirigeant de ${facture.clientNom},

Par la présente, nous vous mettons formellement en demeure de nous régler la somme principale de ${fmt(solde)} FCFA, augmentée des intérêts légaux de ${fmt(interets)} FCFA et de l'indemnité de recouvrement de ${fmt(fraisForfait)} FCFA, soit un total de ${fmt(montantTotalExigible)} FCFA, correspondant aux honoraires de missions échus et impayés (Facture N° ${facture.numeroFacture}).

À défaut de règlement intégral dans un délai impératif de huit (8) jours à compter de la réception de la présente :
1. Nos prestations professionnelles seront immédiatement suspendues ;
2. Une requête aux fins d'Injonction de Payer sera déposée devant la Juridiction compétente, avec demande de saisie-conservatoire sur vos comptes bancaires.

Fait pour valoir ce que de droit.
La Direction du Cabinet.`;
  }

  return {
    factureId: facture.id,
    numeroFacture: facture.numeroFacture,
    clientNom: facture.clientNom,
    joursRetard,
    soldeRestantDu: solde,
    niveauRecommande: niveau,
    interetsMoratoires: interets,
    indemniteForfaitaire: fraisForfait,
    montantTotalExigible,
    actionRecommandee,
    bloquerTravaux,
    messageGenere: {
      objet,
      corpsEmail,
      texteWhatsApp,
      lettreMiseEnDemeure,
    },
  };
}

export function analyserPortefeuilleCreances(
  factures: FactureCreance[],
  dateReference: Date = new Date()
): BilanRecouvrement {
  let montantTotal = 0;
  let montantEchu = 0;
  let montantNonEchu = 0;
  let nbEnRetard = 0;

  const repartition = {
    tranche0_15: 0,
    tranche16_30: 0,
    tranche31_60: 0,
    tranche60_plus: 0,
  };

  for (const f of factures) {
    montantTotal += f.soldeRestantDu;
    const jours = calculerJoursRetard(f.dateEcheance, dateReference);

    if (jours > 0) {
      montantEchu += f.soldeRestantDu;
      nbEnRetard++;

      if (jours <= 15) repartition.tranche0_15 += f.soldeRestantDu;
      else if (jours <= 30) repartition.tranche16_30 += f.soldeRestantDu;
      else if (jours <= 60) repartition.tranche31_60 += f.soldeRestantDu;
      else repartition.tranche60_plus += f.soldeRestantDu;
    } else {
      montantNonEchu += f.soldeRestantDu;
    }
  }

  const tauxEfficacite =
    montantTotal > 0 ? Math.round(((montantTotal - montantEchu) / montantTotal) * 100) : 100;

  return {
    montantTotalCreances: montantTotal,
    montantEchu,
    montantNonEchu,
    nbFacturesEnRetard: nbEnRetard,
    repartitionParTranche: repartition,
    tauxEfficaciteRecouvrement: tauxEfficacite,
  };
}
