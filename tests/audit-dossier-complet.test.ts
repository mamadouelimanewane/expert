import { describe, it, expect } from "vitest";
import {
    initialiserDossierCAC,
    ajouterFeuilleTravail,
    evaluerCompletudeDossier,
    scellerDossierAudit,
    type FeuilleTravail,
} from "@/lib/ohada/audit-dossier-complet";

describe("Dossier de Travail CAC Automatisé (Norme ISA 230)", () => {
    it("initialise l'arborescence complète de 10 sections standards ISA 230", () => {
        const dossier = initialiserDossierCAC("Société Industrielle Dakaroise", 2024, 50_000_000);

        expect(dossier.id).toContain("CAC-");
        expect(dossier.sections.length).toBe(10);
        expect(dossier.seuilSignificationFCFA).toBe(50_000_000);
        expect(dossier.seuilRemonteeAnomaliesFCFA).toBe(2_500_000); // 5%

        const permanent = dossier.sections.find((s) => s.code === "P");
        const general = dossier.sections.find((s) => s.code === "G");
        const tresorerie = dossier.sections.find((s) => s.code === "T");

        expect(permanent?.nom).toBe("Dossier Permanent");
        expect(general?.nom).toContain("Planification");
        expect(tresorerie?.code).toBe("T");
    });

    it("ajoute des feuilles de travail et met à jour le statut de la section", () => {
        let dossier = initialiserDossierCAC("Groupe UEMOA Agro", 2024, 20_000_000);

        const feuilleBanque: FeuilleTravail = {
            id: "FT-01",
            reference: "T.10.1",
            titre: "Rapprochement bancaire Société Générale",
            objectifs: "Contrôler l'état de rapprochement bancaire au 31/12",
            assertions: ["EXISTENCE", "EVALUATION"],
            conclusions: "Solde rapproché avec succès, aucune suspens > 15 jours.",
            redacteur: "Assistant Audit",
            statut: "VALIDE",
            anomaliesDetectees: 0,
            montantAnomaliesFCFA: 0,
        };

        dossier = ajouterFeuilleTravail(dossier, "T", feuilleBanque);

        const secT = dossier.sections.find((s) => s.code === "T");
        expect(secT?.feuilles.length).toBe(1);
        expect(secT?.statut).toBe("VALIDE");
    });

    it("identifie les sections bloquantes et le dépassement du seuil de signification", () => {
        let dossier = initialiserDossierCAC("Compagnie Minière Ouest", 2024, 10_000_000);

        // Ajout d'une feuille avec anomalie significative supérieure au seuil
        const feuilleClients: FeuilleTravail = {
            id: "FT-02",
            reference: "D.20.1",
            titre: "Dépréciation des créances litigieuses",
            objectifs: "Vérifier la suffisance de la provision pour créances douteuses",
            assertions: ["EVALUATION"],
            conclusions: "Sous-évaluation manifeste de la provision client.",
            redacteur: "Senior Audit",
            statut: "POINTS_EN_SUSPENS",
            anomaliesDetectees: 2,
            montantAnomaliesFCFA: 15_000_000, // Dépasse le seuil de 10M
        };

        dossier = ajouterFeuilleTravail(dossier, "D", feuilleClients);
        const bilan = evaluerCompletudeDossier(dossier);

        expect(bilan.depassementSeuilSignification).toBe(true);
        expect(bilan.pretPourEmissionOpinion).toBe(false);
        expect(bilan.sectionsBloquantes.length).toBeGreaterThan(0);
        expect(bilan.totalMontantAnomaliesFCFA).toBe(15_000_000);
    });

    it("scelle le dossier d'audit avec calcul d'empreinte SHA-256 et certificat d'intégrité", () => {
        const dossier = initialiserDossierCAC("Banque Régionale OHADA", 2024, 100_000_000);
        const scelle = scellerDossierAudit(dossier, "Mamadou Sow (Associé Signataire)");

        expect(scelle.dossierId).toBe(dossier.id);
        expect(scelle.signataire).toContain("Mamadou Sow");
        expect(scelle.hashSHA256).toMatch(/^[a-f0-9]{64}$/); // SHA-256 valide
        expect(scelle.signatureCertificat).toContain("CERT-ISA230-");
        expect(scelle.indexSommaire).toContain("INDEX NUMÉRIQUE DU DOSSIER D'AUDIT");
    });
});
