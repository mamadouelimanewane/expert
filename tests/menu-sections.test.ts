import { describe, expect, it } from "vitest";
import { hrefActif, ordonnerMenu } from "@/lib/menu-sections";

const MENU = [
    { header: "PILOTAGE & CABINET" },
    { label: "Hub des modules", href: "/bi" },
    { label: "Clients (CRM 360°)", href: "/clients" },
    { header: "EXPERTISE & PRODUCTION" },
    { label: "Production & Révision", href: "/comptabilite/production" },
    { label: "Liasse Fiscale Auto", href: "/comptabilite/liasse-fiscale" },
    { label: "Fiscalité & Simulateur", href: "/fiscalite" },
    { header: "AUDIT & CONFORMITÉ" },
    { label: "Audit & CAC (FEC)", href: "/audit" },
    { label: "Audit Légal IA", href: "/audit/ai-assisted" },
];
const entetes = (l: typeof MENU) => l.filter((i) => i.header).map((i) => i.header);

describe("hrefActif", () => {
    it("retient le préfixe le plus long", () => {
        expect(hrefActif(MENU, "/audit/ai-assisted")).toBe("/audit/ai-assisted");
        expect(hrefActif(MENU, "/audit/fraud")).toBe("/audit");
        expect(hrefActif(MENU, "/clients/697a1ee4ff1c1106cbf92b04")).toBe("/clients");
        expect(hrefActif(MENU, "/inconnu")).toBeNull();
    });
});

describe("ordonnerMenu — section de l'écran ouvert en tête", () => {
    it("place « Expertise & Production » en premier sur /comptabilite/production", () => {
        const { visibles, enTeteActif } = ordonnerMenu(MENU, "/comptabilite/production");
        expect(entetes(visibles)).toEqual(["EXPERTISE & PRODUCTION", "PILOTAGE & CABINET", "AUDIT & CONFORMITÉ"]);
        expect(visibles[0].header).toBe("EXPERTISE & PRODUCTION");
        expect(visibles[1].label).toBe("Production & Révision");
        expect(enTeteActif?.header).toBe("EXPERTISE & PRODUCTION");
        expect(visibles).toHaveLength(MENU.length);
    });
    it("conserve l'ordre d'origine sans écran actif", () => {
        const { visibles, enTeteActif } = ordonnerMenu(MENU, null);
        expect(visibles).toEqual(MENU);
        expect(enTeteActif).toBeNull();
    });
    it("garde l'ordre interne des autres sections", () => {
        const { visibles } = ordonnerMenu(MENU, "/audit");
        expect(entetes(visibles)).toEqual(["AUDIT & CONFORMITÉ", "PILOTAGE & CABINET", "EXPERTISE & PRODUCTION"]);
        expect(visibles.map((i) => i.label ?? i.header)).toEqual(["AUDIT & CONFORMITÉ", "Audit & CAC (FEC)", "Audit Légal IA", "PILOTAGE & CABINET", "Hub des modules", "Clients (CRM 360°)", "EXPERTISE & PRODUCTION", "Production & Révision", "Liasse Fiscale Auto", "Fiscalité & Simulateur"]);
    });
    it("filtre sans accents en gardant l'en-tête de section, section active d'abord", () => {
        const { visibles } = ordonnerMenu(MENU, "/audit", "fisc");
        expect(visibles.map((i) => i.label ?? i.header)).toEqual(["EXPERTISE & PRODUCTION", "Liasse Fiscale Auto", "Fiscalité & Simulateur"]);
        expect(ordonnerMenu(MENU, null, "zzz").visibles).toEqual([]);
    });
});

import { readdirSync, statSync } from "fs";
import { join } from "path";
import { SECTION_PAR_PREFIXE, sectionParChemin } from "@/lib/menu-sections";

const MENU_COMPLET_HREFS = ["/bi","/clients","/missions","/agenda","/timesheets","/billing","/lettres-mission","/supervision/timeline","/comptabilite/production","/comptabilite/liasse-fiscale","/etats-financiers","/fiscalite","/payroll","/documents","/banking","/audit","/audit/ai-assisted","/compliance/kyc-screening","/governance","/comptabilite/health-report","/strategy/business-plan","/strategy/radar","/strategy/zone-franche","/investment","/strategy/devises","/accompagnement/entreprenant","/douanes/simulateur","/comptabilite/tpe-dashboard","/comptabilite/tpe-processing","/dashboard/whatsapp-bot","/mobile-money","/fintech/payments","/fintech/credit","/fintech/scoring","/assistant","/nexus-go","/library","/settings/ai","/onboarding","/portal/tpe-client","/settings/api-keys","/plan"].map((href) => ({ label: href, href }));
const SECTIONS = ["PILOTAGE & CABINET", "EXPERTISE & PRODUCTION", "AUDIT & CONFORMITÉ", "STRATÉGIE & CONSEIL", "TPE, DOUANES & FINTECH", "NEXUS INTELLIGENCE", "PLATEFORME & ÉCOSYSTÈME"];

