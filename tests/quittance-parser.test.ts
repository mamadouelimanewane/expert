import { describe, expect, it } from "vitest";
import { analyserTexteQuittance, parserMontantQuittance } from "@/lib/ohada/quittance-parser";

describe("Analyseur de Quittances Fiscale et Reçus de Télépaiement", () => {
    it("parse correctement les montants avec formats monétaires variés", () => {
        expect(parserMontantQuittance("1 250 000 FCFA")).toBe(1_250_000);
        expect(parserMontantQuittance("500.000 F")).toBe(500_000);
        expect(parserMontantQuittance("45 000 CFA")).toBe(45_000);
        expect(parserMontantQuittance("123000")).toBe(123_000);
    });

    it("extrait les éléments d'une quittance DGID Sénégal (Senetaf / e-Tax)", () => {
        const texteQuittance = `
            RÉPUBLIQUE DU SÉNÉGAL
            MINISTÈRE DES FINANCES ET DU BUDGET
            DIRECTION GÉNÉRALE DES IMPÔTS ET DES DOMAINES (DGID)
            PORTAIL SENETAF
            
            QUITTANCE DE PAIEMENT FISCAL
            N° de quittance : QUIT-2026-DKR-0098421
            Date de paiement : 15/02/2026
            
            Contribuable : SARL DIALLO & FRÈRES
            NINEA : 004829102
            Centre des impôts : DGE Dakar 1
            
            Impôt liquidé : Taxe sur la Valeur Ajoutée (TVA)
            Période : Janvier 2026
            
            Montant payé : 2 450 000 FCFA
            Mode de règlement : Virement bancaire RTGS
            Statut : PAYÉ ET VALIDÉ
        `;

        const extraction = analyserTexteQuittance(texteQuittance);

        expect(extraction.succes).toBe(true);
        expect(extraction.organismeEmetteur).toBe("DGID_SENEGAL");
        expect(extraction.numeroQuittance).toBe("QUIT-2026-DKR-0098421");
        expect(extraction.montantPaye).toBe(2_450_000);
        expect(extraction.identifiantContribuable).toBe("004829102");
        expect(extraction.datePaiement).toBe("2026-02-15");
        expect(extraction.typeDeclarationDetecte).toBe("TVA");
        expect(extraction.periodeDetectee).toBe("2026-01");
        expect(extraction.confianceGlobale).toBeGreaterThanOrEqual(80);
    });

    it("signale les alertes si des champs essentiels manquent", () => {
        const texteIncomplet = "Reçu de paiement sans numéro ni date";
        const extraction = analyserTexteQuittance(texteIncomplet);

        expect(extraction.succes).toBe(false);
        expect(extraction.numeroQuittance).toBeNull();
        expect(extraction.montantPaye).toBeNull();
        expect(extraction.alertes.length).toBeGreaterThan(0);
    });
});
