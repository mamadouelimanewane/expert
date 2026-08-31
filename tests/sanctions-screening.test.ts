import { describe, expect, it } from "vitest";
import { contientMotsEntiers, correspondNom } from "@/lib/sanctions-screening";

// ─────────────────────────────────────────────────────────────────────────────
// Criblage de sanctions (LCB-FT).
//
// La correspondance se faisait par simple sous-chaîne, ce qui signalait comme
// sanctionnés des clients parfaitement légitimes : l'entité OFAC « ROC »
// ressortait sur « AEROCARIBBEAN » (aé-ROC-aribbean) et « ULA » sur
// « Boulangerie du Plateau SA » (bo-ULA-ngerie) — cas réels observés sur la
// liste SDN téléchargée.
//
// L'enjeu n'est pas cosmétique : en conformité, un criblage bruyant pousse à
// écarter les alertes sans examen, donc à manquer une vraie correspondance.
// Ces tests verrouillent les deux exigences à la fois — ne plus signaler les
// innocents, sans cesser de détecter les vrais.
// ─────────────────────────────────────────────────────────────────────────────

describe("correspondance de noms — faux positifs écartés", () => {
    it("ne signale pas un nom court trouvé au milieu d'un mot", () => {
        // Cas réels ayant motivé le correctif.
        expect(correspondNom("ROC", "AEROCARIBBEAN AIRLINES")).toBe(false);
        expect(correspondNom("ULA", "Boulangerie du Plateau SA")).toBe(false);
    });

    it("ne signale pas un client ordinaire sans rapport", () => {
        expect(correspondNom("BANCO NACIONAL DE CUBA", "Pharmacie du Plateau")).toBe(false);
        expect(correspondNom("AEROCARIBBEAN AIRLINES", "Teranga Tech Solutions")).toBe(false);
    });

    it("ignore les entrées vides plutôt que de tout faire correspondre", () => {
        expect(correspondNom("", "Boulangerie du Plateau SA")).toBe(false);
        expect(correspondNom("AEROCARIBBEAN AIRLINES", "")).toBe(false);
    });
});

describe("correspondance de noms — vrais positifs conservés", () => {
    it("détecte une correspondance exacte", () => {
        expect(correspondNom("AEROCARIBBEAN AIRLINES", "AEROCARIBBEAN AIRLINES")).toBe(true);
    });

    it("détecte l'entité sanctionnée à l'intérieur d'une raison sociale plus longue", () => {
        expect(correspondNom("BANCO NACIONAL DE CUBA", "Banco Nacional de Cuba SA")).toBe(true);
    });

    it("reste insensible à la casse, aux accents et à la ponctuation", () => {
        expect(correspondNom("ANGLO-CARIBBEAN CO., LTD.", "anglo caribbean co ltd")).toBe(true);
        expect(correspondNom("SOCIÉTÉ GÉNÉRALE", "societe generale")).toBe(true);
    });

    it("tolère l'inversion nom / prénom", () => {
        expect(correspondNom("Jean Dupont", "Dupont Jean")).toBe(true);
    });
});

describe("contientMotsEntiers", () => {
    it("exige des mots entiers, pas une sous-chaîne", () => {
        expect(contientMotsEntiers("aerocaribbean airlines", "roc")).toBe(false);
        expect(contientMotsEntiers("aerocaribbean airlines", "airlines")).toBe(true);
        expect(contientMotsEntiers("banco nacional de cuba sa", "banco nacional de cuba")).toBe(true);
    });

    it("renvoie faux sur une chaîne vide au lieu de tout faire correspondre", () => {
        expect(contientMotsEntiers("banco nacional de cuba", "")).toBe(false);
        expect(contientMotsEntiers("", "banco")).toBe(false);
    });
});
