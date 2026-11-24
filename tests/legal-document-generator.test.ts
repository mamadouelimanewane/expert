import { describe, it, expect } from "vitest";
import {
    genererPVAGOA,
    genererStatutsSARL,
    genererBailCommercial,
    genererContratTravailCDI,
} from "@/lib/ohada/legal-document-generator";

describe("Nexus-Legal v2 : Générateur d'actes juridiques certifiés OHADA", () => {
    it("génère un PV d'AGOA conforme aux exigences AUSCGIE (réserves, dividendes, quitus)", () => {
        const acte = genererPVAGOA({
            denomination: "SARL Sahel Solutions",
            formeSociale: "SARL",
            capitalSocial: 10_000_000,
            siegeSocial: "Dakar Plateau, Sénégal",
            rccm: "SN-DKR-2023-B-1234",
            dateAssemblee: "30 juin 2025",
            heureAssemblee: "10:00",
            dateCloture: "31 décembre 2024",
            lieuAssemblee: "Dakar",
            exerciceClos: 2024,
            resultatNet: 25_000_000,
            affectationReserveLegale: 2_500_000, // 10%
            dividendesDistribues: 15_000_000,
            nomGerantOuPresident: "Moustapha Ndiaye",
            presentsOuRepresentesPourcentage: 100,
            voteApprobation: "unanimite",
            voteAffectation: "unanimite",
            voteFormalites: "unanimite",
        }, "sn");

        expect(acte.type).toBe("PV_AGOA");
        expect(acte.texteIntegral).toContain("SARL SAHEL SOLUTIONS");
        expect(acte.texteIntegral).toContain("Le 30 juin 2025 à 10:00");
        expect(acte.texteIntegral).toContain("31 décembre 2024");
        expect(acte.texteIntegral).toContain("Réserve Légale (AUSCGIE art. 346)");
        expect(acte.mentionsObligatoiresVerifiees.length).toBeGreaterThanOrEqual(3);
        // Doit avoir un bon score de conformité (aucun risque léonin)
        expect(acte.analyseConformite.scoreConformite).toBeGreaterThanOrEqual(90);
    });

    it("génère des statuts constitutifs de SARL conformes à l'AUSCGIE", () => {
        const acte = genererStatutsSARL({
            denomination: "Tech West Africa SARL",
            siegeSocial: "Abidjan Plateau, Côte d'Ivoire",
            dureeAnnees: 99,
            objetSocial: "Développement de solutions logicielles et conseil technologique.",
            capitalSocial: 5_000_000,
            valeurNominalePart: 10_000,
            gerantNom: "Jean-Marc Kouassi",
            gerantNationalite: "Ivoirienne",
            associes: [
                { nom: "Jean-Marc Kouassi", parts: 300, apportMontant: 3_000_000 },
                { nom: "Awa Traoré", parts: 200, apportMontant: 2_000_000 },
            ],
            pays: "ci",
        });

        expect(acte.type).toBe("STATUTS_SARL");
        expect(acte.texteIntegral).toContain("STATUTS DE LA SOCIETE A RESPONSABILITE LIMITEE");
        expect(acte.texteIntegral).toContain("5 000 000 FCFA".replace(/\u202F|\u00A0/g, " "));
        expect(acte.texteIntegral).toContain("AUSCGIE art. 323");
        expect(acte.analyseConformite.scoreConformite).toBeGreaterThanOrEqual(90);
    });

    it("génère un bail commercial professionnel conforme à l'AUDCG (indemnité d'éviction)", () => {
        const acte = genererBailCommercial({
            bailleurNom: "Société Immobilière du Golfe",
            bailleurAdresse: "Cotonou, Bénin",
            preneurDenomination: "Cabinet Horizon Conseil",
            preneurRCCM: "BJ-COT-2022-B-5678",
            designationLocaux: "Immeuble Le Tamarin, 2ème étage, 150 m²",
            activiteAutorisee: "Activités de conseil juridique et fiscal",
            loyerMensuelHT: 600_000,
            depotGarantieMois: 3,
            dureeBailAnnees: 3,
            datePriseEffet: "1er janvier 2025",
            pays: "bj",
        });

        expect(acte.type).toBe("BAIL_COMMERCIAL");
        expect(acte.texteIntegral).toContain("AUDCG, art. 101 à 134");
        expect(acte.texteIntegral).toContain("indemnité d'éviction");
        expect(acte.texteIntegral).toContain("mise en demeure d'exécuter restée sans effet, conformément à l'article 123 de l'AUDCG");
    });

    it("génère un contrat de travail CDI conforme CCNI avec mentions obligatoires", () => {
        const acte = genererContratTravailCDI({
            employeurDenomination: "Cabinet Expert 360",
            employeurSiege: "Dakar, Sénégal",
            salarieNomPrenom: "Fatou Bintou Sow",
            salarieNationalite: "Sénégalaise",
            posteIntitule: "Chef de mission Audit",
            categorieProfessionnelle: "Cadre",
            salaireBaseMensuel: 900_000,
            primesMensuelles: 150_000,
            periodeEssaiMois: 3,
            dateEmbauche: "1er février 2025",
            conventionCollective: "Convention Collective Nationale Interprofessionnelle du Sénégal (CCNI)",
            pays: "sn",
        });

        expect(acte.type).toBe("CONTRAT_TRAVAIL_CDI");
        expect(acte.texteIntegral).toContain("CONTRAT DE TRAVAIL A DUREE INDETERMINEE");
        expect(acte.texteIntegral).toContain("CCNI");
        expect(acte.texteIntegral).toContain("Chef de mission Audit");
        expect(acte.disclaimerLegal).toContain("Nexus-Legal v2");
    });
});
