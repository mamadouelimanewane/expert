/**
 * Ordonnancement contextuel du menu latéral.
 *
 * Le menu est une liste plate d'en-têtes de section et de liens. La section
 * qui contient l'écran ouvert est placée en tête (sur /comptabilite/production
 * on voit d'abord « Expertise & Production »), les autres conservent leur
 * ordre. Un filtre textuel, tolérant aux accents, ne garde que les liens
 * correspondants avec l'en-tête de leur section.
 */
export type EntreeMenu = { header: string; label?: never; href?: never } | { label: string; href: string; header?: never; icon?: unknown };

export const normaliserTexte = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Le href le plus long qui préfixe l'URL courante (/clients/123 → /clients). */
export function hrefActif<T extends EntreeMenu>(entrees: T[], pathname: string): string | null {
    return entrees
        .filter((i): i is T & { href: string } => !!i.href && (pathname === i.href || pathname.startsWith(i.href + "/")))
        .sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null;
}

/**
 * Écrans absents du menu (et sans lien du menu en préfixe) → section à
 * afficher en tête. Le préfixe le plus long l'emporte. Couverture vérifiée
 * par tests/menu-sections.test.ts sur l'inventaire complet de src/app.
 */
export const SECTION_PAR_PREFIXE: [string, string][] = [
    // Pilotage & cabinet
    ["/dashboard", "PILOTAGE & CABINET"], ["/agenda", "PILOTAGE & CABINET"], ["/time-entry", "PILOTAGE & CABINET"],
    ["/missions", "PILOTAGE & CABINET"], ["/supervision", "PILOTAGE & CABINET"], ["/prospects", "PILOTAGE & CABINET"],
    ["/commercial", "PILOTAGE & CABINET"], ["/collaboration", "PILOTAGE & CABINET"], ["/communications", "PILOTAGE & CABINET"],
    ["/emails", "PILOTAGE & CABINET"], ["/workflows", "PILOTAGE & CABINET"], ["/procedures", "PILOTAGE & CABINET"],
    ["/management", "PILOTAGE & CABINET"], ["/expenses", "PILOTAGE & CABINET"], ["/expense-notes", "PILOTAGE & CABINET"],
    ["/signature", "PILOTAGE & CABINET"], ["/writing", "PILOTAGE & CABINET"], ["/annuaire", "PILOTAGE & CABINET"],
    ["/presentation", "PILOTAGE & CABINET"], ["/preparation", "PILOTAGE & CABINET"], ["/benchmarking", "PILOTAGE & CABINET"],
    // Expertise & production
    ["/comptabilite", "EXPERTISE & PRODUCTION"], ["/production", "EXPERTISE & PRODUCTION"], ["/liasse-fiscale", "EXPERTISE & PRODUCTION"],
    ["/fec-export", "EXPERTISE & PRODUCTION"], ["/declarations", "EXPERTISE & PRODUCTION"], ["/scan", "EXPERTISE & PRODUCTION"],
    ["/ingest", "EXPERTISE & PRODUCTION"], ["/bank-reconciliation", "EXPERTISE & PRODUCTION"], ["/reporting", "EXPERTISE & PRODUCTION"],
    ["/simulator", "EXPERTISE & PRODUCTION"], ["/industries", "EXPERTISE & PRODUCTION"], ["/data", "EXPERTISE & PRODUCTION"],
    ["/data-center", "EXPERTISE & PRODUCTION"], ["/diagnostic", "EXPERTISE & PRODUCTION"],
    // Audit & conformité
    ["/audit-forensique", "AUDIT & CONFORMITÉ"], ["/audit-legal", "AUDIT & CONFORMITÉ"], ["/compliance", "AUDIT & CONFORMITÉ"],
    ["/kyc", "AUDIT & CONFORMITÉ"], ["/expert-judiciaire", "AUDIT & CONFORMITÉ"], ["/legal", "AUDIT & CONFORMITÉ"],
    ["/corporate/audit-assurance", "AUDIT & CONFORMITÉ"], ["/corporate/legal-archive", "AUDIT & CONFORMITÉ"],
    // Stratégie & conseil
    ["/strategy", "STRATÉGIE & CONSEIL"], ["/analysis", "STRATÉGIE & CONSEIL"], ["/valorisation", "STRATÉGIE & CONSEIL"],
    ["/corporate", "STRATÉGIE & CONSEIL"], ["/advisory", "STRATÉGIE & CONSEIL"], ["/credit-insights", "STRATÉGIE & CONSEIL"],
    // TPE, douanes & fintech
    ["/fintech", "TPE, DOUANES & FINTECH"], ["/douanes", "TPE, DOUANES & FINTECH"], ["/accompagnement", "TPE, DOUANES & FINTECH"],
    ["/comptabilite/tpe-dashboard", "TPE, DOUANES & FINTECH"], ["/comptabilite/tpe-processing", "TPE, DOUANES & FINTECH"],
    ["/comptabilite/informel", "TPE, DOUANES & FINTECH"], ["/dashboard/whatsapp-bot", "TPE, DOUANES & FINTECH"],
    // Nexus intelligence
    ["/nexus", "NEXUS INTELLIGENCE"], ["/nexus-fiscal", "NEXUS INTELLIGENCE"], ["/nexus-legal", "NEXUS INTELLIGENCE"],
    ["/nexus-go", "NEXUS INTELLIGENCE"], ["/assistant", "NEXUS INTELLIGENCE"], ["/ohada-library", "NEXUS INTELLIGENCE"],
    ["/library", "NEXUS INTELLIGENCE"], ["/data/nexus-link", "NEXUS INTELLIGENCE"],
    // Plateforme & écosystème
    ["/settings", "PLATEFORME & ÉCOSYSTÈME"], ["/documentation", "PLATEFORME & ÉCOSYSTÈME"], ["/training", "PLATEFORME & ÉCOSYSTÈME"],
    ["/academy", "PLATEFORME & ÉCOSYSTÈME"], ["/onboarding", "PLATEFORME & ÉCOSYSTÈME"], ["/plan", "PLATEFORME & ÉCOSYSTÈME"],
];

