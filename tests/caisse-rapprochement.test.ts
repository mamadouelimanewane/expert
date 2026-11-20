import { describe, it, expect } from "vitest";
import {
    calculerTotalBilletage,
    analyserBrouillardCaisse,
    etablirProcesVerbalCaisse,
    calculerRapprochementBancaire,
    type BilletageCaisse,
    type LigneCaisse,
    type OperationSuspenseBancaire,
} from "@/lib/ohada/caisse-rapprochement";

describe("Gestion de Caisse & Rapprochement Bancaire (SYSCOHADA)", () => {
    it("calcule avec exactitude le total du billetage physique", () => {
        const billetage: BilletageCaisse = {
            billets10000: 50, // 500 000
            billets5000: 20,  // 100 000
            billets2000: 10,  // 20 000
            billets1000: 15,  // 15 000
            billets500: 10,   // 5 000
            pieces500: 6,     // 3 000
            pieces250: 4,     // 1 000
            pieces200: 5,     // 1 000
            pieces100: 10,    // 1 000
            pieces50: 10,     // 500
            pieces25: 4,      // 100
            pieces10: 10,     // 100
            pieces5: 0,
        };

        const total = calculerTotalBilletage(billetage);
        expect(total).toBe(646_700);
    });

    it("détecte toute alerte critique de caisse négative (anti-caisse créditrice)", () => {
        const soldeInitial = 200_000;
        const lignes: LigneCaisse[] = [
            {
                id: "c1",
                date: "2026-04-01",
                pieceJustificative: "PC-001",
                libelle: "Achat fournitures",
                entree: 0,
                sortie: 150_000,
                valide: true,
            },
            {
                id: "c2",
                date: "2026-04-02",
                pieceJustificative: "PC-002",
                libelle: "Règlement artisan électricien",
                entree: 0,
                sortie: 120_000, // Le solde passe à -70 000 F !
                valide: true,
            },
            {
                id: "c3",
                date: "2026-04-03",
                pieceJustificative: "PC-003",
                libelle: "Encaissement vente comptant",
                entree: 300_000,
                sortie: 0,
                valide: true,
            },
        ];

        const synthese = analyserBrouillardCaisse(soldeInitial, lignes);

        expect(synthese.caisseSaine).toBe(false);
        expect(synthese.alertesNegatives.length).toBe(1);
        expect(synthese.alertesNegatives[0].soldeNegatifConstate).toBe(-70_000);
        expect(synthese.alertesNegatives[0].gravite).toBe("CRITIQUE_FISCALE");
        expect(synthese.alertesNegatives[0].solutionPreconisee).toContain("462");
    });

    it("établit le Procès-Verbal de caisse avec calcul de l'écart d'inventaire", () => {
        const billetage: BilletageCaisse = {
            billets10000: 20, // 200 000
            billets5000: 10,  // 50 000
            billets2000: 0,
            billets1000: 0,
            billets500: 0,
            pieces500: 0,
            pieces250: 0,
            pieces200: 0,
            pieces100: 0,
            pieces50: 0,
            pieces25: 0,
            pieces10: 0,
            pieces5: 0,
        };

        const pv = etablirProcesVerbalCaisse({
            dateArrete: "2026-04-30",
            caissierNom: "Amina DIOP",
            controleurNom: "Mamadou WANE",
            soldeTheoriqueComptable: 250_000,
            billetage,
        });

        expect(pv.soldePhysiqueConstate).toBe(250_000);
        expect(pv.ecartCaisse).toBe(0);
        expect(pv.estConforme).toBe(true);
    });

    it("calcule l'état de rapprochement bancaire normé avec équilibre parfait", () => {
        const soldeComptableAvant = 5_000_000;
        const soldeReleveBancaire = 6_200_000;

        const operationsSuspense: OperationSuspenseBancaire[] = [
            // Relevé : agios bancaires non encore passés en comptabilité (-50 000)
            {
                id: "op1",
                date: "2026-05-31",
                libelle: "Frais de tenue de compte & agios",
                montant: 50_000,
                sens: "CREDIT",
                origine: "NON_EN_COMPTABILITE",
                nature: "AGIOS_FRAIS",
            },
            // Relevé : virement d'un client reçu en banque non encore lettré (+800 000)
            {
                id: "op2",
                date: "2026-05-30",
                libelle: "Virement client reçu",
                montant: 800_000,
                sens: "DEBIT",
                origine: "NON_EN_COMPTABILITE",
                nature: "VIREMENT_INCONNU",
            },
            // Compta : chèque émis au fournisseur non encore débité par la banque (1 950 000)
            {
                id: "op3",
                date: "2026-05-28",
                libelle: "Chèque n° 88412 émis au fournisseur",
                montant: 1_950_000,
                sens: "CREDIT",
                origine: "NON_EN_BANQUE",
                nature: "CHEQUE_CIRCULATION",
            },
        ];

        const r = calculerRapprochementBancaire({
            dateRapprochement: "2026-05-31",
            nomBanque: "Société Générale Sénégal (SGBS)",
            numeroCompteBancaire: "SN012-01001-00000123456-78",
            soldeComptableAvant,
            soldeReleveBancaire,
            operationsSuspense,
        });

        // Solde comptable rectifié : 5M + 800k (recette) - 50k (agios) = 5 750 000 F
        expect(r.soldeComptableRectifie).toBe(5_750_000);

        // Solde bancaire rectifié : 6.2M - 1.95M (chèque en circulation) + 1.5M (remise si présente)
        // 6 200 000 - 1 950 000 = 4 250 000 F
        // Ajustons le test avec une remise de chèque en cours de 1 500 000 pour parfaire l'équilibre
        const opRemise: OperationSuspenseBancaire = {
            id: "op4",
            date: "2026-05-31",
            libelle: "Remise chèques clients à l'encaissement",
            montant: 1_500_000,
            sens: "DEBIT",
            origine: "NON_EN_BANQUE",
            nature: "REMISE_EN_COURS",
        };

        const rEquilibre = calculerRapprochementBancaire({
            dateRapprochement: "2026-05-31",
            nomBanque: "Société Générale Sénégal (SGBS)",
            numeroCompteBancaire: "SN012-01001-00000123456-78",
            soldeComptableAvant,
            soldeReleveBancaire,
            operationsSuspense: [...operationsSuspense, opRemise],
        });

        // 6 200 000 + 1 500 000 - 1 950 000 = 5 750 000 F
        expect(rEquilibre.soldeBancaireRectifie).toBe(5_750_000);
        expect(rEquilibre.soldeComptableRectifie).toBe(5_750_000);
        expect(rEquilibre.ecartRapprochement).toBe(0);
        expect(rEquilibre.estRapproche).toBe(true);
    });
});
