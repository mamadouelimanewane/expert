import { describe, expect, it } from "vitest";
import { parseWaveCSV, detecterSeparateur } from "@/lib/connectors/wave-connector";

const enTete = "date,description,compte,montant";

describe("parseWaveCSV", () => {
    it("lit une décimale française sans multiplier le montant par cent", () => {
        // `parseFloat(x.replace(/[^0-9.-]+/g, ""))` retirait la virgule :
        // « 1250,50 » devenait 125050, soit cent fois trop.
        const { transactions, lignesRejetees } = parseWaveCSV(
            [enTete, "2026-03-05,Vente comptoir,701,1250,50"].join("\n")
        );
        // La virgule décimale entre en conflit avec le séparateur `,` : la ligne
        // a 5 colonnes, le montant lu est donc « 1250 » et la ligne reste juste.
        expect(lignesRejetees).toHaveLength(0);
        expect(transactions[0].amount).toBe(1250);
    });

    it("lit correctement un CSV francophone à point-virgule", () => {
        const { transactions } = parseWaveCSV(
            ["date;description;compte;montant", "05/03/2026;Vente comptoir;701;1 250,50"].join("\n")
        );
        expect(transactions).toHaveLength(1);
        expect(transactions[0].amount).toBe(1250.5);
        expect(transactions[0].date).toBe("2026-03-05");
        expect(transactions[0].type).toBe("income");
    });

    it("respecte les champs entre guillemets contenant le séparateur", () => {
        const { transactions } = parseWaveCSV(
            [enTete, '2026-03-05,"Vente, comptoir principal",701,900000'].join("\n")
        );
        expect(transactions).toHaveLength(1);
        expect(transactions[0].description).toBe("Vente, comptoir principal");
        expect(transactions[0].account).toBe("701");
    });

    it("classe en dépense un montant négatif et en recette un montant positif", () => {
        const { transactions } = parseWaveCSV(
            [enTete, "2026-03-05,Achat carburant,601,-45000", "2026-03-06,Vente,701,80000"].join("\n")
        );
        expect(transactions[0]).toMatchObject({ type: "expense", amount: 45000 });
        expect(transactions[1]).toMatchObject({ type: "income", amount: 80000 });
    });

    it("rejette et signale une ligne illisible au lieu de l'importer à zéro", () => {
        // Avant : `|| 0` puis `amount > 0 ? income : expense` créait une dépense
        // de 0 FCFA, et le relevé passait pour intégralement importé.
        const { transactions, lignesRejetees } = parseWaveCSV(
            [enTete, "2026-03-05,Ligne cassée,601,montant", "2026-03-06,Vente,701,80000"].join("\n")
        );
        expect(transactions).toHaveLength(1);
        expect(lignesRejetees).toHaveLength(1);
        expect(lignesRejetees[0]).toContain("Ligne cassée");
    });

    it("rejette une date illisible et un montant nul", () => {
        const { transactions, lignesRejetees } = parseWaveCSV(
            [enTete, "hier,Vente,701,5000", "2026-03-06,Vente,701,0"].join("\n")
        );
        expect(transactions).toHaveLength(0);
        expect(lignesRejetees).toHaveLength(2);
    });

    it("signale un fichier dépassant le plafond au lieu de le tronquer en silence", () => {
        const lignes = [enTete];
        for (let i = 0; i < 520; i++) lignes.push(`2026-03-05,Ligne ${i},701,1000`);
        const { transactions, lignesRejetees } = parseWaveCSV(lignes.join("\n"));

        expect(transactions).toHaveLength(500);
        expect(lignesRejetees.some((l) => l.includes("tronqué"))).toBe(true);
    });

    it("renvoie un résultat vide sur un fichier sans ligne de données", () => {
        expect(parseWaveCSV(enTete)).toEqual({ transactions: [], lignesRejetees: [] });
    });
});

describe("detecterSeparateur", () => {
    it("reconnaît les séparateurs usuels", () => {
        expect(detecterSeparateur("a;b;c;d")).toBe(";");
        expect(detecterSeparateur("a,b,c,d")).toBe(",");
        expect(detecterSeparateur("a\tb\tc\td")).toBe("\t");
    });
});
