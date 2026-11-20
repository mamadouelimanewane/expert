// ─────────────────────────────────────────────────────────────────────────────
// Moteur de Tableau de Bord Dirigeant & Pilotage Flash PME (SYSCOHADA révisé)
// Point mort / Seuil de rentabilité, Marge sur coûts variables, BFR et Trésorerie nette
// ─────────────────────────────────────────────────────────────────────────────

export interface ParametresTableauBordPME {
    chiffreAffairesHT: number;
    achatsEtChargesVariables: number;
    chargesFixesExploitation: number;
    stocksActuels: number;
    creancesClients: number;
    dettesFournisseurs: number;
    dettesFiscalesSociales: number;
    disponibilitesBancaires: number;
    encaissePhysiqueCaisse: number;
    concoursBancairesCourants: number;
}

export interface AnalysePointMort {
    seuilRentabiliteFCFA: number;
    pointMortJours: number; // Nombre de jours nécessaires pour couvrir les charges fixes
    datePointMortAtteint?: string; // ex: "15 Septembre"
    margeSurCoutVariable: number;
    tauxMargeSurCoutVariable: number; // en %
    resultatExploitationPrevisionnel: number;
    estBeneficiaire: boolean;
}

export interface AnalyseBFR {
    bfrMontant: number;
    bfrJoursCA: number;
    actifsCirculants: number; // Stocks + Créances
    passifsCirculants: number; // Dettes fournisseurs + Dettes fiscales
    rotationCreancesJours: number; // DSO estimé
    rotationDettesJours: number; // DPO estimé
    diagnosticBFR: string;
}

export interface AnalyseTresorerieNette {
    tresorerieActive: number; // Banque + Caisse
    tresoreriePassive: number; // Découverts
    tresorerieNette: number;
    autonomieTresorerieJours: number; // Jours de charges fixes couverts par le cash actuel
    alerteLiquidite: "EXCELLENTE" | "EQUILIBREE" | "TENSION" | "CRITIQUE";
}

export interface SyntheseTableauBordPME {
    exercice: number;
    chiffreAffairesHT: number;
    pointMort: AnalysePointMort;
    bfr: AnalyseBFR;
    tresorerie: AnalyseTresorerieNette;
    scoreSantePME: number; // 0 à 100
    conseilExpert: string;
}

/**
 * Calcule l'ensemble des indicateurs de gestion flash pour le dirigeant de PME.
 */
