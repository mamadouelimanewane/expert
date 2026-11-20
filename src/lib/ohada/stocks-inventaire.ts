// ─────────────────────────────────────────────────────────────────────────────
// Moteur de Gestion des Stocks & Inventaire Intermittent (SYSCOHADA révisé)
// Calcul des variations de stocks (603/73), dépréciations (39) et marge brute PME
// ─────────────────────────────────────────────────────────────────────────────

export type CategorieStock =
    | "MARCHANDISES"      // Compte 31 / 6031
    | "MATIERES_PREMIERES"// Compte 32 / 6032
    | "PRODUITS_FINIS"    // Compte 36 / 736
    | "EN_COURS";         // Compte 34 / 734

export interface ArticleStockInventaire {
    id: string;
    reference: string;
    designation: string;
    categorie: CategorieStock;
    quantitePhysique: number;
    prixUnitaireAchatCUMP: number; // Coût Unitaire Moyen Pondéré
    valeurRealisableNette?: number; // Pour test de dépréciation (VRN)
    valeurTotaleBrute?: number;
    depreciationEstimee?: number;
}

export interface EcritureComptableStock {
    numLigne: number;
    journal: "OD";
    date: string;
    compteDebit: string;
    intituleDebit: string;
    compteCredit: string;
    intituleCredit: string;
    montant: number;
    libelle: string;
}

export interface SyntheseInventaireStocks {
    dateInventaire: string;
    exercice: number;
    totalStockInitial: number;
    totalStockFinalBrut: number;
    variationGlobaleStock: number; // Final - Initial (positif = stockage, négatif = déstockage)
    totalDepreciations: number;
    totalStockFinalNet: number;
    ecrituresCloture: EcritureComptableStock[];
    impactMargeBrute: {
        achatsExercice: number;
        ventesExercice: number;
        coutAchatMarchandisesVendues: number; // Achats - Variation stock marchandises
        margeCommerciale: number;
        tauxMarge: number; // Marge / CAMV
        tauxMarque: number; // Marge / Ventes
    };
}

const COMPTES_PAR_CATEGORIE: Record<
    CategorieStock,
    { compteBilan: string; compteVariation: string; compteDepreciation: string; intituleBilan: string; intituleVar: string }
> = {
    MARCHANDISES: {
        compteBilan: "311",
        compteVariation: "6031",
        compteDepreciation: "391",
        intituleBilan: "Marchandises A",
        intituleVar: "Variation des stocks de marchandises",
    },
    MATIERES_PREMIERES: {
        compteBilan: "321",
        compteVariation: "6032",
        compteDepreciation: "392",
        intituleBilan: "Matières premières",
        intituleVar: "Variation des stocks de matières premières",
    },
    PRODUITS_FINIS: {
        compteBilan: "361",
        compteVariation: "736",
        compteDepreciation: "396",
        intituleBilan: "Produits finis",
        intituleVar: "Variation des stocks de produits finis",
    },
    EN_COURS: {
        compteBilan: "341",
        compteVariation: "734",
        compteDepreciation: "394",
        intituleBilan: "Produits en cours",
        intituleVar: "Variation des en-cours de production",
    },
};

/**
 * Calcule l'inventaire complet de fin d'exercice et génère les écritures d'inventaire intermittent.
 */
