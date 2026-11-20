import { describe, expect, it } from "vitest";
import { creerCertificatRetenueSource, TAUX_RETENUE_DEFAUT } from "@/lib/ohada/attestation-brs";

describe("Générateur d'Attestations et Certificats de Retenue BRS (UEMOA / Sénégal)", () => {
    const collecteur = {
        raisonSociale: "CABINET EXPERT AUDIT SARL",
        identifiantFiscal: "0012345678",
        registreCommerce: "SN-DKR-2020-B-1234",
        adresse: "Avenue Léopold Sédar Senghor",
        ville: "Dakar",
        pays: "Sénégal",
    };

    const beneficiaire = {
        raisonSociale: "SOCIETE DE CONSEIL ET MAINTENANCE",
        identifiantFiscal: "0098765432",
        adresse: "Rue 10 x Corniche Ouest",
        ville: "Dakar",
        pays: "Sénégal",
    };

    it("génère une attestation BRS conforme au CGI Sénégal avec retenue légale de 5 %", () => {
        const cert = creerCertificatRetenueSource({
            pays: "sn",
            typeRetenue: "BRS_PRESTATIONS_SERVICES_LOCALES",
            collecteur,
            beneficiaire,
            factures: [
                {
                    numeroFacture: "FAC-2026-001",
                    dateFacture: "2026-02-10",
                    description: "Maintenance du réseau informatique",
                    montantBrutHT: 2_000_000,
                },
                {
                    numeroFacture: "FAC-2026-002",
                    dateFacture: "2026-02-18",
                    description: "Audit de sécurité des serveurs",
                    montantBrutHT: 3_000_000,
                },
            ],
            signataireNom: "Mamadou Elimane Wane",
            quittanceVersement: {
                numeroQuittance: "DGID-QUIT-2026-8899",
                dateVersement: "2026-03-15",
                centreImpots: "DGE Dakar",
                montantRecepisse: 250_000,
            },
        });

        expect(cert.totalBrutHT).toBe(5_000_000);
        // 5 % de 5 000 000 = 250 000 F
        expect(cert.totalRetenu).toBe(250_000);
        expect(cert.totalNetPaye).toBe(4_750_000);
        expect(cert.numeroCertificat).toMatch(/^CERT-SN-2026-BRS-/);
        expect(cert.cleControle).toBeDefined();
        expect(cert.referenceLegale).toContain("CGI Sénégal art. 200");
    });

    it("applique le taux pour les non-résidents étrangers (20 %)", () => {
        const cert = creerCertificatRetenueSource({
            pays: "sn",
            typeRetenue: "RETENUE_NON_RESIDENTS_ETRANGERS",
            collecteur,
            beneficiaire: {
                raisonSociale: "CLOUD PROVIDER INC",
                identifiantFiscal: "US-EIN-992837",
                adresse: "Silicon Valley",
                ville: "San Francisco",
                pays: "États-Unis",
            },
            factures: [
                {
                    numeroFacture: "INV-CLOUD-88",
                    dateFacture: "2026-01-15",
                    description: "Hébergement serveurs dédiés",
                    montantBrutHT: 10_000_000,
                },
            ],
            signataireNom: "Directeur Financier",
        });

        // 20 % de 10 000 000 = 2 000 000 F
        expect(cert.totalRetenu).toBe(2_000_000);
        expect(cert.totalNetPaye).toBe(8_000_000);
    });
});
