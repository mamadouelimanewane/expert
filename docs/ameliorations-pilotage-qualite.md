# Améliorations de pilotage, qualité et avenants

## Inclus dans cette première tranche

- **Qualité du cabinet** (`/qualite-cabinet`) : registre par cabinet des risques, constats et revues ; gravité, mission facultative, échéance, responsable, périodicité de revue, cause racine, action corrective et preuve d'efficacité. La clôture impose la cause et l'action ; la revue d'efficacité et l'acceptation d'un risque sont réservées à un expert ou administrateur. Une mesure inefficace est réouverte et ses événements sont consignés dans le journal d'audit.
- **Changements de mission** (`/missions/changements`) : demandes liées à une mission avec motif, nouveau périmètre, honoraires et heures supplémentaires ; décision réservée à un expert ou administrateur ; la validation est une revue interne, historisée, sans modification du budget avant l'accord signé du client.
- **Rapport mensuel de pilotage** (`/reporting/mensuel`) : factures émises TTC, règlements enregistrés pendant le mois (y compris ceux de factures antérieures), créances des factures émises pendant la période, temps saisis et suivi des budgets de missions. Export CSV disponible.
- **ESG traçable** (`/advisory/esg`) : évaluations attachées au portefeuille client, niveaux de qualité des données, notes de provenance, versions immuables, méthode et version des facteurs conservées, revue motivée par un expert ou administrateur. Le calcul corrige aussi la classification de l'électricité achetée en Scope 2.

## Définitions et limites

Le rapport mensuel est un indicateur interne de facturation et d'activité, pas un état financier certifié, un chiffre d'affaires comptabilisé à l'avancement, ni un rapport client validé par un associé. Les scores ESG sont des estimations indicatives à partir des données saisies et de facteurs génériques ; ils ne constituent ni une mesure vérifiée ni une attestation IFRS. La juridiction, les facteurs d'émission, l'applicabilité et les obligations doivent être vérifiés pour chaque client et exercice. La qualité enregistrée dans l'application ne constitue pas à elle seule une attestation de conformité à une norme professionnelle. L'approbation interne d'un changement ne vaut pas signature du client : l'avenant doit encore être formalisé et signé via le processus documentaire du cabinet. L'ajustement automatique du budget après signature reste à relier au module de signature.

Les deux nouveaux modèles sont tenant-scopés par la couche Prisma existante. Après sauvegarde de la base et revue de l'environnement cible, déployer le schéma avec les procédures MongoDB habituelles du cabinet ; ne pas lancer `prisma db push` contre une base partagée ou de production sans validation de son impact.

## Suite produit conseillée

1. Ajouter des rappels automatiques et une revue indépendante planifiée aux contrôles qualité.
2. Générer le PDF d'avenant et le transmettre en signature client par un prestataire ou canal garantissant l'identité et la preuve de consentement ; n'ajuster les budgets qu'après confirmation vérifiable.
3. Compléter le rapport de pilotage avec les budgets client, les KPI comptables par période et des commentaires validés par le responsable du dossier.
4. Remplacer les facteurs ESG génériques par des référentiels pays/année documentés et associer les preuves sources à chaque indicateur.
5. Ajouter le passeport de financement après confirmation des pays, formats bancaires et règles de partage des dossiers.
