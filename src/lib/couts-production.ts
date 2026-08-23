// ─────────────────────────────────────────────────────────────────────────────
// Comptabilité analytique : coût de revient et marge par produit.
//
// L'écran de coûts industriels affichait des produits inventés avec leur prix
// de vente, leur coût de revient, leur marge et une structure de coût en
// pourcentages — le tout inscrit dans le code. Un responsable de production
// pouvait y lire une marge de 25 % sans qu'aucune donnée ne l'établisse.
//
// Le coût de revient est désormais la somme des composantes saisies, et la
// marge s'en déduit. Un produit sans composante de coût n'a pas de marge
// « nulle » : il a une marge INDÉTERMINÉE, ce que le calcul signale.
// ─────────────────────────────────────────────────────────────────────────────

export type CategorieCout =
    | "MATIERE_PREMIERE"
    | "MAIN_OEUVRE_DIRECTE"
    | "ENERGIE"
    | "AMORTISSEMENT"
    | "CHARGES_INDIRECTES"
    | "AUTRE";

export const LIBELLE_CATEGORIE: Record<CategorieCout, string> = {
    MATIERE_PREMIERE: "Matières premières",
    MAIN_OEUVRE_DIRECTE: "Main-d'œuvre directe",
    ENERGIE: "Énergie",
    AMORTISSEMENT: "Amortissements",
    CHARGES_INDIRECTES: "Charges indirectes",
    AUTRE: "Autres",
};

export type ComposanteCout = {
    category: CategorieCout;
    label: string;
    unitCost: number;
};

export type ProduitAnalytique = {
    reference: string;
    name: string;
    family?: string | null;
    unit?: string;
    sellingPrice: number;
    costs: ComposanteCout[];
    /** Quantité produite sur la période analysée. */
    quantite?: number;
};

export type VentilationCout = {
    category: CategorieCout;
    libelle: string;
    montant: number;
    /** Part dans le coût de revient, en pourcentage. */
    part: number;
};

export type AnalyseProduit = {
    reference: string;
    name: string;
    family: string | null;
    unit: string;
    sellingPrice: number;
    /** Coût de revient unitaire. `null` si aucune composante n'est saisie. */
    coutRevient: number | null;
    /** Marge unitaire. `null` si le coût de revient est indéterminé. */
    marge: number | null;
    /** Taux de marge sur prix de vente, en pourcentage. */
    tauxMarge: number | null;
    ventilation: VentilationCout[];
    quantite: number | null;
    /** Marge dégagée sur la période, si la quantité est connue. */
    margeTotale: number | null;
    /** Chiffre d'affaires de la période, si la quantité est connue. */
    chiffreAffaires: number | null;
    avertissements: string[];
};

function round2(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Calcule le coût de revient, la marge et la ventilation d'un produit.
 *
 * Un produit sans composante de coût renvoie `coutRevient: null` : l'absence de
 * saisie ne doit jamais être interprétée comme un coût nul, qui afficherait
 * une marge de 100 %.
 */
export function analyserProduit(produit: ProduitAnalytique): AnalyseProduit {
    const avertissements: string[] = [];
    const composantes = produit.costs ?? [];

    const prixVente = Number(produit.sellingPrice) || 0;
    if (prixVente <= 0) {
        avertissements.push("Prix de vente non renseigné : la marge ne peut pas être appréciée.");
    }

    if (composantes.length === 0) {
        avertissements.push(
            "Aucune composante de coût saisie : le coût de revient est indéterminé, il n'est pas nul."
        );

        return {
            reference: produit.reference,
            name: produit.name,
            family: produit.family ?? null,
            unit: produit.unit ?? "unite",
            sellingPrice: prixVente,
            coutRevient: null,
            marge: null,
            tauxMarge: null,
            ventilation: [],
            quantite: produit.quantite ?? null,
            margeTotale: null,
            chiffreAffaires:
                produit.quantite != null ? round2(prixVente * produit.quantite) : null,
            avertissements,
        };
    }

    const negatives = composantes.filter((c) => (Number(c.unitCost) || 0) < 0);
    if (negatives.length > 0) {
        avertissements.push(
            `${negatives.length} composante(s) de coût négative(s) : vérifiez la saisie.`
        );
    }

    const coutRevient = round2(
        composantes.reduce((s, c) => s + (Number(c.unitCost) || 0), 0)
    );

    // Ventilation par catégorie, agrégée puis triée par poids décroissant.
    const parCategorie = new Map<CategorieCout, number>();
    for (const c of composantes) {
        parCategorie.set(c.category, (parCategorie.get(c.category) ?? 0) + (Number(c.unitCost) || 0));
    }

    const ventilation: VentilationCout[] = [...parCategorie.entries()]
        .map(([category, montant]) => ({
            category,
            libelle: LIBELLE_CATEGORIE[category] ?? category,
            montant: round2(montant),
            part: coutRevient !== 0 ? round2((montant / coutRevient) * 100) : 0,
        }))
        .sort((a, b) => b.montant - a.montant);

    const marge = round2(prixVente - coutRevient);
    const tauxMarge = prixVente > 0 ? round2((marge / prixVente) * 100) : null;

    if (marge < 0) {
        avertissements.push(
            "Le coût de revient dépasse le prix de vente : le produit est vendu à perte."
        );
    }

    const quantite = produit.quantite ?? null;

    return {
        reference: produit.reference,
        name: produit.name,
        family: produit.family ?? null,
        unit: produit.unit ?? "unite",
        sellingPrice: prixVente,
        coutRevient,
        marge,
        tauxMarge,
        ventilation,
        quantite,
        margeTotale: quantite != null ? round2(marge * quantite) : null,
        chiffreAffaires: quantite != null ? round2(prixVente * quantite) : null,
        avertissements,
    };
}

export type SyntheseAnalytique = {
    nbProduits: number;
    /** Produits dont le coût de revient est établi. */
    nbEvalues: number;
    /** Produits sans composante de coût saisie. */
    nbIndetermines: number;
    /** Produits vendus à perte. */
    nbAPerte: number;
    chiffreAffaires: number;
    margeTotale: number;
    /** Taux de marge global, pondéré par les volumes. `null` si non calculable. */
    tauxMargeGlobal: number | null;
};

/** Agrège les analyses produit en une synthèse de portefeuille. */
export function synthetiser(analyses: AnalyseProduit[]): SyntheseAnalytique {
    const evalues = analyses.filter((a) => a.coutRevient !== null);
    const avecVolume = evalues.filter((a) => a.quantite != null);

    const chiffreAffaires = round2(
        avecVolume.reduce((s, a) => s + (a.chiffreAffaires ?? 0), 0)
    );
    const margeTotale = round2(avecVolume.reduce((s, a) => s + (a.margeTotale ?? 0), 0));

    return {
        nbProduits: analyses.length,
        nbEvalues: evalues.length,
        nbIndetermines: analyses.length - evalues.length,
        nbAPerte: evalues.filter((a) => (a.marge ?? 0) < 0).length,
        chiffreAffaires,
        margeTotale,
        // Le taux global n'a de sens que si des volumes sont connus : sans eux,
        // une moyenne de taux unitaires donnerait un chiffre trompeur.
        tauxMargeGlobal:
            chiffreAffaires > 0 ? round2((margeTotale / chiffreAffaires) * 100) : null,
    };
}
