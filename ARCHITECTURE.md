# 🏗️ Architecture Technique - Cabinet 360

**Version**: 2.0.0  
**Date**: 28 Janvier 2026  
**Type**: Documentation Technique

---

## 📋 Vue d'Ensemble

Cabinet 360 est une application web full-stack construite avec une architecture moderne et scalable, optimisée pour les cabinets d'expertise comptable en zone OHADA.

### Principes Architecturaux

1. **Separation of Concerns**: Frontend, Backend, Database clairement séparés
2. **Mobile-First**: Design responsive prioritaire
3. **API-First**: Routes API RESTful pour toutes les opérations
4. **Type Safety**: TypeScript strict sur tout le codebase
5. **Performance**: SSR, ISR, et optimisations Next.js
6. **Security**: JWT, bcrypt, validation Zod

---

## 🎨 Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │   Mobile     │  │   Tablet     │      │
│  │  (Desktop)   │  │   (iOS/And)  │  │   (iPad)     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │               │
│         └─────────────────┴──────────────────┘               │
│                           │                                  │
│                           ▼                                  │
└───────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│                      (Next.js 16)                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  App Router (src/app/)                               │  │
│  │  ├── page.tsx (Dashboard)                            │  │
│  │  ├── clients/page.tsx                                │  │
│  │  ├── timesheets/page.tsx                             │  │
│  │  ├── agenda/page.tsx                                 │  │
│  │  └── ...                                             │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Components (src/components/)                        │  │
│  │  ├── layout/ (Sidebar, Header, etc.)                 │  │
│  │  ├── dashboard/ (StatCard, Charts, etc.)             │  │
│  │  └── ...                                             │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER                               │
│                  (Next.js API Routes)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /api/clients        - CRUD Clients                  │  │
│  │  /api/documents      - Upload + OCR                  │  │
│  │  /api/missions       - Gestion missions              │  │
│  │  /api/timesheets     - Saisie temps                  │  │
│  │  /api/invoices       - Facturation                   │  │
│  │  /api/declarations   - Déclarations fiscales         │  │
│  │  /api/auth           - Authentication                │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Services (src/lib/)                                 │  │
│  │  ├── ocr-engine.ts   - OCR Processing                │  │
│  │  ├── prisma.ts       - Database Client               │  │
│  │  ├── auth.ts         - Authentication                │  │
│  │  ├── utils.ts        - Helpers                       │  │
│  │  └── ...                                             │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER                       │
│                       (Prisma ORM)                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Models:                                             │  │
│  │  - User (Admin, Expert, Collaborator, Client)        │  │
│  │  - Client (Entreprise, Particulier)                  │  │
│  │  - Mission (Audit, Conseil, Comptabilité, etc.)      │  │
│  │  - TimeEntry (Suivi temps)                           │  │
│  │  - Invoice (Facturation)                             │  │
│  │  - Document (Stockage + OCR)                         │  │
│  │  - TaxDeclaration (Échéances fiscales)               │  │
│  │  - Meeting (Agenda)                                  │  │
│  │  - Notification                                      │  │
│  │  - AuditLog                                          │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                          │
│                    PostgreSQL 14+                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tables: users, clients, missions, time_entries,     │  │
│  │  invoices, documents, tax_declarations, meetings,    │  │
│  │  notifications, audit_logs                           │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

---

## 🔧 Stack Technique Détaillée

### Frontend Stack

| Technologie | Version | Rôle |
|-------------|---------|------|
| **Next.js** | 16.1.4 | Framework React avec SSR/ISR |
| **React** | 19.2.3 | Bibliothèque UI |
| **TypeScript** | 5.0 | Typage statique |
| **Tailwind CSS** | 4.0 | Framework CSS utility-first |
| **Framer Motion** | 12.29.0 | Animations fluides |
| **Lucide React** | 0.563.0 | Icônes modernes |
| **clsx** | 2.1.1 | Gestion classes conditionnelles |
| **tailwind-merge** | 3.4.0 | Merge classes Tailwind |

