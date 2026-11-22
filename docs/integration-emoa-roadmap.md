# Intégration des capacités EMOA dans Cabinet 360

## Objet

Ce document relie les propositions produit aux modules et données qui existent déjà dans le dépôt. Il évite de créer des fonctions concurrentes et sépare le code présent d'une capacité effectivement connectée ou validée dans un pays.

Le cockpit `/regionalisation` expose une synthèse opérationnelle tenant-scoped et le statut des capacités. Les statuts ne constituent pas une certification comptable, fiscale ou réglementaire.

## Matrice d'intégration

| Proposition | Socle existant | Intégration retenue | État et dépendances |
|---|---|---|---|
| Règles pays et conformité versionnées | `Client.country`, `Client.taxProfile`, `src/lib/compliance-engine.ts`, moteurs de paie | Partir du pays du cabinet et du dossier, afficher la provenance de chaque moteur, ne jamais appliquer par défaut le barème d'un autre pays | Partiel. Il reste à créer un registre d'obligations versionnées et les validations par juridiction. |
| Clôture mensuelle et annuelle orchestrée | `YearEndClose`, `YearEndCloseItem`, verrouillage des périodes, Sentinel de clôture, tie-out | Conserver un seul dossier de clôture et relier les contrôles/anomalies existants à ses étapes et preuves | Partiel. Les règles de complétude et les liens vers les pièces doivent être uniformisés. |
| Rapprochement expliqué | `BankTransaction`, factures, import de relevés | Fournir des suggestions heuristiques avec les raisons visibles ; l'utilisateur garde la décision et l'API vérifie de nouveau les montants | Implémenté dans le parcours bancaire. Le lettrage partiel n'est pas ouvert car il exige une allocation de paiement robuste et concurrente. |
| Analytique d'audit sur population | Import FEC, détection d'anomalies, échantillonnage et dossier d'audit | Réutiliser la population FEC et lier les signaux aux feuilles de travail ; aucun score de risque ne doit être appelé preuve de fraude | Présent dans plusieurs modules ; vérifier la traçabilité unifiée des tests et exécutions. |
| PI-SPI et paiements interopérables | Facturation et paiements Wave/mobile money | Ajouter un adaptateur de paiement distinct des fournisseurs existants, en conservant les statuts et références de transaction | Non connecté. Requiert un participant PI-SPI, les identifiants/certificats de production, les tests et l'autorisation de mise en service. |
| Collecte client mobile | Portail, `ClientRequest`, dépôt de documents, PWA | Réutiliser le portail et les demandes ; ajouter une file de dépôt et de synchronisation hors connexion sans mettre en cache les pages ou APIs authentifiées | Partiel. Le service worker ne cache que des ressources publiques pour protéger les dossiers sur appareils partagés. |
| Copilote IA sourcé et contrôlé | Assistants, agents, lecture documentaire, règles d'imputation | Afficher source, pièce, règle et proposition ; enregistrer acceptation, modification ou rejet par le collaborateur | Partiel. La couverture de traçabilité doit être vérifiée agent par agent avant de promettre une IA entièrement explicable. |
| Prévision de trésorerie | Prévision de trésorerie, factures, relevés importés | Présenter séparément les encaissements projetés et les décaissements suivis ; ne pas créer de charges supposées | Présent mais incomplet : les charges récurrentes ne sont pas encore suivies dans la projection indiquée par le moteur. |
| Rentabilité par mission | Temps, budgets, prix fixes et coût horaire collaborateur | Rapprocher temps budgété/consommé, facturation, frais et marge dans le dossier de mission | Présent. Les indicateurs doivent signaler les coûts ou temps manquants au lieu de les traiter comme nuls. |
| Multi-devises et consolidation | Outils de change, consolidation SYSCOHADA, conversion IFRS | Réutiliser les moteurs spécialisés avec taux datés, hypothèses et journaux d'élimination séparés par entité | Partiel. Les sources et dates de change doivent être persistées et les taux de démonstration écartés. |
| Facturation électronique par juridiction | Facturation et génération de documents | Créer une interface d'adaptateurs, activée uniquement par pays et connecteur réellement disponible | À cadrer. Les formats réglementaires et points d'accès doivent être validés auprès de chaque administration ou partenaire. |
| Gestion de qualité et centre de confiance | Journaux d'audit, contrôles tenant, rôles, qualité des dossiers | Rassembler historique d'accès, révisions, sauvegardes, procédures de restauration et export de dossier dans des vues de supervision | Partiel. La preuve de restauration, l'export et la conservation des données restent des chantiers opérationnels. |
| Benchmark anonymisé | Indicateurs BI et rentabilité | Cohortes volontaires, agrégation avec seuil minimal et aucune possibilité de retrouver un client individuel | À cadrer. Ne pas agréger de données inter-cabinets avant preuve d'isolation et règles de consentement. |

