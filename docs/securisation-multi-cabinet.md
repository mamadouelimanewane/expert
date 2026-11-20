# Sécurisation des données par cabinet

## État actuel

L'application reste en suspension par défaut pour les parcours métier du personnel tant que les lectures et écritures de toutes les routes, pages serveur, tâches planifiées et intégrations ne sont pas filtrées par `cabinetId`. La présence du champ dans le schéma ou dans un JWT ne suffit pas à isoler les données. Le portail client utilise un contexte séparé fondé sur son jeton opaque, limité à un client et à son cabinet; il reste inutilisable tant que le client n'a pas de cabinet actif. Les paiements, webhooks entrants et fonctions SaaS restent suspendus. `TENANT_DATA_ISOLATION_READY=true` est le commutateur d'ouverture des parcours métier, à utiliser uniquement après validation de tous les critères ci-dessous.

Les modèles métier portent maintenant un `cabinetId` indexé; les clauses personnelles sont propres à chaque cabinet. Les cours, quiz et citations juridiques de référence restent partagés. Le script `scripts/migrate-single-cabinet.ts` propose un backfill sûr pour une base qui contient exactement un cabinet; il refuse d'inférer l'appartenance dès qu'il en détecte zéro ou plusieurs.

Le client Prisma applicatif applique un filtre de cabinet aux lectures, agrégats et mutations; les créations héritent du cabinet signé dans le middleware. Il filtre aussi les collections relationnelles, vérifie les références étrangères avant les écritures imbriquées et refuse les mutations imbriquées qu'il ne sait pas valider. Le portail dispose d'une liste d'opérations autorisées et force le couple cabinet/client sur chaque requête directe. Les requêtes brutes sont désactivées sur le client applicatif. Un client système distinct est réservé aux tâches de maintenance et aux semences de catalogues fixes.

## Déroulé de mise en production

1. Restaurer une copie de la base sur un environnement isolé et faire un backup vérifiable avant toute modification.
2. Générer le client Prisma depuis le schéma mis à jour, puis lancer `npm run tenant:backfill:dry-run` sur cette copie.
3. Examiner les volumes par modèle et comparer les totaux à la base source. Pour plusieurs cabinets, établir une table d'affectation dossier par dossier; ne pas utiliser le backfill mono-cabinet.
4. Exécuter le backfill sur la copie, puis vérifier qu'il ne reste aucune ligne sans `cabinetId` dans chaque modèle métier.
5. Ajouter le contexte cabinet vérifié à chaque entrée HTTP protégée. Le contexte doit venir de la session signée et être remplacé par le middleware; jamais d'un paramètre ou d'un en-tête fourni librement par le navigateur.
6. Filtrer les lectures, agrégations, mises à jour, suppressions, relations imbriquées, exports, pièces jointes et traitements asynchrones par ce contexte. Contrôler aussi chaque identifiant de relation entrant (client, collaborateur, facture, écriture, etc.).
7. Revoir séparément les routes portail, import/export, stockage, recherche, paiements, webhooks, cron, scripts de support, journaux et opérations d'administration. Les accès système doivent être explicites, étroits, journalisés et distincts des accès utilisateur.
8. Ajouter des tests d'isolation avec deux cabinets: lecture par ID, listes, compteurs, agrégats, create/update/delete, opérations imbriquées, export, upload, portail et API. Le cabinet A ne doit jamais découvrir ni modifier une donnée du cabinet B.
9. Activer l'accès sur un environnement de préproduction et vérifier les alertes, les journaux d'audit et les sauvegardes; ensuite seulement retirer le verrou `TENANT_DATA_ISOLATION_READY`.

## Règles de migration

- Le script est en simulation par défaut. `npm run tenant:backfill:apply` modifie la base et ne doit être utilisé qu'après sauvegarde et validation de l'affectation.
- Les scripts de démonstration refusent `NODE_ENV=production`, exigent `CABINET_ID` dès qu'il y a plusieurs cabinets et demandent `ALLOW_DEMO_DATA_WRITES=true` pour écrire.
- Le backfill mono-cabinet ne crée pas de cabinet, ne choisit pas entre plusieurs cabinets et ne rend pas l'application accessible.
- Le script est relançable: il ne touche que les enregistrements dont `cabinetId` est nul.
- Ne pas appeler `prisma db push` sur une base de production avant d'avoir examiné son plan et la compatibilité des index MongoDB existants.

## Critères pour lever la suspension

Tous les modèles tenant doivent être non nuls après migration; toutes les opérations des routes doivent utiliser le même contexte fiable; les recherches par identifiant doivent inclure le cabinet; les relations imbriquées et les chemins non HTTP doivent avoir une stratégie explicite; enfin les tests d'isolation doivent passer sur deux tenants distincts. Le verrou reste fermé tant qu'un seul de ces points manque.
