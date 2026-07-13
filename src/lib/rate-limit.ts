/**
 * Rate limiter en mémoire — sliding window par clé (IP, email…)
 *
 * Fonctionne dans l'Edge Runtime (middleware Vercel).
 * Chaque instance lambda garde son propre state ; pour un rate limiting
 * persistent multi-instance, remplacer par @upstash/ratelimit + Redis KV.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Nettoyage toutes les 10 minutes pour éviter les fuites mémoire
let lastCleanup = Date.now();
function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < 10 * 60 * 1000) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * @param key     Clé unique (ex: `login:${ip}`)
 * @param limit   Nombre max de requêtes autorisées
 * @param window  Fenêtre de temps en secondes
 */
export function rateLimit(
  key: string,
  limit: number,
  window: number
): RateLimitResult {
  cleanup();
  const now = Date.now();
  const windowMs = window * 1000;

  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}
