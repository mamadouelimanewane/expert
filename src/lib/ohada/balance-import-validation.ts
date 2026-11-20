import { resolveRule } from "@/lib/ohada/syscohada-engine";
import { analyserMontant } from "@/lib/validation";
import type { CompteBalance } from "@/lib/ohada/types";

const MAX_LIGNES = 5000;

export type AnalyseBalance =
  | { ok: true; lignes: CompteBalance[]; avertissements: string[] }
  | { ok: false; raison: string; rejets: string[] };

/** Validate imported balance rows while preserving duplicate and unmapped-account warnings. */
export function analyserLignesBalance(brutes: unknown): AnalyseBalance {
  if (!Array.isArray(brutes) || brutes.length === 0) {
    return { ok: false, raison: "Aucune ligne de balance reçue.", rejets: [] };
  }
  if (brutes.length > MAX_LIGNES) {
    return { ok: false, raison: `${MAX_LIGNES} lignes au maximum par balance.`, rejets: [] };
  }

  const parCompte = new Map<string, CompteBalance>();
  const lignesCompte = new Map<string, number[]>();
  const rejets: string[] = [];

  brutes.forEach((brut: unknown, i: number) => {
    const n = i + 1;
    if (!brut || typeof brut !== "object" || Array.isArray(brut)) {
      rejets.push(`Ligne ${n} : format de ligne invalide.`);
      return;
    }
    const b = brut as Record<string, unknown>;
    const numero = String(b.numero ?? "").replace(/\s+/g, "").trim();
    if (!/^\d{1,13}$/.test(numero)) {
      rejets.push(`Ligne ${n} : numéro de compte illisible « ${String(b.numero ?? "")} ».`);
      return;
    }
    const debit = analyserMontant(b.debit ?? 0, { min: 0 });
    const credit = analyserMontant(b.credit ?? 0, { min: 0 });
    if (!debit.ok) {
      rejets.push(`Ligne ${n} (${numero}) : débit — ${debit.raison}`);
      return;
    }
    if (!credit.ok) {
      rejets.push(`Ligne ${n} (${numero}) : crédit — ${credit.raison}`);
      return;
    }
    if (debit.valeur === 0 && credit.valeur === 0) return;

    const numerotation = lignesCompte.get(numero) ?? [];
    numerotation.push(n);
    lignesCompte.set(numero, numerotation);

    const intitule = String(b.intitule ?? "").trim().slice(0, 200) || numero;
    const existant = parCompte.get(numero);
    if (existant) {
      existant.debit += debit.valeur;
      existant.credit += credit.valeur;
    } else {
      parCompte.set(numero, { numero, intitule, debit: debit.valeur, credit: credit.valeur });
    }
  });

  if (rejets.length) {
    return {
      ok: false,
      raison: "Certaines lignes n'ont pas pu être lues : la balance n'a pas été enregistrée.",
      rejets: rejets.slice(0, 30),
    };
  }
  if (parCompte.size === 0) {
    return { ok: false, raison: "Toutes les lignes sont à zéro.", rejets: [] };
  }

  const avertissements: string[] = [];
  for (const [numero, numerosLignes] of lignesCompte) {
    if (numerosLignes.length > 1) {
      avertissements.push(`Compte ${numero} présent aux lignes ${numerosLignes.join(", ")} : les montants ont été cumulés.`);
    }
    if (!resolveRule(numero)) {
      avertissements.push(`Compte ${numero} absent des règles d'affectation SYSCOHADA : il reste visible mais ne sera pas ventilé automatiquement dans les états.`);
    }
  }

  return {
    ok: true,
    lignes: [...parCompte.values()].sort((a, b) => a.numero.localeCompare(b.numero)),
    avertissements,
  };
}
