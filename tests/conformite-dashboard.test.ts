import { describe, it, expect } from "vitest";
import {
    calculerEcheancesMois,
    calculerScore,
    genererTableauBord,
    genererRapportConformite,
} from "@/lib/ohada/conformite-dashboard";

describe("Tableau de bord de conformité OHADA / UEMOA", () => {
    it("génère les échéances pour le Sénégal avec les obligations applicables", () => {
        // Référence le 1er janvier 2025
        const dateRef = new Date(2025, 0, 1);
        const echeances = calculerEcheancesMois("SN", 2025, 1, [], dateRef);

        expect(echeances.length).toBeGreaterThan(0);
        expect(echeances.some((e) => e.obligationId === "tva-mensuelle")).toBe(true);
        expect(echeances.some((e) => e.obligationId === "ipres-css")).toBe(true);
    });

    it("passe les obligations déposées en statut DEPOSE", () => {
        const dateRef = new Date(2025, 0, 1);
        const deposees = ["tva-mensuelle"];
        const echeances = calculerEcheancesMois("SN", 2025, 1, deposees, dateRef);

        const tva = echeances.find((e) => e.obligationId === "tva-mensuelle");
        expect(tva?.statut).toBe("DEPOSE");
    });

    it("détecte le statut EN_RETARD et PENALITE selon la date de référence", () => {
        // Date de référence au 25 janvier 2025 (après l'échéance du 15)
        const dateRefRetard = new Date(2025, 0, 25);
        const echeances = calculerEcheancesMois("SN", 2025, 1, [], dateRefRetard);

        const tva = echeances.find((e) => e.obligationId === "tva-mensuelle");
        expect(tva?.statut).toBe("EN_RETARD");
        expect(tva?.penaliteEstimee).toBeGreaterThan(0);

        // Date de référence 40 jours après l'échéance (retard critique > 30j)
        const dateRefPenalite = new Date(2025, 1, 28);
        const echeancesCritiques = calculerEcheancesMois("SN", 2025, 1, [], dateRefPenalite);
        const tvaCritique = echeancesCritiques.find((e) => e.obligationId === "tva-mensuelle");
        expect(tvaCritique?.statut).toBe("PENALITE");
    });

    it("calcule un score maximal lorsque toutes les déclarations sont déposées", () => {
        const dateRef = new Date(2025, 0, 10);
        // D'abord récupérer la liste de toutes les obligations applicables
        const echeancesBase = calculerEcheancesMois("SN", 2025, 1, [], dateRef);
        const toutesDeposees = echeancesBase.map((e) => e.obligationId);

        const echeances = calculerEcheancesMois("SN", 2025, 1, toutesDeposees, dateRef);
        const score = calculerScore(echeances);

        expect(score.global).toBe(100);
        expect(score.detail.depose).toBe(echeances.length);
        expect(score.detail.enRetard).toBe(0);
    });

    it("construit le tableau de bord global et produit un rapport textuel complet", () => {
        const dateRef = new Date(2025, 0, 10);
        const tb = genererTableauBord("SN", 2025, 1, ["ipres-css"], dateRef);

        expect(tb.pays).toBe("SN");
        expect(tb.score.global).toBeGreaterThan(0);
        expect(tb.echeances.length).toBeGreaterThan(0);

        const rapport = genererRapportConformite(tb);
        expect(rapport).toContain("AUDIT DE CONFORMITÉ FISCALE & SOCIALE");
        expect(rapport).toContain("Juridiction : SN");
    });
});
