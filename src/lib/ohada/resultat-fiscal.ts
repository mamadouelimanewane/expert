// ─────────────────────────────────────────────────────────────────────────────
// Détermination du Résultat Fiscal et Liquidation de l'Impôt (Tableau 7 DSF)
// Référentiel SYSCOHADA révisé & Codes Généraux des Impôts (UEMOA / OHADA).
// ─────────────────────────────────────────────────────────────────────────────

import type { CompteBalance } from "./types";
import { REGLES_FISCALES, type PaysFiscal } from "@/lib/tax-simulator";

export type ReintegrationType =
    | "AMORTISSEMENTS_EXCEDENTAIRES"
    | "AMENDES_ET_PENALITES"
    | "REMUNERATIONS_EXCEDENTAIRES"
    | "DONS_ET_LIBERALITES_EXCEDENTAIRES"
    | "PROVISIONS_NON_DEDUCTIBLES"
    | "FRAIS_DE_SIEGE_EXCEDENTAIRES"
    | "INTERETS_AVANCES_EXCEDENTAIRES"
    | "IMPOTS_NON_DEDUCTIBLES"
    | "AUTRES_REINTEGRATIONS";

export type DeductionType =
    | "DIVIDENDES_FILIALES_MERE_FILLE"
    | "PLUS_VALUES_REINVESTIES"
    | "REPRISES_PROVISIONS_TAXEES"
    | "AUTRES_DEDUCTIONS";

export interface LigneAjustementFiscal {
    id: string;
    code: string;
    libelle: string;
    type: ReintegrationType | DeductionType;
    montant: number;
    motif: string;
    referenceLegale: string;
}

export interface DeficitReportable {
    exercice: number;
    montantInitial: number;
    montantImpute: number;
    soldeDisponible: number;
    expireEn: number;
}

export interface ParametresFiscaliteEntreprise {
    pays: PaysFiscal;
    exercice: number;
    chiffreAffairesHT: number;
    resultatComptableAvantImpot: number;
    isEntreprisePME?: boolean;
    tauxPME?: number;
    deficitsAnterieurs?: DeficitReportable[];
    ajustementsManuels?: LigneAjustementFiscal[];
}

export interface DetailLiquidationIS {
    pays: PaysFiscal;
    exercice: number;
    resultatComptable: number;
    totalReintegrations: number;
    reintegrations: LigneAjustementFiscal[];
    totalDeductions: number;
    deductions: LigneAjustementFiscal[];
    resultatFiscalAvantDeficit: number;
    deficitsImputes: number;
    deficitsRestants: DeficitReportable[];
    resultatFiscalNetImposable: number;
    tauxISApplique: number;
    isBrut: number;
    impotMinimumForfaitaire: number;
    minimumApplique: boolean;
    isExigible: number;
    acomptesVerses: number;
    soldeDuOuCredit: number;
    referenceLegaleIS: string;
}

/** Plafonds légaux de déductibilité des dons et mécénat (% du CA HT). */
export const PLAFOND_DONS_POURCENTAGE_CA: Record<PaysFiscal, number> = {
    sn: 0.005, // 0.5 % du CA HT (CGI Sénégal art. 9)
    ci: 0.002, // 0.2 % du CA HT (CGI Côte d'Ivoire art. 18)
    cm: 0.005, // 0.5 % du CA HT
    bj: 0.003, // 0.3 % du CA HT
};

/** Durée de prescription du report déficitaire en années. */
export const DUREE_REPORT_DEFICITAIRE_ANNEES: Record<PaysFiscal, number> = {
    sn: 3, // 3 exercices suivants (CGI Sénégal art. 27)
    ci: 5, // 5 exercices suivants (CGI Côte d'Ivoire art. 26)
    cm: 4, // 4 exercices suivants
    bj: 3, // 3 exercices suivants
};

/**
 * Analyse une balance comptable pour détecter automatiquement les réintégrations
 * et déductions prévues par les CGI de la zone OHADA.
 */
