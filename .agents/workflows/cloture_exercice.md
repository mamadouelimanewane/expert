---
description: Clôture d'Exercice & Production des États Financiers
---

Ce workflow guide le chef de mission dans les étapes de révision et d'édition de la liasse fiscale OHADA.

1. **Rapprochement & Lettrage**
   // turbo
   - Accéder à `/api/banking/reconcile` pour automatiser le lettrage de fin d'année.
   - Valider les écarts résiduels manuellement dans `/banking`.

2. **Génération des États Financiers**
   - Accéder à `/etats-financiers`.
   - Lancer l'exportation du Bilan, Compte de Résultat et Tableau de Flux (SYSCOHADA).
   - Vérifier la cohérence avec le Grand Livre.

3. **Optimisation Fiscale**
   - Consulter `/fiscalite/optimization`.
   - Ajuster les amortissements et provisions selon les résultats du simulateur.

4. **Déclaration d'Impôt sur les Sociétés (IS)**
   - Éditer la déclaration via `/declarations`.
   - Joindre la liasse dématérialisée et envoyer pour signature.

5. **Archivage Probant**
   - Sceller les états définitifs dans le coffre-fort `/signature`.
   - Transférer le dossier complet au client via `/portal`.
