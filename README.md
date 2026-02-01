# 🏢 Cabinet 360 - Plateforme SaaS Expert OHADA

<div align="center">

![Cabinet 360](https://img.shields.io/badge/Version-2.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-Latest-2D3748)
![License](https://img.shields.io/badge/License-Proprietary-red)

**Logiciel de gestion tout-en-un pour cabinets d'expertise comptable en zone OHADA**

> 🆕 **Dernière mise à jour** : 01/02/2026 - Module États Financiers OHADA ajouté à la sidebar

[🚀 Demo](https://cabinet360.vercel.app) • [📖 Documentation](./DOCUMENTATION.md) • [🐛 Report Bug](https://github.com/mamadouelimanewane/expert/issues)

</div>

---

## 📋 Table des Matières

- [À Propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Déploiement](#-déploiement)
- [Tests](#-tests)
- [Contribution](#-contribution)
- [License](#-license)

---

## 🎯 À Propos

**Cabinet 360** est une plateforme SaaS de nouvelle génération conçue spécifiquement pour les cabinets d'expertise comptable opérant en zone OHADA (UEMOA/CEMAC). 

### Vision

Allier **conformité réglementaire** et **intelligence artificielle** pour offrir une expérience premium aux experts-comptables et à leurs clients.

### Pays Supportés

🇨🇮 Côte d'Ivoire • 🇸🇳 Sénégal • 🇨🇲 Cameroun • 🇬🇦 Gabon • 🇧🇯 Bénin • 🇹🇬 Togo • 🇧🇫 Burkina Faso • 🇲🇱 Mali

---

## ✨ Fonctionnalités

### 🏦 Gestion Client (CRM)
- Fiche client complète avec identifiants OHADA (RCCM, NINEA, IFU, NIF)
- Gestion des régimes fiscaux (Réel Normal, Réel Simplifié, CME)
- Historique complet des interactions
- Segmentation par secteur d'activité

### ⏱️ Suivi du Temps (Timesheets)
- Chronomètre intégré pour saisie en temps réel
- Saisie manuelle avec catégorisation
- Calcul automatique de la valorisation
- Export pour facturation

### 📊 Missions & Tâches
- Gestion complète du cycle de vie des missions
- Types: Audit, Conseil, Tenue Comptable, Déclarations, Paie
- Affectation aux collaborateurs
- Suivi de l'avancement

### 💰 Facturation & Honoraires
- Génération automatique des factures
- TVA 18% (norme OHADA)
- Suivi des paiements
- Relances automatiques

### 📄 Gestion Documentaire + OCR
- Upload de documents (factures, relevés, contrats)
- **OCR automatique** pour extraction de données
- Reconnaissance de:
  - Numéro de facture
  - Date
  - Fournisseur
  - Montants HT/TTC/TVA
- Stockage sécurisé

### 📅 Agenda & Réunions
- Calendrier partagé
- Réunions virtuelles (intégration visio)
- **Génération automatique de comptes rendus par IA**
- Notifications et rappels

### 📈 Déclarations Fiscales
- Suivi des échéances (TVA, IS, IRPP, Cotisations)
- Alertes avant deadline
- Historique des déclarations
- Statuts: Draft, Pending, Submitted, Validated

### 🌍 Benchmarking Sectoriel
- Comparaison avec moyennes du marché OHADA
- Indicateurs clés: Marge, DSO, Masse salariale, Endettement
- **Insights IA** pour recommandations stratégiques
- Export de rapports

### 🤖 Intelligence Artificielle
- Génération de rapports d'audit
- Rédaction juridique assistée
- Détection d'anomalies (Forensics)
- Analyse prédictive

### 🎨 Interface Premium
- Design moderne avec glassmorphism
- **Entièrement responsive** (mobile, tablette, desktop)
- 3 thèmes: Dark, Light, Corporate
- Animations fluides avec Framer Motion

---

## 🛠️ Technologies

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion 12](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: PostgreSQL 14+
- **Authentication**: JWT + bcrypt
- **API**: Next.js API Routes

### OCR & AI
- **OCR**: [Tesseract.js](https://tesseract.projectnaptha.com/)
- **Image Processing**: [Sharp](https://sharp.pixelplumbing.com/)
- **PDF Parsing**: pdf-parse

### DevOps
- **Hosting**: Vercel / VPS
- **CI/CD**: GitHub Actions
- **Monitoring**: Vercel Analytics
- **Database**: Supabase / Neon

---

## 🚀 Installation

### Prérequis

- Node.js 18+ ([Download](https://nodejs.org/))
- PostgreSQL 14+ ([Download](https://www.postgresql.org/download/))
- Git ([Download](https://git-scm.com/))

### Installation Rapide

```bash
# 1. Cloner le repository
git clone https://github.com/mamadouelimanewane/expert.git
cd expert/cabinet-expert-ohada

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos paramètres

# 4. Initialiser la base de données
npx prisma generate
npx prisma db push
npx prisma db seed

# 5. Démarrer le serveur de développement
npm run dev
```

L'application sera accessible sur **http://localhost:3001**

### Identifiants de Test

```
Admin:         admin@cabinet360.com / Admin@2026!
Expert:        expert@cabinet360.com / Expert@2026!
Collaborateur: collaborator@cabinet360.com / Collab@2026!
```

---

## ⚙️ Configuration

### Variables d'Environnement

Créer un fichier `.env` à la racine :

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cabinet_ohada"

# JWT
JWT_SECRET="votre-secret-jwt-securise"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3001"
NODE_ENV="development"

# Upload
MAX_FILE_SIZE="10485760"
UPLOAD_DIR="./uploads"

# Email (optionnel)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="votre-email@gmail.com"
SMTP_PASSWORD="votre-mot-de-passe"
```

Voir [.env.example](./.env.example) pour la liste complète.

---

## 📖 Utilisation

### Commandes Disponibles

```bash
# Développement
npm run dev          # Démarrer en mode développement
npm run build        # Build de production
npm start            # Démarrer en production
npm run lint         # Linter le code

# Base de données
npx prisma studio    # Interface graphique DB
npx prisma generate  # Générer le client Prisma
npx prisma db push   # Appliquer le schéma
npx prisma db seed   # Seed avec données de test

# Déploiement
vercel               # Déployer sur Vercel
```

### Structure du Projet

```
cabinet-expert-ohada/
├── src/
│   ├── app/                 # Pages Next.js (App Router)
│   │   ├── api/            # API Routes
│   │   ├── dashboard/      # Dashboard
│   │   ├── clients/        # Gestion clients
│   │   ├── timesheets/     # Saisie des temps
│   │   ├── agenda/         # Calendrier
│   │   └── ...
│   ├── components/         # Composants React
│   │   ├── layout/         # Layout components
│   │   ├── dashboard/      # Dashboard components
│   │   └── ...
│   ├── lib/                # Utilitaires
│   │   ├── prisma.ts       # Client Prisma
│   │   ├── ocr-engine.ts   # Moteur OCR
│   │   └── utils.ts        # Helpers
│   └── context/            # React Context
├── prisma/
│   ├── schema.prisma       # Schéma de base de données
│   └── seed.ts             # Données de test
├── public/                 # Assets statiques
├── uploads/                # Fichiers uploadés
└── ...
```

---

## 🚢 Déploiement

### Déploiement Rapide (Vercel)

```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel --prod
```

### Déploiement VPS

Voir le [Guide de Déploiement Complet](./DEPLOYMENT_GUIDE.md) pour:
- Configuration serveur Ubuntu/Debian
- Nginx + PM2
- SSL avec Let's Encrypt
- Docker
- Backup automatique

---

## 🧪 Tests

### Tests UAT (User Acceptance Testing)

Suivre le [Guide de Tests UAT](./UAT_TESTING_GUIDE.md) pour:
- 8 scénarios de test détaillés
- Formulaires de feedback
- Rapport de bugs
- Checklist de validation

### Tests Automatisés (À venir)

```bash
npm run test          # Tests unitaires
npm run test:e2e      # Tests end-to-end
npm run test:coverage # Coverage
```

---

## 📚 Documentation

- [📖 Documentation Complète](./DOCUMENTATION.md)
- [🚀 Guide de Déploiement](./DEPLOYMENT_GUIDE.md)
- [🧪 Guide de Tests UAT](./UAT_TESTING_GUIDE.md)
- [📱 Guide Responsive](./RESPONSIVE_GUIDE.md)
- [📊 Plan d'Implémentation](./IMPLEMENTATION_PLAN_OHADA.md)
- [📈 Rapport de Projet](./PROJECT_REPORT.md)

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Guidelines

- Suivre les conventions TypeScript
- Ajouter des tests pour les nouvelles fonctionnalités
- Mettre à jour la documentation
- Respecter le style de code (ESLint)

---

## 🐛 Rapport de Bugs

Pour signaler un bug, ouvrir une [issue](https://github.com/mamadouelimanewane/expert/issues) avec:
- Description détaillée
- Étapes pour reproduire
- Comportement attendu vs obtenu
- Captures d'écran si applicable
- Environnement (OS, navigateur, version)

---

## 📊 Roadmap

### Version 2.1 (Q1 2026)
- [ ] Authentification multi-facteurs (2FA)
- [ ] Intégration Mobile Money (Wave, Orange, MTN)
- [ ] Application mobile (React Native)
- [ ] Mode offline
- [ ] Signature électronique avancée

### Version 2.2 (Q2 2026)
- [ ] Intégration bancaire (Open Banking)
- [ ] IA avancée (GPT-4 pour rédaction)
- [ ] Tableau de bord BI avancé
- [ ] API publique pour intégrations
- [ ] Marketplace d'extensions

### Version 3.0 (Q3 2026)
- [ ] Multi-cabinets (SaaS complet)
- [ ] Portail client dédié
- [ ] Conformité RGPD/GDPR
- [ ] Audit trail complet
- [ ] Certifications ISO

---

## 📄 License

**Proprietary** - © 2026 Cabinet 360. Tous droits réservés.

Ce logiciel est la propriété exclusive de Cabinet 360. Toute utilisation, reproduction ou distribution non autorisée est strictement interdite.

Pour obtenir une licence, contactez: [license@cabinet360.com](mailto:license@cabinet360.com)

---

## 👥 Équipe

**Développement**: Mamadou Eliman Ewane  
**Design**: Antigravity AI  
**Product Owner**: Cabinet Expert OHADA  

---

## 📞 Contact

- **Email**: contact@cabinet360.com
- **Support**: support@cabinet360.com
- **Website**: https://cabinet360.com
- **GitHub**: https://github.com/mamadouelimanewane/expert

---

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) pour le framework
- [Vercel](https://vercel.com/) pour l'hébergement
- [Prisma](https://www.prisma.io/) pour l'ORM
- [Tailwind CSS](https://tailwindcss.com/) pour le styling
- [Tesseract.js](https://tesseract.projectnaptha.com/) pour l'OCR
- La communauté open-source

---

<div align="center">

**Fait avec ❤️ pour les experts-comptables d'Afrique**

[⬆ Retour en haut](#-cabinet-360---plateforme-saas-expert-ohada)

</div>
