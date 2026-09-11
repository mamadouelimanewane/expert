# Certification Cabinet 360 — tests approfondis avant démonstration client

**Date** : 11 septembre 2026 · **Commits** : a5433db → 534e735 · **Prod** : expert-pi.vercel.app
**Version complète (mise en page)** : `docs/RAPPORT_CERTIFICATION_2026-09-11.html`

## Verdict : apte à la démo, sous conditions

Les parcours client, missions, temps, facturation, lettres de mission, import et
validation d'écritures, états financiers SYSCOHADA, export FEC, OCR, audit et
conformité fonctionnent de bout en bout. 14 anomalies bloquantes ou majeures ont
été corrigées et re-testées (≈ 95 appels API, 46 écrans, 388 tests unitaires).

Conditions :
1. Renseigner `WHATSAPP_APP_SECRET` sur Vercel (le bot rejette tout message : « signature_invalide »).
2. Vérifier que la prod sert le commit `534e735`.
3. Exclure du scénario : e-dépôt DGI, signature qualifiée, import de balance générale.

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

## Limites à annoncer

L1 WhatsApp (secret manquant) · L2 criblage UE/ONU/PEP (clé OpenSanctions absente) ·
L3 e-dépôt DGI non connecté · L4 signature = empreinte SHA-256 interne ·
L5 lignes de facture non conservées · L6 import de balance générale absent ·
L7 paie Sénégal uniquement · L8 heuristique OCR fournisseur naïve ·
L9 rate limiting mémoire, CSP unsafe-eval, mots de passe démo dans l'historique git.

## Scénario recommandé

Hub → fiche client (lien portail) → mission (démarrer, terminer) → scan OCR
(HT 100 000 / TVA 18 000 / TTC 118 000) → import 8 transactions → validation →
déversement → bilan équilibré / liasse déposable → export FEC → facture
826 000 FCFA (envoyée → payée) → portail client.

Les données de test (`ZZ-TEST-CERTIF`) ont été supprimées de la base après vérification.
