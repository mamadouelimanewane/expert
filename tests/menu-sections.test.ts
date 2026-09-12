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
