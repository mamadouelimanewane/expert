import { describe, expect, it } from "vitest";
import { effectuerCadrageTVA, type DeclarationTVAMensuelle } from "@/lib/ohada/cadrage-tva";
import type { CompteBalance } from "@/lib/ohada/types";

describe("Cadrage Automatique TVA & Cohérence Grand Livre", () => {
    const creer12Declarations = (caMensuel: number): DeclarationTVAMensuelle[] => {
        return Array.from({ length: 12 }, (_, i) => {
            const mois = i + 1;
            const ca = caMensuel;
            const tvaCollectee = Math.round(ca * 0.18);
            const tvaDeductible = Math.round(ca * 0.08);
            return {
                mois,
                periode: `2026-${String(mois).padStart(2, "0")}`,
                chiffreAffairesTaxableDeclare: ca,
                chiffreAffairesExonereDeclare: 0,
                chiffreAffairesExportDeclare: 0,
                chiffreAffairesTotalDeclare: ca,
                tvaCollecteeDeclaree: tvaCollectee,
                tvaDeductibleDeclaree: tvaDeductible,
                tvaNetteDueDeclaree: tvaCollectee - tvaDeductible,
                creditTVAReporte: 0,
            };
        });
    };

    it("déclare le dossier CONFORME lorsque la balance et les 12 déclarations concordent parfaitement", () => {
        // 10 000 000 par mois = 120 000 000 annuel
        const declarations = creer12Declarations(10_000_000);
        const caAnnuel = 120_000_000;
        const tvaCollecteeAnnuelle = Math.round(caAnnuel * 0.18); // 21 600 000
        const tvaDeductibleAnnuelle = Math.round(caAnnuel * 0.08); // 9 600 000

        const balance: CompteBalance[] = [
            { numero: "7011", intitule: "Ventes de marchandises", debit: 0, credit: caAnnuel },
            { numero: "4431", intitule: "État, TVA facturée", debit: 0, credit: tvaCollecteeAnnuelle },
            { numero: "4452", intitule: "État, TVA déductible s/ biens et services", debit: tvaDeductibleAnnuelle, credit: 0 },
        ];

        const synthese = effectuerCadrageTVA("sn", 2026, balance, declarations);

        expect(synthese.statutCadrage).toBe("CONFORME");
        expect(synthese.ecartChiffreAffaires).toBe(0);
        expect(synthese.ecartTVACollectee).toBe(0);
        expect(synthese.ecartTVADeductible).toBe(0);
        expect(synthese.anomalies.length).toBe(0);
    });

    it("détecte une anomalie critique de minoration de CA si le Grand Livre dépasse les déclarations", () => {
        // 12 déclarations de 5M = 60M déclarés
        const declarations = creer12Declarations(5_000_000);
        // Mais en comptabilité classe 7 = 80M (20M non déclarés !)
        const balance: CompteBalance[] = [
            { numero: "7011", intitule: "Ventes", debit: 0, credit: 80_000_000 },
            { numero: "4431", intitule: "TVA collectée", debit: 0, credit: Math.round(60_000_000 * 0.18) },
            { numero: "4452", intitule: "TVA déductible", debit: Math.round(60_000_000 * 0.08), credit: 0 },
        ];

        const synthese = effectuerCadrageTVA("sn", 2026, balance, declarations);

        expect(synthese.statutCadrage).toBe("RISQUE_REDRESSEMENT_ELEVE");
        expect(synthese.ecartChiffreAffaires).toBe(20_000_000);
        const anomalie = synthese.anomalies.find((a) => a.code === "ANOMALIE_CA_CADRAGE");
        expect(anomalie).toBeDefined();
        expect(anomalie?.gravite).toBe("CRITIQUE");
    });

    it("calcule la régularisation requise pour une entreprise mixte avec variation de prorata >= 5 points", () => {
        const declarations: DeclarationTVAMensuelle[] = Array.from({ length: 12 }, (_, i) => ({
            mois: i + 1,
            periode: `2026-${String(i + 1).padStart(2, "0")}`,
            chiffreAffairesTaxableDeclare: 10_000_000,
            chiffreAffairesExonereDeclare: 5_000_000,
            chiffreAffairesExportDeclare: 0,
            chiffreAffairesTotalDeclare: 15_000_000,
            tvaCollecteeDeclaree: 1_800_000,
            tvaDeductibleDeclaree: 800_000,
            tvaNetteDueDeclaree: 1_000_000,
            creditTVAReporte: 0,
        }));

        const caAnnuel = 180_000_000;
        const balance: CompteBalance[] = [
            { numero: "7011", intitule: "Ventes taxables", debit: 0, credit: 120_000_000 },
            { numero: "7012", intitule: "Ventes exonérées", debit: 0, credit: 60_000_000 },
            { numero: "4431", intitule: "TVA facturée", debit: 0, credit: 12 * 1_800_000 },
            { numero: "4452", intitule: "TVA déductible", debit: 12 * 800_000, credit: 0 },
        ];

        // Prorata provisoire de 80 %, mais résultat réel calculé à ~70 % (-10 points)
        const synthese = effectuerCadrageTVA("sn", 2026, balance, declarations, {
            prorataProvisoire: 80,
            caExonereSansDroit: 60_000_000,
        });

        expect(synthese.prorata.estEntrepriseMixte).toBe(true);
        expect(synthese.prorata.tauxProrataDefinitif).toBeLessThan(80);
        expect(Math.abs(synthese.prorata.variationProrata)).toBeGreaterThanOrEqual(5);
        expect(synthese.prorata.regularisationTVAADeduireOuReverser).not.toBe(0);
    });
});
