# 🧪 Guide de Tests UAT (User Acceptance Testing)
## Cabinet 360 - Expert OHADA

**Date**: 28 Janvier 2026  
**Version**: 2.0.0  
**Objectif**: Valider l'application avec les collaborateurs du cabinet

---

## 📋 Vue d'Ensemble

Ce guide décrit les tests à effectuer pour valider que l'application répond aux besoins réels des utilisateurs du cabinet.

### Profils de Testeurs

| Profil | Rôle | Objectif |
|--------|------|----------|
| **Expert Principal** | Validation globale | Tester toutes les fonctionnalités |
| **Collaborateur** | Saisie quotidienne | Tester timesheets, missions, documents |
| **Assistant(e)** | Support administratif | Tester agenda, communications, clients |

---

## 🎯 Scénarios de Test Prioritaires

### 1. **Authentification & Navigation** 🔐

#### Test 1.1: Connexion
- [ ] Ouvrir l'application sur `http://localhost:3001`
- [ ] Se connecter avec les identifiants fournis
- [ ] Vérifier que le dashboard s'affiche correctement
- [ ] Tester la déconnexion

**Identifiants de test**:
```
- **Admin**: admin@cabinet360.com / admin2026
- **Expert**: expert@cabinet360.com / expert2026
- **Collaborateur**: collaborator@cabinet360.com / collab2026
```

#### Test 1.2: Navigation Mobile
- [ ] Ouvrir sur mobile (ou simulateur)
- [ ] Vérifier que le menu hamburger fonctionne
- [ ] Tester la navigation entre les pages
- [ ] Vérifier que tout est lisible et cliquable

**Critères de succès**:
- ✅ Connexion réussie en < 2 secondes
- ✅ Menu hamburger s'ouvre/ferme correctement
- ✅ Toutes les pages sont accessibles
- ✅ Texte lisible (min 14px sur mobile)

---

### 2. **Gestion des Clients** 👥

#### Test 2.1: Consultation de la liste
- [ ] Aller sur `/clients`
- [ ] Vérifier que les 3 clients de test s'affichent
- [ ] Tester la recherche par nom
- [ ] Tester les filtres (pays, régime fiscal)

#### Test 2.2: Création d'un nouveau client
- [ ] Cliquer sur "Nouveau Client"
- [ ] Remplir le formulaire avec des données réelles
- [ ] Vérifier les champs obligatoires OHADA (RCCM, IFU, etc.)
- [ ] Sauvegarder et vérifier que le client apparaît dans la liste

**Données de test**:
```
Entreprise: Tech Afrique SA
Email: contact@techafrique.ci
Téléphone: +225 07 12 34 56 78
RCCM: CI-ABJ-2025-B-11111
IFU: 1111111111111
Régime: Réel Normal
Secteur: Technologies
Pays: Côte d'Ivoire
```

**Critères de succès**:
- ✅ Liste affichée en < 1 seconde
- ✅ Recherche fonctionne en temps réel
- ✅ Nouveau client créé avec succès
- ✅ Validation des champs obligatoires

---

### 3. **Saisie des Temps (Timesheets)** ⏱️

#### Test 3.1: Démarrer un chronomètre
- [ ] Aller sur `/timesheets`
- [ ] Sélectionner un client dans la liste
- [ ] Saisir une description de mission
- [ ] Démarrer le chronomètre
- [ ] Laisser tourner 30 secondes
- [ ] Arrêter et sauvegarder

#### Test 3.2: Saisie manuelle
- [ ] Saisir une entrée de temps manuellement
- [ ] Renseigner : client, mission, catégorie, durée
- [ ] Sauvegarder
- [ ] Vérifier que l'entrée apparaît dans la liste

#### Test 3.3: Validation et facturation
- [ ] Marquer une entrée comme "À facturer"
- [ ] Vérifier le calcul de la valeur (heures × taux)
- [ ] Tester le filtre "Non facturé"

**Critères de succès**:
- ✅ Chronomètre démarre/arrête correctement
- ✅ Temps sauvegardé avec précision
- ✅ Calculs de valorisation corrects
- ✅ Filtres fonctionnent

---

### 4. **Agenda & Réunions** 📅

#### Test 4.1: Créer une réunion
- [ ] Aller sur `/agenda`
- [ ] Cliquer sur "Nouvelle réunion"
- [ ] Remplir les informations (titre, client, date, heure)
- [ ] Choisir le type (Virtuelle/Présentiel)
- [ ] Sauvegarder

#### Test 4.2: Générer un compte rendu IA
- [ ] Ouvrir une réunion planifiée
- [ ] Cliquer sur "Générer Rapport IA"
- [ ] Vérifier que le rapport se génère
- [ ] Modifier le texte généré
- [ ] Exporter en PDF

**Critères de succès**:
- ✅ Réunion créée et visible dans le calendrier
- ✅ Rapport IA généré en < 5 secondes
- ✅ Export PDF fonctionne
- ✅ Notification envoyée (si configuré)

---

### 5. **Upload & OCR de Factures** 📄

#### Test 5.1: Upload d'une facture
- [ ] Aller sur `/scan` ou `/documents`
- [ ] Cliquer sur "Scanner/Uploader une pièce"
- [ ] Sélectionner une image de facture
- [ ] Vérifier que l'upload fonctionne

#### Test 5.2: Vérification OCR
- [ ] Attendre le traitement OCR (5-10 secondes)
- [ ] Vérifier que les données sont extraites :
  - [ ] Numéro de facture
  - [ ] Date
  - [ ] Fournisseur
  - [ ] Montant HT
  - [ ] TVA
  - [ ] Montant TTC
