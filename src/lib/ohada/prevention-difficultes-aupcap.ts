// ─────────────────────────────────────────────────────────────────────────────
// Module AUPCAP : Prévention des Difficultés & Plan de Redressement Judiciaire
// Conforme à l'Acte Uniforme OHADA portant Organisation des Procédures Collectives
// d'Apurement du Passif (AUPCAP Révisé - Règlements Préventifs & Redressement)
// ─────────────────────────────────────────────────────────────────────────────

export type DiagnosticVulnerabilite =
  | "SAIN"                  // Score >= 2.6 — Entreprise financièrement solide
  | "SOUS_OBSERVATION"      // 1.8 <= Score < 2.6 — Vulnérabilité modérée
  | "ALERTE_PREVENTIVE"     // 1.1 <= Score < 1.8 — Risque d'insolvabilité, éligible Règlement Préventif
  | "CESSATION_IMMINENTE";  // Score < 1.1 — Risque majeur de cessation des paiements / Redressement Judiciaire

export type TypeProcedureAUPCAP =
  | "REGLEMENT_PREVENTIF"    // Entreprise non en cessation de paiements ou < 30 jours (Art. 6 AUPCAP)
  | "REDRESSEMENT_JUDICIAIRE" // Cessation des paiements avérée avec perspectives de redressement (Art. 25 AUPCAP)
  | "LIQUIDATION_DES_BIENS";  // Redressement manifestement impossible (Art. 25 AUPCAP)

export interface DonneesFinancieresEntreprise {
  chiffreAffaires: number;        // FCFA
  valeurAjoutee: number;          // FCFA
  ebe: number;                    // Excédent Brut d'Exploitation (FCFA)
  resultatExploitation: number;    // FCFA
  resultatNet: number;            // FCFA
  totalActif: number;             // FCFA
  actifCirculant: number;         // Stocks + Créances (FCFA)
  tresorerieActif: number;        // Disponibilités (FCFA)
  capitauxPropres: number;         // FCFA
  dettesFinancieresLMT: number;   // Emprunts long/moyen terme (FCFA)
  dettesFournisseurs: number;     // Dettes court terme d'exploitation (FCFA)
  dettesFiscalesSociales: number; // Dettes fiscales et sociales échues (FCFA)
  decouvertsBancaires: number;    // Trésorerie passif (FCFA)
}

export interface AnalyseZScoreOHADA {
  scoreZ: number;
  diagnostic: DiagnosticVulnerabilite;
  procedureConseillee: TypeProcedureAUPCAP;
  ratios: {
    liquiditeStructurelle: number; // FRNG / Total Actif
    capaciteRemboursement: number; // EBE / Dettes Totales
    autonomieFinanciere: number;   // Capitaux Propres / Dettes Financières
    rotationActifs: number;        // CA / Total Actif
    rentabiliteEconomique: number; // Résultat Exploitation / Total Actif
  };
  fondsDeRoulement: number;
  besoinFondsRoulement: number;
  tresorerieNette: number;
  passifExigibleImmediat: number;
  actifDisponibleImmediat: number;
  estEnCessationPaiements: boolean;
  syntheseDiagnostic: string;
}

export interface ParametresConcordat {
  dureeAnnees: number;           // 1 à 3 ans (Règlement préventif) ou jusqu'à 5 ans (Redressement)
  tauxAbandonNegocie: number;    // % d'abandon de créances consenti par créanciers (ex: 20%)
  apportFondsPropres: number;    // Nouveau capital ou compte courant bloqué (FCFA)
  economiesStructureAnnuelles: number; // Réductions de charges d'exploitation (FCFA/an)
}

export interface EcheanceConcordat {
  annee: number;
  annuiteRemboursementDettes: number;
  cashFlowExploitationPrevu: number;
  tresorerieFinAnnee: number;
}

export interface PlanApurementConcordat {
  typeProcedure: TypeProcedureAUPCAP;
  passifTotalTraite: number;
  montantAbandonCreances: number;
  passifResiduelARembourser: number;
  dureeAnnees: number;
  echeancierAnnuel: EcheanceConcordat[];
  viabilitePlan: boolean;
  recommandationsJudiciaires: string[];
  projetOffreConcordat: string;
}

/**
 * Calcul du Z-Score adapté zone OHADA / UEMOA
 * Z = 1.2 * R1 + 1.4 * R2 + 0.6 * R3 + 0.999 * R4 + 0.6 * R5
 */