### Backend Stack

| Technologie | Version | Rôle |
|-------------|---------|------|
| **Prisma** | 7.3.0 | ORM TypeScript-first |
| **PostgreSQL** | 14+ | Base de données relationnelle |
| **bcryptjs** | 2.4.3 | Hachage mots de passe |
| **jsonwebtoken** | 9.0.2 | Authentification JWT |
| **Zod** | 3.24.1 | Validation schémas |

### OCR & Processing Stack

| Technologie | Version | Rôle |
|-------------|---------|------|
| **Tesseract.js** | 7.0.0 | OCR (reconnaissance texte) |
| **Sharp** | 0.34.5 | Traitement d'images |
| **pdf-parse** | 2.4.5 | Extraction texte PDF |
| **Multer** | 2.0.2 | Upload fichiers |

---

## 📁 Structure des Dossiers

```
cabinet-expert-ohada/
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/                 # Authentication
│   │   │   ├── clients/              # Clients CRUD
│   │   │   ├── documents/            # Upload + OCR
│   │   │   ├── missions/             # Missions
│   │   │   ├── timesheets/           # Time tracking
│   │   │   ├── invoices/             # Invoicing
│   │   │   └── declarations/         # Tax declarations
│   │   │
│   │   ├── (pages)/                  # Pages publiques
│   │   │   ├── page.tsx              # Dashboard
│   │   │   ├── layout.tsx            # Root layout
│   │   │   ├── globals.css           # Styles globaux
│   │   │   ├── clients/              # Gestion clients
│   │   │   ├── timesheets/           # Saisie temps
│   │   │   ├── agenda/               # Calendrier
│   │   │   ├── missions/             # Missions
│   │   │   ├── billing/              # Facturation
│   │   │   ├── declarations/         # Déclarations
│   │   │   ├── benchmarking/         # Benchmarking
│   │   │   ├── documents/            # Documents
│   │   │   ├── settings/             # Paramètres
│   │   │   └── ...                   # Autres pages
│   │   │
│   │   └── fonts/                    # Polices custom
│   │
│   ├── components/                   # Composants React
│   │   ├── layout/                   # Layout components
│   │   │   ├── Sidebar.tsx           # Menu latéral
│   │   │   ├── ResponsivePageHeader.tsx
│   │   │   └── ResponsiveComponents.tsx
│   │   │
│   │   ├── dashboard/                # Dashboard components
│   │   │   └── StatCard.tsx          # Cartes statistiques
│   │   │
│   │   ├── fintech/                  # Fintech components
│   │   │   └── PaymentModal.tsx      # Modal paiement
│   │   │
│   │   └── onboarding/               # Onboarding
│   │       └── OnboardingGuide.tsx   # Guide utilisateur
│   │
│   ├── lib/                          # Utilitaires & Services
│   │   ├── prisma.ts                 # Client Prisma
│   │   ├── ocr-engine.ts             # Moteur OCR
│   │   ├── utils.ts                  # Helpers
│   │   └── auth.ts                   # Authentication (à créer)
│   │
│   ├── context/                      # React Context
│   │   └── ThemeContext.tsx          # Gestion thèmes
│   │
│   ├── data/                         # Données mock
│   │   └── mock-clients.ts           # Clients de test
│   │
│   └── types/                        # Types TypeScript
│       └── index.ts                  # Types globaux
│
├── prisma/                           # Prisma ORM
│   ├── schema.prisma                 # Schéma DB
│   └── seed.ts                       # Seed data
│
├── public/                           # Assets statiques
│   ├── images/                       # Images
│   ├── icons/                        # Icônes
│   └── fonts/                        # Polices
│
├── uploads/                          # Fichiers uploadés
│   └── .gitkeep                      # (généré dynamiquement)
│
├── .github/                          # GitHub
│   └── workflows/                    # CI/CD
│       └── deploy.yml                # Auto-deploy
│
├── docs/                             # Documentation
│   ├── DOCUMENTATION.md              # Doc complète
│   ├── DEPLOYMENT_GUIDE.md           # Guide déploiement
│   ├── UAT_TESTING_GUIDE.md          # Guide tests
│   ├── RESPONSIVE_GUIDE.md           # Guide responsive
│   └── ARCHITECTURE.md               # Ce fichier
│
├── .env                              # Variables d'environnement
├── .env.example                      # Exemple .env
├── .gitignore                        # Git ignore
├── next.config.ts                    # Config Next.js
├── tailwind.config.ts                # Config Tailwind
├── tsconfig.json                     # Config TypeScript
├── package.json                      # Dependencies
└── README.md                         # README principal
```