- [ ] Corriger les erreurs éventuelles
- [ ] Valider et sauvegarder

**Factures de test à utiliser**:
- Créer 2-3 factures fictives avec Word/Excel
- Imprimer en PDF ou prendre en photo
- Tester avec différentes qualités d'image

**Critères de succès**:
- ✅ Upload réussi (images < 10MB)
- ✅ OCR extrait au moins 70% des données
- ✅ Possibilité de corriger manuellement
- ✅ Données sauvegardées en base

---

### 6. **Déclarations Fiscales** 📊

#### Test 6.1: Consulter les échéances
- [ ] Aller sur le Dashboard
- [ ] Vérifier la section "Échéances Fiscales"
- [ ] Vérifier que les dates sont correctes
- [ ] Tester le tri par urgence

#### Test 6.2: Créer une déclaration
- [ ] Aller sur `/declarations`
- [ ] Créer une nouvelle déclaration TVA
- [ ] Renseigner le client, période, montant
- [ ] Marquer comme "Soumise"
- [ ] Vérifier le changement de statut

**Critères de succès**:
- ✅ Échéances visibles et à jour
- ✅ Alertes pour déclarations urgentes
- ✅ Statuts mis à jour correctement
- ✅ Historique conservé

---

### 7. **Benchmarking Sectoriel** 📈

#### Test 7.1: Comparer un client
- [ ] Aller sur `/benchmarking`
- [ ] Sélectionner un secteur (ex: Commerce)
- [ ] Sélectionner un pays (ex: Côte d'Ivoire)
- [ ] Vérifier les indicateurs comparés
- [ ] Lire les insights IA

#### Test 7.2: Générer un rapport
- [ ] Cliquer sur "Générer Rapport de Benchmarking"
- [ ] Vérifier que le rapport se génère
- [ ] Exporter en PDF

**Critères de succès**:
- ✅ Données sectorielles affichées
- ✅ Comparaison claire (graphiques)
- ✅ Insights IA pertinents
- ✅ Export PDF fonctionnel

---

### 8. **Responsive & Performance** 📱

#### Test 8.1: Test multi-appareils
- [ ] Tester sur ordinateur (1920x1080)
- [ ] Tester sur tablette (768x1024)
- [ ] Tester sur mobile (375x667)
- [ ] Vérifier que tout s'affiche correctement

#### Test 8.2: Performance
- [ ] Mesurer le temps de chargement initial
- [ ] Tester la fluidité de navigation
- [ ] Vérifier qu'il n'y a pas de lag
- [ ] Tester avec connexion lente (3G simulée)

**Critères de succès**:
- ✅ Chargement initial < 3 secondes
- ✅ Navigation fluide (60 FPS)
- ✅ Responsive sur tous les écrans
- ✅ Utilisable en 3G

---

## 📝 Formulaire de Feedback

Pour chaque test, noter :

### Fonctionnalité testée: _______________

**Fonctionne correctement ?**
- [ ] ✅ Oui, parfaitement
- [ ] ⚠️ Oui, mais avec des remarques
- [ ] ❌ Non, problème bloquant

**Remarques / Bugs constatés**:
```
_________________________________________________
_________________________________________________
_________________________________________________
```

**Suggestions d'amélioration**:
```
_________________________________________________
_________________________________________________
_________________________________________________
```

**Note globale** (1-5): ⭐⭐⭐⭐⭐

---

## 🐛 Rapport de Bugs

Si un bug est trouvé, remplir :

**Bug #**: ___  
**Sévérité**: [ ] Bloquant [ ] Majeur [ ] Mineur  
**Page/Fonctionnalité**: _______________  
**Description**:
```
_________________________________________________
```

**Étapes pour reproduire**:
1. _________________________________________________
2. _________________________________________________
3. _________________________________________________

**Résultat attendu**: _______________  
**Résultat obtenu**: _______________  
**Capture d'écran**: (joindre si possible)

---

## ✅ Checklist Finale

Avant de valider l'application :

### Fonctionnalités Essentielles
- [ ] Authentification fonctionne
- [ ] Navigation fluide
- [ ] Clients : CRUD complet
- [ ] Timesheets : saisie et calculs
- [ ] Agenda : création réunions
- [ ] Documents : upload réussi
- [ ] OCR : extraction données
- [ ] Déclarations : suivi échéances
- [ ] Responsive : mobile OK

### Qualité
- [ ] Pas de bugs bloquants
- [ ] Performance acceptable
- [ ] Design professionnel
- [ ] Textes en français correct
- [ ] Données OHADA correctes

### Sécurité
- [ ] Mots de passe sécurisés
- [ ] Sessions gérées
- [ ] Données sensibles protégées

---

## 📊 Résultats Attendus

**Taux de réussite minimum**: 90%  
**Bugs bloquants acceptables**: 0  
**Bugs majeurs acceptables**: < 3  
**Note moyenne minimum**: 4/5

---

## 🚀 Prochaines Étapes Après UAT

1. **Correction des bugs** identifiés
2. **Implémentation des suggestions** prioritaires
3. **Tests de régression** sur les corrections
4. **Formation des utilisateurs** finaux
5. **Déploiement en production**
6. **Monitoring** post-déploiement

---

**Contact Support**:  
Email: support@cabinet360.com  
Téléphone: +225 XX XX XX XX XX

**Durée estimée des tests**: 4-6 heures  
**Participants recommandés**: 3-5 personnes

---

*Merci de votre participation aux tests ! Vos retours sont essentiels pour améliorer Cabinet 360.* 🙏
