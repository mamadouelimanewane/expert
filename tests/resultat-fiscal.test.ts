import { describe, expect, it } from "vitest";
import {
    detecterAjustementsFiscauxAutomatiques,
    determinerResultatFiscalEtIS,
    PLAFOND_DONS_POURCENTAGE_CA,
    DUREE_REPORT_DEFICITAIRE_ANNEES,
} from "@/lib/ohada/resultat-fiscal";
import type { CompteBalance } from "@/lib/ohada/types";

describe("Détermination du Résultat Fiscal & Liquidation IS (Tableau 7 DSF)", () => {
    it("détecte automatiquement les amendes pénales et fiscales non déductibles", () => {
        const balance: CompteBalance[] = [
            { numero: "6582", intitule: "Amendes et pénalités fiscales", debit: 500_000, credit: 0 },
            { numero: "7011", intitule: "Ventes de marchandises", debit: 0, credit: 50_000_000 },
        ];

        const ajustements = detecterAjustementsFiscauxAutomatiques(balance, {
            pays: "sn",
            exercice: 2026,
            chiffreAffairesHT: 50_000_000,
            resultatComptableAvantImpot: 5_000_000,
        });

        const amende = ajustements.find((a) => a.type === "AMENDES_ET_PENALITES");
        expect(amende).toBeDefined();
        expect(amende?.montant).toBe(500_000);
    });

    it("réintègre l'excédent de dons dépassant le plafond légal de 0.5% du CA au Sénégal", () => {
        const ca = 100_000_000;
        const plafond = ca * PLAFOND_DONS_POURCENTAGE_CA.sn; // 500 000 F
        const balance: CompteBalance[] = [
            { numero: "6581", intitule: "Dons et libéralités", debit: 1_200_000, credit: 0 },
        ];

        const ajustements = detecterAjustementsFiscauxAutomatiques(balance, {
            pays: "sn",
            exercice: 2026,
            chiffreAffairesHT: ca,
            resultatComptableAvantImpot: 10_000_000,
        });

        const don = ajustements.find((a) => a.type === "DONS_ET_LIBERALITES_EXCEDENTAIRES");
        expect(don).toBeDefined();
        expect(don?.montant).toBe(1_200_000 - plafond); // 700 000 F
    });

    it("déduit 95% des dividendes perçus dans le cadre du régime mère-fille", () => {
        const balance: CompteBalance[] = [
            { numero: "7711", intitule: "Dividendes de filiales UEMOA", debit: 0, credit: 10_000_000 },
        ];

        const ajustements = detecterAjustementsFiscauxAutomatiques(balance, {
            pays: "sn",
            exercice: 2026,
            chiffreAffairesHT: 50_000_000,
            resultatComptableAvantImpot: 15_000_000,
        });

        const ded = ajustements.find((a) => a.type === "DIVIDENDES_FILIALES_MERE_FILLE");
        expect(ded).toBeDefined();
        expect(ded?.montant).toBe(9_500_000);
    });

    it("liquide l'IS correctement en imputant les déficits antérieurs reportables (FIFO)", () => {
        const liquidation = determinerResultatFiscalEtIS(
            {
                pays: "sn",
                exercice: 2026,
                chiffreAffairesHT: 100_000_000,
                resultatComptableAvantImpot: 10_000_000,
                deficitsAnterieurs: [
                    {
                        exercice: 2024,
                        montantInitial: 4_000_000,
                        montantImpute: 0,
                        soldeDisponible: 4_000_000,
                        expireEn: 2027,
                    },
                ],
            },
            [
                {
                    id: "1",
                    code: "R1",
                    libelle: "Amende",
                    type: "AMENDES_ET_PENALITES",
                    montant: 1_000_000,
                    motif: "Amende pénale",
                    referenceLegale: "CGI art 11",
                },
            ]
        );

        // Résultat comptable : 10M + Réintégrations : 1M = 11M avant déficit
        expect(liquidation.resultatFiscalAvantDeficit).toBe(11_000_000);
        // Déficit imputé : 4M
        expect(liquidation.deficitsImputes).toBe(4_000_000);
        // Résultat fiscal net : 7M
        expect(liquidation.resultatFiscalNetImposable).toBe(7_000_000);
        // Taux IS Sénégal : 30% -> 7M * 30% = 2 100 000
        expect(liquidation.isBrut).toBe(2_100_000);
        // IMF : 100M * 0.5% = 500 000 (plafond 5M) -> IS supérieur à IMF
        expect(liquidation.minimumApplique).toBe(false);
        expect(liquidation.isExigible).toBe(2_100_000);
    });

    it("applique l'Impôt Minimum Forfaitaire (IMF) si l'entreprise est déficitaire", () => {
        const liquidation = determinerResultatFiscalEtIS({
            pays: "sn",
            exercice: 2026,
            chiffreAffairesHT: 80_000_000,
            resultatComptableAvantImpot: -5_000_000, // Déficit comptable
        });

        expect(liquidation.resultatFiscalNetImposable).toBe(0);
        expect(liquidation.isBrut).toBe(0);
        // IMF = 80M * 0.5% = 400 000 F
        expect(liquidation.impotMinimumForfaitaire).toBe(400_000);
        expect(liquidation.minimumApplique).toBe(true);
        expect(liquidation.isExigible).toBe(400_000);
    });
});
