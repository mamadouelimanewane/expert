export interface WaveTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  account?: string;
}

/**
 * Parseur CSV générique (colonnes attendues : date, description, compte,
 * montant). Couvre les exports Wave et tout CSV respectant cet ordre ; ne gère
 * ni le format .PNM propriétaire de Sage, ni le FEC de QuickBooks.
 */
export function parseWaveCSV(csvContent: string): WaveTransaction[] {
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  const transactions: WaveTransaction[] = [];

  // Ligne d'en-tête ignorée ; 500 lignes au maximum par import (même plafond
  // que /api/ingest/import).
  for (let i = 1; i < Math.min(lines.length, 501); i++) {
    const line = lines[i];
    const columns = line.split(',');
    
    // Simplistic mapping: Date, Description, Account, Amount
    if (columns.length >= 4) {
      const amount = parseFloat(columns[3].replace(/[^0-9.-]+/g,"")) || 0;
      transactions.push({
        date: columns[0] || new Date().toISOString().split('T')[0],
        description: columns[1] || 'Transaction importée',
        account: columns[2] || '',
        amount: Math.abs(amount),
        type: amount > 0 ? 'income' : 'expense'
      });
    }
  }
  
  return transactions;
}
