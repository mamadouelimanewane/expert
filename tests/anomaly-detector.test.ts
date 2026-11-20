import { describe, it, expect } from "vitest";
import {
    analyserBulletin,
    analyserLot,
    genererRapportAnomalies,
    type BulletinInput,
} from "@/lib/payroll/anomaly-detector";

describe("Détecteur d'anomalies de paie & social", () => {
    it("valide un bulletin normal sans déclencher d'anomalie critique", () => {
        const bulletinNormal: BulletinInput = {
            matricule: "EMP001",
            nomEmploye: "Amadou Diallo",
            periode: "2025-01",
            salaireBase: 500_000,
            primes: 50_000,
            cotisationsPatronales: 110_000, // ~20% du brut
            cotisationsSalariales: 55_000,  // ~10% du brut
            retenueFiscale: 45_000,
            netAPayer: 450_000,
            historiqueBrut: [550_000, 550_000, 550_000],
        };

        const res = analyserBulletin(bulletinNormal);
        expect(res.scoreRisque).toBeLessThan(25);
        expect(res.niveauGlobal).toBe("FAIBLE");
        expect(res.anomalies.length).toBe(0);
    });

    it("détecte une anomalie critique de type NET_SUPERIEUR_BRUT", () => {
        const bulletinIncoherent: BulletinInput = {
            matricule: "EMP002",
            periode: "2025-01",
            salaireBase: 300_000,
            cotisationsPatronales: 60_000,
            cotisationsSalariales: 30_000,
            retenueFiscale: 20_000,
            netAPayer: 400_000, // 400k net pour 300k brut !
        };

        const res = analyserBulletin(bulletinIncoherent);
        expect(res.anomalies.some((a) => a.type === "NET_SUPERIEUR_BRUT")).toBe(true);
        expect(res.scoreRisque).toBeGreaterThanOrEqual(45);
    });

    it("détecte une hausse brutale de salaire > 20%", () => {
        const bulletinHausse: BulletinInput = {
            matricule: "EMP003",
            periode: "2025-02",
            salaireBase: 800_000, // Brut 800k vs historique 500k (+60%)
            cotisationsPatronales: 160_000,
            cotisationsSalariales: 80_000,
            retenueFiscale: 70_000,
            netAPayer: 650_000,
            historiqueBrut: [500_000, 500_000, 500_000],
        };

        const res = analyserBulletin(bulletinHausse);
        expect(res.anomalies.some((a) => a.type === "HAUSSE_BRUTALE_SALAIRE")).toBe(true);
        expect(res.niveauGlobal).toMatch(/ELEVE|CRITIQUE/);
    });

    it("détecte des retenues excessives (> 50% du brut)", () => {
        const bulletinRetenues: BulletinInput = {
            matricule: "EMP004",
            periode: "2025-01",
            salaireBase: 400_000,
            cotisationsPatronales: 80_000,
            cotisationsSalariales: 120_000, // Retenues = 120k + 100k = 220k (55% du brut)
            retenueFiscale: 100_000,
            netAPayer: 180_000,
        };

        const res = analyserBulletin(bulletinRetenues);
        expect(res.anomalies.some((a) => a.type === "RETENUE_EXCESSIVE")).toBe(true);
    });

    it("analyse un lot et détecte les doublons de matricule avec génération de rapport", () => {
        const lot: BulletinInput[] = [
            {
                matricule: "EMP005",
                periode: "2025-01",
                salaireBase: 500_000,
                cotisationsPatronales: 100_000,
                cotisationsSalariales: 50_000,
                retenueFiscale: 40_000,
                netAPayer: 410_000,
            },
            {
                matricule: "EMP005", // Doublon même période
                periode: "2025-01",
                salaireBase: 500_000,
                cotisationsPatronales: 100_000,
                cotisationsSalariales: 50_000,
                retenueFiscale: 40_000,
                netAPayer: 410_000,
            },
        ];

        const resultats = analyserLot(lot);
        expect(resultats.length).toBe(2);
        expect(resultats[1].anomalies.some((a) => a.type === "DOUBLON_POTENTIEL")).toBe(true);

        const rapport = genererRapportAnomalies(resultats);
        expect(rapport).toContain("DOUBLON_POTENTIEL");
        expect(rapport).toContain("EMP005");
    });
});
