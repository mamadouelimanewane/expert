// ─────────────────────────────────────────────────────────────────────────────
// Suivi Pluriannuel & Imputation des Déficits Reportables (IS OHADA / UEMOA)
// Règles CGI : Report ordinaire = 3 ans (Sénégal / Côte d'Ivoire / Cameroun)
// Amortissements Réputés Différés (ARD) = Report indéfini
// ─────────────────────────────────────────────────────────────────────────────

import type { PaysFiscal } from "@/lib/tax-simulator";

export type TypeDeficit =
    | "ORDINAIRE"               // reportable 3 ans
    | "AMORTISSEMENT_DIFFERE";  // reportable indéfiniment

export interface DeficitExercice {
    exercice: number;           // année fiscale (ex: 2021)
    montantInitial: number;     // montant initialement constaté
    type: TypeDeficit;
    montantImpute: number;      // déjà absorbé sur exercices précédents
    soldeDisponible: number;    // solde restant reportable
    expirationExercice: number; // dernier exercice d'imputation possible
    expire: boolean;            // true si solde > 0 et expirationExercice < exerciceCourant
    anneesRestantes: number;    // nombre d'exercices avant déchéance
}

export interface DetailImputationLigne {
    deficitExercice: number;
    type: TypeDeficit;
    montantImpute: number;
    soldeRestantApres: number;
}

export interface ImputationDeficit {
    exercice: number;
    resultatFiscalAvantImputation: number;
    totalDeficitImpute: number;
    baseImposableApresImputation: number;
    lignesImputation: DetailImputationLigne[];
    soldeDeficitGlobalRestant: number;
}

export interface ProjectionExerciceFutur {
    exercice: number;
    resultatFiscalEstime: number;
    deficitImpute: number;
    baseImposable: number;
    soldeDeficitsFinExercice: number;
}

export interface BordereauDeficits {
    pays: PaysFiscal;
    exerciceCourant: number;
    deficits: DeficitExercice[];
    totalDeficitDisponible: number;
    totalDeficitExpire: number;
    alertesExpiration: string[];
}

/**
 * Construit l'état pluriannuel complet des déficits fiscaux (Bordereau fiscal).
 */
export function construireBordereauDeficits(
    pays: PaysFiscal,
    exerciceCourant: number,
    historique: Array<{
        exercice: number;
        montant: number;
        type?: TypeDeficit;
        montantDejaImpute?: number;
    }>
): BordereauDeficits {
    const deficits: DeficitExercice[] = [];
    const alertesExpiration: string[] = [];

    // Durée de report selon législation fiscale locale
    // CGI Sénégal art. 26 / CGI Côte d'Ivoire art. 10 : 3 ans de report ordinaire
    const dureeOrdinaire = (pays === "SN" || pays === "CI" || pays === "CM" || pays === "BF") ? 3 : 3;

    for (const h of historique) {
        const typeDeficit: TypeDeficit = h.type || "ORDINAIRE";
        const dejaImpute = h.montantDejaImpute || 0;
        const solde = Math.max(0, h.montant - dejaImpute);

        // Expiration : exercice + durée (ex: déficit 2021 expire en 2024 = imputable sur 2022, 2023, 2024)
        const expiration = typeDeficit === "AMORTISSEMENT_DIFFERE"
            ? exerciceCourant + 99 // indéfini en pratique
            : h.exercice + dureeOrdinaire;

        const estExpire = solde > 0 && expiration < exerciceCourant;
        const anneesRestantes = Math.max(0, expiration - exerciceCourant);

        if (solde > 0 && !estExpire && typeDeficit === "ORDINAIRE") {
            if (anneesRestantes === 0) {
                alertesExpiration.push(
                    `🚨 Échéance immédiate : Le déficit ${h.exercice} (${solde.toLocaleString("fr-FR")} FCFA) expire définitivement sur l'exercice ${exerciceCourant} !`
                );
            } else if (anneesRestantes <= 1) {
                alertesExpiration.push(
                    `⚠️ Vigilance fiscale : Le déficit ${h.exercice} expire dans 1 an (fin ${expiration}).`
                );
            }
        } else if (estExpire) {
            alertesExpiration.push(
                `❌ Forclusion fiscale : Le déficit ${h.exercice} de ${solde.toLocaleString("fr-FR")} FCFA est définitivement prescrit.`
            );
        }

        deficits.push({
            exercice: h.exercice,
            montantInitial: h.montant,
            type: typeDeficit,
            montantImpute: dejaImpute,
            soldeDisponible: estExpire ? 0 : solde,
            expirationExercice: expiration,
            expire: estExpire,
            anneesRestantes,
        });
    }

    const totalDeficitDisponible = deficits
        .filter((d) => !d.expire)
        .reduce((sum, d) => sum + d.soldeDisponible, 0);

    const totalDeficitExpire = historique.reduce((sum, h) => {
        const def = deficits.find((d) => d.exercice === h.exercice);
        if (def && def.expire) {
            return sum + Math.max(0, h.montant - (h.montantDejaImpute || 0));
        }
        return sum;
    }, 0);

    return {
        pays,
        exerciceCourant,
        deficits,
        totalDeficitDisponible,
        totalDeficitExpire,
        alertesExpiration,
    };
}

