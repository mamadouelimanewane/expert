import { describe, expect, it } from "vitest";
import {
    projeterTresorerie,
    detectCriticalPoints,
    retardMoyenReglement,
    type EncaissementAttendu,
} from "@/lib/forecast-engine";

const LE_1ER_MARS = new Date("2026-03-01T00:00:00.000Z");
const jours = (n: number) => new Date(LE_1ER_MARS.getTime() + n * 24 * 60 * 60 * 1000);

const SANS_MESURE = { retardMoyenJours: null };

describe("projeterTresorerie", () => {
    it("part du solde réel et ne bouge pas sans encaissement attendu", () => {
        // L'ancienne implémentation ajoutait 250 000 FCFA par semaine plus une
        // « volatilité » Math.sin(i) * 500000, sans aucune donnée du dossier.
        const points = projeterTresorerie(4_000_000, [], "realiste", SANS_MESURE, LE_1ER_MARS);

        expect(points).toHaveLength(13);
        expect(points.every((p) => p.cash === 4_000_000)).toBe(true);
    });

    it("place chaque encaissement sur la semaine de son échéance", () => {
        const encaissements: EncaissementAttendu[] = [
            { echeance: jours(10), montant: 1_000_000, enRetard: false },
            { echeance: jours(40), montant: 2_000_000, enRetard: false },
        ];
        const points = projeterTresorerie(0, encaissements, "optimiste", SANS_MESURE, LE_1ER_MARS);

        expect(points[0].cash).toBe(0);
        expect(points[1].cash).toBe(0);
        expect(points[2].cash).toBe(1_000_000); // jour 10 → semaine 2
        expect(points[6].cash).toBe(3_000_000); // jour 40 → semaine 6
        expect(points[12].cash).toBe(3_000_000);
    });

    it("décale les encaissements du retard moyen constaté", () => {
        const encaissements: EncaissementAttendu[] = [
            { echeance: jours(5), montant: 1_000_000, enRetard: false },
        ];
        const aLEcheance = projeterTresorerie(0, encaissements, "optimiste", SANS_MESURE, LE_1ER_MARS);
        const avecRetard = projeterTresorerie(0, encaissements, "realiste", { retardMoyenJours: 21 }, LE_1ER_MARS);

        expect(aLEcheance[1].cash).toBe(1_000_000);
        expect(avecRetard[1].cash).toBe(0);
        expect(avecRetard[4].cash).toBe(1_000_000); // 5 + 21 jours → semaine 4
    });

    it("exclut les créances déjà échues du scénario pessimiste", () => {
        const encaissements: EncaissementAttendu[] = [
            { echeance: jours(-30), montant: 5_000_000, enRetard: true },
            { echeance: jours(7), montant: 1_000_000, enRetard: false },
        ];
        const optimiste = projeterTresorerie(0, encaissements, "optimiste", SANS_MESURE, LE_1ER_MARS);
        const pessimiste = projeterTresorerie(0, encaissements, "pessimiste", SANS_MESURE, LE_1ER_MARS);

        expect(optimiste[12].cash).toBe(6_000_000);
        expect(pessimiste[12].cash).toBe(1_000_000);
    });

    it("attend une créance échue à partir d'aujourd'hui, sans la perdre dans le passé", () => {
        const encaissements: EncaissementAttendu[] = [
            { echeance: jours(-60), montant: 3_000_000, enRetard: true },
        ];
        const points = projeterTresorerie(0, encaissements, "optimiste", SANS_MESURE, LE_1ER_MARS);

        expect(points[12].cash).toBe(3_000_000);
    });

    it("ne reporte pas sur la dernière semaine un encaissement hors horizon", () => {
        const encaissements: EncaissementAttendu[] = [
            { echeance: jours(200), montant: 9_000_000, enRetard: false },
        ];
        const points = projeterTresorerie(1_000_000, encaissements, "optimiste", SANS_MESURE, LE_1ER_MARS);

        expect(points[12].cash).toBe(1_000_000);
    });

    it("ignore les montants illisibles au lieu de produire un NaN", () => {
        const encaissements = [
            { echeance: jours(7), montant: Number.NaN, enRetard: false },
            { echeance: "pas une date", montant: 500_000, enRetard: false },
            { echeance: jours(7), montant: 500_000, enRetard: false },
        ] as EncaissementAttendu[];
        const points = projeterTresorerie(0, encaissements, "optimiste", SANS_MESURE, LE_1ER_MARS);

        expect(points[12].cash).toBe(500_000);
    });
});

describe("detectCriticalPoints", () => {
    it("signale la première semaine de solde négatif", () => {
        const serie = [
            { week: 0, date: "2026-03-01", cash: 500_000 },
            { week: 1, date: "2026-03-08", cash: -200_000 },
            { week: 2, date: "2026-03-15", cash: -900_000 },
        ];
        expect(detectCriticalPoints(serie)).toEqual({ minCash: -900_000, criticalDate: "2026-03-08" });
    });

    it("ne signale rien sur une projection toujours positive", () => {
        const serie = [{ week: 0, date: "2026-03-01", cash: 10 }];
        expect(detectCriticalPoints(serie).criticalDate).toBeNull();
    });
});

describe("retardMoyenReglement", () => {
    it("mesure le retard moyen sur les factures réellement payées", () => {
        const retard = retardMoyenReglement([
            { dueDate: "2026-01-10", paidDate: "2026-01-20" },
            { dueDate: "2026-02-10", paidDate: "2026-02-30" },
        ]);
        expect(retard).toBeGreaterThan(0);
    });

    it("renvoie null faute de mesure, au lieu de faire passer l'absence pour zéro retard", () => {
        expect(retardMoyenReglement([])).toBeNull();
        expect(retardMoyenReglement([{ dueDate: "2026-01-10", paidDate: null }])).toBeNull();
    });

    it("borne à zéro un règlement en avance", () => {
        expect(retardMoyenReglement([{ dueDate: "2026-01-20", paidDate: "2026-01-10" }])).toBe(0);
    });
});
