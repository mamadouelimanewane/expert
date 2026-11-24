export type StatutSuiviObligation =
  | "NON_CONCERNE"
  | "A_SAISIR_DANS_OUTIL"
  | "PARTIEL"
  | "REJETEE"
  | "EN_COURS"
  | "DEPOSEE"
  | "A_VERIFIER";

/** Décrit le suivi connu dans l'application, sans conclure à une conformité légale. */
export function calculerStatutSuiviObligation(statuts: string[], nombreEligible: number): StatutSuiviObligation {
  if (nombreEligible === 0) return "NON_CONCERNE";
  const deposees = statuts.filter((status) => status === "SUBMITTED" || status === "VALIDATED").length;
  const rejetees = statuts.filter((status) => status === "REJECTED").length;
  const enCours = statuts.filter((status) => status === "DRAFT" || status === "PENDING").length;
  const nonSaisiesDansOutil = Math.max(0, nombreEligible - statuts.length);

  if (nonSaisiesDansOutil > 0) return statuts.length > 0 ? "PARTIEL" : "A_SAISIR_DANS_OUTIL";
  if (rejetees > 0) return "REJETEE";
  if (enCours > 0) return "EN_COURS";
  if (deposees === statuts.length && statuts.length > 0) return "DEPOSEE";
  return "A_VERIFIER";
}