export function detecterAjustementsFiscauxAutomatiques(
    balance: CompteBalance[],
    parametres: ParametresFiscaliteEntreprise
): LigneAjustementFiscal[] {
    const ajustements: LigneAjustementFiscal[] = [];
    const pays = parametres.pays;
    const ca = Math.max(0, parametres.chiffreAffairesHT);

    let cumulDons = 0;
    let cumulAmendes = 0;
    let cumulProvisionsNonDed = 0;
    let cumulInteretsCC = 0;

    for (const compte of balance) {
        const num = (compte.numero || "").trim();
        const soldeDebiteur = Math.max(0, (compte.debit || 0) - (compte.credit || 0));
        const soldeCrediteur = Math.max(0, (compte.credit || 0) - (compte.debit || 0));

        // 1. Amendes, pénalités fiscales et confiscations (non déductibles)
        // Comptes 6582, 6583, 6712 dans le plan SYSCOHADA
        if (num.startsWith("6582") || num.startsWith("6583") || num.startsWith("6712")) {
            cumulAmendes += soldeDebiteur;
        }

        // 2. Dons, mécénat et libéralités
        // Compte 6581 (Dons et libéralités)
        if (num.startsWith("6581")) {
            cumulDons += soldeDebiteur;
        }

        // 3. Provisions non déductibles (risques généraux, pertes de change latentes)
        // Compte 6972 (Dotations aux provisions pour pertes de change), 659
        if (num.startsWith("6972") || num.startsWith("659")) {
            cumulProvisionsNonDed += soldeDebiteur;
        }

        // 4. Intérêts des comptes courants d'associés (compte 6713)
        if (num.startsWith("6713") || num.startsWith("6712")) {
            cumulInteretsCC += soldeDebiteur;
        }

        // 5. Dividendes de filiales éligibles au régime mère-fille (compte 771)
        if (num.startsWith("771") && soldeCrediteur > 0) {
            // Exonération de 95% du dividende perçu (quote-part de 5% réintégrée)
            const exoneration = Math.round(soldeCrediteur * 0.95);
            ajustements.push({
                id: `ded-mere-fille-${num}`,
                code: "DED_01",
                libelle: `Exonération régime mère-fille (95% des dividendes perçus - c/ ${num})`,
                type: "DIVIDENDES_FILIALES_MERE_FILLE",
                montant: exoneration,
                motif: "Dividendes de filiales détenues à plus de 10% exonérés à hauteur de 95%.",
                referenceLegale: pays === "sn" ? "CGI Sénégal art. 22" : "CGI Côte d'Ivoire art. 23",
            });
        }
    }

    if (cumulAmendes > 0) {
        ajustements.push({
            id: "reint-amendes",
            code: "REINT_01",
            libelle: "Amendes, pénalités administratives et fiscales",
            type: "AMENDES_ET_PENALITES",
            montant: Math.round(cumulAmendes),
            motif: "Les sanctions pénales et fiscales sont strictement non déductibles.",
            referenceLegale: pays === "sn" ? "CGI Sénégal art. 11" : "CGI Côte d'Ivoire art. 18",
        });
    }

    if (cumulDons > 0) {
        const plafond = Math.round(ca * PLAFOND_DONS_POURCENTAGE_CA[pays]);
        const excedent = Math.max(0, cumulDons - plafond);
        if (excedent > 0) {
            ajustements.push({
                id: "reint-dons-excedent",
                code: "REINT_02",
                libelle: `Dons et libéralités excédant le plafond légal de ${(PLAFOND_DONS_POURCENTAGE_CA[pays] * 100).toFixed(1)} % du CA`,
                type: "DONS_ET_LIBERALITES_EXCEDENTAIRES",
                montant: Math.round(excedent),
                motif: `Total des dons : ${cumulDons.toLocaleString("fr-FR")} F. Plafond autorisé : ${plafond.toLocaleString("fr-FR")} F.`,
                referenceLegale: pays === "sn" ? "CGI Sénégal art. 9" : "CGI Côte d'Ivoire art. 18",
            });
        }
    }

    if (cumulProvisionsNonDed > 0) {
        ajustements.push({
            id: "reint-prov-perte-change",
            code: "REINT_03",
            libelle: "Provisions pour pertes de change latentes ou risques non individualisés",
            type: "PROVISIONS_NON_DEDUCTIBLES",
            montant: Math.round(cumulProvisionsNonDed),
            motif: "Seules les pertes effectives et provisions pour charges précises individualisées sont déductibles.",
            referenceLegale: pays === "sn" ? "CGI Sénégal art. 10" : "CGI Côte d'Ivoire art. 19",
        });
    }

    return ajustements;
}

/**
 * Liquidation complète de l'Impôt sur les Sociétés (Tableau 7 DSF).
 */
