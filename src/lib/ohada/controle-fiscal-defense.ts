// ─────────────────────────────────────────────────────────────────────────────
// Module Bouclier Fiscal & Défense en Contrôle Fiscal — Espace OHADA / UEMOA
// Procédure contradictoire de redressement, calcul des pénalités LPF et transaction fiscale
// ─────────────────────────────────────────────────────────────────────────────

export type TypeChefRedressement =
  | "REJET_CHARGE_DEDUCTIBLE"
  | "REINTEGRATION_TVA"
  | "OMISSION_RETENUE_BRS"
  | "AMORTISSEMENT_EXCEDENTAIRE"
  | "PROVISION_NON_DEDUCTIBLE"
  | "INCOHERENCE_CHIFFRE_AFFAIRES";

export type DegrePenaiteFiscale =
  | "BONNE_FOI_STANDARD"        // 25% majoration
  | "MANQUEMENT_DELIBERE"       // 50% majoration (mauvaise foi)
  | "MANOEUVRES_FRAUDULEUSES";   // 100% majoration

export interface ChefRedressementFiscal {
  id: string;
  typeChef: TypeChefRedressement;
  exerciceConcerne: number;     // Ex: 2023, 2024
  motifInspecteur: string;
  baseRedressee: number;        // FCFA
  tauxImposition: number;       // % (ex: 30% IS, 18% TVA, 5% BRS)
  droitsSimplesReclames: number;// Base × Taux
  degrePenalite: DegrePenaiteFiscale;
  estContestable: boolean;
  argumentsContestation: string;
  baseAccepteeParContribuable: number; // Montant admis par le client
}

export interface DossierControleFiscal {
  contribuableNom: string;
  nineaRccm: string;
  centreDesImpots: string;      // Ex: "Direction des Grandes Entreprises (DGE Dakar)"
  inspecteurNom: string;
  dateReceptionNotification: string; // YYYY-MM-DD
  chefsRedressement: ChefRedressementFiscal[];
}

export interface AnalyseControleFiscal {
  dateEcheanceReponse: string;  // J+30 impératif
  joursRestantsPourRepondre: number;
  estHorsDelai: boolean;

  totalBaseRedresseeInitiale: number;
  totalDroitsSimples: number;
  totalPenalitesReclamees: number;
  totalReclameParFisc: number;

  totalDroitsContestes: number;
  totalPenalitesContestees: number;
  montantTotalConteste: number;

  totalDroitsAcceptes: number;
  propositionTransactionnelle: {
    principalApresContestation: number;
    penalitesNegociees: number; // Réduction à 10%
    montantFinalTransaction: number;
    economieTotaleRealisee: number;
    echeancierMoisPropose: number; // 6 à 12 mois
  };

  memoireReponseFormel: string;
}

export function calculerDelaiReponse(dateReception: string, dateReference = new Date()): { dateEcheance: string; joursRestants: number; estHorsDelai: boolean } {
  const dRec = new Date(dateReception);
  const dEch = new Date(dRec);
  dEch.setDate(dEch.getDate() + 30); // 30 jours francs selon le Livre de Procédures Fiscales

  const diffTime = dEch.getTime() - dateReference.getTime();
  const joursRestants = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    dateEcheance: dEch.toISOString().split("T")[0],
    joursRestants,
    estHorsDelai: joursRestants < 0,
  };
}

