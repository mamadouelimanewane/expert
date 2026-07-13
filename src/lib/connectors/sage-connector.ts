export interface SageEntry {
  date: string;
  compte: string;
  libelle: string;
  debit: number;
  credit: number;
  piece?: string;
}

export function parseSageJournal(content: string): SageEntry[] {
  // Mock parser for Sage 100 journal exports (.PNM or .TXT format)
  // Highly dependent on export format. This simulates parsing.
  
  const entries: SageEntry[] = [];
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  
  for (let i = 0; i < Math.min(lines.length, 100); i++) {
    const line = lines[i];
    // Very simplistic split for demo purposes (e.g. Tab separated)
    const cols = line.split('\t');
    
    if (cols.length >= 5) {
      entries.push({
        date: cols[0],
        compte: cols[1],
        libelle: cols[2],
        debit: parseFloat(cols[3]) || 0,
        credit: parseFloat(cols[4]) || 0,
        piece: cols[5] || `EXT-${i}`
      });
    }
  }
  
  return entries;
}
