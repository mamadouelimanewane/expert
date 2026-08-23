import { describe, expect, it } from "vitest";
import {
    LIBELLE_CONFORMITE,
    obligationsLegalesPourPays,
    OBLIGATIONS_LEGALES,
    type EtatConformite,
} from "@/lib/ohada/obligations-legales";

describe("référentiel des obligations légales", () => {
    it("attribue un identifiant unique à chaque obligation", () => {
        const ids = OBLIGATIONS_LEGALES.map((o) => o.id);
        expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
    });

    it("cite un article pour chaque obligation", () => {
        const sansArticle = OBLIGATIONS_LEGALES.filter((o) => !o.article?.trim());
        expect(sansArticle.map((o) => o.id)).toEqual([]);
    });

    // Une obligation sans piece probante n'est pas verifiable : le collaborateur
    // ne saurait pas quoi demander au client.
    it("indique la pièce probante attendue pour chaque obligation", () => {
        const sansPiece = OBLIGATIONS_LEGALES.filter((o) => !o.pieceProbante?.trim());
        expect(sansPiece.map((o) => o.id)).toEqual([]);
    });

    it("décrit chaque obligation", () => {
        const sansDescription = OBLIGATIONS_LEGALES.filter((o) => o.description.length < 30);
        expect(sansDescription.map((o) => o.id)).toEqual([]);
    });

    it("n'emploie que des sources connues", () => {
        const sources = new Set(["OHADA", "CGI", "UEMOA", "SOCIAL"]);
        for (const o of OBLIGATIONS_LEGALES) {
            expect(sources.has(o.source), `${o.id} → ${o.source}`).toBe(true);
        }
    });

    it("couvre les obligations OHADA structurantes", () => {
        const ids = OBLIGATIONS_LEGALES.map((o) => o.id);
        for (const attendu of ["depot-comptes", "livres-obligatoires", "assemblee-generale", "rccm"]) {
            expect(ids, attendu).toContain(attendu);
        }
    });

    // Le catalogue ne doit porter aucun verdict : c'etait precisement le defaut
    // de la version precedente, qui affichait « Risque » par defaut.
    it("ne comporte aucun état de conformité prédéfini", () => {
        for (const o of OBLIGATIONS_LEGALES) {
            expect(Object.keys(o)).not.toContain("etat");
            expect(Object.keys(o)).not.toContain("complianceStatus");
        }
    });
});

describe("filtrage par pays", () => {
    it("renvoie les obligations de portée générale pour tout pays OHADA", () => {
        for (const pays of ["SN", "CI", "CM", "BJ"]) {
            expect(obligationsLegalesPourPays(pays).length).toBeGreaterThan(0);
        }
    });

    it("ignore la casse et les espaces", () => {
        expect(obligationsLegalesPourPays(" sn ").length).toBe(obligationsLegalesPourPays("SN").length);
    });

    it("conserve les obligations sans restriction de pays", () => {
        const generales = OBLIGATIONS_LEGALES.filter((o) => !o.pays);
        for (const o of generales) {
            expect(obligationsLegalesPourPays("SN").map((x) => x.id)).toContain(o.id);
        }
    });
});

describe("états de conformité", () => {
    it("libelle chacun des quatre états", () => {
        const etats: EtatConformite[] = ["CONFORME", "ALERTE", "RISQUE", "NON_EVALUE"];
        for (const e of etats) {
            expect(LIBELLE_CONFORMITE[e], e).toBeTruthy();
        }
    });

    // « Non évalué » doit rester distinct de « conforme » : c'est ce qui empeche
    // de lire une absence de verification comme une validation.
    it("distingue « non évalué » de « conforme »", () => {
        expect(LIBELLE_CONFORMITE.NON_EVALUE).not.toBe(LIBELLE_CONFORMITE.CONFORME);
        expect(LIBELLE_CONFORMITE.NON_EVALUE.toLowerCase()).toContain("non");
    });
});
