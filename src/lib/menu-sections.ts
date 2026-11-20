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
    ["/emails", "PILOTAGE & CABINET"], ["/inbox", "PILOTAGE & CABINET"], ["/workflows", "PILOTAGE & CABINET"], ["/procedures", "PILOTAGE & CABINET"],
    ["/management", "PILOTAGE & CABINET"], ["/expenses", "PILOTAGE & CABINET"], ["/expense-notes", "PILOTAGE & CABINET"],
    ["/signature", "PILOTAGE & CABINET"], ["/writing", "PILOTAGE & CABINET"], ["/annuaire", "PILOTAGE & CABINET"],
    ["/presentation", "PILOTAGE & CABINET"], ["/preparation", "PILOTAGE & CABINET"], ["/benchmarking", "PILOTAGE & CABINET"],
    // Expertise & production
    ["/payroll", "EXPERTISE & PRODUCTION"], ["/fiscalite", "EXPERTISE & PRODUCTION"], ["/comptabilite", "EXPERTISE & PRODUCTION"], ["/production", "EXPERTISE & PRODUCTION"], ["/liasse-fiscale", "EXPERTISE & PRODUCTION"],
    ["/fec-export", "EXPERTISE & PRODUCTION"], ["/declarations", "EXPERTISE & PRODUCTION"], ["/scan", "EXPERTISE & PRODUCTION"],
    ["/ingest", "EXPERTISE & PRODUCTION"], ["/bank-reconciliation", "EXPERTISE & PRODUCTION"], ["/reporting", "EXPERTISE & PRODUCTION"],
    ["/simulator", "EXPERTISE & PRODUCTION"], ["/industries", "EXPERTISE & PRODUCTION"], ["/data", "EXPERTISE & PRODUCTION"],
    ["/data-center", "EXPERTISE & PRODUCTION"], ["/diagnostic", "EXPERTISE & PRODUCTION"],
    // Audit & conformité
    ["/conformite", "AUDIT & CONFORMITÉ"], ["/audit-forensique", "AUDIT & CONFORMITÉ"], ["/audit-legal", "AUDIT & CONFORMITÉ"], ["/compliance", "AUDIT & CONFORMITÉ"],
    ["/kyc", "AUDIT & CONFORMITÉ"], ["/expert-judiciaire", "AUDIT & CONFORMITÉ"], ["/legal", "AUDIT & CONFORMITÉ"],
    ["/corporate/audit-assurance", "AUDIT & CONFORMITÉ"], ["/corporate/legal-archive", "AUDIT & CONFORMITÉ"],
    ["/audit/circularisation", "AUDIT & CONFORMITÉ"], ["/audit/rapport-cac", "AUDIT & CONFORMITÉ"],
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
    ["/admin", "PLATEFORME & ÉCOSYSTÈME"], ["/cabinet-indisponible", "PLATEFORME & ÉCOSYSTÈME"],
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

// ─────────────────────────────────────────────────────────────────────────────
// Sous-menu contextuel : les écrans du module en cours
// ─────────────────────────────────────────────────────────────────────────────
export type EntreeSousMenu = { label: string; href: string };

/**
 * Pages de chaque module, affichées sous l'entrée active de la barre
 * latérale quand on navigue dans ce module. Sur /etats-financiers/tft on
 * voit ainsi Synthèse, Import balance, Bilan, Résultat, TFT, Paramètres —
 * la barre ne se contentait jusqu'ici d'une seule entrée par module.
 * Clé = préfixe d'URL du module (le plus long l'emporte).
 */