/** En-tête de section pour un chemin sans lien de menu correspondant. */
export function sectionParChemin(pathname: string, table: [string, string][] = SECTION_PAR_PREFIXE): string | null {
    return table
        .filter(([prefix]) => pathname === prefix || pathname.startsWith(prefix + "/"))
        .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ?? null;
}

export function ordonnerMenu<T extends EntreeMenu>(entrees: T[], activeHref: string | null, filtre = "", pathname?: string): { visibles: T[]; enTeteActif: T | null } {
    const sections = entrees.reduce<T[][]>((acc, item) => {
        if (item.header !== undefined) acc.push([item]);
        else acc[acc.length - 1]?.push(item);
        return acc;
    }, []);
    // Section active : celle du lien actif, sinon celle déduite du chemin
    // (écrans hors menu), pour que chaque module remonte sa famille en tête.
    const enTeteDeduit = pathname ? sectionParChemin(pathname) : null;
    const sectionActive =
        (activeHref ? sections.find((sec) => sec.some((i) => i.href === activeHref)) : null)
        ?? (enTeteDeduit ? sections.find((sec) => sec[0].header === enTeteDeduit) : null)
        ?? null;
    const ordonnees = sectionActive ? [sectionActive, ...sections.filter((sec) => sec !== sectionActive)] : sections;
    const q = normaliserTexte(filtre.trim());
    const visibles = q
        ? ordonnees.reduce<T[]>((acc, sec) => {
            const [header, ...liens] = sec;
            const retenus = liens.filter((i) => normaliserTexte(i.label ?? "").includes(q));
            if (retenus.length) acc.push(header, ...retenus);
            return acc;
        }, [])
        : ordonnees.flat();
    return { visibles, enTeteActif: sectionActive?.[0] ?? null };
}
