import { analyserMontant, normaliserDateISO } from "@/lib/validation";

export interface WaveTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  account?: string;
}

export interface ResultatImportCSV {
  transactions: WaveTransaction[];
  /** Lignes non exploitables, avec leur numéro et le motif du rejet. */
  lignesRejetees: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Lecture d'un relevé CSV (colonnes attendues : date, description, compte,
// montant), utilisée par /ingest/connectors puis versée dans le journal via
// /api/ingest/import.
//
// Trois défauts corrigés :
//
// 1. Le montant était lu par
//    `parseFloat(colonne.replace(/[^0-9.-]+/g, ""))`. Cette expression retire
//    la virgule décimale : un montant « 1250,50 » devenait « 125050 », soit
//    une écriture cent fois trop élevée, sans le moindre avertissement.
//
// 2. Une valeur illisible retombait sur `|| 0`, et `amount > 0 ? income :
//    expense` classait alors la ligne en dépense de 0 FCFA. Le relevé était
//    importé « avec succès », amputé en silence.
//
// 3. Le séparateur était toujours la virgule. Un CSV francophone (点-virgule)
//    ou un champ entre guillemets contenant une virgule décalait toutes les
//    colonnes — la date devenait le libellé, le libellé le compte, etc.
// ─────────────────────────────────────────────────────────────────────────────

const LIGNES_MAX = 500;

/** Sépare une ligne CSV en respectant les champs entre guillemets. */
function decouper(ligne: string, separateur: string): string[] {
  const champs: string[] = [];
  let courant = "";
  let entreGuillemets = false;

  for (let i = 0; i < ligne.length; i++) {
    const c = ligne[i];

    if (c === '"') {
      // Guillemet doublé à l'intérieur d'un champ cité = guillemet littéral.
      if (entreGuillemets && ligne[i + 1] === '"') {
        courant += '"';
        i++;
      } else {
        entreGuillemets = !entreGuillemets;
      }
      continue;
    }

    if (c === separateur && !entreGuillemets) {
      champs.push(courant.trim());
      courant = "";
      continue;
    }

    courant += c;
  }

  champs.push(courant.trim());
  return champs;
}

/** Séparateur le plus probable, déduit de la ligne d'en-tête. */
export function detecterSeparateur(enTete: string): string {
  const candidats = [";", ",", "\t", "|"];
  let meilleur = ",";
  let maximum = 0;

  for (const c of candidats) {
    const occurrences = enTete.split(c).length - 1;
    if (occurrences > maximum) {
      maximum = occurrences;
      meilleur = c;
    }
  }

  return meilleur;
}

/**
 * Parseur CSV générique (colonnes attendues : date, description, compte,
 * montant). Couvre les exports Wave et tout CSV respectant cet ordre ; ne gère
 * ni le format .PNM propriétaire de Sage, ni le FEC de QuickBooks.
 */
export function parseWaveCSV(csvContent: string): ResultatImportCSV {
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) return { transactions: [], lignesRejetees: [] };

  const separateur = detecterSeparateur(lines[0]);
  const transactions: WaveTransaction[] = [];
  const lignesRejetees: string[] = [];

  // Ligne d'en-tête ignorée ; 500 lignes au maximum par import (même plafond
  // que /api/ingest/import).
  const derniere = Math.min(lines.length, LIGNES_MAX + 1);

  for (let i = 1; i < derniere; i++) {
    const numero = i + 1; // numéro de ligne dans le fichier, en-tête comprise
    const columns = decouper(lines[i], separateur);

    if (columns.length < 4) {
      lignesRejetees.push(`Ligne ${numero} : ${columns.length} colonne(s) au lieu de 4 attendues.`);
      continue;
    }

    const date = normaliserDateISO(columns[0]);
    if (date === null) {
      lignesRejetees.push(`Ligne ${numero} : date illisible « ${columns[0]} ».`);
      continue;
    }

    const description = columns[1] || "";
    if (!description) {
      lignesRejetees.push(`Ligne ${numero} : libellé manquant.`);
      continue;
    }

    const montant = analyserMontant(columns[3]);
    if (!montant.ok) {
      lignesRejetees.push(`Ligne ${numero} (${description}) : ${montant.raison}`);
      continue;
    }
    if (montant.valeur === 0) {
      lignesRejetees.push(`Ligne ${numero} (${description}) : montant nul.`);
      continue;
    }

    transactions.push({
      date,
      description,
      account: columns[2] || '',
      amount: Math.abs(montant.valeur),
      type: montant.valeur > 0 ? 'income' : 'expense',
    });
  }

  if (lines.length - 1 > LIGNES_MAX) {
    lignesRejetees.push(
      `Fichier tronqué : ${lines.length - 1} lignes soumises, ${LIGNES_MAX} au maximum par import.`
    );
  }

  return { transactions, lignesRejetees };
}
