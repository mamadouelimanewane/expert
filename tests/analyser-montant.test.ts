import { describe, expect, it } from "vitest";
import { analyserMontant, analyserMontantOptionnel } from "@/lib/validation";

const valeur = (brut: unknown) => {
    const r = analyserMontant(brut);
    return r.ok ? r.valeur : r.raison;
};

describe("analyserMontant", () => {
    it("lit les montants formatés avec des espaces, comme l'application les affiche", () => {
        // parseFloat("1 500 000") renvoyait 1.
        expect(valeur("1 500 000")).toBe(1500000);
        expect(valeur("1\u00a0500\u00a0000")).toBe(1500000);
        expect(valeur("1\u202f500\u202f000")).toBe(1500000);
    });

    it("lit les séparateurs de milliers point et virgule", () => {
        expect(valeur("1.500.000")).toBe(1500000);
        expect(valeur("1,500,000")).toBe(1500000);
        expect(valeur("1,500")).toBe(1500);
    });

    it("lit la décimale française", () => {
        expect(valeur("12,50")).toBe(12.5);
        expect(valeur("1,5")).toBe(1.5);
        expect(valeur("1 250,75")).toBe(1250.75);
    });

    it("lit le format anglo-saxon complet", () => {
        expect(valeur("1,250,000.75")).toBe(1250000.75);
        expect(valeur("1.250.000,75")).toBe(1250000.75);
    });

    it("accepte les nombres et les signes", () => {
        expect(valeur(1500)).toBe(1500);
        expect(valeur(-42.5)).toBe(-42.5);
        expect(valeur("-1 000")).toBe(-1000);
    });

    it("refuse ce que parseFloat transformait en NaN stocké en base", () => {
        expect(analyserMontant("abc").ok).toBe(false);
        expect(analyserMontant("12abc").ok).toBe(false);
        expect(analyserMontant(NaN).ok).toBe(false);
        expect(analyserMontant(Infinity).ok).toBe(false);
        expect(analyserMontant("").ok).toBe(false);
        expect(analyserMontant(undefined).ok).toBe(false);
        expect(analyserMontant({}).ok).toBe(false);
    });

    it("applique les bornes demandées", () => {
        expect(analyserMontant("0", { min: 1 }).ok).toBe(false);
        expect(analyserMontant("-5", { min: 0 }).ok).toBe(false);
        expect(analyserMontant("5", { min: 0 }).ok).toBe(true);
    });
});

describe("analyserMontantOptionnel", () => {
    it("accepte l'absence de valeur", () => {
        expect(analyserMontantOptionnel(undefined)).toEqual({ ok: true, valeur: null });
        expect(analyserMontantOptionnel(null)).toEqual({ ok: true, valeur: null });
        expect(analyserMontantOptionnel("  ")).toEqual({ ok: true, valeur: null });
    });

    it("refuse une valeur présente mais illisible", () => {
        expect(analyserMontantOptionnel("abc").ok).toBe(false);
    });

    it("lit une valeur présente", () => {
        expect(analyserMontantOptionnel("2 000 000")).toEqual({ ok: true, valeur: 2000000 });
    });
});
