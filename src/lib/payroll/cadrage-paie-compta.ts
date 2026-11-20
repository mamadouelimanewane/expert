// ─────────────────────────────────────────────────────────────────────────────
// Cadrage Paie vs Comptabilité (Audit Social & Rapprochement Comptes 66 / 42 / 43 / 44)
// Rapprochement systématique du journal de paie et du Grand Livre SYSCOHADA
// ─────────────────────────────────────────────────────────────────────────────

import type { PaysFiscal } from "@/lib/tax-simulator";

export interface LigneLivrePaieCumul {
  brutImposable: number;
  chargesPatronalesSociales: number; // IPRES/CSS (SN) ou CNPS/CMU (CI)
  chargesSalarialesSociales: number;
  impotsRetenusSource: number; // VRS/IR (SN) ou ITS/CN/IGR (CI)
  netAPayer: number;
  avancesEtAcomptes: number;
}

export interface SoldesComptablesPaie {
  solde661_Remunerations: number; // Compte 661 Rémunérations directes au personnel
  solde664_ChargesSocialesPatronales: number; // Compte 664 Charges sociales
  solde422_PersonnelRemunerationsDues: number; // Compte 422 Personnel, rémunérations dues (mouvement crédit)
  solde43_OrganismesSociaux: number; // Comptes 431/432/433 Organismes sociaux
  solde447_RetenuesFiscalesSalaires: number; // Compte 447 État, impôts retenus à la source
  solde421_AvancesAcomptes: number; // Compte 421 Personnel, avances et acomptes
}

export interface EcartCadrage {
  poste: "SALAIRES_BRUTS" | "CHARGES_PATRONALES" | "NET_A_PAYER" | "ORGANISMES_SOCIAUX" | "IMPOTS_SALAIRES";
  intitule: string;
  montantPaie: number;
  montantComptabilite: number;
  ecart: number; // Paie - Compta
  statut: "CONFORME" | "ANOMALIE_MINEURE" | "RISQUE_REDRESSEMENT";
  explication: string;
  compteSYSCOHADA: string;
  recommandation: string;
}

export interface RapportCadragePaieCompta {
  pays: PaysFiscal;
  exercice: number;
  periodeOuMois: string;
  tauxConformiteGlobal: number; // en % (100% = équilibre parfait)
  totalEcartsAbsolus: number;
  ecarts: EcartCadrage[];
  syntheseRisqueSocial: "FAIBLE" | "MODERE" | "ELEVE" | "CRITIQUE";
  recommandationsCabinet: string[];
}