export function calculerInventaireStocks(params: {
    exercice: number;
    dateInventaire?: string;
    stockInitialParCategorie: Record<CategorieStock, number>;
    articles: ArticleStockInventaire[];
    ventesExercice?: number;
    achatsExercice?: number;
}): SyntheseInventaireStocks {
    const { exercice, dateInventaire = `${params.exercice}-12-31`, stockInitialParCategorie, articles } = params;

    const totauxFinaux: Record<CategorieStock, number> = {
        MARCHANDISES: 0,
        MATIERES_PREMIERES: 0,
        PRODUITS_FINIS: 0,
        EN_COURS: 0,
    };

    let totalDepreciations = 0;

    for (const art of articles) {
        const valeurBrute = Math.round(art.quantitePhysique * art.prixUnitaireAchatCUMP);
        art.valeurTotaleBrute = valeurBrute;
        totauxFinaux[art.categorie] += valeurBrute;

        // Test de dépréciation : si VRN < Coût CUMP
        if (art.valeurRealisableNette !== undefined && art.valeurRealisableNette < art.prixUnitaireAchatCUMP) {
            const perteUnitaire = art.prixUnitaireAchatCUMP - art.valeurRealisableNette;
            const dep = Math.round(art.quantitePhysique * perteUnitaire);
            art.depreciationEstimee = dep;
            totalDepreciations += dep;
        } else {
            art.depreciationEstimee = 0;
        }
    }

    const ecrituresCloture: EcritureComptableStock[] = [];
    let numLigne = 1;

    let totalStockInitial = 0;
    let totalStockFinalBrut = 0;

    const categories: CategorieStock[] = [
        "MARCHANDISES",
        "MATIERES_PREMIERES",
        "PRODUITS_FINIS",
        "EN_COURS",
    ];

    for (const cat of categories) {
        const si = stockInitialParCategorie[cat] || 0;
        const sf = totauxFinaux[cat] || 0;
        const conf = COMPTES_PAR_CATEGORIE[cat];

        totalStockInitial += si;
        totalStockFinalBrut += sf;

        // 1. Annulation du stock initial (si SI > 0)
        if (si > 0) {
            if (cat === "PRODUITS_FINIS" || cat === "EN_COURS") {
                // Pour les produits finis (classe 7) : Débit 73 / Crédit 36
                ecrituresCloture.push({
                    numLigne: numLigne++,
                    journal: "OD",
                    date: dateInventaire,
                    compteDebit: conf.compteVariation,
                    intituleDebit: conf.intituleVar,
                    compteCredit: conf.compteBilan,
                    intituleCredit: conf.intituleBilan,
                    montant: si,
                    libelle: `Annulation stock initial N-1 (${cat})`,
                });
            } else {
                // Pour marchandises et matières (classe 6) : Débit 603 / Crédit 31
                ecrituresCloture.push({
                    numLigne: numLigne++,
                    journal: "OD",
                    date: dateInventaire,
                    compteDebit: conf.compteVariation,
                    intituleDebit: conf.intituleVar,
                    compteCredit: conf.compteBilan,
                    intituleCredit: conf.intituleBilan,
                    montant: si,
                    libelle: `Annulation stock initial N-1 (${cat})`,
                });
            }
        }

        // 2. Constatation du stock final (si SF > 0)
        if (sf > 0) {
            if (cat === "PRODUITS_FINIS" || cat === "EN_COURS") {
                // Constatation produits finis : Débit 36 / Crédit 73
                ecrituresCloture.push({
                    numLigne: numLigne++,
                    journal: "OD",
                    date: dateInventaire,
                    compteDebit: conf.compteBilan,
                    intituleDebit: conf.intituleBilan,
                    compteCredit: conf.compteVariation,
                    intituleCredit: conf.intituleVar,
                    montant: sf,
                    libelle: `Constatation stock final N (${cat})`,
                });
            } else {
                // Constatation marchandises/matières : Débit 31 / Crédit 603
                ecrituresCloture.push({
                    numLigne: numLigne++,
                    journal: "OD",
                    date: dateInventaire,
                    compteDebit: conf.compteBilan,
                    intituleDebit: conf.intituleBilan,
                    compteCredit: conf.compteVariation,
                    intituleCredit: conf.intituleVar,
                    montant: sf,
                    libelle: `Constatation stock final N (${cat})`,
                });
            }
        }
    }

    // 3. Dotation aux dépréciations si perte de valeur constatée
    if (totalDepreciations > 0) {
        ecrituresCloture.push({
            numLigne: numLigne++,
            journal: "OD",
            date: dateInventaire,
            compteDebit: "6593",
            intituleDebit: "Charges pour dépréciation sur stocks",
            compteCredit: "391",
            intituleCredit: "Dépréciations des stocks de marchandises",
            montant: totalDepreciations,
            libelle: `Dotation dépréciation stocks inventaire N`,
        });
    }

    const variationGlobaleStock = totalStockFinalBrut - totalStockInitial;
    const totalStockFinalNet = totalStockFinalBrut - totalDepreciations;

    // Calcul de la marge commerciale
    const ventes = params.ventesExercice || 0;
    const achats = params.achatsExercice || 0;
    const varStockMarchandises = (totauxFinaux.MARCHANDISES || 0) - (stockInitialParCategorie.MARCHANDISES || 0);
    const coutAchatMarchandisesVendues = Math.max(0, achats - varStockMarchandises);
    const margeCommerciale = ventes - coutAchatMarchandisesVendues;
    const tauxMarge = coutAchatMarchandisesVendues > 0 ? Math.round((margeCommerciale / coutAchatMarchandisesVendues) * 1000) / 10 : 0;
    const tauxMarque = ventes > 0 ? Math.round((margeCommerciale / ventes) * 1000) / 10 : 0;

    return {
        dateInventaire,
        exercice,
        totalStockInitial,
        totalStockFinalBrut,
        variationGlobaleStock,
        totalDepreciations,
        totalStockFinalNet,
        ecrituresCloture,
        impactMargeBrute: {
            achatsExercice: achats,
            ventesExercice: ventes,
            coutAchatMarchandisesVendues,
            margeCommerciale,
            tauxMarge,
            tauxMarque,
        },
    };
}
