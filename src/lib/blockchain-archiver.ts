import { createHash, randomUUID } from 'crypto';

export interface ArchiveRecord {
  id: string;
  documentHash: string;
  documentName: string;
  timestamp: string;
  author: string;
  signature: string;
}

export function generateHash(content: Buffer | string): string {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Calcule une empreinte d'intégrité (SHA-256) réelle sur le contenu du document.
 * IMPORTANT : il ne s'agit PAS d'un ancrage sur une vraie blockchain (aucun réseau distribué,
 * aucun consensus, aucune autorité d'horodatage tierce) — seulement un hash + un identifiant
 * local, persisté dans le journal d'audit du cabinet.
 */
export function archiveDocument(documentName: string, content: Buffer, author: string): ArchiveRecord {
  const docHash = generateHash(content);
  const id = randomUUID();

  return {
    id,
    documentHash: docHash,
    documentName,
    timestamp: new Date().toISOString(),
    author,
    signature: `SIG-${generateHash(docHash + author).substring(0, 16).toUpperCase()}`
  };
}
