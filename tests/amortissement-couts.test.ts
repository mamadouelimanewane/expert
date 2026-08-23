import { describe, expect, it } from "vitest";
import {
    coefficientDegressif,
    genererPlanAmortissement,
    moisAmortissablesPremiereAnnee,
    valeurNetteComptable,
    type Immobilisation,
} from "@/lib/amortissement";
import {
    analyserProduit,
    synthetiser,
    type ProduitAnalytique,
} from "@/lib/couts-production";

// ═══════════════════════════════════════════════════════════════════════════
// Plan d'amortissement
// ═══════════════════════════════════════════════════════════════════════════

const immo = (o: Partial<Immobilisation> = {}): Immobilisation => ({
    valeurOrigine: 10_000_000,
    dureeAnnees: 5,
    methode: "LINEAIRE",
    valeurResiduelle: 0,
    dateMiseEnService: new Date(Date.UTC(2026, 0, 1)), // 1er janvier
    ...o,
});

describe("amortissement linéaire", () => {
    it("répartit la base en annuités constantes", () => {
        const { lignes } = genererPlanAmortissement(immo());

        expect(lignes).toHaveLength(5);
        for (const l of lignes) {
            expect(l.dotation).toBe(2_000_000);
        }
    });

    it("amortit intégralement la base à l'échéance", () => {
        const { lignes } = genererPlanAmortissement(immo());
        const derniere = lignes[lignes.length - 1];

        expect(derniere.cumul).toBe(10_000_000);
        expect(derniere.vnc).toBe(0);
    });

    it("applique un prorata temporis la première année", () => {
        // Mise en service en juillet : six mois amortissables.
        const { lignes } = genererPlanAmortissement(
            immo({ dateMiseEnService: new Date(Date.UTC(2026, 6, 15)) })
        );

        expect(lignes[0].dotation).toBe(1_000_000);
        expect(lignes).toHaveLength(6); // cinq exercices pleins + le reliquat
        expect(lignes[lignes.length - 1].vnc).toBe(0);
    });

    it("compte le mois de mise en service", () => {
        expect(moisAmortissablesPremiereAnnee(new Date(Date.UTC(2026, 0, 31)))).toBe(12);
        expect(moisAmortissablesPremiereAnnee(new Date(Date.UTC(2026, 6, 1)))).toBe(6);
        expect(moisAmortissablesPremiereAnnee(new Date(Date.UTC(2026, 11, 20)))).toBe(1);
    });

    it("s'arrête à la valeur résiduelle", () => {
        const { lignes, baseAmortissable } = genererPlanAmortissement(
            immo({ valeurResiduelle: 1_000_000 })
        );

        expect(baseAmortissable).toBe(9_000_000);
        expect(lignes[lignes.length - 1].vnc).toBe(1_000_000);
        expect(lignes.reduce((s, l) => s + l.dotation, 0)).toBeCloseTo(9_000_000, 2);
    });

    it("ne descend jamais la VNC sous la valeur résiduelle", () => {
        const { lignes } = genererPlanAmortissement(immo({ valeurResiduelle: 2_500_000 }));
        for (const l of lignes) {
            expect(l.vnc).toBeGreaterThanOrEqual(2_500_000 - 0.01);
        }
    });
});

describe("amortissement dégressif", () => {
    it("applique le coefficient prévu par la durée", () => {
        expect(coefficientDegressif(3)).toBe(1.5);
        expect(coefficientDegressif(4)).toBe(1.5);
        expect(coefficientDegressif(5)).toBe(2);
        expect(coefficientDegressif(6)).toBe(2);
        expect(coefficientDegressif(8)).toBe(2.5);
    });

    it("dote davantage que le linéaire la première année", () => {
        const lineaire = genererPlanAmortissement(immo({ methode: "LINEAIRE" }));
        const degressif = genererPlanAmortissement(immo({ methode: "DEGRESSIF" }));

        expect(degressif.lignes[0].dotation).toBeGreaterThan(lineaire.lignes[0].dotation);
    });

    it("amortit lui aussi la totalité de la base", () => {
        const { lignes } = genererPlanAmortissement(immo({ methode: "DEGRESSIF" }));
        expect(lignes[lignes.length - 1].vnc).toBeCloseTo(0, 2);
    });

    it("produit des dotations décroissantes puis constantes", () => {
        const { lignes } = genererPlanAmortissement(immo({ methode: "DEGRESSIF" }));
        // Aucune dotation ne doit remonter au-delà de la précédente.
        for (let i = 1; i < lignes.length; i++) {
            expect(lignes[i].dotation).toBeLessThanOrEqual(lignes[i - 1].dotation + 0.01);
        }
    });
});