export function executerCadragePaieCompta(
  pays: PaysFiscal,
  exercice: number,
  periodeOuMois: string,
  paie: LigneLivrePaieCumul,
  compta: SoldesComptablesPaie
): RapportCadragePaieCompta {
  const ecarts: EcartCadrage[] = [];

  // 1. Salaires bruts vs Compte 661
  const diff661 = Math.round(paie.brutImposable - compta.solde661_Remunerations);
  ecarts.push({
    poste: "SALAIRES_BRUTS",
    intitule: "Salaires Bruts imposables vs Compte 661 (Rémunérations directes)",
    montantPaie: paie.brutImposable,
    montantComptabilite: compta.solde661_Remunerations,
    ecart: diff661,
    statut: Math.abs(diff661) === 0 ? "CONFORME" : Math.abs(diff661) < 50_000 ? "ANOMALIE_MINEURE" : "RISQUE_REDRESSEMENT",
    compteSYSCOHADA: "661 - Rémunérations directes versées au personnel",
    explication: diff661 === 0
      ? "Parfait alignement entre la masse salariale brute du livre de paie et les charges du compte 661."
      : diff661 > 0
      ? "Masse salariale paie supérieure aux écritures du 661 : charges de personnel potentiellement sous-estimées en compta."
      : "Compte 661 supérieur au livre de paie : risque d'écritures directes non justifiées ou avantages en nature non intégrés.",
    recommandation: diff661 !== 0 ? "Rapprocher les fiches de paie individuelles avec le grand livre du compte 661." : "Conserver le cadrage mensuel en dossier permanent.",
  });

  // 2. Charges patronales vs Compte 664
  const diff664 = Math.round(paie.chargesPatronalesSociales - compta.solde664_ChargesSocialesPatronales);
  ecarts.push({
    poste: "CHARGES_PATRONALES",
    intitule: "Cotisations patronales sociales vs Compte 664 (Charges sociales)",
    montantPaie: paie.chargesPatronalesSociales,
    montantComptabilite: compta.solde664_ChargesSocialesPatronales,
    ecart: diff664,
    statut: Math.abs(diff664) === 0 ? "CONFORME" : Math.abs(diff664) < 20_000 ? "ANOMALIE_MINEURE" : "RISQUE_REDRESSEMENT",
    compteSYSCOHADA: "664 - Charges sociales patronales",
    explication: diff664 === 0
      ? "Cotisations patronales cohérentes avec les états récapitulatifs mensuels (IPRES/CSS ou CNPS/CMU)."
      : "Écart de cotisations patronales : vérifier le calcul des cotisations plafonnées et le taux accident du travail.",
    recommandation: diff664 !== 0 ? "Vérifier l'application des plafonds de cotisation et les taux d'AT déclarés." : "Conforme.",
  });

  // 3. Net à payer vs Compte 422
  const netTheoriqueCompta = compta.solde422_PersonnelRemunerationsDues;
  const diff422 = Math.round(paie.netAPayer - netTheoriqueCompta);
  ecarts.push({
    poste: "NET_A_PAYER",
    intitule: "Net à payer vs Compte 422 (Rémunérations dues au personnel)",
    montantPaie: paie.netAPayer,
    montantComptabilite: netTheoriqueCompta,
    ecart: diff422,
    statut: Math.abs(diff422) === 0 ? "CONFORME" : Math.abs(diff422) < 10_000 ? "ANOMALIE_MINEURE" : "RISQUE_REDRESSEMENT",
    compteSYSCOHADA: "422 - Personnel, rémunérations dues",
    explication: diff422 === 0
      ? "Le net à verser correspond exactement aux dettes constatées envers le personnel."
      : "Différence entre le net des bulletins et le compte 422 : possible omission d'acomptes ou primes exceptionnelles.",
    recommandation: diff422 !== 0 ? "Rapprocher les bordereaux de virement bancaire et chèques de paie avec le 422." : "Conforme.",
  });

  // 4. Cotisations sociales globales (salarié + patronal) vs Compte 43
  const totalCotisationsSocialesPaie = paie.chargesPatronalesSociales + paie.chargesSalarialesSociales;
  const diff43 = Math.round(totalCotisationsSocialesPaie - compta.solde43_OrganismesSociaux);
  ecarts.push({
    poste: "ORGANISMES_SOCIAUX",
    intitule: "Dettes organismes sociaux (Salarié + Patronal) vs Compte 43",
    montantPaie: totalCotisationsSocialesPaie,
    montantComptabilite: compta.solde43_OrganismesSociaux,
    ecart: diff43,
    statut: Math.abs(diff43) === 0 ? "CONFORME" : Math.abs(diff43) < 25_000 ? "ANOMALIE_MINEURE" : "RISQUE_REDRESSEMENT",
    compteSYSCOHADA: "431/432/433 - Sécurité sociale et caisses de retraite",
    explication: diff43 === 0
      ? "Dettes sociales envers les caisses (CSS, IPRES, CNPS) parfaitement cadrées."
      : "Écart sur les dettes sociales : risque de redressement de majoration de retard de 10% si déclaration sous-évaluée.",
    recommandation: diff43 !== 0 ? "Contrôler les bordereaux déclaratifs trimestriels/mensuels signés." : "Conforme.",
  });

  // 5. Impôts retenus sur salaires vs Compte 447
  const diff447 = Math.round(paie.impotsRetenusSource - compta.solde447_RetenuesFiscalesSalaires);
  ecarts.push({
    poste: "IMPOTS_SALAIRES",
    intitule: "Impôts retenus à la source (VRS/IR ou ITS/IGR) vs Compte 447",
    montantPaie: paie.impotsRetenusSource,
    montantComptabilite: compta.solde447_RetenuesFiscalesSalaires,
    ecart: diff447,
    statut: Math.abs(diff447) === 0 ? "CONFORME" : Math.abs(diff447) < 10_000 ? "ANOMALIE_MINEURE" : "RISQUE_REDRESSEMENT",
    compteSYSCOHADA: "447 - État, impôts retenus à la source sur salaires",
    explication: diff447 === 0
      ? "Retenues fiscales salariales cadrées avec le grand livre fiscal."
      : "Écart de retenues fiscales : risque d'amende fiscale de 25% pour retenue non reversée dans les délais.",
    recommandation: diff447 !== 0 ? "Vérifier la déclaration fiscale mensuelle N° 102 (VRS) ou état 301." : "Conforme.",
  });

  const totalEcartsAbsolus = ecarts.reduce((acc, e) => acc + Math.abs(e.ecart), 0);
  const nbConformes = ecarts.filter((e) => e.statut === "CONFORME").length;
  const tauxConformiteGlobal = Math.round((nbConformes / ecarts.length) * 100);

  const nbRisques = ecarts.filter((e) => e.statut === "RISQUE_REDRESSEMENT").length;
  const syntheseRisqueSocial =
    nbRisques >= 2 ? "CRITIQUE" : nbRisques === 1 ? "ELEVE" : totalEcartsAbsolus > 0 ? "MODERE" : "FAIBLE";

  const recommandationsCabinet: string[] = [];
  if (totalEcartsAbsolus === 0) {
    recommandationsCabinet.push("Excellente cohérence paie-comptabilité : aucune anomalie détectée.");
    recommandationsCabinet.push("Viser le dossier de travail paie pour archivage des quittances sociales.");
  } else {
    recommandationsCabinet.push(`Corriger en priorité les ${nbRisques} poste(s) à risque de redressement social ou fiscal.`);
    recommandationsCabinet.push("Établir une OD de paie rectificative avant la clôture définitive des comptes.");
    recommandationsCabinet.push("Vérifier les concordances avec les Déclarations Annuelles des Salaires (DAS / DISA).");
  }

  return {
    pays,
    exercice,
    periodeOuMois,
    tauxConformiteGlobal,
    totalEcartsAbsolus,
    ecarts,
    syntheseRisqueSocial,
    recommandationsCabinet,
  };
}
