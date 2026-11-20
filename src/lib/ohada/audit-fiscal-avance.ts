// ─────────────────────────────────────────────────────────────────────────────
// Moteur d'Audit Fiscal Avancé & Matrice des Risques Fiscaux (UEMOA / OHADA)
// CCA (BCEAO + 2pts), Frais de siège, Amortissements véhicules, Dons, Prescription
// ─────────────────────────────────────────────────────────────────────────────

import type { PaysFiscal } from "@/lib/tax-simulator";

export interface DonneesAuditFiscal {
    pays: PaysFiscal;
    exercice: number;
    chiffreAffairesHT: number;
    beneficeAvantFraisSiege: number;
    capitalSocialTotal: number;
    capitalSocialLibere: number; // Doit être 100% pour déductibilité CCA

    // 1. Comptes Courants d'Associés
    comptesCourants: {
        soldeMoyenAnnuel: number;
        tauxInteretApplique: number; // en % (ex: 7.5 pour 7.5%)
        tauxBCEAOMax: number; // ex: 5.5% (Taux ref BCEAO 3.5% + 2 pts)
    };

    // 2. Frais de Siège / Management Fees
    fraisDeSiegeComptabilises: number;

    // 3. Véhicules de Tourisme
    vehiculesTourisme: Array<{
        immatriculation: string;
        prixAcquisitionTTC: number;
        tauxAmortissementAnnuel: number; // ex: 20% (durée 5 ans)
        dotationComptabilisee: number;
    }>;

    // 4. Dons & Libéralités
    donsComptabilises: number;
}

export interface AnomalieFiscaleDetectee {
    code: string;
    domaine: "CCA_INTERETS" | "FRAIS_SIEGE" | "VEHICULES_TOURISME" | "DONS" | "PRESCRIPTION";
    titre: string;
    description: string;
    montantReintegrationFiscale: number;
    rappelImpotEstime: number; // IS (ex: 30% ou 25%)
    penalitesEstimees: number; // 25% de pénalités de retard standard
    referenceLegale: string;
    gravite: "CRITIQUE" | "MAJEURE" | "MOYENNE";
    recommandationExpert: string;
}

export interface SyntheseAuditFiscalAvance {
    pays: PaysFiscal;
    exercice: number;
    tauxIS: number;
    totalReintegrations: number;
    totalRappelImpot: number;
    totalPenalites: number;
    expositionFiscaleGlobale: number; // Impôt + Pénalités
    anomalies: AnomalieFiscaleDetectee[];
    statutRisqueFiscal: "FAIBLE" | "MODERE" | "ELEVE" | "CRITIQUE";
    exercicesPrescription: {
        anneesPrescrites: number[];
        anneesControlePossibles: number[];
        regle: string;
    };
}

const PLAFOND_VEHICULE_PAR_PAYS: Record<PaysFiscal, number> = {
    sn: 15_000_000, // 15M FCFA au Sénégal (CGI art. 10)
    ci: 20_000_000, // 20M FCFA en Côte d'Ivoire (CGI art. 13)
    cm: 20_000_000,
    bj: 15_000_000,
};

const TAUX_IS_PAR_PAYS: Record<PaysFiscal, number> = {
    sn: 0.30,
    ci: 0.25,
    cm: 0.33,
    bj: 0.30,
};

/**
 * Exécute un audit fiscal approfondi des 10 points chauds de redressement en zone OHADA.
 */
