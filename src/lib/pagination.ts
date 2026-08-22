// ─────────────────────────────────────────────────────────────────────────────
// Pagination des endpoints de liste.
//
// Une route qui renvoie `findMany()` sans borne charge la collection entière en
// mémoire et la sérialise : le coût croît sans limite avec le volume de données
// du cabinet. Toute route qui retourne des lignes à l'interface doit donc
// passer par ce helper.
//
// Attention : ne pas appliquer ces bornes aux requêtes d'agrégation (calcul de
// chiffre d'affaires, de KPI…), où tronquer le jeu de résultats fausserait le
// calcul. Ces requêtes doivent utiliser `aggregate` / `groupBy` côté base.
// ─────────────────────────────────────────────────────────────────────────────

/** Nombre de lignes renvoyées par défaut. */
export const LIMITE_PAR_DEFAUT = 50;

/** Plafond absolu, même si le client demande davantage. */
export const LIMITE_MAX = 200;

export type Pagination = {
    page: number;
    limit: number;
    skip: number;
    take: number;
};

function entier(valeur: string | null, defaut: number): number {
    const n = Number.parseInt(valeur ?? "", 10);
    return Number.isFinite(n) && n > 0 ? n : defaut;
}

/**
 * Lit `?page=` et `?limit=` et renvoie les bornes à passer à Prisma.
 * Les valeurs absurdes ou absentes retombent sur les valeurs par défaut.
 */
export function parsePagination(searchParams: URLSearchParams): Pagination {
    const page = entier(searchParams.get("page"), 1);
    const limit = Math.min(entier(searchParams.get("limit"), LIMITE_PAR_DEFAUT), LIMITE_MAX);

    return { page, limit, skip: (page - 1) * limit, take: limit };
}

/** Enveloppe de réponse paginée, commune à tous les endpoints de liste. */
export function reponsePaginee<T>(
    items: T[],
    total: number,
    { page, limit }: Pagination
) {
    return {
        total,
        page,
        limit,
        pages: Math.max(1, Math.ceil(total / limit)),
        hasMore: page * limit < total,
        count: items.length,
    };
}