/**
 * Liquidation optimale de l'IS : Imputation FIFO des déficits les plus anciens.
 */
export function calculerImputationOptimale(
    bordereau: BordereauDeficits,
    resultatFiscalBrut: number
): ImputationDeficit {
    let capaciteAbsorption = Math.max(0, resultatFiscalBrut);
    let totalImpute = 0;
    const lignesImputation: DetailImputationLigne[] = [];

    // Ordonner FIFO : d'abord les ordinaires qui expirent le plus vite, puis les ARD
    const deficitsEligibles = [...bordereau.deficits]
        .filter((d) => !d.expire && d.soldeDisponible > 0)
        .sort((a, b) => a.expirationExercice - b.expirationExercice);

    for (const d of deficitsEligibles) {
        if (capaciteAbsorption <= 0) break;

        const aImputer = Math.min(d.soldeDisponible, capaciteAbsorption);
        totalImpute += aImputer;
        capaciteAbsorption -= aImputer;

        lignesImputation.push({
            deficitExercice: d.exercice,
            type: d.type,
            montantImpute: aImputer,
            soldeRestantApres: d.soldeDisponible - aImputer,
        });
    }

    const baseImposable = Math.max(0, resultatFiscalBrut - totalImpute);
    const soldeDeficitGlobalRestant = Math.max(0, bordereau.totalDeficitDisponible - totalImpute);

    return {
        exercice: bordereau.exerciceCourant,
        resultatFiscalAvantImputation: resultatFiscalBrut,
        totalDeficitImpute: totalImpute,
        baseImposableApresImputation: baseImposable,
        lignesImputation,
        soldeDeficitGlobalRestant,
    };
}

/**
 * Simulation pluriannuelle prévisionnelle (trajectoire fiscale sur 3 à 5 ans).
 */
export function projeterDeficits(
    bordereau: BordereauDeficits,
    previsionResultatsFuturs: number[],
    exerciceDepart: number
): ProjectionExerciceFutur[] {
    const projections: ProjectionExerciceFutur[] = [];
    let stockDeficits = bordereau.totalDeficitDisponible;

    for (let i = 0; i < previsionResultatsFuturs.length; i++) {
        const ex = exerciceDepart + i;
        const res = Math.max(0, previsionResultatsFuturs[i]);
        const impute = Math.min(stockDeficits, res);
        stockDeficits = Math.max(0, stockDeficits - impute);
        const base = Math.max(0, res - impute);

        projections.push({
            exercice: ex,
            resultatFiscalEstime: res,
            deficitImpute: impute,
            baseImposable: base,
            soldeDeficitsFinExercice: stockDeficits,
        });
    }

    return projections;
}

/**
 * Synthèse textuelle d'analyse fiscale des déficits.
 */
export function genererRapportDeficits(bordereau: BordereauDeficits): string {
    let out = `=== ÉTAT FISCAL DES DÉFICITS REPORTABLES & ARD (TABLEAU DSF 7/8) ===\n`;
    out += `Juridiction : ${bordereau.pays} | Exercice d'arrêté : ${bordereau.exerciceCourant}\n`;
    out += `Déficits disponibles à imputer : ${bordereau.totalDeficitDisponible.toLocaleString("fr-FR")} FCFA\n`;
    out += `Déficits prescrits/perdus : ${bordereau.totalDeficitExpire.toLocaleString("fr-FR")} FCFA\n\n`;

    if (bordereau.alertesExpiration.length > 0) {
        out += `--- ALERTES PÉREMPTION & RISQUE FISCAL ---\n`;
        for (const a of bordereau.alertesExpiration) {
            out += `${a}\n`;
        }
        out += `\n`;
    }

    out += `--- DÉTAIL DES DÉFICITS PAR EXERCICE D'ORIGINE ---\n`;
    for (const d of bordereau.deficits) {
        const statut = d.expire ? "PRESCRIT" : `DISPONIBLE (expire fin ${d.expirationExercice})`;
        out += `• Exercice ${d.exercice} [${d.type}] : Initial ${d.montantInitial.toLocaleString("fr-FR")} FCFA | `;
        out += `Imputé: ${d.montantImpute.toLocaleString("fr-FR")} | Solde: ${d.soldeDisponible.toLocaleString("fr-FR")} FCFA [${statut}]\n`;
    }

    return out;
}