export function executerAuditFiscalAvance(donnees: DonneesAuditFiscal): SyntheseAuditFiscalAvance {
    const anomalies: AnomalieFiscaleDetectee[] = [];
    const tauxIS = TAUX_IS_PAR_PAYS[donnees.pays] || 0.30;
    const penTaux = 0.25; // 25% de pénalité de droit commun

    // ── 1. CONTRÔLE DES INTÉRÊTS DES COMPTES COURANTS D'ASSOCIÉS ─────────────
    if (donnees.comptesCourants && donnees.comptesCourants.soldeMoyenAnnuel > 0) {
        const { soldeMoyenAnnuel, tauxInteretApplique, tauxBCEAOMax } = donnees.comptesCourants;
        const interetsVerses = Math.round((soldeMoyenAnnuel * tauxInteretApplique) / 100);

        // Condition 1 : Capital non intégralement libéré
        if (donnees.capitalSocialLibere < donnees.capitalSocialTotal) {
            const partNonLiberee = donnees.capitalSocialTotal - donnees.capitalSocialLibere;
            const rappel = Math.round(interetsVerses * tauxIS);
            const penalites = Math.round(rappel * penTaux);

            anomalies.push({
                code: "CCA_CAPITAL_NON_LIBERE",
                domaine: "CCA_INTERETS",
                titre: "Intérêts de Comptes Courants non déductibles (Capital non libéré)",
                description: `Le capital social n'est libéré qu'à concurrence de ${donnees.capitalSocialLibere.toLocaleString("fr-FR")} F sur ${donnees.capitalSocialTotal.toLocaleString("fr-FR")} F. En droit fiscal OHADA, aucun intérêt de CCA n'est déductible tant que le capital n'est pas intégralement libéré.`,
                montantReintegrationFiscale: interetsVerses,
                rappelImpotEstime: rappel,
                penalitesEstimees: penalites,
                referenceLegale: "CGI art. 12 (Sénégal / UEMOA)",
                gravite: "CRITIQUE",
                recommandationExpert: "Libérer immédiatement le reliquat du capital social ou annuler la charge d'intérêts sur cet exercice.",
            });
        } else if (tauxInteretApplique > tauxBCEAOMax) {
            // Condition 2 : Dépassement du taux légal BCEAO + 2 points
            const interetsPlafond = Math.round((soldeMoyenAnnuel * tauxBCEAOMax) / 100);
            const excédentInterets = interetsVerses - interetsPlafond;
            const rappel = Math.round(excédentInterets * tauxIS);
            const penalites = Math.round(rappel * penTaux);

            anomalies.push({
                code: "CCA_TAUX_EXCEDENTAIRE",
                domaine: "CCA_INTERETS",
                titre: "Taux d'intérêt de Compte Courant supérieur au plafond légal",
                description: `Le taux pratiqué (${tauxInteretApplique} %) dépasse le taux plafond légal autorisé (${tauxBCEAOMax} %, Taux directeur BCEAO + 2 points). L'excédent d'intérêts de ${excédentInterets.toLocaleString("fr-FR")} F doit être réintégré.`,
                montantReintegrationFiscale: excédentInterets,
                rappelImpotEstime: rappel,
                penalitesEstimees: penalites,
                referenceLegale: "CGI art. 12 (Taux usure BCEAO)",
                gravite: "MAJEURE",
                recommandationExpert: "Ajuster la convention de compte courant au taux plafond BCEAO en vigueur.",
            });
        }
    }

    // ── 2. CONTRÔLE DES FRAIS DE SIÈGE & MANAGEMENT FEES ──────────────────────
    if (donnees.fraisDeSiegeComptabilises > 0) {
        let plafondLegal = 0;
        let motifPlafond = "";

        if (donnees.pays === "ci") {
            // Côte d'Ivoire : 5% du CA HT
            plafondLegal = Math.round(donnees.chiffreAffairesHT * 0.05);
            motifPlafond = "5% du CA HT (CGI Côte d'Ivoire art. 18)";
        } else {
            // Sénégal et autres UEMOA : 10% du bénéfice avant lesdits frais
            const beneficeAvantFrais = Math.max(0, donnees.beneficeAvantFraisSiege);
            plafondLegal = Math.round(beneficeAvantFrais * 0.10);
            motifPlafond = "10% du bénéfice imposable avant déduction (CGI Sénégal art. 17)";
        }

        if (donnees.fraisDeSiegeComptabilises > plafondLegal) {
            const excédentFrais = donnees.fraisDeSiegeComptabilises - plafondLegal;
            const rappel = Math.round(excédentFrais * tauxIS);
            const penalites = Math.round(rappel * penTaux);

            anomalies.push({
                code: "FRAIS_SIEGE_PLAFOND_DEPASSE",
                domaine: "FRAIS_SIEGE",
                titre: "Frais de Siège / Management Fees excédant le plafond de déductibilité",
                description: `Les frais de siège comptabilisés (${donnees.fraisDeSiegeComptabilises.toLocaleString("fr-FR")} F) excèdent le plafond légal de ${plafondLegal.toLocaleString("fr-FR")} F (${motifPlafond}).`,
                montantReintegrationFiscale: excédentFrais,
                rappelImpotEstime: rappel,
                penalitesEstimees: penalites,
                referenceLegale: donnees.pays === "ci" ? "CGI CI art. 18" : "CGI Sénégal art. 17",
                gravite: "CRITIQUE",
                recommandationExpert: "Réintégrer l'excédent au Tableau 7 DSF et vérifier l'application de la retenue à la source de 20 %.",
            });
        }
    }

    // ── 3. AMORTISSEMENT DES VÉHICULES DE TOURISME ────────────────────────────
    const plafondVehicule = PLAFOND_VEHICULE_PAR_PAYS[donnees.pays] || 15_000_000;
    for (const v of donnees.vehiculesTourisme || []) {
        if (v.prixAcquisitionTTC > plafondVehicule) {
            const baseExcedente = v.prixAcquisitionTTC - plafondVehicule;
            const annuiteExcedente = Math.round((baseExcedente * v.tauxAmortissementAnnuel) / 100);
            const rappel = Math.round(annuiteExcedente * tauxIS);
            const penalites = Math.round(rappel * penTaux);

            anomalies.push({
                code: `VEHICULE_PLAFOND_${v.immatriculation}`,
                domaine: "VEHICULES_TOURISME",
                titre: `Amortissement excédentaire véhicule de tourisme (${v.immatriculation})`,
                description: `Véhicule acquis pour ${v.prixAcquisitionTTC.toLocaleString("fr-FR")} F TTC excédant le plafond légal de déductibilité de ${plafondVehicule.toLocaleString("fr-FR")} F. Quote-part d'amortissement non déductible : ${annuiteExcedente.toLocaleString("fr-FR")} F.`,
                montantReintegrationFiscale: annuiteExcedente,
                rappelImpotEstime: rappel,
                penalitesEstimees: penalites,
                referenceLegale: `CGI art. 10 (Plafond véhicules ${plafondVehicule.toLocaleString("fr-FR")} F)`,
                gravite: "MOYENNE",
                recommandationExpert: "Réintégrer automatiquement la fraction excédentaire de l'amortissement en déduction extracomptable au Tableau 7.",
            });
        }
    }

    // ── 4. CONTRÔLE DES DONS & MÉCÉNAT ───────────────────────────────────────
    const tauxDonsMax = donnees.pays === "ci" ? 0.002 : 0.005; // 0.2% en CI, 0.5% au Sénégal
    const plafondDons = Math.round(donnees.chiffreAffairesHT * tauxDonsMax);
    if (donnees.donsComptabilises > plafondDons) {
        const excédentDons = donnees.donsComptabilises - plafondDons;
        const rappel = Math.round(excédentDons * tauxIS);
        const penalites = Math.round(rappel * penTaux);

        anomalies.push({
            code: "DONS_PLAFOND_DEPASSE",
            domaine: "DONS",
            titre: "Dépassement du plafond de déductibilité des dons et libéralités",
            description: `Les dons comptabilisés (${donnees.donsComptabilises.toLocaleString("fr-FR")} F) dépassent le plafond de ${plafondDons.toLocaleString("fr-FR")} F (${(tauxDonsMax * 100).toFixed(1)} % du CA HT).`,
            montantReintegrationFiscale: excédentDons,
            rappelImpotEstime: rappel,
            penalitesEstimees: penalites,
            referenceLegale: donnees.pays === "ci" ? "CGI CI art. 16" : "CGI SN art. 11",
            gravite: "MOYENNE",
            recommandationExpert: "Réintégrer l'excédent de dons et vérifier la nature d'intérêt public des bénéficiaires.",
        });
    }

    // ── 5. CALCULS GLOBAUX & PRESCRIPTION FISCALE ────────────────────────────
    const totalReintegrations = anomalies.reduce((sum, a) => sum + a.montantReintegrationFiscale, 0);
    const totalRappelImpot = anomalies.reduce((sum, a) => sum + a.rappelImpotEstime, 0);
    const totalPenalites = anomalies.reduce((sum, a) => sum + a.penalitesEstimees, 0);
    const expositionFiscaleGlobale = totalRappelImpot + totalPenalites;

    let statutRisqueFiscal: SyntheseAuditFiscalAvance["statutRisqueFiscal"] = "FAIBLE";
    if (expositionFiscaleGlobale >= 10_000_000) statutRisqueFiscal = "CRITIQUE";
    else if (expositionFiscaleGlobale >= 4_000_000) statutRisqueFiscal = "ELEVE";
    else if (expositionFiscaleGlobale > 0) statutRisqueFiscal = "MODERE";

    // Règle de prescription : 3 ans révolus + année en cours
    const anneeCourante = new Date().getFullYear();
    const anneesControlePossibles = [
        anneeCourante,
        anneeCourante - 1,
        anneeCourante - 2,
        anneeCourante - 3,
    ];
    const anneesPrescrites = [
        anneeCourante - 4,
        anneeCourante - 5,
        anneeCourante - 6,
    ];

    return {
        pays: donnees.pays,
        exercice: donnees.exercice,
        tauxIS,
        totalReintegrations,
        totalRappelImpot,
        totalPenalites,
        expositionFiscaleGlobale,
        anomalies,
        statutRisqueFiscal,
        exercicesPrescription: {
            anneesPrescrites,
            anneesControlePossibles,
            regle: "Délai de répétition de droit commun de 3 ans révolus suivant l'année de réalisation des revenus (art. 673 LPF).",
        },
    };
}
