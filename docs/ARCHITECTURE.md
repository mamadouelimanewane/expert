# Architecture et état de préparation

Mis à jour le 18 novembre 2026. Ce document décrit le code de la branche locale
`codex/professionalisation-cabinet360`; il ne certifie pas le déploiement public.

## Stack vérifiée dans le dépôt

- Next.js 16 (App Router), React 19 et TypeScript 5.
- MongoDB avec Prisma 6. Le provider de base est déclaré dans
  `prisma/schema.prisma`; PostgreSQL n'est pas utilisé par cette application.
- NextAuth avec sessions JWT et mots de passe bcrypt.
- Vitest pour les tests unitaires et GitHub Actions pour typecheck, lint, tests
  et build (`.github/workflows/ci.yml`).
- Upstash Redis pour le rate limiting partagé entre instances en production.

## Accès aux données

Les routes et pages serveur utilisent le client applicatif de
`src/lib/prisma.ts`. La branche ajoute une extension Prisma qui filtre les
modèles tenant par `cabinetId`, impose les références étrangères du même
cabinet et refuse les opérations non prévues. Le middleware retire les en-têtes
tenant fournis par l'appelant et reconstruit le contexte à partir du JWT signé.
Les journaux `AuditLog` sont append-only par ce client applicatif : lectures et
ajouts sont permis, mises à jour, suppressions et upserts sont refusés.

Le portail client suit un chemin distinct : son jeton opaque est résolu par le
client système, puis les opérations autorisées sont limitées à ce client et à
son cabinet. Le client système (`prismaSystem`) est réservé aux migrations,
semences et résolutions de jetons explicitement contrôlées; il ne doit pas être
utilisé dans les handlers ordinaires pour contourner le filtrage tenant.

## Verrou de déploiement multi-cabinet

`TENANT_DATA_ISOLATION_READY` vaut `false` par défaut. Tant qu'il reste fermé,
les pages publiques et l'authentification restent accessibles, tandis que les
parcours métier protégés sont suspendus. Les inscriptions et le checkout
publics renvoient également un statut d'indisponibilité.

Les champs `cabinetId` sont encore optionnels pour permettre un backfill
progressif. La présence du champ et de l'extension Prisma ne prouve pas à elle
seule que les tâches planifiées, scripts, imports, exports, webhooks et toutes
les relations imbriquées sont isolés. **Ne pas ouvrir le verrou** avant les
étapes du document `securisation-multi-cabinet.md`, en particulier le backfill
vérifié et les scénarios d'isolation avec deux cabinets.

## Parcours métier principaux

- Comptabilité : moteurs OHADA sous `src/lib/ohada/`, import de balances,
  journal TPE, bilan, compte de résultat, TFT, liasse et export FEC. Les
  périodes peuvent être verrouillées par un administrateur après traitement
  des écritures en attente; import et suppression de balance sont alors
  refusés, et toute réouverture demande un motif audité.
- Paie : moteur sénégalais sous `src/lib/payroll/`; les pays non implémentés
  doivent rester explicitement hors périmètre de calcul.
- Missions, facturation, documents, audit, conformité et portail : pages
  `src/app/` et handlers `src/app/api/`.
- Automatisation : OCR local, traitement de règles comptables et connecteurs IA
  sous `src/lib/`; l'envoi vers un fournisseur externe dépend de sa clé et de
  l'action de l'utilisateur.

Les écrans et supports marketing ne constituent pas une preuve de conformité
réglementaire ni de disponibilité opérationnelle d'une intégration externe.
Les calculs, règles pays et contrôles doivent être validés par des
professionnels compétents avant usage réel.

## Vérifications avant une mise en production

1. Backuper et restaurer une copie de la base, puis exécuter le backfill en
   simulation et comparer les volumes.
2. Vérifier que chaque modèle métier et chaque référence relationnelle porte
   l'identifiant du bon cabinet.
3. Exécuter les tests d'isolation A/B sur les lectures, agrégats, mutations,
   portail, documents, exports, webhooks et tâches asynchrones.
4. Vérifier `npm run typecheck`, `npm run lint`, `npm test` et `npm run build`
   dans la CI et sur une copie isolée de la base.
5. Tester restauration, rotation des secrets, alertes et retour arrière de
   migration avant d'activer l'accès en préproduction.
