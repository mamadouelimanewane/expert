export type ProfilEligibiliteClient = {
  country: string;
  type: string;
  fiscalRegime?: string;
  sector?: string | null;
  subjectToTva?: boolean;
  taxProfile: unknown;
};

export type ScopeRegleObligation = {
  clientTypes: readonly string[];
  fiscalRegimes: readonly string[];
  sectors: readonly string[];
  requiredTaxProfileFlags: readonly string[];
};

export function clientConcerneObligation(
  obligation: { id: string; categorie: string; pays: readonly string[] },
  client: ProfilEligibiliteClient,
  rule?: ScopeRegleObligation,
): boolean {
  const country = client.country.toUpperCase();
  if (!obligation.pays.includes(country)) return false;
  const profile = client.taxProfile && typeof client.taxProfile === "object" && !Array.isArray(client.taxProfile)
    ? client.taxProfile as Record<string, unknown>
    : {};

  if (rule) {
    return rule.clientTypes.includes(client.type)
      && (rule.fiscalRegimes.length === 0 || rule.fiscalRegimes.includes(client.fiscalRegime ?? ""))
      && (rule.sectors.length === 0 || rule.sectors.includes((client.sector ?? "").toUpperCase()))
      && rule.requiredTaxProfileFlags.every((flag) => profile[flag] === true);
  }

  if (obligation.categorie === "TVA") return client.subjectToTva === true || profile.vatRegistered === true;
  if (obligation.categorie === "SOCIAL" || obligation.id === "irpp-salaires") return profile.employer === true;
  if (obligation.id === "ras-bnc") return profile.withholdingAgent === true;
  return client.type === "ENTREPRISE" || client.type === "ASSOCIATION";
}