export function determinerResultatFiscalEtIS(
    parametres: ParametresFiscaliteEntreprise,
    ajustementsDetectes: LigneAjustementFiscal[] = [],
    acomptesVerses: number = 0
): DetailLiquidationIS {
    const { pays, exercice, chiffreAffairesHT, resultatComptableAvantImpot } = parametres;
    const regle = REGLES_FISCALES[pays] || REGLES_FISCALES.sn;

    // Fusionner ajustements auto et manuels
    const tousAjustements = [...ajustementsDetectes, ...(parametres.ajustementsManuels || [])];

    const reintegrations = tousAjustements.filter((a) =>
        [
            "AMORTISSEMENTS_EXCEDENTAIRES",
            "AMENDES_ET_PENALITES",
            "REMUNERATIONS_EXCEDENTAIRES",
            "DONS_ET_LIBERALITES_EXCEDENTAIRES",
            "PROVISIONS_NON_DEDUCTIBLES",
            "FRAIS_DE_SIEGE_EXCEDENTAIRES",
            "INTERETS_AVANCES_EXCEDENTAIRES",
            "IMPOTS_NON_DEDUCTIBLES",
            "AUTRES_REINTEGRATIONS",
        ].includes(a.type)
    );

    const deductions = tousAjustements.filter((a) =>
        [
            "DIVIDENDES_FILIALES_MERE_FILLE",
            "PLUS_VALUES_REINVESTIES",
            "REPRISES_PROVISIONS_TAXEES",
            "AUTRES_DEDUCTIONS",
        ].includes(a.type)
    );

    const totalReintegrations = reintegrations.reduce((sum, r) => sum + Math.max(0, r.montant), 0);
    const totalDeductions = deductions.reduce((sum, d) => sum + Math.max(0, d.montant), 0);

    const resultatFiscalAvantDeficit = resultatComptableAvantImpot + totalReintegrations - totalDeductions;

    // Gestion de l'imputation des déficits antérieurs
    let deficitImputableTotal = 0;
    const deficitsRestants: DeficitReportable[] = [];
    let capaciteImputation = Math.max(0, resultatFiscalAvantDeficit);

    if (parametres.deficitsAnterieurs && parametres.deficitsAnterieurs.length > 0) {
        // Trier par exercice le plus ancien en premier (FIFO)
        const defsTries = [...parametres.deficitsAnterieurs].sort((a, b) => a.exercice - b.exercice);
        const dureeMax = DUREE_REPORT_DEFICITAIRE_ANNEES[pays] || 3;

        for (const def of defsTries) {
            const expireEn = def.expireEn || def.exercice + dureeMax;
            const encoreValide = expireEn >= exercice;

            if (encoreValide && capaciteImputation > 0 && def.soldeDisponible > 0) {
                const aImputer = Math.min(capaciteImputation, def.soldeDisponible);
                deficitImputableTotal += aImputer;
                capaciteImputation -= aImputer;
                const reste = def.soldeDisponible - aImputer;
                if (reste > 0) {
                    deficitsRestants.push({
                        ...def,
                        montantImpute: def.montantImpute + aImputer,
                        soldeDisponible: reste,
                        expireEn,
                    });
                }
            } else if (def.soldeDisponible > 0 && encoreValide) {
                deficitsRestants.push({ ...def, expireEn });
            }
        }
    }

    const resultatFiscalNetImposable = Math.max(0, resultatFiscalAvantDeficit - deficitImputableTotal);

    // Calcul du taux d'IS
    let tauxIS = regle.tauxIS;
    if (parametres.isEntreprisePME && parametres.tauxPME !== undefined) {
        tauxIS = parametres.tauxPME;
    }

    const isBrut = Math.round(resultatFiscalNetImposable * tauxIS);

    // Impôt Minimum Forfaitaire (IMF)
    let impotMinimum = 0;
    if (regle.minimum) {
        const baseCA = Math.max(0, chiffreAffairesHT);
        impotMinimum = Math.round(baseCA * regle.minimum.taux);
        if (regle.minimum.plancher) impotMinimum = Math.max(impotMinimum, regle.minimum.plancher);
        if (regle.minimum.plafond) impotMinimum = Math.min(impotMinimum, regle.minimum.plafond);
    }

    const minimumApplique = impotMinimum > isBrut;
    const isExigible = Math.max(isBrut, impotMinimum);
    const soldeDuOuCredit = isExigible - acomptesVerses;

    const ref =
        pays === "sn"
            ? "CGI Sénégal, Titre I (IS art. 1 à 35) & Tableau 7 DSF"
            : pays === "ci"
            ? "CGI Côte d'Ivoire, Livre I (IS art. 1 à 38) & DSF"
            : "Acte uniforme OHADA AUDCIF & CGI national";

    return {
        pays,
        exercice,
        resultatComptable: resultatComptableAvantImpot,
        totalReintegrations,
        reintegrations,
        totalDeductions,
        deductions,
        resultatFiscalAvantDeficit,
        deficitsImputes: deficitImputableTotal,
        deficitsRestants,
        resultatFiscalNetImposable,
        tauxISApplique: tauxIS,
        isBrut,
        impotMinimumForfaitaire: impotMinimum,
        minimumApplique,
        isExigible,
        acomptesVerses,
        soldeDuOuCredit,
        referenceLegaleIS: ref,
    };
}
