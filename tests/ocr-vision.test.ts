import { describe, expect, it } from "vitest";
import { LectureVisionSchema, normaliserLecture, type LectureVision } from "@/lib/ocr-vision";

const base = { titre: "", periode: "", devise: "FCFA", remarques: [] as string[] };

describe("normaliserLecture — balance manuscrite transcrite par le modèle", () => {
    const lecture: LectureVision = {
        ...base,
        document: "balance",
        titre: "Balance au 31/12/2025",
        periode: "31/12/2025",
        lignesBalance: [
            { numero: "101000", intitule: "Capital", debit: 0, credit: 5_000_000, confiance: "haute", illisible: false, remarque: "" },
            { numero: "521 000", intitule: "Banque", debit: 4_300_000, credit: 0, confiance: "moyenne", illisible: false, remarque: "le 3 pourrait être un 8" },
            { numero: "", intitule: "Fournisseurs", debit: 0, credit: 700_000, confiance: "faible", illisible: true, remarque: "numéro raturé" },
            { numero: "6O1", intitule: "Achats", debit: 1_400_000, credit: 0, confiance: "faible", illisible: false, remarque: "" },
        ],
        lignesJournal: [],
        totauxEcrits: { debit: 4_300_000, credit: 5_000_000, present: true },
    };
    const n = normaliserLecture(lecture);
    it("garde les lignes lisibles avec un compte valide, normalise le numéro", () => {
        expect(n.lignes.map((l) => l.numero)).toEqual(["101000", "521000"]);
        expect(n.lignes[1]).toMatchObject({ debit: 4_300_000, credit: 0, confiance: "moyenne" });
        expect(n.lignes[1].source).toContain("le 3 pourrait être un 8");
    });
    it("rejette l'illisible et le compte non numérique, sans jamais compléter", () => {
        expect(n.rejets).toHaveLength(2);
        expect(n.rejets[0].raison).toBe("numéro raturé");
        expect(n.rejets[1].texte).toContain("6O1");
    });
    it("confronte les totaux écrits aux lignes retenues", () => {
        expect(n.totauxCalcules).toMatchObject({ debit: 4_300_000, credit: 5_000_000, equilibree: false });
        expect(n.controleTotaux).toBe("concordant");
    });
});

describe("normaliserLecture — cahier de caisse manuscrit", () => {
    const lecture: LectureVision = {
        ...base,
        document: "journal",
        lignesBalance: [],
        lignesJournal: [
            { date: "03/09/2026", libelle: "Vente tissus Mme Diop", entree: 45_000, sortie: 0, confiance: "haute", illisible: false, remarque: "" },
            { date: "03/09/2026", libelle: "Transport marchandise", entree: 0, sortie: 7_500, confiance: "moyenne", illisible: false, remarque: "" },
            { date: "", libelle: "", entree: 0, sortie: 12_000, confiance: "faible", illisible: true, remarque: "ligne barrée" },
        ],
        totauxEcrits: { debit: 0, credit: 0, present: false },
    };
    const n = normaliserLecture(lecture);
    it("transmet les opérations telles quelles avec leur confiance", () => {
        expect(n.document).toBe("journal");
        expect(n.journal).toHaveLength(3);
        expect(n.journal[0]).toMatchObject({ entree: 45_000, sortie: 0 });
        expect(n.journal[2]).toMatchObject({ illisible: true, remarque: "ligne barrée" });
        expect(n.lignes).toEqual([]);
        expect(n.controleTotaux).toBe("absent");
    });
});

describe("LectureVisionSchema", () => {
    it("valide une réponse conforme et refuse un montant non numérique", () => {
        expect(LectureVisionSchema.safeParse({ ...base, document: "autre", lignesBalance: [], lignesJournal: [], totauxEcrits: { debit: 0, credit: 0, present: false } }).success).toBe(true);
        expect(LectureVisionSchema.safeParse({ ...base, document: "balance", lignesBalance: [{ numero: "101000", intitule: "x", debit: "1 000", credit: 0, confiance: "haute", illisible: false, remarque: "" }], lignesJournal: [], totauxEcrits: { debit: 0, credit: 0, present: false } }).success).toBe(false);
    });
});
