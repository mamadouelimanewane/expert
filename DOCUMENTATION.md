# Documentation Complète - Cabinet 360

## 1. Introduction
**Cabinet 360** est une plateforme de gestion intégrée (ERP) conçue spécifiquement pour les cabinets d'expertise comptable opérant dans la zone OHADA. Elle centralise la production comptable, la gestion juridique, le social, et le pilotage stratégique du cabinet.

### Modules Clés
*   **Pilotage** : Dashboard Associé, Business Intelligence (BI), M&A.
*   **Production** : Paie Multi-pays, Révision, Fiscalité, États Financiers.
*   **Juridique** : Secrétariat juridique, Signatures certifiées, Conformité.
*   **Relation Client** : CRM 360°, Portail Client, GED Collaborative.

---

## 2. Architecture Technique

### Stack Technologique
*   **Frontend** : Next.js 14+ (App Router), React, TypeScript.
*   **Styling** : Tailwind CSS, Lucide React (Icônes), Glassmorphism UI.
*   **Performance** : Turbopack, Server Components, Lazy Loading.
*   **Déploiement** : Vercel (Edge Network).

### Structure du Projet
```
/src
  /app              # Routes de l'application (Next.js App Router)
    /audit          # Module Audit & Conformité
    /banking        # Module Banque & Réconciliation
    /bi             # Business Intelligence
    /clients        # CRM & Portefeuille
    /dashboard      # Tableaux de bord
    /data-center    # Exports & Automatisations
    /documents      # GED Intelligente
    /governance     # Juridique & AG
    /investment     # M&A & Valorisation
    /payroll        # Paie & Social
    /signature      # Signatures Électroniques
    ...
  /components       # Composants Réutilisables
    /layout         # Sidebar, Header
    /onboarding     # Guide Interactif
    /ui             # Boutons, Cartes, Modales
  /lib              # Utilitaires (formatage, helpers)
  /data             # Données mockées (pour le prototype)
```

---

## 3. Guide d'Utilisation (Par Pôle)

### A. Pôle Stratégie (Associés)
*   **Tableau de Bord** : Vue d'ensemble du CA, trésorerie et tâches critiques.
*   **Pilotage Associé** (`/dashboard/partner`) : Suivi de la rentabilité par collaborateur et par dossier.
*   **Business Intelligence** (`/bi`) : Analyses prédictives, benchmarking sectoriel et alertes de performance.
*   **M&A** (`/investment`) : Simulateur de valorisation et de fusions/acquisitions pour le conseil client haute valeur.

### B. Pôle Production (Collaborateurs)
*   **Clients & Missions** (`/clients`, `/missions`) : Gestion du portefeuille, suivi des deadlines fiscales et sociales.
*   **Paie & Social** (`/payroll`) : Édition des bulletins, suivi des congés et déclarations sociales mult-pays.
*   **Banque** (`/banking`) : Réconciliation automatique des flux bancaires via l'IA.
*   **Fiscalité** (`/fiscalite`) : Calcul et suivi des obligations fiscales OHADA.

### C. Pôle Juridique
*   **Gouvernance** (`/governance`) : Suivi des mandats, organisation des AG et CA.
*   **Signatures** (`/signature`) : Envoi et suivi des documents pour signature électronique certifiée.

### D. Transverse
*   **GED** (`/documents`) : Stockage intelligent, OCR et recherche sémantique.
*   **Data Center** (`/data-center`) : Exportation des données (Grand Livre, Balances) et configuration des reportings automatiques.

---

## 4. Guide d'Administration

### Gestion des Accès
L'accès est géré via le module `/settings/admin` (à implémenter avec un provider d'auth comme NextAuth/Clerk).
*   **Rôles** : Administrateur, Associé, Chef de Mission, Collaborateur, Assistant.
*   **Permissions** : Granularité par module (ex: Paie accessible uniquement aux RH/Comptables Senior).

### Configuration du Cabinet
*   **Entité** : Logo, Coordonnées, Devises par défaut (FCFA).
*   **Automatisations** : Configurer les fréquences des emails de reporting dans le Data Center.

---

## 5. Maintenance & Support

### Mises à Jour
Le déploiement est continu (CI/CD) via GitHub et Vercel.
1.  Pousser les modifications sur la branche `main`.
2.  Vercel détecte le commit et lance le build.
3.  En cas d'échec, vérifier les logs de build dans la console Vercel.

### Sauvegardes
*   **Code** : Hébergé et versionné sur GitHub.
*   **Données** : Le module Data Center permet des exports manuels et programmés des données critiques en JSON/CSV pour archivage froid.

### Dépannage Courant
*   **Affichage cassé** : Vider le cache du navigateur (le site utilise beaucoup de cache client pour la performance).
*   **Erreur 404** : Vérifier que la route existe dans `src/app`.
*   **Build Error** : Vérifier les imports manquants ou les erreurs TypeScript (souvent liées aux icônes ou aux types).

---

## 6. Plan de Formation

### Phase 1 : Découverte (J-1)
*   Connexion et parcours du **Guide d'Onboarding** (automatique).
*   Configuration du profil utilisateur.
*   Navigation dans la Sidebar et découverte des modules.

### Phase 2 : Opérationnel (Semaine 1)
*   **Pour les Comptables** : Saisie des temps, gestion des missions, utilisation de la GED.
*   **Pour les Juristes** : Module Gouvernance et Signature.
*   **Pour les Managers** : Module Clients, Pilotage Associé et BI.

### Phase 3 : Expert (Mois 1)
*   Utilisation des fonctions avancées : Simulations M&A, Automatisations Data Center, Audit IA.

---

*Document généré le 27 Janvier 2026 pour Cabinet 360.*