export function calculerTableauBordPME(
    params: ParametresTableauBordPME,
    exercice = new Date().getFullYear()
): SyntheseTableauBordPME {
    const ca = Math.max(1, params.chiffreAffairesHT);
    const mcv = params.chiffreAffairesHT - params.achatsEtChargesVariables;
    const tauxMcv = mcv / ca;

    // 1. Analyse du Seuil de Rentabilité
    const seuilRentabiliteFCFA = tauxMcv > 0 ? Math.round(params.chargesFixesExploitation / tauxMcv) : 0;
    const pointMortJours = ca > 0 ? Math.round((seuilRentabiliteFCFA / ca) * 365) : 365;

    let datePointMortAtteint: string | undefined;
    if (pointMortJours <= 365) {
        const d = new Date(exercice, 0, 1);
        d.setDate(d.getDate() + pointMortJours);
        datePointMortAtteint = d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
    }

    const resultatExploitation = mcv - params.chargesFixesExploitation;

    const pointMort: AnalysePointMort = {
        seuilRentabiliteFCFA,
        pointMortJours,
        datePointMortAtteint,
        margeSurCoutVariable: Math.round(mcv),
        tauxMargeSurCoutVariable: Math.round(tauxMcv * 1000) / 10,
        resultatExploitationPrevisionnel: Math.round(resultatExploitation),
        estBeneficiaire: resultatExploitation > 0,
    };

    // 2. Analyse du Besoin en Fonds de Roulement (BFR)
    const actifsCirculants = params.stocksActuels + params.creancesClients;
    const passifsCirculants = params.dettesFournisseurs + params.dettesFiscalesSociales;
    const bfrMontant = actifsCirculants - passifsCirculants;
    const bfrJoursCA = ca > 0 ? Math.round((bfrMontant / ca) * 360) : 0;
    const rotationCreancesJours = ca > 0 ? Math.round((params.creancesClients / ca) * 360) : 0;
    const rotationDettesJours = params.achatsEtChargesVariables > 0 ? Math.round((params.dettesFournisseurs / params.achatsEtChargesVariables) * 360) : 0;

    let diagnosticBFR = "";
    if (bfrMontant <= 0) {
        diagnosticBFR = "BFR négatif : l'entreprise bénéficie d'une ressource en fonds de roulement grâce au crédit fournisseurs (situation idéale en distribution).";
    } else if (bfrJoursCA <= 45) {
        diagnosticBFR = "BFR maîtrisé (< 45 jours de CA), rotation saine des créances et stocks.";
    } else {
        diagnosticBFR = "BFR élevé (> 45 jours de CA) mobilisant une part excessive de trésorerie. Action prioritaire : accélérer le recouvrement client.";
    }

    const bfr: AnalyseBFR = {
        bfrMontant: Math.round(bfrMontant),
        bfrJoursCA,
        actifsCirculants: Math.round(actifsCirculants),
        passifsCirculants: Math.round(passifsCirculants),
        rotationCreancesJours,
        rotationDettesJours,
        diagnosticBFR,
    };

    // 3. Analyse de la Trésorerie Nette & Liquidité
    const tresorerieActive = params.disponibilitesBancaires + params.encaissePhysiqueCaisse;
    const tresoreriePassive = params.concoursBancairesCourants;
    const tresorerieNette = tresorerieActive - tresoreriePassive;

    const chargeFixeQuotidienne = params.chargesFixesExploitation / 365;
    const autonomieTresorerieJours = chargeFixeQuotidienne > 0 ? Math.round(tresorerieNette / chargeFixeQuotidienne) : 0;

    let alerteLiquidite: AnalyseTresorerieNette["alerteLiquidite"] = "EQUILIBREE";
    if (tresorerieNette < 0) {
        alerteLiquidite = "CRITIQUE";
    } else if (autonomieTresorerieJours < 15) {
        alerteLiquidite = "TENSION";
    } else if (autonomieTresorerieJours >= 60) {
        alerteLiquidite = "EXCELLENTE";
    }

    const tresorerie: AnalyseTresorerieNette = {
        tresorerieActive: Math.round(tresorerieActive),
        tresoreriePassive: Math.round(tresoreriePassive),
        tresorerieNette: Math.round(tresorerieNette),
        autonomieTresorerieJours,
        alerteLiquidite,
    };

    // 4. Score de Santé Global PME (0 à 100)
    let score = 50;
    if (resultatExploitation > 0) score += 20;
    else score -= 20;

    if (tauxMcv >= 0.3) score += 10;
    if (bfrJoursCA <= 45) score += 10;
    else if (bfrJoursCA > 90) score -= 15;

    if (tresorerieNette > 0) score += 10;
    else score -= 25;

    score = Math.max(0, Math.min(100, score));

    let conseilExpert = "";
    if (score >= 80) {
        conseilExpert = "Situation financière excellente : capacité d'autofinancement robuste permettant d'envisager de nouveaux investissements ou une distribution de dividendes.";
    } else if (score >= 50) {
        conseilExpert = "Modèle économique stable : veillez à maintenir le rythme de relance clients pour préserver le coussin de sécurité de trésorerie.";
    } else {
        conseilExpert = "Vigilance trésorerie requise : renégocier les délais fournisseurs, accélérer les encaissements ou apporter des concours d'associés.";
    }

    return {
        exercice,
        chiffreAffairesHT: params.chiffreAffairesHT,
        pointMort,
        bfr,
        tresorerie,
        scoreSantePME: score,
        conseilExpert,
    };
}
