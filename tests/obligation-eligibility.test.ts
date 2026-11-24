import { describe, expect, it } from "vitest";
import { clientConcerneObligation } from "@/lib/obligation-eligibility";

const obligation = { id: "tva-mensuelle", categorie: "TVA", pays: ["SN"] };
const client = { country: "SN", type: "ENTREPRISE", fiscalRegime: "REEL_NORMAL", sector: "commerce", subjectToTva: true, taxProfile: { vatRegistered: true, employer: true } };

describe("périmètre des obligations par profil", () => {
  it("respecte le pays et l'assujettissement TVA du client", () => {
    expect(clientConcerneObligation(obligation, client)).toBe(true);
    expect(clientConcerneObligation(obligation, { ...client, country: "CI" })).toBe(false);
    expect(clientConcerneObligation(obligation, { ...client, subjectToTva: false, taxProfile: {} })).toBe(false);
  });

  it("applique les filtres structurés propres à la règle validée", () => {
    const rule = { clientTypes: ["ENTREPRISE"], fiscalRegimes: ["REEL_NORMAL"], sectors: ["COMMERCE"], requiredTaxProfileFlags: ["employer"] };
    expect(clientConcerneObligation(obligation, client, rule)).toBe(true);
    expect(clientConcerneObligation(obligation, { ...client, fiscalRegime: "CME" }, rule)).toBe(false);
    expect(clientConcerneObligation(obligation, { ...client, taxProfile: {} }, rule)).toBe(false);
  });
});
