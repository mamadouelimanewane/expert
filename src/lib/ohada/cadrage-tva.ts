// ─────────────────────────────────────────────────────────────────────────────
// Cadrage Automatique TVA & Contrôle de Cohérence Déclarations / Grand Livre
// Référentiel SYSCOHADA révisé & CGI (Sénégal art. 363+, Côte d'Ivoire art. 383+).
// ─────────────────────────────────────────────────────────────────────────────

import type { CompteBalance } from "./types";
import { REGLES_FISCALES, type PaysFiscal } from "@/lib/tax-simulator";

export interface DeclarationTVAMensuelle {
    mois: number; // 1 à 12
    periode: string; // Ex: "2026-01"
    chiffreAffairesTaxableDeclare: number;
    chiffreAffairesExonereDeclare: number;
    chiffreAffairesExportDeclare: number;
    chiffreAffairesTotalDeclare: number;
    tvaCollecteeDeclaree: number;
    tvaDeductibleDeclaree: number;
    tvaNetteDueDeclaree: number;
    creditTVAReporte: number;
}

export interface ProrataTVAMixte {
    estEntrepriseMixte: boolean;
    caOperationsTaxablesTTC: number;
    caExportationsTaxables: number;
    caOperationsExonereesSansDroit: number;
    tauxProrataProvisoire: number; // en % (ex: 82 %)
    tauxProrataDefinitif: number; // en % (ex: 85 %)
    variationProrata: number; // ex: +3 %
    regularisationTVAADeduireOuReverser: number; // positif = déduction complémentaire, négatif = reversement
}

export interface AnomalieCadrageTVA {
    code: string;
    gravite: "CRITIQUE" | "MAJEURE" | "MINEURE";
    libelle: string;
    description: string;
    ecart: number;
    referenceLegale: string;
    recommandationExpert: string;
}

export interface SyntheseCadrageTVA {
    pays: PaysFiscal;
    exercice: number;
    tauxTVANormal: number;

    // 1. Chiffre d'Affaires
    caComptableClasse7: number;
    caTotalDeclareTVA: number;
    ecartChiffreAffaires: number;
    tauxCadrageCA: number; // % de concordance

    // 2. TVA Collectée
    tvaCollecteeComptable4431: number;
    tvaCollecteeDeclareeCumul: number;
    tvaCollecteeTheoriqueSurCA: number;
    ecartTVACollectee: number;

    // 3. TVA Déductible
    tvaDeductibleComptable445: number;
    tvaDeductibleDeclareeCumul: number;
    ecartTVADeductible: number;

    // 4. Prorata éventuel
    prorata: ProrataTVAMixte;

    // 5. Diagnostics et alertes
    anomalies: AnomalieCadrageTVA[];
    statutCadrage: "CONFORME" | "A_JUSTIFIER" | "RISQUE_REDRESSEMENT_ELEVE";
    noteSynthese: string;
}

/**
 * Extrait le CA comptable et les comptes de TVA d'une balance générale.
 */
export function extraireDonneesComptablesTVA(balance: CompteBalance[]) {
    let caComptableClasse7 = 0;
    let tvaCollectee4431 = 0;
    let tvaDeductible445 = 0;

    for (const compte of balance) {
        const num = (compte.numero || "").trim();
        const soldeDebiteur = Math.max(0, (compte.debit || 0) - (compte.credit || 0));
        const soldeCrediteur = Math.max(0, (compte.credit || 0) - (compte.debit || 0));

        // Comptes de ventes et prestations de services : 701 à 707
        if (/^70[1-7]/.test(num)) {
            // Dans le compte de résultat, le produit est un crédit net
            caComptableClasse7 += soldeCrediteur - soldeDebiteur;
        }

        // 4431 : État, TVA facturée sur ventes / prestations
        if (num.startsWith("4431") || num.startsWith("443")) {
            tvaCollectee4431 += soldeCrediteur;
        }

        // 445 : État, TVA récupérable (4451 immobilisations, 4452 biens et services, 4454)
        if (num.startsWith("445")) {
            tvaDeductible445 += soldeDebiteur;
        }
    }

    return {
        caComptableClasse7: Math.round(caComptableClasse7),
        tvaCollectee4431: Math.round(tvaCollectee4431),
        tvaDeductible445: Math.round(tvaDeductible445),
    };
}

/**
 * Calcule le cadrage global TVA entre la balance générale et les déclarations mensuelles.
 */