export const SOUS_MENUS: Record<string, EntreeSousMenu[]> = {
    "/etats-financiers": [
        { label: "Import balance", href: "/etats-financiers/import" },
        { label: "Bilan", href: "/etats-financiers/bilan" }, { label: "Compte de résultat", href: "/etats-financiers/resultat" },
        { label: "Flux de trésorerie (TFT)", href: "/etats-financiers/tft" }, { label: "Paramètres", href: "/etats-financiers/config" },
    ],
    "/comptabilite": [
        { label: "Production & révision", href: "/comptabilite/production" },
        { label: "Révision", href: "/comptabilite/revision" },
        { label: "Comptabilité auxiliaire", href: "/comptabilite/auxiliaire" },
        { label: "Système Minimal (SMT)", href: "/comptabilite/smt" },
        { label: "Caisse & Billetage", href: "/comptabilite/caisse" },
        { label: "Rapprochement bancaire", href: "/comptabilite/rapprochement-bancaire" },
        { label: "Stocks & Inventaire", href: "/comptabilite/stocks" },
        { label: "Tableau de bord PME", href: "/comptabilite/tableau-bord-pme" },
        { label: "Liasse fiscale", href: "/comptabilite/liasse-fiscale" }, { label: "Reporting", href: "/comptabilite/reporting" },
        { label: "Rapport santé", href: "/comptabilite/health-report" }, { label: "Scores santé", href: "/comptabilite/health-scores" },
    ],
    "/comptabilite/tpe-dashboard": [
        { label: "Abonnés TPE", href: "/comptabilite/tpe-dashboard" }, { label: "Usine de traitement", href: "/comptabilite/tpe-processing" },
        { label: "Saisie informel", href: "/comptabilite/informel" }, { label: "Hub WhatsApp", href: "/dashboard/whatsapp-bot" },
    ],
    "/comptabilite/tpe-processing": [
        { label: "Abonnés TPE", href: "/comptabilite/tpe-dashboard" }, { label: "Usine de traitement", href: "/comptabilite/tpe-processing" },
        { label: "Saisie informel", href: "/comptabilite/informel" }, { label: "Hub WhatsApp", href: "/dashboard/whatsapp-bot" },
    ],
    "/dashboard/whatsapp-bot": [
        { label: "Abonnés TPE", href: "/comptabilite/tpe-dashboard" }, { label: "Usine de traitement", href: "/comptabilite/tpe-processing" },
        { label: "Saisie informel", href: "/comptabilite/informel" }, { label: "Hub WhatsApp", href: "/dashboard/whatsapp-bot" },
    ],
    "/comptabilite/informel": [
        { label: "Abonnés TPE", href: "/comptabilite/tpe-dashboard" }, { label: "Usine de traitement", href: "/comptabilite/tpe-processing" },
        { label: "Saisie informel", href: "/comptabilite/informel" }, { label: "Hub WhatsApp", href: "/dashboard/whatsapp-bot" },
    ],
    "/clients": [
        { label: "Portefeuille", href: "/clients" }, { label: "Nouveau dossier", href: "/clients/new" }, { label: "Scoring", href: "/clients/scoring" },
    ],
    "/missions": [
        { label: "Missions", href: "/missions" }, { label: "Nouvelle mission", href: "/missions/new" }, { label: "Planning", href: "/missions/planning" },
        { label: "Budget", href: "/missions/budget" }, { label: "Boni / mali", href: "/missions/boni-mali" }, { label: "Feuilles de temps", href: "/missions/timesheets" },
        { label: "Sizing & Budget Prédictif", href: "/missions/budget-sentinel" },
    ],
    "/payroll": [
        { label: "Bulletins de paie", href: "/payroll" },
        { label: "Anomalies Paie IA", href: "/payroll/anomaly-detection" },
        { label: "Cadrage Paie vs Comptabilité", href: "/payroll/cadrage" },
        { label: "Indemnités & Solde de Tout Compte", href: "/payroll/indemnites" },
        { label: "Déclarations sociales", href: "/declarations" },
    ],
    "/billing": [
        { label: "Factures", href: "/billing" }, { label: "Nouvelle facture", href: "/billing/new" }, { label: "Relances", href: "/billing/relances" },
    ],
    "/lettres-mission": [
        { label: "Lettres de mission", href: "/lettres-mission" }, { label: "Nouvelle lettre", href: "/lettres-mission/new" }, { label: "Signature", href: "/signature/lettres-mission" },
    ],
    "/signature": [
        { label: "Lettres de mission", href: "/lettres-mission" }, { label: "Signature", href: "/signature/lettres-mission" },
    ],
    "/fiscalite": [
        { label: "Fiscalité", href: "/fiscalite" }, { label: "Obligations", href: "/fiscalite/obligations" },
        { label: "Optimisation", href: "/fiscalite/optimization" }, { label: "Dépôt de pièces", href: "/fiscalite/drop-zone" },
        { label: "Cadrage TVA", href: "/fiscalite/cadrage-tva" },
        { label: "Matrice des Risques Fiscaux", href: "/fiscalite/matrice-risques" },
        { label: "Résultat Fiscal (IS)", href: "/fiscalite/resultat-fiscal" },
        { label: "Déficits reportables IS", href: "/fiscalite/deficits-reportables" },
        { label: "Conventions internationales", href: "/fiscalite/conventions" },
        { label: "Export FEC", href: "/fiscalite/fec" },
        { label: "Attestations BRS", href: "/fiscalite/attestation-brs" },
        { label: "Quittances OCR", href: "/fiscalite/quittance-ocr" },
        { label: "Simulateur Loi de Finances", href: "/fiscalite/loi-finances" },
        { label: "Déclarations", href: "/declarations" }, { label: "E-dépôt", href: "/declarations/e-depot" },
    ],
    "/declarations": [
        { label: "Déclarations", href: "/declarations" }, { label: "E-dépôt", href: "/declarations/e-depot" }, { label: "Fiscalité", href: "/fiscalite" },
    ],
    "/documents": [
        { label: "GED", href: "/documents" }, { label: "Génération", href: "/documents/generation" }, { label: "Scan OCR", href: "/scan" },
    ],
    "/scan": [
        { label: "GED", href: "/documents" }, { label: "Scan OCR", href: "/scan" },
    ],
    "/banking": [
        { label: "Banque & lettrage", href: "/banking" }, { label: "Import de flux", href: "/ingest/connectors" },
    ],
    "/ingest": [
        { label: "Ingestion", href: "/ingest" }, { label: "Connecteurs", href: "/ingest/connectors" }, { label: "Banque & lettrage", href: "/banking" },
    ],
    "/audit": [
        { label: "Détection de fraude", href: "/audit/fraud-detection" }, { label: "Audit légal IA", href: "/audit-legal" }, { label: "Suite CAC", href: "/audit/cac-suite" },
        { label: "Dossier de travail", href: "/audit/dossier-travail" }, { label: "Missions d'audit", href: "/audit/missions" },
        { label: "Immobilisations", href: "/audit/fixed-assets" },
        { label: "Risques IA", href: "/audit/ia-risks" }, { label: "Kit de préparation", href: "/audit/prep-kit" },
        { label: "Circularisation ISA 505", href: "/audit/circularisation" },
        { label: "Rapports CAC (ISA 700)", href: "/audit/rapport-cac" },
    ],
    "/compliance": [
        { label: "Hub conformité", href: "/compliance" }, { label: "Tableau de bord OHADA", href: "/conformite/dashboard" }, { label: "KYC / LCB-FT", href: "/compliance/kyc-screening" }, { label: "Dossiers KYC", href: "/compliance/kyc" },
        { label: "Vérification d'identité", href: "/compliance/id-verify" }, { label: "Score UEMOA", href: "/compliance/uemoa-score" },
        { label: "Criminalité financière", href: "/compliance/financial-crime" }, { label: "Contrôle fiscal", href: "/compliance/tax-audit" }, { label: "Douanes", href: "/compliance/customs" },
        { label: "Carte des risques", href: "/compliance/governance/heatmap" },
    ],
    "/governance": [
        { label: "Gouvernance & AG", href: "/governance" }, { label: "Carte des risques", href: "/compliance/governance/heatmap" },
    ],
    "/legal": [
        { label: "Rédaction d'actes", href: "/legal/drafting" },
        { label: "Générateur AGOA", href: "/legal/ag-generator" },
        { label: "Recouvrement AUPSRVE", href: "/legal/recouvrement" },
    ],
    "/strategy": [
        { label: "Business plan", href: "/strategy/business-plan" }, { label: "Radar fiscal", href: "/strategy/radar" }, { label: "Zone franche", href: "/strategy/zone-franche" },
        { label: "Multi-devises", href: "/strategy/devises" }, { label: "Simulateur", href: "/strategy/simulator" }, { label: "Miroir fiscal", href: "/strategy/fiscal-mirror" },
        { label: "Levée de fonds", href: "/strategy/fundraising" }, { label: "Patrimoine", href: "/strategy/wealth" },
    ],
    "/analysis": [
        { label: "Analyse financière", href: "/analysis/financial" }, { label: "Radar santé", href: "/analysis/financial/health-radar" },
        { label: "Stress test", href: "/analysis/financial/stress-simulator" }, { label: "Prévision de trésorerie", href: "/analysis/cash-forecast" },
        { label: "Trésorerie prédictive", href: "/analysis/cash-flow-predictive" }, { label: "Rentabilité", href: "/analysis/profitability" },
        { label: "Simulateur d'impôt", href: "/analysis/tax-simulator" }, { label: "Tiers", href: "/analysis/tiers" },
        { label: "Radar clients", href: "/analysis/clients/radar" }, { label: "Investigation", href: "/analysis/deep" },
        { label: "War room", href: "/analysis/deep/war-room" }, { label: "Credit insights", href: "/analysis/credit-insights" },
    ],
    "/valorisation": [
        { label: "Valorisation", href: "/valorisation" }, { label: "Transmission", href: "/valorisation/transmission" },
    ],
    "/corporate": [
        { label: "Consolidation", href: "/corporate/consolidation" }, { label: "Entity hub", href: "/corporate/entity-hub" },
        { label: "Performance", href: "/corporate/performance" }, { label: "Audit & assurance", href: "/corporate/audit-assurance" }, { label: "Archives juridiques", href: "/corporate/legal-archive" },
    ],
    "/fintech": [
        { label: "Paiements", href: "/fintech/payments" }, { label: "Mobile Money", href: "/fintech/mobile-money" },
        { label: "Dossier crédit", href: "/fintech/credit" }, { label: "Scoring", href: "/fintech/scoring" }, { label: "Marketplace", href: "/fintech/marketplace" },
    ],
    "/mobile-money": [
        { label: "Mobile Money", href: "/mobile-money" }, { label: "Paiements", href: "/fintech/payments" },
    ],
    "/douanes": [
        { label: "Simulateur douanier", href: "/douanes/simulateur" }, { label: "Douanes & conformité", href: "/compliance/customs" },
    ],
    "/nexus": [
        { label: "Assistant", href: "/assistant" }, { label: "Chat", href: "/nexus/chat" },
        { label: "WhatsApp", href: "/nexus/whatsapp" }, { label: "Nexus fiscal", href: "/nexus-fiscal" }, { label: "Rédaction juridique", href: "/legal/drafting" },
    ],
    "/assistant": [
        { label: "Assistant", href: "/assistant" }, { label: "Co-counsel", href: "/assistant/cocounsel" },
    ],
    "/library": [
        { label: "Bibliothèque", href: "/library" }, { label: "OHADA cité", href: "/library/ohada-cite" }, { label: "Banque de clauses", href: "/library/clause-bank" },
    ],
    "/training": [
        { label: "Academy", href: "/training/academy" }, { label: "Catalogue", href: "/training/catalog" }, { label: "Cours", href: "/training/courses" },
        { label: "Quiz", href: "/training/quiz" }, { label: "Certificats", href: "/training/certificates" }, { label: "Parcours", href: "/training/roadmaps" },
        { label: "Formateurs", href: "/training/instructors" }, { label: "Communauté", href: "/training/community" },
    ],
    "/settings": [
        { label: "Paramètres", href: "/settings" }, { label: "Administration", href: "/settings/admin" }, { label: "Sécurité", href: "/settings/security" },
        { label: "Moteur IA", href: "/settings/ai" }, { label: "Clés API", href: "/settings/api-keys" },
    ],
    "/documentation": [
        { label: "Documentation", href: "/documentation" }, { label: "Manuel", href: "/documentation/manuel" }, { label: "Manuel complet", href: "/documentation/full-manual" },
        { label: "Notes de version", href: "/documentation/release-notes" }, { label: "Brochure", href: "/documentation/brochure" }, { label: "Pack de bienvenue", href: "/documentation/welcome-pack" },
    ],
    "/dashboard": [
        { label: "Hub des modules", href: "/bi" }, { label: "Exécutif", href: "/dashboard/executive" }, { label: "Associé", href: "/dashboard/partner" },
        { label: "Brief du matin", href: "/dashboard/morning-brief" }, { label: "Confidentiel", href: "/dashboard/confidentiel" },
    ],
    "/management": [
        { label: "Pilotage cabinet", href: "/management/practice" }, { label: "Contrôle de gestion", href: "/management/controlling" }, { label: "Capacité", href: "/management/capacity-planning" },
    ],
    "/production": [
        { label: "Production comptable", href: "/comptabilite/production" }, { label: "Tableau de bord", href: "/production/dashboard" }, { label: "Planning", href: "/production/planning" }, { label: "Analytique", href: "/production/analytics" },
    ],
    "/collaboration": [
        { label: "Requêtes", href: "/collaboration/requests" }, { label: "Triage", href: "/collaboration/triage" }, { label: "Espaces de travail", href: "/collaboration/workspaces" },
    ],
    "/supervision": [
        { label: "Supervision", href: "/supervision" }, { label: "Chronologie", href: "/supervision/timeline" },
    ],
    "/onboarding": [
        { label: "Onboarding", href: "/onboarding" }, { label: "Onboarding digital", href: "/onboarding/digital" },
    ],
};

/** Sous-menu du module contenant `pathname` (préfixe le plus long), sinon null. */
export function sousMenuPour(pathname: string): { module: string; entrees: EntreeSousMenu[] } | null {
    const prefixe = Object.keys(SOUS_MENUS)
        .filter((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"))
        .sort((a, b) => b.length - a.length)[0];
    return prefixe ? { module: prefixe, entrees: SOUS_MENUS[prefixe] } : null;
}

/** Entrée du sous-menu correspondant à `pathname` (exacte, sinon préfixe le plus long). */
export function entreeSousMenuActive(entrees: EntreeSousMenu[], pathname: string): string | null {
    const exacte = entrees.find((e) => e.href === pathname);
    if (exacte) return exacte.href;
    // Par préfixe, sans la racine du module : sur /etats-financiers/print/bilan,
    // « Synthèse » (/etats-financiers) ne doit pas s'allumer.
    const racine = [...entrees].sort((a, b) => a.href.length - b.href.length)[0]?.href;
    return entrees
        .filter((e) => e.href !== racine && pathname.startsWith(e.href + "/"))
        .sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null;
}
