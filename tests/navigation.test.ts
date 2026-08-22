import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { SECTIONS_NAVIGATION, TOUS_LES_ECRANS } from "@/lib/navigation/routes";

// ─────────────────────────────────────────────────────────────────────────────
// Garde-fou de navigation.
//
// 131 des 213 écrans n'étaient atteignables qu'en saisissant leur URL : aucun
// lien ne pointait vers eux depuis l'interface. La page /plan les inventorie
// tous, mais cet inventaire est engendré et se périmerait au premier écran
// ajouté. Ces tests échouent alors, avec la commande de régénération.
// ─────────────────────────────────────────────────────────────────────────────

const APP = path.resolve(__dirname, "../src/app");

function listerEcrans(dir: string, base = ""): string[] {
    const routes: string[] = [];

    for (const entree of fs.readdirSync(dir, { withFileTypes: true })) {
        const complet = path.join(dir, entree.name);

        if (entree.isDirectory()) {
            routes.push(...listerEcrans(complet, `${base}/${entree.name}`));
        } else if (entree.name === "page.tsx") {
            routes.push(base || "/");
        }
    }

    return routes;
}

/** Écrans réellement présents sur le disque, hors routes dynamiques. */
const ECRANS_SUR_DISQUE = listerEcrans(APP)
    .filter((r) => !r.includes("["))
    .sort();

const INVENTORIES = TOUS_LES_ECRANS.map((e) => e.href).sort();

describe("inventaire des écrans", () => {
    it("couvre tous les écrans présents dans src/app", () => {
        const manquants = ECRANS_SUR_DISQUE.filter((r) => !INVENTORIES.includes(r));

        expect(
            manquants,
            `Écrans absents de l'inventaire. Régénérez-le : npm run routes:generate`
        ).toEqual([]);
    });

    it("ne référence aucun écran qui n'existe plus", () => {
        const fantomes = INVENTORIES.filter((r) => !ECRANS_SUR_DISQUE.includes(r));

        expect(
            fantomes,
            `Écrans inventoriés mais supprimés. Régénérez : npm run routes:generate`
        ).toEqual([]);
    });

    it("n'inventorie aucune route dynamique, qui exige un identifiant", () => {
        expect(INVENTORIES.filter((r) => r.includes("["))).toEqual([]);
    });
});

describe("cohérence de l'inventaire", () => {
    it("ne comporte aucun doublon", () => {
        const doublons = INVENTORIES.filter((r, i) => INVENTORIES.indexOf(r) !== i);
        expect(doublons).toEqual([]);
    });

    it("n'expose que des chemins absolus", () => {
        for (const ecran of TOUS_LES_ECRANS) {
            expect(ecran.href.startsWith("/"), ecran.href).toBe(true);
        }
    });

    it("attribue un libellé non vide à chaque écran", () => {
        const sansLibelle = TOUS_LES_ECRANS.filter((e) => !e.label?.trim());
        expect(sansLibelle).toEqual([]);
    });

    it("ne comporte aucune section vide", () => {
        const vides = SECTIONS_NAVIGATION.filter((s) => s.pages.length === 0);
        expect(vides).toEqual([]);
    });

    it("trie les sections par ordre alphabétique", () => {
        const noms = SECTIONS_NAVIGATION.map((s) => s.nom);
        expect(noms).toEqual([...noms].sort((a, b) => a.localeCompare(b, "fr")));
    });

    it("inventorie la page de plan elle-même", () => {
        expect(INVENTORIES).toContain("/plan");
    });
});

describe("atteignabilité", () => {
    it("rend atteignable chacun des écrans de l'application", () => {
        // C'est la propriété qui compte : plus aucun écran n'est accessible
        // uniquement par saisie manuelle de son URL.
        expect(INVENTORIES.length).toBe(ECRANS_SUR_DISQUE.length);
        expect(INVENTORIES).toEqual(ECRANS_SUR_DISQUE);
    });
});
