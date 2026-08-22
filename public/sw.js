// ─────────────────────────────────────────────────────────────────────────────
// Service worker — Cabinet 360
//
// La version précédente appliquait une stratégie « cache d'abord » à TOUTES les
// requêtes, y compris les appels d'API et les pages authentifiées. Sur un poste
// partagé, cela pouvait servir à un utilisateur le tableau de bord — ou les
// données comptables — d'un autre. Cela pouvait aussi afficher un bilan périmé
// après correction des écritures, sans aucun moyen de s'en apercevoir.
//
// Règles retenues pour une application manipulant des données couvertes par le
// secret professionnel :
//
//   • aucune réponse d'API n'est mise en cache, jamais ;
//   • aucune navigation (page HTML) n'est mise en cache : elles dépendent
//     toutes de la session ;
//   • seules les ressources statiques réellement publiques le sont, et en
//     « réseau d'abord » avec repli sur le cache hors ligne.
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_NAME = 'cabinet360-v2';

/** Ressources publiques, identiques pour tous les utilisateurs. */
const STATIC_ASSETS = ['/manifest.json'];

/** Extensions considérées comme statiques et sans donnée personnelle. */
const STATIC_EXTENSIONS = /\.(?:css|js|woff2?|ttf|otf|png|jpe?g|gif|svg|webp|ico)$/i;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  // Purge des caches des versions précédentes, dont le cache v1 qui pouvait
  // contenir des pages authentifiées.
  event.waitUntil(
    caches
      .keys()
      .then((noms) =>
        Promise.all(noms.filter((nom) => nom !== CACHE_NAME).map((nom) => caches.delete(nom)))
      )
      .then(() => self.clients.claim())
  );
});

function estMisEnCache(request, url) {
  if (request.method !== 'GET') return false;
  // Même origine uniquement.
  if (url.origin !== self.location.origin) return false;
  // Jamais les API : réponses propres à une session et périssables.
  if (url.pathname.startsWith('/api/')) return false;
  // Jamais les navigations : elles dépendent de la session.
  if (request.mode === 'navigate') return false;
  // Jamais le portail client, qui est authentifié par un token en URL.
  if (url.pathname.startsWith('/portal')) return false;

  return url.pathname.startsWith('/_next/static/') || STATIC_EXTENSIONS.test(url.pathname);
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (!estMisEnCache(event.request, url)) {
    // Rien à faire : la requête part au réseau, sans interception.
    return;
  }

  // Réseau d'abord, repli sur le cache si l'utilisateur est hors ligne.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.ok && response.type === 'basic') {
          const copie = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copie));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
