export type IndicateursBalancePME = {
  chiffreAffairesHT: number;
  achatsEtChargesVariables: number;
  chargesFixesExploitation: number;
  stocksActuels: number;
  creancesClients: number;
  dettesFournisseurs: number;
  dettesFiscalesSociales: number;
  disponibilitesBancaires: number;
  encaissePhysiqueCaisse: number;
  concoursBancairesCourants: number;
};

type LigneBalance = { numero: string; debit: number; credit: number };

/** Lit une balance importée uniquement si toutes ses lignes sont exploitables. */
export function extraireIndicateursBalancePME(lignes: unknown): IndicateursBalancePME | null {
  if (!Array.isArray(lignes) || lignes.length === 0) return null;
  const parsed: LigneBalance[] = [];
  for (const item of lignes) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    const row = item as Record<string, unknown>;
    if (typeof row.numero !== "string" || !row.numero.trim()
      || typeof row.debit !== "number" || !Number.isFinite(row.debit) || row.debit < 0
      || typeof row.credit !== "number" || !Number.isFinite(row.credit) || row.credit < 0) return null;
    parsed.push({ numero: row.numero.replace(/\s/g, ""), debit: row.debit, credit: row.credit });
  }

  const soldeDebit = (prefixes: string[]) => parsed
    .filter((row) => prefixes.some((prefix) => row.numero.startsWith(prefix)))
    .reduce((sum, row) => sum + row.debit - row.credit, 0);
  const soldeCredit = (prefixes: string[]) => parsed
    .filter((row) => prefixes.some((prefix) => row.numero.startsWith(prefix)))
    .reduce((sum, row) => sum + row.credit - row.debit, 0);

  return {
    chiffreAffairesHT: Math.max(0, soldeCredit(["70"])),
    achatsEtChargesVariables: Math.max(0, soldeDebit(["60", "61"])),
    chargesFixesExploitation: Math.max(0, soldeDebit(["62", "63", "64", "65", "66", "68"])),
    stocksActuels: Math.max(0, soldeDebit(["3"])),
    creancesClients: Math.max(0, soldeDebit(["41"])),
    dettesFournisseurs: Math.max(0, soldeCredit(["40"])),
    dettesFiscalesSociales: Math.max(0, soldeCredit(["42", "43", "44"])),
    disponibilitesBancaires: Math.max(0, soldeDebit(["52"])),
    encaissePhysiqueCaisse: Math.max(0, soldeDebit(["57"])),
    concoursBancairesCourants: Math.max(0, soldeCredit(["56"])),
  };
}
