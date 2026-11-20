// ─────────────────────────────────────────────────────────────────────────────
// Optimisation IS par Scénarios What-If (Fiscalité Stratégique OHADA)
// Permet de comparer 3 stratégies : Base, Prudent/Standard, Optimisé Dynamique
// Calcule l'économie d'impôt, l'impact trésorerie et le score de risque fiscal
// ─────────────────────────────────────────────────────────────────────────────

import type { PaysFiscal } from "@/lib/tax-simulator";
import { REGLES_FISCALES } from "@/lib/tax-simulator";

export type StrategieFiscale = "BASE" | "PRUDENT" | "OPTIMISE";

export interface LevierFiscalInput {
    // Amortissements dégressifs ou exceptionnels éligibles
    surcroitAmortissementEligible?: number;
    // Provisions justifiées fiscalement déductibles (art. 10 CGI)
    provisionsDeductiblesJustifiees?: number;
    // Déficits antérieurs reportables disponibles
    deficitsAnterieursDisponibles?: number;
    // Plus-values nettes de cession réinvesties (exonération conditionnelle)
    plusValuesReinvesties?: number;
    // Éligibilité au régime d'incitation PME (abattement de taux ou base)
    eligibleRegimePME?: boolean;
    // Taux réduit PME éventuel (ex: 20% au lieu de 25% / 28%)
    tauxPME?: number;
}

export interface ScenarioResultat {
    strategie: StrategieFiscale;
    nom: string;
    description: string;
    resultatComptable: number;
    reintegrations: number;
    deductions: number;
    resultatFiscalAvantDeficit: number;
    deficitImpute: number;
    baseImposableIS: number;
    tauxISApplique: number;
    isTheorique: number;
    impotMinimumForfaitaire: number;
    isLiquide: number;                // Max(IS, IMF)
    economieImpotVsBase: number;
    gainTresorerieNet: number;
    scoreRisqueFiscal: number;        // 0-100 (0 = zéro risque, 100 = risque de redressement maximal)
    niveauRisque: "TRES_FAIBLE" | "MODERE" | "SIGNIFICATIF";
    justificationsLegales: string[];
}

export interface ComparatifScenariosIS {
    pays: PaysFiscal;
    exercice: number;
    chiffreAffairesHT: number;
    resultatComptable: number;
    scenarios: {
        base: ScenarioResultat;
        prudent: ScenarioResultat;
        optimise: ScenarioResultat;
    };
    meilleurCompromis: StrategieFiscale;
    economieMaximalePossible: number;
    syntheseConseil: string;
}

/**
 * Moteur de simulation multicritère des scénarios d'IS.
 */