---

## 🔐 Sécurité

### Authentification & Autorisation

```typescript
// Flow d'authentification
1. User login → /api/auth/login
2. Validation credentials (bcrypt)
3. Génération JWT token
4. Stockage token (httpOnly cookie)
5. Middleware vérifie token sur chaque requête
6. Autorisation basée sur rôle (RBAC)
```

### Rôles & Permissions

| Rôle | Permissions |
|------|-------------|
| **ADMIN** | Accès complet, gestion utilisateurs, paramètres |
| **EXPERT** | Toutes missions, validation, facturation |
| **COLLABORATOR** | Saisie temps, missions assignées, documents |
| **CLIENT** | Portail client (lecture seule) |
| **ASSISTANT** | Support administratif, agenda, communications |

### Mesures de Sécurité

- ✅ **Passwords**: Hachage bcrypt (10 rounds)
- ✅ **JWT**: Tokens signés, expiration 24h
- ✅ **HTTPS**: Obligatoire en production
- ✅ **CORS**: Origines autorisées uniquement
- ✅ **Rate Limiting**: Protection contre brute force
- ✅ **SQL Injection**: Prisma ORM (requêtes paramétrées)
- ✅ **XSS**: React escape automatique
- ✅ **CSRF**: Tokens CSRF sur formulaires
- ✅ **File Upload**: Validation type/taille
- ✅ **Audit Logs**: Traçabilité complète

---

## 📊 Modèle de Données

### Schéma Relationnel

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │   Client    │       │   Mission   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │───┐   │ id          │───┐   │ id          │
│ email       │   │   │ email       │   │   │ title       │
│ password    │   │   │ companyName │   │   │ type        │
│ firstName   │   │   │ rccm        │   │   │ status      │
│ lastName    │   │   │ ifu/ninea   │   │   │ clientId    │──┐
│ role        │   │   │ fiscalRegime│   │   │ assignedTo  │  │
│ phone       │   │   │ sector      │   │   │ createdBy   │  │
│ isActive    │   │   │ country     │   │   │ startDate   │  │
└─────────────┘   │   └─────────────┘   │   └─────────────┘  │
                  │                     │                     │
                  │   ┌─────────────┐   │   ┌─────────────┐  │
                  └──▶│ TimeEntry   │◀──┘   │  Document   │◀─┘
                      ├─────────────┤       ├─────────────┤
                      │ id          │       │ id          │
                      │ date        │       │ fileName    │
                      │ duration    │       │ fileUrl     │
                      │ category    │       │ type        │
                      │ userId      │       │ ocrData     │
                      │ clientId    │       │ clientId    │
                      │ missionId   │       │ uploadedBy  │
                      └─────────────┘       └─────────────┘
```

### Entités Principales

1. **User**: Utilisateurs du système (experts, collaborateurs)
2. **Client**: Clients du cabinet (entreprises, particuliers)
3. **Mission**: Missions comptables (audit, conseil, etc.)
4. **TimeEntry**: Saisie des temps de travail
5. **Invoice**: Factures clients
6. **Document**: Documents avec OCR
7. **TaxDeclaration**: Déclarations fiscales
8. **Meeting**: Réunions et rendez-vous
9. **Notification**: Notifications utilisateurs
10. **AuditLog**: Logs d'audit

---

## 🚀 Performance & Optimisations

### Next.js Optimizations

- **SSR**: Server-Side Rendering pour SEO
- **ISR**: Incremental Static Regeneration
- **Code Splitting**: Automatic par Next.js
- **Image Optimization**: next/image
- **Font Optimization**: next/font
- **Bundle Analysis**: webpack-bundle-analyzer

### Database Optimizations

- **Indexes**: Sur colonnes fréquemment requêtées
- **Connection Pooling**: Prisma connection pool
- **Query Optimization**: Select only needed fields
- **Pagination**: Limit/offset sur listes

### Caching Strategy

```
┌──────────────┐
│   Browser    │ ← Cache: 1 hour (static assets)
└──────┬───────┘
       │
