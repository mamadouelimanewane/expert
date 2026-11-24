import { describe, expect, it } from "vitest";
import { lireContenuDocumentGenere } from "@/lib/generated-document";

describe("lecture des documents générés", () => {
  it("sert le texte du procès-verbal plutôt que les métadonnées d'archivage", () => {
    const bytes = lireContenuDocumentGenere({ contenu: "Procès-verbal de l'assemblée", exercice: 2026 });
    expect(bytes?.toString("utf8")).toBe("Procès-verbal de l'assemblée");
  });

  it("sérialise les attestations structurées en JSON lisible", () => {
    const bytes = lireContenuDocumentGenere({ numeroCertificat: "BRS-2026-1", totalRetenu: 2500 });
    expect(JSON.parse(bytes!.toString("utf8"))).toEqual({ numeroCertificat: "BRS-2026-1", totalRetenu: 2500 });
  });

  it("préserve les documents texte et refuse l'absence de contenu", () => {
    expect(lireContenuDocumentGenere("document texte")?.toString("utf8")).toBe("document texte");
    expect(lireContenuDocumentGenere(null)).toBeNull();
  });
});