## Principes de synchronisation

1. **Un seul référentiel de dossier.** Le pays du client, ses périodes, ses écritures, ses pièces et ses missions doivent partager une identité métier et une piste d'audit.
2. **Les règles sont datées et attachées au contexte.** Tout calcul conserve le pays, la période, la version et la source de règle appliquée.
3. **Aucune intégration simulée en production.** Les données sandbox portent un environnement clairement identifié ; elles ne modifient jamais des factures réelles.
4. **L'automatisation propose, l'utilisateur décide.** Une suggestion d'IA ou de rapprochement n'écrit pas dans les livres tant qu'un utilisateur autorisé ne la valide pas.
5. **L'isolation précède l'agrégation.** Aucune statistique de portefeuille ou benchmark transverse n'est activé avant les contrôles multi-cabinet.
6. **Les connecteurs sont remplaçables.** PI-SPI, banques, mobile money, facturation électronique et identités passent par des adaptateurs dont les statuts, erreurs et preuves sont conservés.

## Séquence de mise en œuvre

### Socle de confiance

- Terminer la preuve d'isolation tenant pour toutes les routes, jobs, imports, exports et fichiers.
- Relier les contrôles Sentinel, les preuves de mission, la revue par les pairs et la clôture annuelle.
- Définir les contrats d'événements pour paiement importé, rapprochement, annulation, facture réglée et correction.

### Couverture régionale

- Enregistrer les pays réellement pris en charge par chaque moteur avec version, sources, période d'effet et statut de revue.
- Mettre en place un calendrier réglementaire versionné, sans copier des échéances d'un pays à un autre.
- Prototyper PI-SPI dans son sandbox officiel, puis engager la procédure avec un participant avant tout accès réel.

### Productivité et conseil

- Étendre les suggestions de rapprochement après définition d'un modèle d'allocation partielle et de ses garanties de concurrence.
- Ajouter la collecte mobile hors connexion sous forme de brouillons chiffrés avec consentement et révocation, jamais par cache des pages authentifiées.
- Compléter la projection de trésorerie avec les charges que le cabinet a réellement renseignées.
- Uniformiser citations et validations humaines dans les agents IA.

### Expansion

- Ajouter facturation électronique, dépôts et connecteurs pays par pays après disponibilité de points d'accès officiellement documentés.
- N'activer les analyses comparatives anonymisées qu'après consentement et démonstration qu'aucune donnée ne fuit entre cabinets.

## Règles d'affichage produit

- « Disponible dans le code » signifie qu'un module est repéré ; cela ne veut pas dire qu'il a été homologué ou audité.
- « Partiel » signifie que le module ne couvre pas encore tous les prérequis du parcours annoncé.
- « Non connecté » signifie qu'aucune connexion de production ne doit être présumée.
- « À cadrer » signifie qu'il manque un périmètre pays, une source validée, un contrat fournisseur ou une décision de produit.
- Un libellé « conforme », « certifié », « connecté » ou « prêt à déclarer » exige une preuve vérifiable propre à cette fonction et cette juridiction.
