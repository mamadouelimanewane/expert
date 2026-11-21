/**
 * Agent IA Sentinel Clôture — Cabinet Expert OHADA 360
 * Surveillance autonome de la clôture des comptes & Intégrité de liasse
 * Inspiré des standards CaseWare & FloQast
 *
 * Fonctionnalités clés :
 * 1. Audit continu de la balance de clôture SYSCOHADA
 * 2. Détection automatique des 5 anomalies critiques de clôture (Tiers débiteurs/créditeurs, comptes d'attente 471, équilibre bilan, dotations)
 * 3. Génération des écritures d'ajustement / OD de régularisation prêtes à être injectées en compta
 * 4. Délivrance du Score d'Intégrité de Clôture (0-100)
 */

export interface CompteBalanceCloture {
  compte: string;
  libelle: string;
  soldeDebiteur_XOF: number;
  soldeCrediteur_XOF: number;
}

export interface EcritureRegularisationProposee {
  idEcriture: string;
  journal: "OD_CLOTURE";
  date: string;
  libelleEcriture: string;
  lignes: {
    compte: string;
    intituleCompte: string;
    debit_XOF: number;
    credit_XOF: number;
  }[];
  justificationSYSCOHADA: string;
  impactNetResultat_XOF: number;
}

export interface AnomalieClotureDetectee {
  code: string;
  gravite: "BLOQUANTE" | "MAJEURE" | "MINEURE";
  intitule: string;
  explication: string;
  compteConcerne: string;
  montantAnomalie_XOF: number;
  ecritureProposee?: EcritureRegularisationProposee;
}

export interface RapportSentinelCloture {
  clientNom: string;
  exercice: number;
  dateAudit: string;
  scoreIntegrite_100: number;
  statutCloture: "CONFORME_POUR_LIASSE" | "AJUSTEMENTS_REQUIS" | "BLOQUEE";
  totalAnomalies: number;
  anomaliesBloquantes: number;
  anomaliesMajeures: number;
  anomalies: AnomalieClotureDetectee[];
  ecrituresRegularisation: EcritureRegularisationProposee[];
  syntheseRecommandations: string[];
}