describe("cas limites du plan", () => {
    it("ne produit aucun plan pour une immobilisation non amortissable", () => {
        const { lignes } = genererPlanAmortissement(immo({ methode: "NON_AMORTISSABLE" }));
        expect(lignes).toEqual([]);
    });

    // Regression : sans duree d'utilite, la VNC etait auparavant inscrite en dur
    // sur l'ecran. Le moteur doit dire qu'il ne peut pas conclure.
    it("signale une durée d'utilité manquante au lieu d'inventer un plan", () => {
        const { lignes, anomalies } = genererPlanAmortissement(immo({ dureeAnnees: null }));
        expect(lignes).toEqual([]);
        expect(anomalies.join(" ")).toContain("Durée d'utilité");
    });

    it("refuse une valeur résiduelle supérieure à la valeur d'origine", () => {
        const { anomalies } = genererPlanAmortissement(
            immo({ valeurOrigine: 1_000_000, valeurResiduelle: 2_000_000 })
        );
        expect(anomalies.join(" ")).toContain("valeur résiduelle");
    });

    it("refuse une valeur d'origine négative", () => {
        const { anomalies } = genererPlanAmortissement(immo({ valeurOrigine: -5 }));
        expect(anomalies.join(" ")).toContain("Valeur d'origine");
    });

    it("accepte une durée d'un an", () => {
        const { lignes } = genererPlanAmortissement(immo({ dureeAnnees: 1 }));
        expect(lignes).toHaveLength(1);
        expect(lignes[0].dotation).toBe(10_000_000);
    });
});