export function calculerZScoreOHADA(data: DonneesFinancieresEntreprise): AnalyseZScoreOHADA {
  const dettesTotales =
    data.dettesFinancieresLMT +
    data.dettesFournisseurs +
    data.dettesFiscalesSociales +
    data.decouvertsBancaires;

  const dettesCT =
    data.dettesFournisseurs +
    data.dettesFiscalesSociales +
    data.decouvertsBancaires;

  // Fonds de roulement net global (Capitaux stables - Actif immobilisé) = Actif Circulant Net
  const frng = (data.capitauxPropres + data.dettesFinancieresLMT) - (data.totalActif - data.actifCirculant - data.tresorerieActif);
  const bfr = data.actifCirculant - data.dettesFournisseurs;
  const tresorerieNette = data.tresorerieActif - data.decouvertsBancaires;

  // Cessation des paiements (Art. 25 AUPCAP) : Actif disponible < Passif exigible
  const actifDisponible = data.tresorerieActif;
  const passifExigible = data.dettesFiscalesSociales + data.decouvertsBancaires + (data.dettesFournisseurs * 0.5);
  const estEnCessation = actifDisponible < passifExigible;

  // Calcul des 5 Ratios
  const r1 = data.totalActif > 0 ? frng / data.totalActif : 0;
  const r2 = dettesTotales > 0 ? data.ebe / dettesTotales : 0;
  const r3 = data.dettesFinancieresLMT > 0 ? data.capitauxPropres / data.dettesFinancieresLMT : 1;
  const r4 = data.totalActif > 0 ? data.chiffreAffaires / data.totalActif : 0;
  const r5 = data.totalActif > 0 ? data.resultatExploitation / data.totalActif : 0;

  const zScoreRaw = 1.2 * r1 + 1.4 * r2 + 0.6 * Math.min(3, r3) + 0.999 * r4 + 0.6 * r5;
  const scoreZ = Math.round(zScoreRaw * 100) / 100;

  let diagnostic: DiagnosticVulnerabilite;
  let procedureConseillee: TypeProcedureAUPCAP;

  if (scoreZ >= 2.6 && !estEnCessation) {
    diagnostic = "SAIN";
    procedureConseillee = "REGLEMENT_PREVENTIF"; // non requis dans l'immédiat
  } else if (scoreZ >= 1.8 && !estEnCessation) {
    diagnostic = "SOUS_OBSERVATION";
    procedureConseillee = "REGLEMENT_PREVENTIF";
  } else if (scoreZ >= 1.1 || (!estEnCessation && scoreZ < 1.1)) {
    diagnostic = "ALERTE_PREVENTIVE";
    procedureConseillee = "REGLEMENT_PREVENTIF";
  } else {
    diagnostic = "CESSATION_IMMINENTE";
    procedureConseillee = estEnCessation ? "REDRESSEMENT_JUDICIAIRE" : "REGLEMENT_PREVENTIF";
  }

  const fmt = (n: number) => n.toLocaleString("fr-FR");
  const syntheseDiagnostic =
    `Z-Score OHADA : ${scoreZ} (${diagnostic}). ` +
    `Trésorerie nette : ${fmt(tresorerieNette)} FCFA. ` +
    (estEnCessation
      ? `État de cessation des paiements caractérisé (Actif dispo ${fmt(actifDisponible)} FCFA < Passif exigible ${fmt(passifExigible)} FCFA). Déclaration requise sous 30 jours (AUPCAP Art. 25).`
      : `Entreprise in bonis. Éligibilité pleine à la procédure préventive négociée (Concordat Préventif AUPCAP Art. 6).`);

  return {
    scoreZ,
    diagnostic,
    procedureConseillee,
    ratios: {
      liquiditeStructurelle: Math.round(r1 * 100) / 100,
      capaciteRemboursement: Math.round(r2 * 100) / 100,
      autonomieFinanciere: Math.round(r3 * 100) / 100,
      rotationActifs: Math.round(r4 * 100) / 100,
      rentabiliteEconomique: Math.round(r5 * 100) / 100,
    },
    fondsDeRoulement: frng,
    besoinFondsRoulement: bfr,
    tresorerieNette,
    passifExigibleImmediat: passifExigible,
    actifDisponibleImmediat: actifDisponible,
    estEnCessationPaiements: estEnCessation,
    syntheseDiagnostic,
  };
}

/**
 * Élaboration du plan d'apurement du passif et simulation du concordat (AUPCAP Titre II & III)
 */
