export const AUDIT_SAMPLE_METHODS = ["RANDOM", "SYSTEMATIC", "TARGETED"] as const;
export const AUDIT_SAMPLE_CONCLUSIONS = ["NO_EXCEPTION", "EXCEPTION", "INCONCLUSIVE", "PENDING"] as const;

export function validateAuditSample(input: Record<string, unknown>) {
  const populationSize = Number(input.populationSize);
  const sampleSize = Number(input.sampleSize);
  const exceptionsCount = Number(input.exceptionsCount ?? 0);
  const selectedItems = Array.isArray(input.selectedItems)
    ? input.selectedItems.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)
    : typeof input.selectedItems === "string"
      ? input.selectedItems.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)
      : [];
  const procedureReference = typeof input.procedureReference === "string" ? input.procedureReference.trim() : "";
  const populationDescription = typeof input.populationDescription === "string" ? input.populationDescription.trim() : "";
  const method = input.method;
  const conclusion = input.conclusion ?? "PENDING";

  if (procedureReference.length < 2 || procedureReference.length > 200) return { ok: false as const, error: "La référence de procédure doit contenir de 2 à 200 caractères." };
  if (populationDescription.length < 5 || populationDescription.length > 2000) return { ok: false as const, error: "Décrivez la population (5 à 2 000 caractères)." };
  if (!Number.isInteger(populationSize) || populationSize < 1 || populationSize > 1_000_000_000) return { ok: false as const, error: "La taille de population doit être un entier positif." };
  if (!Number.isInteger(sampleSize) || sampleSize < 1 || sampleSize > populationSize) return { ok: false as const, error: "La taille d’échantillon doit être comprise entre 1 et la taille de population." };
  if (!Number.isInteger(exceptionsCount) || exceptionsCount < 0 || exceptionsCount > sampleSize) return { ok: false as const, error: "Le nombre d’exceptions doit être compris entre 0 et la taille de l’échantillon." };
  if (!(AUDIT_SAMPLE_METHODS as readonly unknown[]).includes(method)) return { ok: false as const, error: "Méthode d’échantillonnage invalide." };
  if (!(AUDIT_SAMPLE_CONCLUSIONS as readonly unknown[]).includes(conclusion)) return { ok: false as const, error: "Conclusion d’échantillonnage invalide." };
  if (selectedItems.length !== sampleSize || selectedItems.some((item) => item.length > 300) || new Set(selectedItems).size !== selectedItems.length) return { ok: false as const, error: "Renseignez chaque élément de l’échantillon une seule fois; les identifiants doivent être uniques." };
  if (exceptionsCount === 0 && conclusion === "EXCEPTION") return { ok: false as const, error: "Une conclusion avec exception requiert au moins une exception documentée." };
  if (exceptionsCount > 0 && !["EXCEPTION", "INCONCLUSIVE"].includes(String(conclusion))) return { ok: false as const, error: "Documentez une exception ou concluez que le test est non concluant." };
  const exceptionDetails = typeof input.exceptionDetails === "string" ? input.exceptionDetails.trim().slice(0, 5000) || null : null;
  if (exceptionsCount > 0 && (!exceptionDetails || exceptionDetails.length < 5)) return { ok: false as const, error: "Décrivez les exceptions constatées (5 caractères minimum)." };
  return { ok: true as const, value: { procedureReference, populationDescription, populationSize, sampleSize, method: String(method), selectedItems, exceptionsCount, exceptionDetails, conclusion: String(conclusion) } };
}
