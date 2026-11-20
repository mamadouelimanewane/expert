import { describe, expect, it } from "vitest";
import { genererFEC, type LigneEcritureFEC } from "@/lib/ohada/fec-export";

describe("Générateur du Fichier des Écritures Comptables (FEC) & Piste d'Audit Fiable (PAF)", () => {
    const ecrituresEquilibrees: LigneEcritureFEC[] = [
        {
            journalCode: "VT",
            journalLib: "Journal des Ventes",
            ecritureNum: "1",
            ecritureDate: "2026-01-15",
            compteNum: "411100",
            compteLib: "Clients ordinaires",
            compteAuxNum: "CLI001",
            compteAuxLib: "SARL DIALLO",
            pieceRef: "FAC-2026-001",
            pieceDate: "2026-01-15",
            ecritureLib: "Facture prestations informatiques",
            debit: 1_180_000,
            credit: 0,
            validDate: "2026-01-15",
        },
        {
            journalCode: "VT",
            journalLib: "Journal des Ventes",
            ecritureNum: "1",
            ecritureDate: "2026-01-15",
            compteNum: "706100",
            compteLib: "Prestations de services",
            pieceRef: "FAC-2026-001",
            pieceDate: "2026-01-15",
            ecritureLib: "Facture prestations informatiques",
            debit: 0,
            credit: 1_000_000,
            validDate: "2026-01-15",
        },
        {
            journalCode: "VT",
            journalLib: "Journal des Ventes",
            ecritureNum: "1",
            ecritureDate: "2026-01-15",
            compteNum: "443100",
            compteLib: "État, TVA facturée sur ventes",
            pieceRef: "FAC-2026-001",
            pieceDate: "2026-01-15",
            ecritureLib: "TVA 18% sur facture",
            debit: 0,
            credit: 180_000,
            validDate: "2026-01-15",
        },
    ];

    it("génère un FEC conforme aux 18 colonnes normées avec une balance carrée", () => {
        const resultat = genererFEC("0012345678", 2026, ecrituresEquilibrees);

        expect(resultat.rapport.conformeAudit).toBe(true);
        expect(resultat.rapport.totalDebit).toBe(1_180_000);
        expect(resultat.rapport.totalCredit).toBe(1_180_000);
        expect(resultat.rapport.ecartBalance).toBe(0);
        expect(resultat.nomFichier).toBe("0012345678FEC20261231.txt");
        expect(resultat.rapport.empreinteSHA256).toHaveLength(64);

        const lignes = resultat.contenuTexte.split("\r\n");
        // En-tête + 3 écritures = 4 lignes
        expect(lignes.length).toBe(4);
        expect(lignes[0]).toContain("JournalCode\tJournalLib\tEcritureNum");
        expect(lignes[1]).toContain("VT\tJournal des Ventes\t1\t20260115\t411100");
    });

    it("détecte un déséquilibre et bloque la conformité audit si Débit != Crédit", () => {
        const ecrituresDesequilibrees: LigneEcritureFEC[] = [
            {
                journalCode: "OD",
                journalLib: "Opérations diverses",
                ecritureNum: "10",
                ecritureDate: "2026-03-31",
                compteNum: "601100",
                compteLib: "Achats",
                pieceRef: "PIECE-01",
                pieceDate: "2026-03-31",
                ecritureLib: "Achat fournitures",
                debit: 500_000,
                credit: 0,
                validDate: "2026-03-31",
            },
        ];

        const resultat = genererFEC("0012345678", 2026, ecrituresDesequilibrees);
        expect(resultat.rapport.conformeAudit).toBe(false);
        expect(resultat.rapport.anomalies.length).toBeGreaterThan(0);
        expect(resultat.rapport.anomalies[0]).toContain("Déséquilibre du grand livre");
    });
});
