import { describe, it, expect } from "vitest";
import { analyserContratOHADA, genererConsultationFiscaleSync } from "@/lib/ohada/nexus-legal-core";

describe("analyserContratOHADA", () => {
  it("détecte une clause léonine dans un contrat de société", () => {
    const texte = "L'associé majoritaire percevra la totalité des profits sans contribution aux pertes.";
    const resultat = analyserContratOHADA(texte, "SN");
    expect(resultat.risques.length).toBeGreaterThan(0);
    const leonine = resultat.risques.find((r) => r.domaine === "CLAUSE_LEONINE");
    expect(leonine).toBeDefined();
    expect(leonine!.gravite).toBe("CRITIQUE");
    expect(leonine!.article).toContain("AUSCGIE art. 54");
  });

  it("détecte un risque d'établissement stable pour un contrat avec représentant permanent", () => {
    const texte =
      "La société étrangère désigne un représentant exclusif pour l'ensemble du territoire sénégalais avec pouvoir de conclure des contrats.";
    const resultat = analyserContratOHADA(texte, "SN");
    const es = resultat.risques.find((r) => r.domaine === "ETABLISSEMENT_STABLE");
    expect(es).toBeDefined();
    expect(es!.gravite).toBe("ELEVE");
  });

  it("retourne un score de conformité de 100 pour un contrat sans risque", () => {
    const texte = "Les parties conviennent d'une prestation de services de conseil en gestion.";
    const resultat = analyserContratOHADA(texte, "CI");
    expect(resultat.scoreConformite).toBe(100);
    expect(resultat.risques).toHaveLength(0);
  });

  it("génère un disclaimer de non-opposabilité", () => {
    const resultat = analyserContratOHADA("contrat test", "BJ");
    expect(resultat.disclaimer).toContain("opposable");
  });
});

describe("genererConsultationFiscaleSync", () => {
  it("retourne une consultation avec références doctrine", () => {
    const consultation = genererConsultationFiscaleSync(
      "Déductibilité des intérêts CCA",
      "Société avec CCA de 50M FCFA à taux 8%",
      "SN"
    );
    expect(consultation.reponse).not.toBeNull();
    expect(consultation.referencesDoctrine.length).toBeGreaterThan(0);
    expect(consultation.disclaimer).toContain("opposable");
  });

  it("adapte le pays dans la consultation", () => {
    const consultation = genererConsultationFiscaleSync("TVA sur services", "importation de services IT", "CI");
    expect(consultation.reponse).toContain("Côte d'Ivoire");
    expect(consultation.pays).toBe("CI");
  });
});