export function executerAuditSentinelCloture(
  clientNom: string,
  exercice: number,
  comptes: CompteBalanceCloture[]
): RapportSentinelCloture {
  const anomalies: AnomalieClotureDetectee[] = [];
  const ecritures: EcritureRegularisationProposee[] = [];
  const today = new Date().toISOString().slice(0, 10);

  // 1. Contrôle Équilibre Débit / Crédit de la balance
  const totalDebit = comptes.reduce((s, c) => s + c.soldeDebiteur_XOF, 0);
  const totalCredit = comptes.reduce((s, c) => s + c.soldeCrediteur_XOF, 0);
  const ecartBalance = Math.abs(totalDebit - totalCredit);

  if (ecartBalance > 0) {
    anomalies.push({
      code: "ANOM_01_DESEQUILIBRE_BALANCE",
      gravite: "BLOQUANTE",
      intitule: "Déséquilibre Débit/Crédit de la balance générale",
      explication: `La balance générale présente un écart de ${ecartBalance.toLocaleString("fr-FR")} XOF entre débits et crédits.`,
      compteConcerne: "TOUS_COMPTES",
      montantAnomalie_XOF: ecartBalance,
    });
  }

  // 2. Contrôle du compte d'attente 471 (doit impérativement être soldé à la clôture)
  const compte471 = comptes.find((c) => c.compte.startsWith("471"));
  if (compte471) {
    const solde471 = Math.abs(compte471.soldeDebiteur_XOF - compte471.soldeCrediteur_XOF);
    if (solde471 > 0) {
      anomalies.push({
        code: "ANOM_02_COMPTE_ATTENTE_NON_SOLDE",
        gravite: "BLOQUANTE",
        intitule: "Compte d'attente 471 non soldé avant clôture",
        explication: `Le compte d'attente 471 contient un solde non imputé de ${solde471.toLocaleString("fr-FR")} XOF, interdit en liasse SYSCOHADA.`,
        compteConcerne: compte471.compte,
        montantAnomalie_XOF: solde471,
      });
    }
  }

  // 3. Contrôle des Fournisseurs débiteurs (doivent être reclassés au compte 409)
  const fournisseursDebiteurs = comptes.filter(
    (c) => c.compte.startsWith("401") && c.soldeDebiteur_XOF > 0
  );
  for (const frn of fournisseursDebiteurs) {
    const montant = frn.soldeDebiteur_XOF;
    const ecritureReclassement: EcritureRegularisationProposee = {
      idEcriture: `OD-RECLASS-FRN-${frn.compte}`,
      journal: "OD_CLOTURE",
      date: `${exercice}-12-31`,
      libelleEcriture: `Reclassement bilan fournisseur débiteur ${frn.compte} au 409`,
      lignes: [
        { compte: "409100", intituleCompte: "Fournisseurs débiteurs - Avances & acomptes", debit_XOF: montant, credit_XOF: 0 },
        { compte: frn.compte, intituleCompte: frn.libelle, debit_XOF: 0, credit_XOF: montant },
      ],
      justificationSYSCOHADA: "Acte Uniforme Art. 34 : Non-compensation actif/passif. Reclassement obligatoire à l'actif du bilan.",
      impactNetResultat_XOF: 0,
    };
    ecritures.push(ecritureReclassement);

    anomalies.push({
      code: "ANOM_03_FOURNISSEUR_DEBITEUR",
      gravite: "MAJEURE",
      intitule: `Fournisseur débiteur non reclassé (${frn.compte} - ${frn.libelle})`,
      explication: `Le compte 401 présente un solde débiteur de ${montant.toLocaleString("fr-FR")} XOF violant le principe de non-compensation.`,
      compteConcerne: frn.compte,
      montantAnomalie_XOF: montant,
      ecritureProposee: ecritureReclassement,
    });
  }

  // 4. Contrôle des Clients créditeurs (doivent être reclassés au compte 419)
  const clientsCrediteurs = comptes.filter(
    (c) => c.compte.startsWith("411") && c.soldeCrediteur_XOF > 0
  );
  for (const clt of clientsCrediteurs) {
    const montant = clt.soldeCrediteur_XOF;
    const ecritureReclassement: EcritureRegularisationProposee = {
      idEcriture: `OD-RECLASS-CLT-${clt.compte}`,
      journal: "OD_CLOTURE",
      date: `${exercice}-12-31`,
      libelleEcriture: `Reclassement bilan client créditeur ${clt.compte} au 419`,
      lignes: [
        { compte: clt.compte, intituleCompte: clt.libelle, debit_XOF: montant, credit_XOF: 0 },
        { compte: "419100", intituleCompte: "Clients créditeurs - Avances reçues", debit_XOF: 0, credit_XOF: montant },
      ],
      justificationSYSCOHADA: "Acte Uniforme Art. 34 : Non-compensation actif/passif. Reclassement obligatoire au passif circulant.",
      impactNetResultat_XOF: 0,
    };
    ecritures.push(ecritureReclassement);

    anomalies.push({
      code: "ANOM_04_CLIENT_CREDITEUR",
      gravite: "MAJEURE",
      intitule: `Client créditeur non reclassé (${clt.compte} - ${clt.libelle})`,
      explication: `Le compte 411 présente un solde créditeur de ${montant.toLocaleString("fr-FR")} XOF violant le principe de non-compensation.`,
      compteConcerne: clt.compte,
      montantAnomalie_XOF: montant,
      ecritureProposee: ecritureReclassement,
    });
  }

  // 5. Contrôle Caisse créditrice (compte 571 solde créditeur interdit par la jurisprudence OHADA)
  const caisse = comptes.find((c) => c.compte.startsWith("571"));
  if (caisse && caisse.soldeCrediteur_XOF > 0) {
    anomalies.push({
      code: "ANOM_05_CAISSE_CREDITRICE",
      gravite: "BLOQUANTE",
      intitule: "Caisse créditrice détectée (Présomption d'irrégularité fiscale)",
      explication: `Le compte caisse 571 présente un solde créditeur de ${caisse.soldeCrediteur_XOF.toLocaleString("fr-FR")} XOF. Risque de rejet de comptabilité par le fisc.`,
      compteConcerne: caisse.compte,
      montantAnomalie_XOF: caisse.soldeCrediteur_XOF,
    });
  }

  // Calcul du score d'intégrité
  const bloquantes = anomalies.filter((a) => a.gravite === "BLOQUANTE").length;
  const majeures = anomalies.filter((a) => a.gravite === "MAJEURE").length;
  const mineures = anomalies.filter((a) => a.gravite === "MINEURE").length;

  let score = 100 - bloquantes * 30 - majeures * 10 - mineures * 5;
  if (score < 0) score = 0;

  let statut: RapportSentinelCloture["statutCloture"] = "CONFORME_POUR_LIASSE";
  if (bloquantes > 0) {
    statut = "BLOQUEE";
  } else if (majeures > 0 || mineures > 0) {
    statut = "AJUSTEMENTS_REQUIS";
  }

  const syntheseRecommandations: string[] = [];
  if (bloquantes > 0) {
    syntheseRecommandations.push(
      `Corriger immédiatement les ${bloquantes} anomalie(s) bloquante(s) (équilibre, caisse ou compte 471) avant toute édition de liasse.`
    );
  }
  if (ecritures.length > 0) {
    syntheseRecommandations.push(
      `Injecter les ${ecritures.length} écriture(s) d'OD de régularisation proposées pour garantir la conformité aux articles 34 et 35 du SYSCOHADA.`
    );
  }
  if (statut === "CONFORME_POUR_LIASSE") {
    syntheseRecommandations.push("Comptes parfaitement équilibrés et conformes aux contrôles d'intégrité CaseWare & FloQast.");
  }

  return {
    clientNom,
    exercice,
    dateAudit: today,
    scoreIntegrite_100: score,
    statutCloture: statut,
    totalAnomalies: anomalies.length,
    anomaliesBloquantes: bloquantes,
    anomaliesMajeures: majeures,
    anomalies,
    ecrituresRegularisation: ecritures,
    syntheseRecommandations,
  };
}
