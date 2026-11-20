# Cabinet 360 — ERP pour cabinet d'expertise comptable OHADA

![Version](https://img.shields.io/badge/Version-2.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tests](https://img.shields.io/badge/Tests-322-brightgreen)
![Licence](https://img.shields.io/badge/Licence-Propri%C3%A9taire-red)

Logiciel de gestion destiné aux cabinets d'expertise comptable en zone OHADA :
production comptable, missions, temps, facturation, paie,
fiscalité et états financiers SYSCOHADA.

---

## Statut : cloisonnement multi-cabinet en préparation

Le code local contient le schéma et les contrôles nécessaires au cloisonnement
par `cabinetId`, ainsi qu'un verrou de déploiement qui reste fermé par défaut.
Les inscriptions publiques et la souscription en libre-service sont suspendues
pendant cette phase. **Ne définissez pas `TENANT_DATA_ISOLATION_READY=true`**
avant d'avoir effectué le backfill, vérifié chaque route et passé les tests
d'isolation décrits dans [le plan de sécurisation](docs/securisation-multi-cabinet.md).

La présence d'un champ `cabinetId` dans le schéma ne suffit pas à prouver que
toutes les données sont isolées. Cette branche ne doit pas être considérée
comme prête pour des cabinets indépendants avant validation de la migration,
des traitements hors HTTP, du portail et des scénarios à deux cabinets.

> Les documents `docs/ANALYSE_*.md`, `docs/PROJECT_REPORT.md`,
> `docs/MANUEL_UTILISATEUR.md`, `docs/DEPLOYMENT_GUIDE.md` et
> `docs/IMPLEMENTATION_PLAN_OHADA.md` sont historiques. Le manuel et le guide
> de déploiement décrivent des fonctions SaaS et PostgreSQL qui ne correspondent
> pas au code actuel (MongoDB); ne les utilisez pas comme procédures produit
> ou de mise en production.

---

Les nombres de pages, routes, modèles et tests changent au fil du développement;
ils ne sont pas publiés ici comme garanties produit. La CI est décrite dans
[`.github/workflows/ci.yml`](.github/workflows/ci.yml).

---

## Stack

- **Framework** : Next.js 16 (App Router), React 19, TypeScript 5
- **Base de données** : MongoDB via Prisma
- **Authentification** : NextAuth (session JWT), bcrypt
- **Interface** : Tailwind CSS v4, Framer Motion, Lucide
- **Tests** : Vitest
- **Fichiers** : SheetJS (xlsx), Tesseract.js et pdf-parse (OCR serveur), Claude (lecture IA optionnelle du manuscrit)
- **Mobile** : Capacitor (Android)

---

## Modules

### Comptabilité et états financiers
Production, révision, journal TPE, et génération du **bilan** et du **compte de
résultat** au format SYSCOHADA révisé (AUDCIF).

Le moteur (`src/lib/ohada/`) applique le référentiel du système normal :
affectation unique de chaque compte par préfixe le plus long, reclassement des
comptes de tiers selon le sens réel du solde, déduction des amortissements et
dépréciations, cascade complète des soldes intermédiaires de gestion.

Il **ne force jamais l'équilibre du bilan**. Le résultat net provient de la
cascade des classes 6 et 7, jamais d'une différence calculée pour faire
tomber juste. Tout écart et tout compte hors référentiel sont remontés à
l'écran avec leur cause.

### Paie
Bulletins **Sénégal** : IPRES régime général et complémentaire, CSS, CFCE,
abattement forfaitaire, barème IR annuel avec réduction pour charge de famille
(CGI art. 174), TRIMF, heures supplémentaires par palier.

Les autres pays ne sont pas implémentés et le calcul est **refusé
explicitement** — l'application n'applique jamais le barème d'un pays à un
autre.

### CRM et missions
Fiche client avec identifiants OHADA (RCCM, NINEA, IFU, NIF), missions,
tâches, saisie des temps et rentabilité par dossier.

### Facturation
Émission aux normes UEMOA, suivi des encaissements, relances, paiements Mobile
Money (Wave, Orange Money, MTN MoMo).

### Audit et conformité
Analyse FEC, détection d'anomalies (caisse créditrice, écritures du dimanche,
montants ronds), KYC/LCB-FT, gouvernance.

### Analyse
Consolidation de groupe avec écritures d'élimination et contrôles d'équilibre,
valorisation (DCF, multiple d'EBITDA, actif net réévalué), simulateur
d'imposition des bénéfices avec impôt minimum forfaitaire.

### Portail client
Espace client authentifié par un `portalToken` opaque de 32 octets, révocable
depuis la fiche client.

---

## Intelligence artificielle : ce qui est réel

L'assistant **Nexus** (`src/lib/llm.ts`) interroge DeepSeek en lui injectant le
contexte réel du cabinet issu de la base, et lui interdit d'inventer des
chiffres. Moteur : Claude (`ANTHROPIC_API_KEY`) en priorité, DeepSeek (`DEEPSEEK_API_KEY`) en repli. **Sans aucune des deux clés, il répond qu'il n'est pas configuré** — il
ne simule jamais de réponse.

L'imputation comptable automatique fonctionne par règles métier et par
apprentissage des corrections de l'expert. **Lorsqu'aucune règle ne
correspond, l'écriture part en compte d'attente 471 avec une confiance nulle**
et un motif explicite. Elle n'est jamais imputée au hasard sur un compte
plausible.

### Lecture des documents : trois niveaux, du local vers l'IA

| Niveau | Outil | Où ça tourne | Quand |
|---|---|---|---|
| Fichier structuré | SheetJS | navigateur | balance Excel / CSV |
| Imprimé scanné | Tesseract.js + pdf-parse | **serveur de l'application** | balance ou facture imprimée, PDF natif ou scanné |
| Manuscrit ou dégradé | Claude (modèle de vision, `ANTHROPIC_API_KEY`) | **API Anthropic** | cahier de caisse, reçu de commerçant, balance annotée |

Les deux premiers niveaux ne transmettent rien à un tiers. Le troisième
**n'est jamais automatique** : il n'apparaît que si la clé est configurée
et ne se déclenche que sur le bouton « Lire avec l'IA », qui annonce
l'envoi du document. Dans les trois cas, rien n'est enregistré avant
relecture à l'écran : lignes à confiance faible surlignées, champs
illisibles laissés vides (jamais devinés), totaux imprimés confrontés à la
somme des lignes lues. Voir `scripts/test-vision-manuscrit.ts` pour un
test réel sur documents manuscrits générés.

---

## Installation

### Prérequis
- Node.js 20+
- Une base MongoDB (Atlas ou locale)

```bash
git clone https://github.com/mamadouelimanewane/expert.git
cd expert/cabinet-expert-ohada
npm install
```

Pour un environnement local uniquement, copiez `.env.example` vers `.env` et renseignez au minimum `DATABASE_URL`,
`NEXTAUTH_SECRET` et `NEXTAUTH_URL`. Pour le rate limiting distribué en
production, configurez également `UPSTASH_REDIS_REST_URL` et
`UPSTASH_REDIS_REST_TOKEN`; sans Redis distribué, les requêtes API échouent
fermées en environnement de production.

```bash
npx prisma generate
npx prisma db push      # base locale jetable uniquement; jamais directement en production
npm run seed:admin      # crée l'admin, affiche son mot de passe une seule fois
npm run dev
```

L'application écoute sur http://localhost:3000.

> Aucun mot de passe par défaut n'existe et aucun identifiant n'est versionné.
> Voir [docs/ACCESS.md](docs/ACCESS.md).

---

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm test` | Suite de tests (Vitest) |
| `npm run test:watch` | Tests en continu |
| `npm run typecheck` | Vérification TypeScript |
| `npm run lint` | ESLint |
| `npm run seed:admin` | Compte administrateur initial |
| `npm run seed:admin:prod` | Idem, production (`ADMIN_PASSWORD` requis) |
| `npm run rotate:passwords` | Rotation d'urgence des mots de passe staff |
| `npm run prisma:studio` | Explorateur de base |

---

## Tests

```bash
npm test
```

| Suite | Portée |
|---|---|
| `syscohada-engine` | Référentiel, amortissements, reclassement, SIG, équilibre |
| `syscohada-property` | 1 000 balances aléatoires : équilibre, absence de NaN, déterminisme |
| `payroll-senegal` | Barème IR, parts, réduction familiale, TRIMF, cotisations, routage pays |
| `consolidation-engine` | Cumul, éliminations, contrôles d'équilibre |
| `valuation-tax` | DCF, multiples, ANR, IS, impôt minimum, CFCE, projection |
| `accounting-engine` | Imputation, TVA, partie double, compte d'attente |
| `infrastructure` | Validation zod, pagination, limitation de débit, journal → balance |
| `webhook-signature` | HMAC Wave et générique, anti-rejeu |
| `obligations-fiscales` | Calendrier réglementaire, échéances, urgence |
| `obligations-legales` | Référentiel OHADA, états de conformité |
| `amortissement-couts` | Plans linéaire et dégressif, coût de revient, marge |
| `zones-franches` | Économie d'IS et de douane, exclusion de la TVA |
| `rentabilite-mission` | Boni/mali, coût interne indéterminé si non paramétré |
| `navigation` | Inventaire des écrans, garde-fou anti-dérive |

L'intégration continue (`.github/workflows/ci.yml`) exécute typecheck, lint,
tests et build sur `main` et sur chaque pull request.

---

## Sécurité

- Mots de passe hachés en **bcrypt (coût 12)**, jamais de valeur par défaut
- Session **JWT** NextAuth, contrôle de rôle par préfixe de route
- **Double contrôle d'accès** : middleware *et* garde-fou dans chaque route
  API — aucune route métier ne dépend d'un point de contrôle unique
- **Limitation de débit** sur le login, honeypot serveur, blocage des
  user-agents de scanners
- En-têtes complets : CSP, HSTS, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`, `X-Robots-Tag: noindex`
- **Webhooks de paiement signés** en HMAC-SHA256 avec fenêtre anti-rejeu ;
  aucun webhook accepté sans secret configuré
- **Service worker cloisonné** : ni les réponses d'API, ni les pages
  authentifiées, ni le portail client ne sont mis en cache
- `/api/health` public réduit à l'état de service ; le détail est réservé aux
  administrateurs authentifiés

En cas d'exposition d'identifiants : `npm run rotate:passwords`.

---

## Documentation

| Document | Contenu |
|---|---|
| [docs/ACCESS.md](docs/ACCESS.md) | Accès, rôles, rotation des secrets |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Architecture technique |
| [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) | Déploiement |
| [docs/MANUEL_UTILISATEUR.md](docs/MANUEL_UTILISATEUR.md) | Manuel utilisateur |

---

## Contact

**Mamadou Eliman Wane** — contact@cabinet360.com

Licence propriétaire. Tous droits réservés.
