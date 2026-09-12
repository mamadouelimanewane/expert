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

export function ordonnerMenu<T extends EntreeMenu>(entrees: T[], activeHref: string | null, filtre = ""): { visibles: T[]; enTeteActif: T | null } {
    const sections = entrees.reduce<T[][]>((acc, item) => {
        if (item.header !== undefined) acc.push([item]);
        else acc[acc.length - 1]?.push(item);
        return acc;
    }, []);
    const sectionActive = activeHref ? sections.find((sec) => sec.some((i) => i.href === activeHref)) ?? null : null;
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
