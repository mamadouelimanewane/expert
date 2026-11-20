import { describe, it, expect } from "vitest";
import {
    calculerBalanceAgee,
    lettrerEcritures,
    detecterReclassements416,
    type EcritureTiers,
} from "@/lib/ohada/comptabilite-auxiliaire";

describe("Comptabilité Auxiliaire & Tiers (SYSCOHADA)", () => {
    it("calcule correctement la balance âgée d'un portefeuille clients", () => {
        const dateArrete = "2026-06-30";

        const ecritures: EcritureTiers[] = [
            // Client A : facture non échue (échéance au 15/07/2026)
            {
                id: "e1",
                date: "2026-06-15",
                echeance: "2026-07-15",
                numeroPiece: "FAC-001",
                libelle: "Vente marchandises",
                compteGeneral: "4111",
                compteAuxiliaire: "CLI-001",
                nomTiers: "Société Alpha",
                sens: "DEBIT",
                montant: 1_000_000,
            },
            // Client A : facture en retard de 20 jours (échéance 10/06/2026)
            {
                id: "e2",
                date: "2026-05-10",
                echeance: "2026-06-10",
                numeroPiece: "FAC-002",
                libelle: "Prestation de services",
                compteGeneral: "4111",
                compteAuxiliaire: "CLI-001",
                nomTiers: "Société Alpha",
                sens: "DEBIT",
                montant: 500_000,
            },
            // Client B : facture très ancienne (> 90 jours de retard, échéance 01/01/2026)
            {
                id: "e3",
                date: "2025-12-01",
                echeance: "2026-01-01",
                numeroPiece: "FAC-003",
                libelle: "Marchandises non réglées",
                compteGeneral: "4111",
                compteAuxiliaire: "CLI-002",
                nomTiers: "Société Bêta",
                sens: "DEBIT",
                montant: 2_500_000,
            },
        ];

        const resultat = calculerBalanceAgee(ecritures, dateArrete, "CLIENT");

        expect(resultat.lignes.length).toBe(2);
        expect(resultat.totaux.totalDu).toBe(4_000_000);
        expect(resultat.totaux.nonEchu).toBe(1_000_000);
        expect(resultat.totaux.retard0a30).toBe(500_000);
        expect(resultat.totaux.retardPlus90).toBe(2_500_000);

        // Vérification des statuts de risque
        const clientBeta = resultat.lignes.find((l) => l.compteAuxiliaire === "CLI-002");
        expect(clientBeta?.statutRisque).toBe("CONTENTIEUX_PROBABLE");
        expect(resultat.montantRisqueEleve).toBe(2_500_000);
    });

    it("gère le lettrage partiel et l'imputation de règlements", () => {
        const factures: EcritureTiers[] = [
            {
                id: "f1",
                date: "2026-01-10",
                numeroPiece: "FAC-100",
                libelle: "Facture 1",
                compteGeneral: "4111",
                compteAuxiliaire: "CLI-01",
                nomTiers: "Client Test",
                sens: "DEBIT",
                montant: 1_000_000,
                montantLettre: 0,
            },
        ];

        const reglements: EcritureTiers[] = [
            {
                id: "r1",
                date: "2026-02-01",
                numeroPiece: "VIR-01",
                libelle: "Acompte virement",
                compteGeneral: "4111",
                compteAuxiliaire: "CLI-01",
                nomTiers: "Client Test",
                sens: "CREDIT",
                montant: 600_000,
            },
        ];

        const { facturesMisesAJour, reglementsMisAJour, soldeNonLettre } = lettrerEcritures(
            factures,
            reglements,
            "AA"
        );

        expect(facturesMisesAJour[0].montantLettre).toBe(600_000);
        expect(facturesMisesAJour[0].codeLettrage).toBe("AA");
        expect(reglementsMisAJour[0].montantLettre).toBe(600_000);
        expect(soldeNonLettre).toBe(0);
    });

    it("détecte les créances à reclasser en 416 avec proposition de dépréciation HT", () => {
        const dateArrete = "2026-06-30";
        const ecritures: EcritureTiers[] = [
            {
                id: "f1",
                date: "2025-10-01",
                echeance: "2025-11-01", // Plus de 200 jours de retard
                numeroPiece: "FAC-OLD",
                libelle: "Vente impayée",
                compteGeneral: "4111",
                compteAuxiliaire: "CLI-RISK",
                nomTiers: "Client Défaillant SARL",
                sens: "DEBIT",
                montant: 1_180_000, // 1 000 000 HT + 180 000 TVA
            },
        ];

        const balanceAgee = calculerBalanceAgee(ecritures, dateArrete, "CLIENT");
        const reclassements = detecterReclassements416(balanceAgee, 0.18);

        expect(reclassements.length).toBe(1);
        expect(reclassements[0].creanceTTC).toBe(1_180_000);
        expect(reclassements[0].creanceHT).toBe(1_000_000);
        expect(reclassements[0].tvaEstimee).toBe(180_000);
        expect(reclassements[0].tauxDepreciationPropose).toBe(100);
        expect(reclassements[0].montantDepreciation).toBe(1_000_000);
    });
});