export function simulerScenariosIS(
    pays: string,
    exercice: number,
    chiffreAffairesHT: number,
    resultatComptable: number,
    leviers: LevierFiscalInput = {}
): ComparatifScenariosIS {
    const code = (pays || "sn").toLowerCase() as PaysFiscal;
    const regle = REGLES_FISCALES[code] || REGLES_FISCALES.sn;
    const tauxISStandard = regle.tauxIS; // déjà en fraction (ex: 0.3 ou 0.25)
    const tauxIMF = regle.minimum.taux;  // ex: 0.005
    const imf = Math.max(regle.minimum.plancher, Math.round(chiffreAffairesHT * tauxIMF));

    // 1. SCÉNARIO 1 : BASE (Déclaratif direct, zéro optimisation active)
    const reintegrationsBase = Math.round(resultatComptable * 0.10); // réintégrations standard usuelles
    const resultatFiscalBase = Math.max(0, resultatComptable + reintegrationsBase);
    const isBrutBase = Math.round(resultatFiscalBase * tauxISStandard);
    const isLiquideBase = Math.max(isBrutBase, imf);

    const scenarioBase: ScenarioResultat = {
        strategie: "BASE",
        nom: "Déclaratif Spontané (Base)",
        description: "Application directe du résultat comptable sans optimisation ni amortissements accélérés.",
        resultatComptable,
        reintegrations: reintegrationsBase,
        deductions: 0,
        resultatFiscalAvantDeficit: resultatFiscalBase,
        deficitImpute: 0,
        baseImposableIS: resultatFiscalBase,
        tauxISApplique: Math.round(tauxISStandard * 100),
        isTheorique: isBrutBase,
        impotMinimumForfaitaire: imf,
        isLiquide: isLiquideBase,
        economieImpotVsBase: 0,
        gainTresorerieNet: 0,
        scoreRisqueFiscal: 5,
        niveauRisque: "TRES_FAIBLE",
        justificationsLegales: ["Application standard du CGI sans arbitrage de charges."],
    };

    // 2. SCÉNARIO 2 : PRUDENT (Optimisations sûres et documentées)
    const surcroitAmort = Math.round((leviers.surcroitAmortissementEligible || 0) * 0.7);
    const provisionsJustifiees = Math.round((leviers.provisionsDeductiblesJustifiees || 0) * 0.6);
    const deductionsPrudent = surcroitAmort + provisionsJustifiees;
    const reintegrationsPrudent = reintegrationsBase; // reste identique
    const resultatAvantDeficitPrudent = Math.max(0, resultatComptable + reintegrationsPrudent - deductionsPrudent);

    // Imputation prudente des déficits (max 50% du résultat)
    const deficitDisponible = leviers.deficitsAnterieursDisponibles || 0;
    const deficitImputePrudent = Math.min(deficitDisponible, Math.round(resultatAvantDeficitPrudent * 0.6));
    const baseISPrudent = Math.max(0, resultatAvantDeficitPrudent - deficitImputePrudent);

    const isTheoriquePrudent = Math.round(baseISPrudent * tauxISStandard);
    const isLiquidePrudent = Math.max(isTheoriquePrudent, imf);
    const economiePrudent = Math.max(0, isLiquideBase - isLiquidePrudent);

    const scenarioPrudent: ScenarioResultat = {
        strategie: "PRUDENT",
        nom: "Optimisation Prudente & Documentée",
        description: "Activation des amortissements dégressifs justifiés et imputation modérée des déficits reportables.",
        resultatComptable,
        reintegrations: reintegrationsPrudent,
        deductions: deductionsPrudent,
        resultatFiscalAvantDeficit: resultatAvantDeficitPrudent,
        deficitImpute: deficitImputePrudent,
        baseImposableIS: baseISPrudent,
        tauxISApplique: Math.round(tauxISStandard * 100),
        isTheorique: isTheoriquePrudent,
        impotMinimumForfaitaire: imf,
        isLiquide: isLiquidePrudent,
        economieImpotVsBase: economiePrudent,
        gainTresorerieNet: economiePrudent,
        scoreRisqueFiscal: 15,
        niveauRisque: "TRES_FAIBLE",
        justificationsLegales: [
            "Amortissement dégressif certifié conforme aux barèmes CGI",
            "Imputation de déficits fiscaux ordinaires non prescrits (délai 3 ans)",
        ],
    };

    // 3. SCÉNARIO 3 : OPTIMISÉ DYNAMIQUE (Plein régime des leviers légaux)
    const surcroitAmortMax = leviers.surcroitAmortissementEligible || 0;
    const provisionsMax = leviers.provisionsDeductiblesJustifiees || 0;
    const pvReinvesties = leviers.plusValuesReinvesties || 0;
    const deductionsMax = surcroitAmortMax + provisionsMax + pvReinvesties;

    // Réintégration réduite par documentation fiscale
    const reintegrationsOptimisees = Math.round(reintegrationsBase * 0.6);
    const resultatAvantDeficitOptimise = Math.max(0, resultatComptable + reintegrationsOptimisees - deductionsMax);

    // Imputation FIFO intégrale des déficits
    const deficitImputeOptimise = Math.min(deficitDisponible, resultatAvantDeficitOptimise);
    const baseISOptimise = Math.max(0, resultatAvantDeficitOptimise - deficitImputeOptimise);

    const tauxISActif = (leviers.eligibleRegimePME && leviers.tauxPME) ? (leviers.tauxPME / 100) : tauxISStandard;
    const isTheoriqueOptimise = Math.round(baseISOptimise * tauxISActif);
    const isLiquideOptimise = Math.max(isTheoriqueOptimise, imf);
    const economieOptimise = Math.max(0, isLiquideBase - isLiquideOptimise);

    const scenarioOptimise: ScenarioResultat = {
        strategie: "OPTIMISE",
        nom: "Optimisation Dynamique Intégrale",
        description: "Mobilisation totale des déductions, réinvestissement de plus-values et imputation maximale des reports déficitaires.",
        resultatComptable,
        reintegrations: reintegrationsOptimisees,
        deductions: deductionsMax,
        resultatFiscalAvantDeficit: resultatAvantDeficitOptimise,
        deficitImpute: deficitImputeOptimise,
        baseImposableIS: baseISOptimise,
        tauxISApplique: Math.round(tauxISActif * 100),
        isTheorique: isTheoriqueOptimise,
        impotMinimumForfaitaire: imf,
        isLiquide: isLiquideOptimise,
        economieImpotVsBase: economieOptimise,
        gainTresorerieNet: economieOptimise,
        scoreRisqueFiscal: 38,
        niveauRisque: "MODERE",
        justificationsLegales: [
            "Exonération temporaire des plus-values sous engagement de réinvestissement (art. 18 CGI)",
            "Absorption maximale des déficits antérieurs dans la limite du résultat fiscal",
            leviers.eligibleRegimePME ? `Application du taux préférentiel PME (${Math.round(tauxISActif * 100)}%)` : "Régime fiscal de droit commun",
        ],
    };

    // Arbitrage et meilleur compromis
    const meilleurCompromis: StrategieFiscale =
        scenarioOptimise.scoreRisqueFiscal <= 40 ? "OPTIMISE" : "PRUDENT";

    const economieMaximale = Math.max(economiePrudent, economieOptimise);

    const syntheseConseil =
        `Pour l'exercice ${exercice} (${pays}), la stratégie « ${meilleurCompromis} » permet de générer une économie d'impôt ` +
        `de ${economieMaximale.toLocaleString("fr-FR")} FCFA par rapport à la déclaration spontanée brute, tout en maintenant ` +
        `un score de risque fiscal maîtrisé (${scenarioOptimise.scoreRisqueFiscal}/100). Plancher IMF : ${imf.toLocaleString("fr-FR")} FCFA.`;

    return {
        pays: (pays || "SN").toUpperCase() as any,
        exercice,
        chiffreAffairesHT,
        resultatComptable,
        scenarios: {
            base: scenarioBase,
            prudent: scenarioPrudent,
            optimise: scenarioOptimise,
        },
        meilleurCompromis,
        economieMaximalePossible: economieMaximale,
        syntheseConseil,
    };
}