function pages(dir: string, base = ""): string[] {
    const out: string[] = [];
    for (const e of readdirSync(dir)) {
        const p = join(dir, e);
        if (statSync(p).isDirectory()) out.push(...pages(p, base + "/" + e));
        else if (e === "page.tsx") out.push(base || "/");
    }
    return out;
}

describe("sectionParChemin — écrans hors menu", () => {
    it("choisit le préfixe le plus long", () => {
        expect(sectionParChemin("/comptabilite/informel")).toBe("TPE, DOUANES & FINTECH");
        expect(sectionParChemin("/comptabilite/revision")).toBe("EXPERTISE & PRODUCTION");
        expect(sectionParChemin("/corporate/audit-assurance")).toBe("AUDIT & CONFORMITÉ");
        expect(sectionParChemin("/corporate/consolidation")).toBe("STRATÉGIE & CONSEIL");
        expect(sectionParChemin("/portal/x")).toBeNull();
    });
    it("ne référence que des sections existantes", () => {
        for (const [, section] of SECTION_PAR_PREFIXE) expect(SECTIONS).toContain(section);
    });
    it("couvre chaque écran de l'application (hors portail, login, hub)", () => {
        const ecrans = pages(join(process.cwd(), "src/app"))
            .filter((p) => !p.startsWith("/api") && !p.startsWith("/portal") && !["/", "/login", "/bi"].includes(p))
            .map((p) => p.replace(/\/\[[^\]]+\]/g, "/x"));
        const orphelins = ecrans.filter((p) => !hrefActif(MENU_COMPLET_HREFS, p) && !sectionParChemin(p));
        expect(ecrans.length).toBeGreaterThan(150);
        expect(orphelins).toEqual([]);
    });
    it("remonte la section déduite quand l'écran n'est pas dans le menu", () => {
        const { visibles, enTeteActif } = ordonnerMenu(MENU, null, "", "/comptabilite/revision");
        expect(enTeteActif?.header).toBe("EXPERTISE & PRODUCTION");
        expect(visibles[0].header).toBe("EXPERTISE & PRODUCTION");
    });
});

import { SOUS_MENUS, sousMenuPour, entreeSousMenuActive } from "@/lib/menu-sections";

describe("sous-menu contextuel du module", () => {
    it("propose les pages des états financiers sur /etats-financiers/tft, TFT active", () => {
        const sm = sousMenuPour("/etats-financiers/tft");
        expect(sm?.module).toBe("/etats-financiers");
        expect(sm?.entrees.map((e) => e.label)).toEqual(["Synthèse", "Import balance", "Bilan", "Compte de résultat", "Flux de trésorerie (TFT)", "Paramètres"]);
        expect(entreeSousMenuActive(sm!.entrees, "/etats-financiers/tft")).toBe("/etats-financiers/tft");
        expect(entreeSousMenuActive(sm!.entrees, "/etats-financiers")).toBe("/etats-financiers");
        expect(entreeSousMenuActive(sm!.entrees, "/etats-financiers/print/bilan")).toBeNull();
    });
    it("prend le préfixe le plus long (TPE sous /comptabilite)", () => {
        expect(sousMenuPour("/comptabilite/tpe-processing")?.module).toBe("/comptabilite/tpe-processing");
        expect(sousMenuPour("/comptabilite/revision")?.module).toBe("/comptabilite");
        expect(sousMenuPour("/clients/697a1ee4ff1c1106cbf92b04")?.module).toBe("/clients");
        expect(sousMenuPour("/bi")).toBeNull();
    });
    it("chaque page de sous-menu existe réellement dans src/app", () => {
        const ecrans = new Set(pages(join(process.cwd(), "src/app")).filter((p) => !p.startsWith("/api")));
        const manquantes = Object.values(SOUS_MENUS).flat().map((e) => e.href).filter((h) => !ecrans.has(h));
        expect(manquantes).toEqual([]);
    });
});

describe("liens du menu latéral", () => {
    it("pointent tous sur une page existante (les liens morts Suivi Transitaire et Traduction ont été retirés)", () => {
        const ecrans = new Set(pages(join(process.cwd(), "src/app")).filter((p) => !p.startsWith("/api")).map((p) => p.replace(/\/\[[^\]]+\]/g, "/x")));
        const morts = MENU_COMPLET_HREFS.map((e) => e.href).filter((h) => !ecrans.has(h) && !ecrans.has(h.replace(/\/[^/]+$/, "/x")));
        expect(morts).toEqual([]);
    });
});
