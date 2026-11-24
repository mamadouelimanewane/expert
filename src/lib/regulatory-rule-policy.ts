export type RegleReglementaireApplicable = {
  country: string;
  declarationType: string;
  periodicity: string;
  dueDay: number;
  dueMonth: number | null;
  effectiveFrom: Date;
  effectiveUntil: Date | null;
  status: string;
  retiredAt?: Date | null;
};

export type RegleCalendrier = Pick<RegleReglementaireApplicable,
  "status" | "periodicity" | "dueMonth" | "dueDay" | "effectiveFrom" | "effectiveUntil" | "retiredAt"
>;

/** Vrai si le texte reste en vigueur pendant le mois demandé, même si son échéance n'est pas mensuelle. */
export function regleEnVigueurDansLeMois(rule: RegleCalendrier, annee: number, mois: number): boolean {
  if (!Number.isInteger(annee) || !Number.isInteger(mois) || mois < 1 || mois > 12) return false;
  const debutMois = new Date(Date.UTC(annee, mois - 1, 1));
  const finMois = new Date(Date.UTC(annee, mois, 1));
  if (rule.effectiveFrom >= finMois || (rule.effectiveUntil && rule.effectiveUntil < debutMois)) return false;
  if (rule.status === "RETIRED" && rule.retiredAt && rule.retiredAt <= debutMois) return false;
  return rule.status === "VERIFIED" || rule.status === "RETIRED";
}

/** Vrai si la règle en vigueur produit effectivement une échéance dans le mois. */
export function regleActiveDansLeMois(rule: RegleCalendrier, annee: number, mois: number): boolean {
  if (!regleEnVigueurDansLeMois(rule, annee, mois)) return false;
  const periodicityMatches = rule.periodicity === "MENSUELLE"
    || (rule.periodicity === "TRIMESTRIELLE" && rule.dueMonth === ((mois - 1) % 3) + 1)
    || (rule.periodicity === "ANNUELLE" && rule.dueMonth === mois);
  if (!periodicityMatches) return false;

  const dernierJour = new Date(Date.UTC(annee, mois, 0)).getUTCDate();
  const dateEcheance = new Date(Date.UTC(annee, mois - 1, Math.min(rule.dueDay, dernierJour)));
  return rule.effectiveFrom <= dateEcheance
    && (!rule.effectiveUntil || rule.effectiveUntil >= dateEcheance)
    && (rule.status !== "RETIRED" || !rule.retiredAt || dateEcheance < rule.retiredAt);
}

/** Vérifie la période, la date prévue et le type avant de figer une règle sur une déclaration. */
export function verifierReglePourDeclaration(
  rule: RegleReglementaireApplicable,
  declaration: { country: string; type: string; period: string; dueDate: Date },
): string | null {
  if (rule.status !== "VERIFIED" && rule.status !== "RETIRED") return "La règle n’est pas validée.";
  if (rule.country !== declaration.country) return "La règle ne correspond pas au pays du client.";
  if (rule.declarationType !== declaration.type) return "Le type de déclaration ne correspond pas à la règle validée.";

  const date = declaration.dueDate;
  if (rule.status === "RETIRED" && rule.retiredAt && date >= rule.retiredAt) return "La règle a été retirée à cette date.";
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), month, 0)).getUTCDate();
  const expectedDay = Math.min(rule.dueDay, lastDay);
  if (day !== expectedDay) return "La date d’échéance ne correspond pas au jour défini dans la règle.";
  if (date < rule.effectiveFrom || (rule.effectiveUntil && date > rule.effectiveUntil)) return "La règle n’est pas en vigueur à cette date.";

  const match = /^(\d{4})-(\d{2}|T[1-4]|A)$/.exec(declaration.period);
  if (!match) return "La période ne correspond pas au format attendu.";
  const year = Number(match[1]);
  if (rule.periodicity === "MENSUELLE") {
    if (!/^\d{4}-\d{2}$/.test(declaration.period) || Number(match[2]) !== month || year !== date.getUTCFullYear()) return "La période ne correspond pas à l’échéance mensuelle.";
  } else if (rule.periodicity === "TRIMESTRIELLE") {
    if (!/^\d{4}-T[1-4]$/.test(declaration.period) || !rule.dueMonth) return "La période trimestrielle est invalide pour cette règle.";
    const quarter = Number(match[2].slice(1));
    const expectedMonth = (quarter - 1) * 3 + rule.dueMonth;
    if (month !== expectedMonth || year !== date.getUTCFullYear()) return "La date ne correspond pas au mois prévu dans le trimestre.";
  } else if (rule.periodicity === "ANNUELLE") {
    if (!/^\d{4}-A$/.test(declaration.period) || rule.dueMonth !== month) return "La date ne correspond pas à la période annuelle.";
  } else {
    return "La périodicité de la règle n’est pas reconnue.";
  }
  return null;
}