┌──────▼───────┐
│   Vercel CDN │ ← Cache: Edge locations
└──────┬───────┘
       │
┌──────▼───────┐
│   Next.js    │ ← ISR: Revalidate every 60s
└──────┬───────┘
       │
┌──────▼───────┐
│  PostgreSQL  │ ← Query cache
└──────────────┘
```

---

## 🧪 Tests

### Stratégie de Tests

1. **Unit Tests**: Fonctions utilitaires, helpers
2. **Integration Tests**: API routes
3. **E2E Tests**: Scénarios utilisateurs complets
4. **UAT**: Tests d'acceptation utilisateurs

### Outils (À implémenter)

- **Jest**: Tests unitaires
- **React Testing Library**: Tests composants
- **Playwright**: Tests E2E
- **Cypress**: Alternative E2E

---

## 📈 Monitoring & Observabilité

### Métriques Clés

- **Performance**: Page load time, TTFB, FCP, LCP
- **Errors**: Error rate, stack traces
- **Usage**: Active users, page views, sessions
- **Business**: Clients créés, factures générées, temps saisi

### Outils Recommandés

- **Vercel Analytics**: Performance monitoring
- **Sentry**: Error tracking
- **Google Analytics**: Usage tracking
- **Posthog**: Product analytics

---

## 🔄 CI/CD Pipeline

```
┌──────────────┐
│  Git Push    │
└──────┬───────┘
       │
┌──────▼───────┐
│  GitHub      │
│  Actions     │
└──────┬───────┘
       │
       ├─► Lint (ESLint)
       ├─► Type Check (TypeScript)
       ├─► Tests (Jest)
       ├─► Build (Next.js)
       │
┌──────▼───────┐
│   Vercel     │
│   Deploy     │
└──────┬───────┘
       │
┌──────▼───────┐
│  Production  │
└──────────────┘
```

---

## 🌍 Scalabilité

### Horizontal Scaling

- **Vercel**: Auto-scaling serverless
- **Database**: Read replicas pour lecture
- **CDN**: Distribution globale des assets

### Vertical Scaling

- **Database**: Upgrade instance PostgreSQL
- **Compute**: Plus de RAM/CPU si VPS

---

## 📝 Conventions de Code

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Functions**: camelCase (`getUserById()`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Files**: kebab-case (`user-profile.tsx`)
- **CSS Classes**: kebab-case (`user-profile-card`)

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes pour JS, double pour JSX
- **Semicolons**: Oui
- **Line Length**: Max 100 caractères
- **Imports**: Ordre: React → Third-party → Local

---

## 🎯 Roadmap Technique

### Q1 2026
- [ ] Tests automatisés (Jest + Playwright)
- [ ] CI/CD complet avec GitHub Actions
- [ ] Monitoring avec Sentry
- [ ] Performance optimization (Lighthouse 90+)

### Q2 2026
- [ ] Microservices architecture (si nécessaire)
- [ ] GraphQL API (alternative REST)
- [ ] Real-time avec WebSockets
- [ ] Mobile app (React Native)

### Q3 2026
- [ ] Multi-tenancy (SaaS complet)
- [ ] Kubernetes deployment
- [ ] Advanced caching (Redis)
- [ ] Message queue (RabbitMQ/Kafka)

---

**Dernière mise à jour**: 28 Janvier 2026  
**Auteur**: Antigravity AI  
**Version**: 2.0.0
