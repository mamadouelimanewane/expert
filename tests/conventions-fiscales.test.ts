import { describe, expect, it } from "vitest";
import { analyserOperationTransfrontaliere } from "@/lib/ohada/conventions-fiscales";

describe("Matrice des Conventions Fiscales Internationales & Retenues", () => {
    it("applique le taux 0% pour les prestations de services intragroupes UEMOA sans établissement stable", () => {
        // Opération entre une filiale au Sénégal et un siège/prestataire en Côte d'Ivoire
        const analyse = analyserOperationTransfrontaliere({
            paysSource: "SN",
            paysBeneficiaire: "CI",
            natureFlux: "PRESTATIONS_DE_SERVICES_GENERALES",
            montantBrutPaiement: 20_000_000,
        });

        expect(analyse.conventionTrouvee).toBe(true);
        expect(analyse.nomConvention).toContain("UEMOA");
        expect(analyse.tauxRetenueDroitCommun).toBe(20);
        // Traité UEMOA : imposition exclusive dans l'État de résidence (taux 0 % à la source)
        expect(analyse.tauxRetenueApplicable).toBe(0);
        expect(analyse.montantRetenuConventionnel).toBe(0);
        expect(analyse.economieFiscaleClient).toBe(4_000_000); // 20% de 20M économisés !
        expect(analyse.justificatifsObligatoires).toContain("Certificat de résidence fiscale UEMOA.");
    });

    it("applique le taux réduit de 15% pour les redevances versées à une société résidente en France", () => {
        const analyse = analyserOperationTransfrontaliere({
            paysSource: "SN",
            paysBeneficiaire: "FR",
            natureFlux: "REDEVANCES_LOGICIELS_BREVETS",
            montantBrutPaiement: 10_000_000,
        });

        expect(analyse.conventionTrouvee).toBe(true);
        expect(analyse.nomConvention).toContain("France - Sénégal");
        expect(analyse.tauxRetenueDroitCommun).toBe(20);
        // Taux conventionnel réduit plafonné à 15 %
        expect(analyse.tauxRetenueApplicable).toBe(15);
        expect(analyse.montantRetenuConventionnel).toBe(1_500_000);
        expect(analyse.economieFiscaleClient).toBe(500_000);
        expect(analyse.articleApplicable).toContain("art. 20");
    });

    it("applique le taux plein de droit commun (20%) en l'absence de convention fiscale bilatérale", () => {
        const analyse = analyserOperationTransfrontaliere({
            paysSource: "SN",
            paysBeneficiaire: "BR", // Brésil (pas de convention)
            natureFlux: "ASSISTANCE_TECHNIQUE_MANAGEMENT_FEES",
            montantBrutPaiement: 5_000_000,
        });

        expect(analyse.conventionTrouvee).toBe(false);
        expect(analyse.tauxRetenueDroitCommun).toBe(20);
        expect(analyse.tauxRetenueApplicable).toBe(20);
        expect(analyse.montantRetenuConventionnel).toBe(1_000_000);
        expect(analyse.economieFiscaleClient).toBe(0);
    });
});
