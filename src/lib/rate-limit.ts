/**
 * Rate limiter — fenêtre glissante par clé (IP, email…)
 *
 * Deux implémentations derrière la même signature :
 *
 *  - Distribuée (production) : Upstash Redis via REST, compatible Edge
 *    Runtime, activée dès que UPSTASH_REDIS_REST_URL et
 *    UPSTASH_REDIS_REST_TOKEN sont définies. Le compteur est partagé par
 *    toutes les instances Vercel : un attaquant ne peut plus multiplier ses
 *    tentatives de connexion en tombant sur des lambdas différentes.
 *
 *  - En mémoire : développement et tests uniquement. En production, l'absence
 *    ou la panne de Redis échoue fermée : un compteur local ne protège pas
 *    contre la répartition des requêtes sur plusieurs instances.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  /** "redis" quand le compteur est partagé entre instances, "memoire" sinon. */
  backend: "redis" | "memoire" | "indisponible";
}

// ── Repli en mémoire ─────────────────────────────────────────────────────────

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

/**
 * Compteur local à l'instance (synchrone). Exporté pour les tests et pour
 * les rares appelants qui ne peuvent pas attendre une promesse.
 * @param key     Clé unique (ex: `login:${ip}`)
 * @param limit   Nombre max de requêtes autorisées
 * @param window  Fenêtre de temps en secondes
 */
export function rateLimitMemoire(key: string, limit: number, window: number): RateLimitResult {
  cleanup();
  const now = Date.now();
  const windowMs = window * 1000;

  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs, backend: "memoire" };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt, backend: "memoire" };
  }

  entry.count += 1;
  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt, backend: "memoire" };
}

// ── Upstash Redis ────────────────────────────────────────────────────────────

export function estRateLimitDistribue(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

let redis: Redis | null = null;
const limiteurs = new Map<string, Ratelimit>();

function limiteur(limit: number, window: number): Ratelimit {
  const cle = `${limit}:${window}`;
  let l = limiteurs.get(cle);
  if (!l) {
    redis ??= Redis.fromEnv();
    l = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${window} s`),
      prefix: "c360:rl",
      analytics: false,
    });
    limiteurs.set(cle, l);
  }
  return l;
}

let derniereErreurRedis = 0;

/**
 * Limite le nombre d'appels par clé sur une fenêtre glissante.
 * Distribué via Upstash quand configuré, en mémoire sinon.
 */
export async function rateLimit(key: string, limit: number, window: number): Promise<RateLimitResult> {
  if (!estRateLimitDistribue()) {
    if (process.env.NODE_ENV === "production") {
      return { success: false, remaining: 0, resetAt: Date.now() + window * 1000, backend: "indisponible" };
    }
    return rateLimitMemoire(key, limit, window);
  }

  try {
    const r = await limiteur(limit, window).limit(key);
    return { success: r.success, remaining: r.remaining, resetAt: r.reset, backend: "redis" };
  } catch (e) {
    if (process.env.NODE_ENV === "production") {
      if (Date.now() - derniereErreurRedis > 60_000) {
        derniereErreurRedis = Date.now();
        console.error("[rate-limit] Upstash indisponible en production; requête refusée.", (e as Error)?.message);
      }
      return { success: false, remaining: 0, resetAt: Date.now() + window * 1000, backend: "indisponible" };
    }
    // Une seule trace par minute : une panne Redis ne doit pas inonder les logs.
    if (Date.now() - derniereErreurRedis > 60_000) {
      derniereErreurRedis = Date.now();
      console.warn("[rate-limit] Upstash injoignable, repli sur le compteur local :", (e as Error)?.message);
    }
    return rateLimitMemoire(key, limit, window);
  }
}
