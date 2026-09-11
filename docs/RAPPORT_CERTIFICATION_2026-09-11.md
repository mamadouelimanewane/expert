# Certification Cabinet 360 — tests approfondis avant démonstration client

**Date** : 11 septembre 2026 (mis à jour après le lot « balance + factures ») · **Commits** : a5433db → af07f1e · **Prod** : expert-pi.vercel.app
**Version complète (mise en page)** : `docs/RAPPORT_CERTIFICATION_2026-09-11.html`

## Verdict : apte à la démo, sous conditions

Les parcours client, missions, temps, facturation, lettres de mission, import et
validation d'écritures, états financiers SYSCOHADA, export FEC, OCR, audit et
conformité fonctionnent de bout en bout. 14 anomalies bloquantes ou majeures ont
été corrigées et re-testées (≈ 95 appels API, 46 écrans, 388 tests unitaires).

Conditions :
1. Renseigner `WHATSAPP_APP_SECRET` sur Vercel (le bot rejette tout message : « signature_invalide »).
2. Vérifier que la prod sert le commit `534e735`.
3. Exclure du scénario : e-dépôt DGI, signature qualifiée.

## Constats corrigés

| # | Constat | Correctif |
|---|---|---|
| C-01 | Aucune fiche client, aucune modification (PATCH → 405) | `/clients/[id]` + API PATCH/DELETE |
| C-02 | Portail client inaccessible depuis l'UI (jeton jamais renvoyé) | `/api/clients/[id]/portal-link` : afficher, régénérer, révoquer |
| C-03 | Missions figées en DRAFT (kanban lecture seule) | `/api/missions/[id]` avec transitions, fiche, menu kanban |
| C-04 | Écritures APPROVED jamais déversées → absentes du bilan | Déversement PENDING + APPROVED |
| C-05 | Documents figés en PROCESSING (worker Tesseract bundlé) | serverExternalPackages, délai 45 s, cachePath /tmp |
| C-06 | Webhook vers localhost / IP privée accepté (SSRF) | https + hôte public obligatoires |
| C-07 | Montants négatifs/nuls acceptés à l'import | Rejet explicite par ligne |
| C-08 | 500 au lieu de 400 : alertes fraude, dépenses, réunions, relances, paie | Validation des énumérations et cohérences |
| C-09 | Raccourcis mobiles morts, overlay vocal simulé, alert() | Liens réels, /nexus-go, notifications |
| C-10 | Non utilisable sur mobile, erreur d'hydratation | Filet CSS, tabs défilants, fuseau fixe |
| C-11 | CI en échec depuis le 1er septembre, APK jamais produit | CI verte, APK généré |
| C-12 | Formulaire « Nouvelle facture » : `lineItems` envoyé, `lines` attendu → toute création échouait | Contrat aligné, lignes persistées, fiche `/billing/[id]` imprimable |
| C-13 | Écritures saisies en « JUIN-2026 » jamais dans les états du mois (période non normalisée) | Normalisation AAAA-MM partout |
| C-14 | Import de balance générale absent (page désactivée) | Import CSV/Excel + modèle BalanceImportee, prioritaire sur le journal dans bilan/résultat/TFT/liasse |

## Limites à annoncer

L1 WhatsApp (secret manquant) · L2 criblage UE/ONU/PEP (clé OpenSanctions absente) ·
L3 e-dépôt DGI non connecté · L4 signature = empreinte SHA-256 interne (désormais stockée sur la lettre), pas de tiers de confiance ·
L7 paie Sénégal uniquement ·
L9 rate limiting mémoire, CSP unsafe-eval, mots de passe démo dans l'historique git.

## Scénario recommandé

Hub → fiche client (lien portail) → mission (démarrer, terminer) → scan OCR
(HT 100 000 / TVA 18 000 / TTC 118 000) → import 8 transactions → validation →
déversement → bilan équilibré / liasse déposable → export FEC → facture
826 000 FCFA (envoyée → payée) → portail client.

Mise en état de la base de démo exécutée (`scripts/prepare-demo.ts --apply`) : client de test et 2 doublons archivés, 36 factures complétées, 2 lettres de mission, balance 2025-12 (30 comptes) pour Traoré Import-Export → bilan 30,4 M équilibré, résultat 4,6 M.

Nouveau parcours vérifié : balance 12 comptes → bilan équilibré 9 400 000 / résultat 3 200 000 / liasse déposable ; CSV Excel FR (5 comptes) via l'écran → bilan présélectionné ; facture 2 lignes → 1 003 000 TTC imprimable.

Les données de test (`ZZ-TEST-CERTIF`) ont été supprimées de la base après vérification.
