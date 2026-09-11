import { describe, expect, it } from "vitest";
import { parserBalanceTableau, parserBalanceTexte } from "@/lib/ocr-balance";

const trouver = (r: ReturnType<typeof parserBalanceTexte>, numero: string) => r.lignes.find((l) => l.numero === numero);

describe("parserBalanceTexte — balance à deux colonnes (texte OCR propre)", () => {
    const texte = `
BALANCE GENERALE AU 31/12/2025
Compte    Intitulé                         Débit          Crédit
101000    Capital social                        -      10 000 000
244100    Matériel informatique          3 200 000              -
411100    Clients                       10 250 000              0
601000    Achats de marchandises        28 400 000              -
701000    Ventes de marchandises                 -     52 300 000
TOTAL GENERAL                           41 850 000     62 300 000
`;
    const r = parserBalanceTexte(texte);
    it("lit 5 comptes, ignore en-tête, titre et total", () => {
        expect(r.lignes.map((l) => l.numero)).toEqual(["101000", "244100", "411100", "601000", "701000"]);
        expect(r.rejets).toEqual([]);
    });
    it("reconstitue les montants avec espaces de milliers et tirets pour zéro", () => {
        expect(trouver(r, "101000")).toMatchObject({ debit: 0, credit: 10_000_000, intitule: "Capital social" });
        expect(trouver(r, "601000")).toMatchObject({ debit: 28_400_000, credit: 0 });
        expect(trouver(r, "411100")).toMatchObject({ debit: 10_250_000, credit: 0 });
    });
    it("contrôle les totaux imprimés", () => {
        expect(r.disposition).toBe("debit-credit");
        expect(r.totauxDetectes).toEqual({ debit: 41_850_000, credit: 62_300_000 });
        expect(r.controleTotaux).toBe("concordant");
        expect(r.totauxCalcules.equilibree).toBe(false);
    });
});

describe("parserBalanceTexte — bruit OCR", () => {
    it("corrige O→0 et l→1 dans les comptes et montants, et baisse la confiance", () => {
        const r = parserBalanceTexte(`
Compte   Libellé                 Debit        Credit
6O1OOO   Achats marchandises   28.4OO.OOO        0
70l000   Ventes                        0   52.300.000
`);
        expect(trouver(r, "601000")).toMatchObject({ debit: 28_400_000, credit: 0, confiance: "moyenne" });
        expect(trouver(r, "701000")).toMatchObject({ debit: 0, credit: 52_300_000, confiance: "moyenne" });
    });
    it("lit les décimales « 1 250 000,50 » et les colonnes séparées par des barres", () => {
        const r = parserBalanceTexte(`521000 | Banque | 1 250 000,50 | 0,00`);
        expect(trouver(r, "521000")).toMatchObject({ debit: 1_250_000.5, credit: 0 });
    });
    it("rejette une ligne avec montants mais sans compte, et une ligne sans montant", () => {
        const r = parserBalanceTexte(`
Report de la page 1                       12 000 000    9 000 000
601000 Achats de marchandises
`);
        expect(r.lignes).toEqual([]);
        expect(r.rejets.map((x) => x.raison)).toEqual(["compte illisible en début de ligne", "aucun montant lu"]);
    });
    it("ignore les sous-totaux de classe", () => {
        const r = parserBalanceTexte(`
601000 Achats 1 000 0
Total classe 6 1 000 0
701000 Ventes 0 1 000
`);
        expect(r.lignes).toHaveLength(2);
        expect(r.totauxDetectes).toBeNull();
    });
});

describe("parserBalanceTexte — quatre colonnes (mouvements + soldes)", () => {
    const texte = `
N° Compte  Intitulé            Mouvement Débit  Mouvement Crédit  Solde Débiteur  Solde Créditeur
411100     Clients                 18 500 000        8 250 000     10 250 000               0
401100     Fournisseurs             9 400 000       14 000 000              0       4 600 000
TOTAL                               27 900 000       22 250 000     10 250 000       4 600 000
`;
    const r = parserBalanceTexte(texte);
    it("retient les soldes, pas les mouvements", () => {
        expect(r.disposition).toBe("mouvements-soldes");
        expect(trouver(r, "411100")).toMatchObject({ debit: 10_250_000, credit: 0, colonnes: 4 });
        expect(trouver(r, "401100")).toMatchObject({ debit: 0, credit: 4_600_000 });
        expect(r.totauxDetectes).toEqual({ debit: 10_250_000, credit: 4_600_000 });
        expect(r.controleTotaux).toBe("concordant");
    });
});

describe("parserBalanceTexte — solde signé unique", () => {
    it("ventile un solde négatif au crédit", () => {
        const r = parserBalanceTexte(`
Compte  Intitulé   Solde
521000  Banque     4 300 000
401100  Fournisseurs  -1 200 000
`);
        expect(r.disposition).toBe("solde-signe");
        expect(trouver(r, "521000")).toMatchObject({ debit: 4_300_000, credit: 0 });
        expect(trouver(r, "401100")).toMatchObject({ debit: 0, credit: 1_200_000 });
    });
});

describe("parserBalanceTableau", () => {
    it("accepte des cellules issues d'un tableau PDF", () => {
        const r = parserBalanceTableau([
            ["Compte", "Intitulé", "Débit", "Crédit"],
            ["101000", "Capital", "", "5 000 000"],
            ["521000", "Banque", "5 000 000", ""],
            ["", "TOTAL", "5 000 000", "5 000 000"],
        ]);
        expect(r.lignes).toHaveLength(2);
        expect(r.totauxCalcules.equilibree).toBe(true);
        expect(r.controleTotaux).toBe("concordant");
    });
});

describe("parserBalanceTexte — sortie Tesseract réelle (image de balance)", () => {
    it("lit une ligne où le compte n'est séparé de l'intitulé que par un espace et où le tiret est lu « = » ou « — »", () => {
        const r = parserBalanceTexte(`
Compte   Intitule                        Debit         Credit
101000 Capital social                                   =      10 000 000
241000 Materiel et outillage                    9 500 000               —
661000   Remunerations du personnel               9 600 000               =
701000 Ventes de marchandises                            =      52 300 000
TOTAL GENERAL                                  19 100 000      62 300 000
`);
        expect(r.rejets).toEqual([]);
        expect(r.disposition).toBe("debit-credit");
        expect(trouver(r, "101000")).toMatchObject({ debit: 0, credit: 10_000_000, intitule: "Capital social" });
        expect(trouver(r, "241000")).toMatchObject({ debit: 9_500_000, credit: 0 });
        expect(trouver(r, "661000")).toMatchObject({ debit: 9_600_000, credit: 0, intitule: "Remunerations du personnel" });
        expect(r.controleTotaux).toBe("concordant");
    });
});
