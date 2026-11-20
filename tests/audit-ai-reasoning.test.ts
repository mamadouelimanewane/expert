import { describe, it, expect } from "vitest";
import { evaluerFeuillesTravail, type ConstatAuditeur } from "@/lib/ohada/audit-ai-reasoning";

describe("Assistant IA d'Audit sur Feuilles de Travail (Norme ISA 500)", () => {
    it("valide une section avec toutes les assertions couvertes et conformes (Opinion Satisfaisante)", () => {
        const constats: ConstatAuditeur[] = [
            { id: "1", referenceCompte: "521", libelle: "Banque BOA", descriptionDiligence: "Rapprochement bancaire", assertionVisee: "EXISTENCE", conforme: true },
            { id: "2", referenceCompte: "521", libelle: "Banque BOA", descriptionDiligence: "Exhaustivité des agios", assertionVisee: "EXHAUSTIVITE", conforme: true },
            { id: "3", referenceCompte: "521", libelle: "Banque BOA", descriptionDiligence: "Conversion devises", assertionVisee: "EVALUATION", conforme: true },
            { id: "4", referenceCompte: "521", libelle: "Banque BOA", descriptionDiligence: "Pouvoirs bancaires", assertionVisee: "DROITS_OBLIGATIONS", conforme: true },
            { id: "5", referenceCompte: "521", libelle: "Banque BOA", descriptionDiligence: "Présentation au bilan", assertionVisee: "PRESENTATION", conforme: true },
        ];

        const bilan = evaluerFeuillesTravail({
            cycleAudit: "TRESORERIE",
            seuilSignificationFCFA: 20_000_000,
            soldeComptableTotalFCFA: 150_000_000,
            constats,
        });

        expect(bilan.scoreRisqueResiduel).toBeLessThan(20);
        expect(bilan.niveauRisque).toBe("FAIBLE");
        expect(bilan.opinionProposeePourCycle).toBe("SATISFAISANTE");
        expect(bilan.totalAnomaliesRelevees).toBe(0);
        expect(bilan.conclusionRapportSection).toContain("donnent une image fidèle");
    });

    it("détecte des anomalies dépassant le seuil de signification et propose un désaccord", () => {
        const constats: ConstatAuditeur[] = [
            {
                id: "1",
                referenceCompte: "411",
                libelle: "Client Grands Comptes",
                descriptionDiligence: "Contrôle de dépréciation",
                assertionVisee: "EVALUATION",
                conforme: false,
                anomalieDetectee: "Créance compromise non provisionnée",
                montantAnomalieFCFA: 25_000_000, // Supérieur au seuil de 20M
            },
        ];

        const bilan = evaluerFeuillesTravail({
            cycleAudit: "CLIENTS",
            seuilSignificationFCFA: 20_000_000,
            soldeComptableTotalFCFA: 80_000_000,
            constats,
        });

        expect(bilan.ratioSurSeuilSignification).toBeGreaterThanOrEqual(1.0);
        expect(bilan.niveauRisque).toBe("CRITIQUE");
        expect(bilan.opinionProposeePourCycle).toBe("DESACCORD_SIGNIFICATIF");
        expect(bilan.conclusionRapportSection).toContain("désaccord significatif");
    });

    it("génère des recommandations ciblées pour les assertions non couvertes", () => {
        // Seule l'existence est auditée, les 4 autres assertions manquent
        const constats: ConstatAuditeur[] = [
            { id: "1", referenceCompte: "241", libelle: "Matériel industriel", descriptionDiligence: "Inspection physique", assertionVisee: "EXISTENCE", conforme: true },
        ];

        const bilan = evaluerFeuillesTravail({
            cycleAudit: "IMMOBILISATIONS",
            seuilSignificationFCFA: 15_000_000,
            soldeComptableTotalFCFA: 200_000_000,
            constats,
        });

        expect(bilan.recommandationsDiligences.length).toBeGreaterThanOrEqual(3);
        expect(bilan.recommandationsDiligences.some((r) => r.assertion === "EVALUATION")).toBe(true);
        expect(bilan.recommandationsDiligences.some((r) => r.referenceNormative.includes("ISA 500"))).toBe(true);
    });
});
