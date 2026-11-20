# CABINET-360: Practice Management pour l'Espace OHADA
> Plan historique : la stack décrite ci-dessous ne reflète pas le dépôt actuel
> (MongoDB et Next.js 16). Utilisez `ARCHITECTURE.md` pour l'état du code.
*Document de spécification et plan d'implémentation*

## 1. Vision du Produit
Un logiciel "Tout-en-un" pour les cabinets d'expertise comptable opérant dans l'espace OHADA, alliant l'expérience utilisateur moderne (inspirée de TaxDome/Axonaut) aux contraintes légales locales (SYSCOHADA, fiscalité UEMOA/CEMAC).

## 2. Stack Technique
- **Framework** : Next.js 14+ (App Router)
- **Langage** : TypeScript Strict
- **Styling** : Tailwind CSS v3/v4 (Design System "Glassmorphism" & "Premium")
- **Animations** : Framer Motion
- **Icônes** : Lucide React
- **Base de données (Future)** : PostgreSQL / Prisma

## 3. Spécificités OHADA & SYSCOHADA (Modules)

### A. Module CRM Adapté
Contrairement aux CRM génériques, nous intégrons les champs obligatoires en Afrique de l'Ouest/Centrale :
- **Identifiants** : RCCM (Registre Commerce), NINEA (Sénégal), IFU (Bénin/CI).
- **Régimes Fiscaux** :
  - *Droit Commun* (Réel Normal)
  - *Réel Simplifié*
  - *CME / Micro-entreprise*
- **Dirigeants** : Champs pour pièces d'identité (CNI/Passeport CEDEAO).

### B. Module "Production" (Référentiel)
- **Plan Comptable** : Intégration du PCG-OHADA Révisé (Classes 1 à 9).
- **Missions** : Modèles de lettres de mission conformes aux normes de l'Ordre (ONECCA, etc.).

### C. Gestion des Échéances (Fiscalité)
- Calendrier fiscal paramétrable par pays.
- Alertes automatiques (ex: Déclaration TVA le 15 du mois).

## 4. Design System & UX
- **Vibe** : Professionnel mais dynamique. Fond sombre riche (Slate/Zinc) avec accents vifs (Indigo/Cyan).
- **Composants** :
  - *Glass Cards* : Transparence et flou d'arrière-plan.
  - *Micro-interactions* : Feedback visuel immédiat.

## 5. Plan d'Implémentation (Lot 1)

1.  **Initialisation & Design System**
    - Setup Next.js & Tailwind.
    - Création des composants de base (Button, Card, Input).
    - Mise en place du Layout (Sidebar, Topbar).

2.  **Dashboard "Vue Cabinet"**
    - KPI : Dossiers en cours, Deadlines proches.
    - Widgets rapides.

3.  **Module CRM (Clients)**
    - Liste des clients avec filtres (Régime, Secteur).
    - Fiche client détaillée (Vue 360).

4.  **Module Missions (Projets)**
    - Vue Kanban des dossiers.

## 6. Phase 2 : Fonctionnalités Avancées (Propositions)

Pour transformer le logiciel en véritable avantage concurrentiel ("Unfair Advantage"), voici les modules additionnels proposés :

### A. Module "Fintech" & Mobile Money 💳
*Contexte : Indispensable en zone UEMOA/CEMAC.*
- **Intégration Paiements** : Collecte des honoraires via **Wave, Orange Money, MTN MoMo** (via API type CinetPay ou KKiaPay).
- **Réconciliation Auto** : Lettrage automatique des factures cabinet dès réception du SMS de paiement.

### B. OCR & IA Comptable 🤖
*Contexte : Gain de temps sur la saisie.*
- **Scan Intelligent** : Extraction automatique des données (Date, Montant HT/TVA, Fournisseur) sur les factures photos.
- **Classification** : Suggestion automatique du compte PCG-OHADA (ex: 605 pour "Transport").

### C. Portail RH & Paie Collaboratif 👥
- **Saisie des Variables** : Le client saisit lui-même les heures sup/absences de ses employés sur le portail.
- **Distribution** : Envoi automatique des bulletins de paie dans les coffres-forts numériques des salariés (WhatsApp/SMS sécurisé).

### D. Mode "Offline First" (PWA) 📶
- **Continuité** : Permettre aux collaborateurs de saisir des temps ou consulter des dossiers même en cas de coupure internet.
- **Synchro** : Synchronisation différentielle dès le retour de la connexion.

### E. Assistant Fiscal IA (LLM RAG) 🧠
- **Base de Connaissance** : Chatbot entraîné sur le Code Général des Impôts (CGI) de chaque pays cible.
- **Rédaction** : Brouillon automatique de réponses aux notifications de redressement fiscal.

---
**Date de démarrage** : 2024-05
**Développeur Principal** : Antigravity