describe("valeur nette comptable à une date", () => {
    it("renvoie la valeur d'origine avant tout amortissement", () => {
        const r = valeurNetteComptable(immo(), new Date(Date.UTC(2026, 5, 1)));
        expect(r.cumul).toBe(0);
        expect(r.vnc).toBe(10_000_000);
        expect(r.dotationExercice).toBe(2_000_000);
    });

    it("déduit les exercices clos", () => {
        const r = valeurNetteComptable(immo(), new Date(Date.UTC(2028, 5, 1)));
        // Deux exercices clos (2026, 2027).
        expect(r.cumul).toBe(4_000_000);
        expect(r.vnc).toBe(6_000_000);
    });

    it("renvoie une VNC nulle au-delà du plan", () => {
        const r = valeurNetteComptable(immo(), new Date(Date.UTC(2035, 0, 1)));
        expect(r.vnc).toBe(0);
        expect(r.dotationExercice).toBe(0);
    });

    it("remonte l'anomalie quand le plan est impossible", () => {
        const r = valeurNetteComptable(immo({ dureeAnnees: null }));
        expect(r.vnc).toBe(10_000_000);
        expect(r.anomalies.length).toBeGreaterThan(0);
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// Coût de revient et marge
// ═══════════════════════════════════════════════════════════════════════════

const produit = (o: Partial<ProduitAnalytique> = {}): ProduitAnalytique => ({
    reference: "P-101",
    name: "Ciment CPJ 45 — sac 50 kg",
    family: "Cimenterie",
    unit: "sac",
    sellingPrice: 4_200,
    costs: [
        { category: "MATIERE_PREMIERE", label: "Clinker", unitCost: 1_890 },
        { category: "ENERGIE", label: "Électricité four", unitCost: 787.5 },
        { category: "MAIN_OEUVRE_DIRECTE", label: "Atelier ensachage", unitCost: 315 },
        { category: "CHARGES_INDIRECTES", label: "Frais de structure", unitCost: 157.5 },
    ],
    ...o,
});

describe("coût de revient", () => {
    it("somme les composantes saisies", () => {
        expect(analyserProduit(produit()).coutRevient).toBe(3_150);
    });

    it("en déduit la marge et son taux", () => {
        const a = analyserProduit(produit());
        expect(a.marge).toBe(1_050);
        expect(a.tauxMarge).toBe(25);
    });

    it("ventile le coût par catégorie, du plus lourd au plus léger", () => {
        const { ventilation } = analyserProduit(produit());

        expect(ventilation[0].category).toBe("MATIERE_PREMIERE");
        expect(ventilation[0].part).toBe(60);
        expect(ventilation.reduce((s, v) => s + v.part, 0)).toBeCloseTo(100, 1);
    });

    it("agrège plusieurs composantes d'une même catégorie", () => {
        const a = analyserProduit(
            produit({
                costs: [
                    { category: "MATIERE_PREMIERE", label: "Clinker", unitCost: 1_000 },
                    { category: "MATIERE_PREMIERE", label: "Gypse", unitCost: 500 },
                    { category: "ENERGIE", label: "Électricité", unitCost: 500 },
                ],
            })
        );

        expect(a.ventilation).toHaveLength(2);
        expect(a.ventilation.find((v) => v.category === "MATIERE_PREMIERE")!.montant).toBe(1_500);
    });
});

describe("absence de données de coût", () => {
    // Regression : un produit sans composante affichait un cout nul, donc une
    // marge de 100 %.
    it("ne conclut pas à un coût nul quand rien n'est saisi", () => {
        const a = analyserProduit(produit({ costs: [] }));

        expect(a.coutRevient).toBeNull();
        expect(a.marge).toBeNull();
        expect(a.tauxMarge).toBeNull();
        expect(a.avertissements.join(" ")).toContain("indéterminé");
    });

    it("calcule tout de même le chiffre d'affaires si le volume est connu", () => {
        const a = analyserProduit(produit({ costs: [], quantite: 100 }));
        expect(a.chiffreAffaires).toBe(420_000);
        expect(a.margeTotale).toBeNull();
    });

    it("signale un prix de vente manquant", () => {
        const a = analyserProduit(produit({ sellingPrice: 0 }));
        expect(a.avertissements.join(" ")).toContain("Prix de vente");
        expect(a.tauxMarge).toBeNull();
    });

    it("signale une vente à perte", () => {
        const a = analyserProduit(produit({ sellingPrice: 2_000 }));
        expect(a.marge).toBeLessThan(0);
        expect(a.avertissements.join(" ")).toContain("à perte");
    });

    it("signale une composante négative", () => {
        const a = analyserProduit(
            produit({ costs: [{ category: "AUTRE", label: "Remise", unitCost: -100 }] })
        );
        expect(a.avertissements.join(" ")).toContain("négative");
    });
});

describe("synthèse de portefeuille", () => {
    it("distingue les produits évalués des indéterminés", () => {
        const s = synthetiser([
            analyserProduit(produit({ quantite: 100 })),
            analyserProduit(produit({ reference: "P-2", costs: [] })),
        ]);

        expect(s.nbProduits).toBe(2);
        expect(s.nbEvalues).toBe(1);
        expect(s.nbIndetermines).toBe(1);
    });

    it("pondère le taux de marge global par les volumes", () => {
        const s = synthetiser([
            analyserProduit(produit({ quantite: 1_000 })),
            analyserProduit(
                produit({
                    reference: "P-2",
                    sellingPrice: 350,
                    costs: [{ category: "MATIERE_PREMIERE", label: "Argile", unitCost: 180 }],
                    quantite: 1_000,
                })
            ),
        ]);

        // CA = 4 200 000 + 350 000 ; marge = 1 050 000 + 170 000
        expect(s.chiffreAffaires).toBe(4_550_000);
        expect(s.margeTotale).toBe(1_220_000);
        expect(s.tauxMargeGlobal).toBeCloseTo(26.81, 1);
    });

    it("compte les produits vendus à perte", () => {
        const s = synthetiser([
            analyserProduit(produit({ quantite: 10 })),
            analyserProduit(produit({ reference: "P-2", sellingPrice: 1_000, quantite: 10 })),
        ]);
        expect(s.nbAPerte).toBe(1);
    });

    it("ne calcule pas de taux global sans volume connu", () => {
        const s = synthetiser([analyserProduit(produit())]);
        expect(s.tauxMargeGlobal).toBeNull();
    });

    it("accepte un portefeuille vide", () => {
        const s = synthetiser([]);
        expect(s.nbProduits).toBe(0);
        expect(s.tauxMargeGlobal).toBeNull();
    });
});