export function analyserDossierControleFiscal(
  dossier: DossierControleFiscal,
  dateReference = new Date()
): AnalyseControleFiscal {
  const { dateEcheance, joursRestants, estHorsDelai } = calculerDelaiReponse(
    dossier.dateReceptionNotification,
    dateReference
  );

  let totalBaseRedresseeInitiale = 0;
  let totalDroitsSimples = 0;
  let totalPenalites = 0;

  let totalDroitsContestes = 0;
  let totalPenalitesContestees = 0;
  let totalDroitsAcceptes = 0;

  for (const chef of dossier.chefsRedressement) {
    totalBaseRedresseeInitiale += chef.baseRedressee;
    const droits = chef.droitsSimplesReclames;
    totalDroitsSimples += droits;

    const txPena = chef.degrePenalite === "MANOEUVRES_FRAUDULEUSES" ? 1.0 : chef.degrePenalite === "MANQUEMENT_DELIBERE" ? 0.5 : 0.25;
    const pena = Math.round(droits * txPena);
    totalPenalites += pena;

    if (chef.estContestable) {
      const baseContestee = Math.max(0, chef.baseRedressee - chef.baseAccepteeParContribuable);
      const droitsContestes = Math.round(baseContestee * (chef.tauxImposition / 100));
      const penaContestee = Math.round(droitsContestes * txPena);
      totalDroitsContestes += droitsContestes;
      totalPenalitesContestees += penaContestee;
    }

    const droitsAcceptes = Math.round(chef.baseAccepteeParContribuable * (chef.tauxImposition / 100));
    totalDroitsAcceptes += droitsAcceptes;
  }

  const totalReclame = totalDroitsSimples + totalPenalites;
  const montantTotalConteste = totalDroitsContestes + totalPenalitesContestees;

  // Proposition transactionnelle (Art. LPF sur la transaction fiscale)
  // Droits simples restant dus après contestation + pénalités ramenées à 10%
  const principalApresContest = totalDroitsSimples - totalDroitsContestes;
  const penalitesNegociees = Math.round(principalApresContest * 0.10); // 10% forfait transactionnel
  const montantFinalTransaction = principalApresContest + penalitesNegociees;
  const economieRealisee = totalReclame - montantFinalTransaction;

  const fmt = (n: number) => n.toLocaleString("fr-FR");

  // Rédaction du Mémoire Formel en Réponse (Art. 42 du Livre de Procédures Fiscales)
  const memoireFormel =
    `MÉMOIRE EN RÉPONSE À LA NOTIFICATION DE REDRESSEMENTS\n` +
    `(Articles 40 à 46 du Livre de Procédures Fiscales — Procédure de Redressement Contradictoire)\n\n` +
    `À l'attention de : M. l'Inspecteur des Impôts et des Domaines, ${dossier.centreDesImpots}\n` +
    `Contribuable : ${dossier.contribuableNom} (NINEA/RCCM : ${dossier.nineaRccm})\n` +
    `Date de notification : ${dossier.dateReceptionNotification} — Date limite de réponse : ${dateEcheance}\n\n` +
    `Monsieur l'Inspecteur,\n\n` +
    `Faisant suite à la notification de redressements citée en référence, par laquelle vos services envisagent de mettre à la charge de notre société un rappel de droits simples de ${fmt(totalDroitsSimples)} FCFA assorti de pénalités de ${fmt(totalPenalites)} FCFA (soit un total de ${fmt(totalReclame)} FCFA), nous avons l'honneur de vous soumettre nos observations contradictoires dans le délai légal impératif de 30 jours.\n\n` +
    `1. OBSERVATIONS CHEF PAR CHEF :\n` +
    dossier.chefsRedressement.map((c, i) =>
      `  Chef N°${i + 1} : [${c.typeChef}] Exercice ${c.exerciceConcerne}\n` +
      `  - Montant réclamé par le vérificateur : ${fmt(c.droitsSimplesReclames)} FCFA\n` +
      `  - Position du contribuable : ${c.estContestable ? "CONTESTÉ TOTALEMENT OU PARTIELLEMENT" : "ACCEPTÉ"}\n` +
      `  - Motifs juridiques & factuels : ${c.argumentsContestation}\n`
    ).join("\n") +
    `\n2. SYNTHÈSE DES DROITS CONTESTÉS & DEMANDE TRANSACTIONNELLE :\n` +
    `- Droits et pénalités contestés : ${fmt(montantTotalConteste)} FCFA sur le fondement des textes précités.\n` +
    `- Droits nets admis sous réserve de transaction : ${fmt(principalApresContest)} FCFA.\n\n` +
    `Nous sollicitons dès lors le bénéfice d'une transaction fiscale ramenant les pénalités à titre transactionnel à ${fmt(penalitesNegociees)} FCFA, avec plan d'apurement échelonné sur 12 mensualités.\n\n` +
    `Veuillez agréer, Monsieur l'Inspecteur, l'assurance de notre considération distinguée.\n\n` +
    `Pour la Société ${dossier.contribuableNom},\n` +
    `Le Conseil Fiscal / L'Expert-Comptable Référent.`;

  return {
    dateEcheanceReponse: dateEcheance,
    joursRestantsPourRepondre: joursRestants,
    estHorsDelai,
    totalBaseRedresseeInitiale,
    totalDroitsSimples,
    totalPenalitesReclamees: totalPenalites,
    totalReclameParFisc: totalReclame,
    totalDroitsContestes,
    totalPenalitesContestees,
    montantTotalConteste,
    totalDroitsAcceptes,
    propositionTransactionnelle: {
      principalApresContestation: principalApresContest,
      penalitesNegociees,
      montantFinalTransaction,
      economieTotaleRealisee: economieRealisee,
      echeancierMoisPropose: 12,
    },
    memoireReponseFormel: memoireFormel,
  };
}