export function effectuerCadrageTVA(
    pays: PaysFiscal,
    exercice: number,
    balance: CompteBalance[],
    declarations: DeclarationTVAMensuelle[],
    options?: {
        prorataProvisoire?: number; // Pourcentage (ex: 80)
        caExonereSansDroit?: number;
    }
): SyntheseCadrageTVA {
    const regle = REGLES_FISCALES[pays] || REGLES_FISCALES.sn;
    const tauxTVA = regle.tauxTVA; // 0.18

    const comptable = extraireDonneesComptablesTVA(balance);

    // Cumuls déclarés
    const caTotalDeclareTVA = declarations.reduce((sum, d) => sum + d.chiffreAffairesTotalDeclare, 0);
    const caTaxableDeclareTVA = declarations.reduce((sum, d) => sum + d.chiffreAffairesTaxableDeclare, 0);
    const caExportDeclareTVA = declarations.reduce((sum, d) => sum + d.chiffreAffairesExportDeclare, 0);
    const caExonereDeclareTVA = declarations.reduce((sum, d) => sum + d.chiffreAffairesExonereDeclare, 0);

    const tvaCollecteeDeclareeCumul = declarations.reduce((sum, d) => sum + d.tvaCollecteeDeclaree, 0);
    const tvaDeductibleDeclareeCumul = declarations.reduce((sum, d) => sum + d.tvaDeductibleDeclaree, 0);

    // Écarts
    const ecartChiffreAffaires = comptable.caComptableClasse7 - caTotalDeclareTVA;
    const tauxCadrageCA =
        comptable.caComptableClasse7 > 0
            ? Math.round((Math.min(comptable.caComptableClasse7, caTotalDeclareTVA) / Math.max(comptable.caComptableClasse7, caTotalDeclareTVA)) * 10000) / 100
            : 100;

    const tvaCollecteeTheoriqueSurCA = Math.round(caTaxableDeclareTVA * tauxTVA);
    const ecartTVACollectee = comptable.tvaCollectee4431 - tvaCollecteeDeclareeCumul;
    const ecartTVADeductible = comptable.tvaDeductible445 - tvaDeductibleDeclareeCumul;

    // Prorata
    const estMixte = (caExonereDeclareTVA > 0) || (options?.caExonereSansDroit && options.caExonereSansDroit > 0);
    const caTaxableTTC = caTaxableDeclareTVA * (1 + tauxTVA);
    const caExonereSansDroit = options?.caExonereSansDroit ?? caExonereDeclareTVA;
    const denominateur = caTaxableTTC + caExportDeclareTVA + caExonereSansDroit;

    let tauxDefinitif = 100;
    let variationProrata = 0;
    let regularisation = 0;

    if (estMixte && denominateur > 0) {
        tauxDefinitif = Math.round(((caTaxableTTC + caExportDeclareTVA) / denominateur) * 100);
        const tauxProvisoire = options?.prorataProvisoire ?? tauxDefinitif;
        variationProrata = tauxDefinitif - tauxProvisoire;
        // Si le prorata définitif dépasse le provisoire de plus de 5 points, déduction complémentaire
        // Si inférieur de plus de 5 points, reversement au Trésor (règle CGI OHADA)
        if (Math.abs(variationProrata) >= 5) {
            regularisation = Math.round((tvaDeductibleDeclareeCumul * variationProrata) / 100);
        }
    }

    const prorata: ProrataTVAMixte = {
        estEntrepriseMixte: !!estMixte,
        caOperationsTaxablesTTC: Math.round(caTaxableTTC),
        caExportationsTaxables: caExportDeclareTVA,
        caOperationsExonereesSansDroit: caExonereSansDroit,
        tauxProrataProvisoire: options?.prorataProvisoire ?? tauxDefinitif,
        tauxProrataDefinitif: tauxDefinitif,
        variationProrata,
        regularisationTVAADeduireOuReverser: regularisation,
    };

    // Analyse des anomalies
    const anomalies: AnomalieCadrageTVA[] = [];

    // Seuil de tolérance (1000 FCFA pour arrondis)
    const SEUIL_TOLERANCE = 1000;

    if (Math.abs(ecartChiffreAffaires) > SEUIL_TOLERANCE) {
        anomalies.push({
            code: "ANOMALIE_CA_CADRAGE",
            gravite: Math.abs(ecartChiffreAffaires) > 1_000_000 ? "CRITIQUE" : "MAJEURE",
            libelle: "Écart entre Chiffre d'Affaires comptable (classe 7) et CA déclaré TVA",
            description: `Le CA en comptabilité (${comptable.caComptableClasse7.toLocaleString("fr-FR")} F) diffère de la somme des 12 déclarations (${caTotalDeclareTVA.toLocaleString("fr-FR")} F) d'un montant de ${Math.abs(ecartChiffreAffaires).toLocaleString("fr-FR")} F.`,
            ecart: ecartChiffreAffaires,
            referenceLegale: pays === "sn" ? "CGI Sénégal art. 396" : "CGI Côte d'Ivoire art. 383",
            recommandationExpert:
                ecartChiffreAffaires > 0
                    ? "Risque immédiat de redressement pour minoration de recettes déclarées. Vérifier les factures à établir ou les ventes non télédéclarées."
                    : "CA déclaré supérieur au CA comptable. Vérifier les avoirs, ristournes ou doubles comptabilisations déclaratives.",
        });
    }

    if (Math.abs(ecartTVACollectee) > SEUIL_TOLERANCE) {
        anomalies.push({
            code: "ANOMALIE_TVA_COLLECTEE",
            gravite: Math.abs(ecartTVACollectee) > 500_000 ? "CRITIQUE" : "MAJEURE",
            libelle: "Discordance sur la TVA collectée (compte 4431 vs déclarations)",
            description: `La TVA collectée enregistrée au compte 4431 (${comptable.tvaCollectee4431.toLocaleString("fr-FR")} F) ne concorde pas avec la TVA déclarée (${tvaCollecteeDeclareeCumul.toLocaleString("fr-FR")} F). Écart : ${Math.abs(ecartTVACollectee).toLocaleString("fr-FR")} F.`,
            ecart: ecartTVACollectee,
            referenceLegale: pays === "sn" ? "CGI Sénégal art. 363 & 396" : "CGI Côte d'Ivoire art. 384",
            recommandationExpert: "Rapprocher écriture par écriture le journal des ventes et les bordereaux mensuels de TVA.",
        });
    }

    if (Math.abs(ecartTVADeductible) > SEUIL_TOLERANCE) {
        anomalies.push({
            code: "ANOMALIE_TVA_DEDUCTIBLE",
            gravite: "MAJEURE",
            libelle: "Écart de TVA déductible (comptes 445 vs déclarations)",
            description: `TVA déductible en comptabilité : ${comptable.tvaDeductible445.toLocaleString("fr-FR")} F vs déclarée : ${tvaDeductibleDeclareeCumul.toLocaleString("fr-FR")} F. Écart : ${Math.abs(ecartTVADeductible).toLocaleString("fr-FR")} F.`,
            ecart: ecartTVADeductible,
            referenceLegale: pays === "sn" ? "CGI Sénégal art. 380" : "CGI Côte d'Ivoire art. 370",
            recommandationExpert: "S'assurer qu'aucune TVA sur fournisseur étranger ou prestation non assujettie n'a été déduite à tort.",
        });
    }

    if (prorata.estEntrepriseMixte && Math.abs(prorata.variationProrata) >= 5) {
        anomalies.push({
            code: "REGULARISATION_PRORATA_REQUISE",
            gravite: "MAJEURE",
            libelle: "Variation du prorata de TVA supérieure au seuil légal de 5 points",
            description: `Le prorata définitif (${prorata.tauxProrataDefinitif} %) varie de ${prorata.variationProrata > 0 ? "+" : ""}${prorata.variationProrata} points par rapport au provisoire (${prorata.tauxProrataProvisoire} %). Une régularisation de ${Math.abs(prorata.regularisationTVAADeduireOuReverser).toLocaleString("fr-FR")} F est requise.`,
            ecart: prorata.regularisationTVAADeduireOuReverser,
            referenceLegale: pays === "sn" ? "CGI Sénégal art. 384" : "CGI Côte d'Ivoire art. 372",
            recommandationExpert:
                prorata.regularisationTVAADeduireOuReverser < 0
                    ? "Opérer un reversement de TVA sur la prochaine déclaration mensuelle."
                    : "Inscrire un complément de déduction de TVA sur la prochaine déclaration.",
        });
    }

    const hasCritique = anomalies.some((a) => a.gravite === "CRITIQUE");
    const statutCadrage: SyntheseCadrageTVA["statutCadrage"] =
        hasCritique ? "RISQUE_REDRESSEMENT_ELEVE" : anomalies.length > 0 ? "A_JUSTIFIER" : "CONFORME";

    const noteSynthese =
        statutCadrage === "CONFORME"
            ? "Parfaite concordance entre la comptabilité et les déclarations de TVA sur l'exercice. Aucun écart décelé."
            : statutCadrage === "A_JUSTIFIER"
            ? "Des écarts modérés nécessitent la constitution d'un état de rapprochement de travail avant clôture définitive."
            : "Alerte : présence d'écarts significatifs de chiffre d'affaires ou de TVA exposant l'entreprise à un redressement fiscal immédiat en cas de contrôle.";

    return {
        pays,
        exercice,
        tauxTVANormal: tauxTVA,
        caComptableClasse7: comptable.caComptableClasse7,
        caTotalDeclareTVA,
        ecartChiffreAffaires,
        tauxCadrageCA,
        tvaCollecteeComptable4431: comptable.tvaCollectee4431,
        tvaCollecteeDeclareeCumul,
        tvaCollecteeTheoriqueSurCA,
        ecartTVACollectee,
        tvaDeductibleComptable445: comptable.tvaDeductible445,
        tvaDeductibleDeclareeCumul,
        ecartTVADeductible,
        prorata,
        anomalies,
        statutCadrage,
        noteSynthese,
    };
}
