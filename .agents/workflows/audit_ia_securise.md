---
description: Audit Assisté par IA & Cartographie des Risques
---

Ce workflow guide le commissaire aux comptes dans la planification et l'exécution d'un audit légal en zone OHADA.

1. **Analyse Prédictive des Risques**
   // turbo
   - Accéder à `/api/audit/risk-score` pour générer la cartographie dynamique du dossier.
   - Analyser les déviances significatives (Scoring > 7/10).

2. **Génération de l'Échantillonnage Audit**
   - Utiliser le "Générateur de Sondages" dans `/audit/ia-risks`.
   - Exporter les listes de pointage enrichies par l'IA.

3. **Revue Analytique & Comparatifs**
   - Accéder à `/strategy/fiscal-mirror` (Nexus Fiscal Mirror).
   - Comparer les indicateurs du client avec les benchmarks sectoriels de la zone UEMOA/CEMAC.

4. **Forensic & Détection de Fraude**
   - Scanner les flux de caisse et notes de frais suspectes via `/audit/forensic`.
   - Valider les justificatifs OCR dans le centre d'ingestion `/scan`.

5. **Clôture d'Audit & Rapports**
   - Préparer la note de synthèse dans `/writing`.
   - Signer numériquement le rapport général via`/signature`.
   - Archiver le dossier permanent dans le coffre-fort probatoire.