export function simulerConcordatApurement(
  data: DonneesFinancieresEntreprise,
  params: ParametresConcordat
): PlanApurementConcordat {
  const dettesTotales =
    data.dettesFinancieresLMT +
    data.dettesFournisseurs +
    data.dettesFiscalesSociales +
    data.decouvertsBancaires;

  const abandon = Math.round((dettesTotales * Math.min(50, Math.max(0, params.tauxAbandonNegocie))) / 100);
  const passifResiduel = dettesTotales - abandon;

  const duree = Math.min(5, Math.max(1, params.dureeAnnees));
  const annuiteTheorique = Math.round(passifResiduel / duree);

  const echeancierAnnuel: EcheanceConcordat[] = [];
  let tresoCourante = data.tresorerieActif - data.decouvertsBancaires + params.apportFondsPropres;
  let planViable = true;

  // Capacité d'autofinancement annuelle estimée (EBE + économies de structure)
  const cashFlowBase = Math.max(0, data.ebe) + params.economiesStructureAnnuelles;

  for (let annee = 1; annee <= duree; annee++) {
    tresoCourante += cashFlowBase - annuiteTheorique;
    if (tresoCourante < 0) {
      planViable = false;
    }
    echeancierAnnuel.push({
      annee,
      annuiteRemboursementDettes: annuiteTheorique,
      cashFlowExploitationPrevu: cashFlowBase,
      tresorerieFinAnnee: tresoCourante,
    });
  }

  const estCessation = data.tresorerieActif < (data.dettesFiscalesSociales + data.decouvertsBancaires);
  const typeProcedure: TypeProcedureAUPCAP = estCessation ? "REDRESSEMENT_JUDICIAIRE" : "REGLEMENT_PREVENTIF";

  const recommandations: string[] = [
    `Demande de suspension des poursuites individuelles (Art. 9 ou Art. 32 AUPCAP).`,
    `Négociation de délais et remises avec les créanciers sous l'égide de l'Expert ou du Syndic.`,
    `Blocage des comptes courants d'associés pendant l'exécution intégrale du concordat.`,
  ];

  if (!planViable) {
    recommandations.push(
      "ALERTE : Les cash-flows prévisionnels sont insuffisants pour couvrir les annuités. Augmenter l'apport en fonds propres ou étendre la durée du concordat."
    );
  }

  const fmt = (n: number) => n.toLocaleString("fr-FR");
  const projetOffreConcordat =
    `PROJET DE CONCORDAT ${typeProcedure === "REGLEMENT_PREVENTIF" ? "PRÉVENTIF" : "DE REDRESSEMENT"}\n` +
    `(Articles ${typeProcedure === "REGLEMENT_PREVENTIF" ? "6 à 24" : "119 à 145"} de l'Acte Uniforme OHADA - AUPCAP)\n\n` +
    `1. PASSIF CONCERNÉ :\n` +
    `- Passif total à apurer : ${fmt(dettesTotales)} FCFA\n` +
    `- Remise de dette / Abandon consenti : ${fmt(abandon)} FCFA (${params.tauxAbandonNegocie}%)\n` +
    `- Passif résiduel à apurer : ${fmt(passifResiduel)} FCFA\n\n` +
    `2. MODALITÉS DE RÈGLEMENT :\n` +
    `- Durée du plan : ${duree} an(s)\n` +
    `- Annuité de remboursement : ${fmt(annuiteTheorique)} FCFA / an\n` +
    `- Apport immédiat en fonds propres : ${fmt(params.apportFondsPropres)} FCFA\n` +
    `- Économies de structure annuelles engagées : ${fmt(params.economiesStructureAnnuelles)} FCFA\n\n` +
    `3. ENGAGEMENTS DU DÉBITEUR :\n` +
    `- Affectation intégrale des cash-flows excédentaires au compte séquestre de répartition.\n` +
    `- Interdiction de contracter de nouveaux emprunts sans autorisation du Juge-Commissaire.\n` +
    `- Rapport semestriel de l'Expert/Syndic à la Juridiction compétente.`;

  return {
    typeProcedure,
    passifTotalTraite: dettesTotales,
    montantAbandonCreances: abandon,
    passifResiduelARembourser: passifResiduel,
    dureeAnnees: duree,
    echeancierAnnuel,
    viabilitePlan: planViable,
    recommandationsJudiciaires: recommandations,
    projetOffreConcordat,
  };
}
