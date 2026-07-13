export interface WaveTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  account?: string;
}

export function parseWaveCSV(csvContent: string): WaveTransaction[] {
  // Mock parser for Wave Accounting CSV exports
  // In reality, this would use a proper CSV parser and map columns
  
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) return [];
  
  const transactions: WaveTransaction[] = [];
  
  // Skip header
  for (let i = 1; i < Math.min(lines.length, 100); i++) {
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
