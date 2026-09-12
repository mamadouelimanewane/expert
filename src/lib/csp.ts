/**
 * Content Security Policy avec nonce par requête.
 *
 * Avant : `script-src 'self' 'unsafe-inline' 'unsafe-eval'` — n'importe quel
 * script injecté (XSS stockée dans un libellé, extension malveillante…)
 * s'exécutait. Désormais seuls les scripts portant le nonce de la requête,
 * ou chargés par eux ('strict-dynamic'), sont autorisés. Next.js appose
 * lui-même ce nonce sur ses balises quand il le trouve dans l'en-tête CSP
 * de la requête entrante (voir middleware.ts). Aucun script inline maison :
 * l'enregistrement du service worker passe par un composant client
 * (un nonce posé en JSX est masqué par le navigateur et casse l'hydratation).
 *
 * Compatible Edge Runtime (Web Crypto uniquement).
 */

export function genererNonce(): string {
  const octets = new Uint8Array(16);
  crypto.getRandomValues(octets);
  let binaire = "";
  for (const o of octets) binaire += String.fromCharCode(o);
  return btoa(binaire);
}

/** Directives communes à la politique de repli (next.config.ts) et à celle du middleware. */
export const CSP_DIRECTIVES_COMMUNES = [
  "default-src 'self'",
  // Tailwind/styled-jsx injectent des styles inline ; le nonce ne couvre pas
  // les attributs style="" des composants, donc 'unsafe-inline' reste requis.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  // Déclarés explicitement : sans `worker-src`, tous les navigateurs
  // n'appliquent pas le repli sur `default-src` de la même façon et
  // peuvent refuser l'enregistrement du service worker.
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
];

export function construireCsp(nonce: string): string {
  // 'unsafe-eval' reste nécessaire au rechargement à chaud de Next en dev ;
  // en production il est retiré. 'strict-dynamic' fait confiance aux scripts
  // chargés par un script nonce (chunks Next) et ignore 'self' sur les
  // navigateurs modernes — 'self' est conservé pour les anciens.
  const eval_ = process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";
  return [
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${eval_}`,
    ...CSP_DIRECTIVES_COMMUNES,
  ].join("; ");
}
