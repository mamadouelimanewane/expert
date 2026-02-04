# 🔐 IDENTIFIANTS DE CONNEXION - CABINET 360

## 📱 APPLICATION PRINCIPALE (Expert)
**URL**: https://expert-pi.vercel.app/

### Utilisateurs Disponibles

#### 1. **Administrateur Principal**
- **Email**: `admin@cabinet360.com`
- **Mot de passe**: `Admin@2026!`
- **Rôle**: ADMIN
- **Nom**: Expert Principal
- **Accès**: Complet (toutes les fonctionnalités)

#### 2. **Expert Comptable**
- **Email**: `expert@cabinet360.com`
- **Mot de passe**: `Expert@2026!`
- **Rôle**: EXPERT
- **Nom**: Jean Kouassi
- **Téléphone**: +225 07 11 22 33 44
- **Accès**: Gestion des missions, clients, audits

#### 3. **Collaborateur**
- **Email**: `collaborator@cabinet360.com`
- **Mot de passe**: `Collab@2026!`
- **Rôle**: COLLABORATOR
- **Nom**: Marie Traoré
- **Téléphone**: +225 07 55 66 77 88
- **Accès**: Production comptable, saisie

---

## 🌐 PORTAIL CLIENT (Espace Client Sécurisé)
**URL**: https://expert-pi.vercel.app/portal

### Clients de Démonstration

#### 1. **Société Ivoirienne de Banque (SIB)**
- **Email**: `contact@sib-ci.com`
- **Entreprise**: Société Ivoirienne de Banque
- **Secteur**: Banque et Finance
- **Pays**: Côte d'Ivoire (CI)
- **RCCM**: CI-ABJ-2020-B-12345
- **IFU**: 1234567890123
- **Régime Fiscal**: REEL_NORMAL
- **Adresse**: Avenue Chardy, Plateau, Abidjan
- **Téléphone**: +225 27 20 12 34 56

#### 2. **Traoré Import-Export SARL**
- **Email**: `traore@import-export.sn`
- **Entreprise**: Traoré Import-Export SARL
- **Secteur**: Commerce International
- **Pays**: Sénégal (SN)
- **RCCM**: SN-DKR-2019-B-54321
- **NINEA**: 987654321
- **Régime Fiscal**: REEL_SIMPLIFIE
- **Adresse**: Rue 10, Almadies, Dakar
- **Téléphone**: +221 33 123 45 67

#### 3. **Boulangerie du Plateau**
- **Email**: `contact@boulangerie-plateau.ci`
- **Entreprise**: Boulangerie du Plateau
- **Secteur**: Boulangerie / Pâtisserie
- **Pays**: Côte d'Ivoire (CI)
- **RCCM**: CI-ABJ-2021-B-98765
- **IFU**: 9876543210987
- **Régime Fiscal**: CME (Centre de Moyenne Entreprise)
- **Adresse**: Rue du Commerce, Plateau, Abidjan
- **Téléphone**: +225 07 98 76 54 32

---

## 🔧 COMPTE DE DÉVELOPPEMENT (Alternatif)
Si vous avez besoin d'un compte simple pour les tests :

- **Email**: `admin@cabinet360.com`
- **Mot de passe**: `admin123`
- **Note**: Compte créé via le script seed-admin.ts

---

## 📝 NOTES IMPORTANTES

### Sécurité
- Tous les mots de passe sont hashés avec bcrypt (12 rounds)
- Les sessions sont gérées via cookies sécurisés
- Audit automatique de toutes les connexions

### Base de Données
- Les données sont stockées dans PostgreSQL via Prisma
- Script de seed disponible: `prisma/seed.ts`
- Pour réinitialiser: `npm run db:seed`

### Portail Client
- Le portail client affiche des données de démonstration
- Informations client visibles: SIB (Société Ivoirienne de Banque)
- Manager affiché: M. Kouassi Jean

### Fonctionnalités Actives
- ✅ Tableau de bord avec KPI temps réel
- ✅ CRM 360° avec gestion clients
- ✅ Missions & Tâches (Kanban)
- ✅ Audit & Conformité
- ✅ Banque & Lettrage IA
- ✅ Facturation & Finance
- ✅ Paie Multi-pays
- ✅ Fiscalité OHADA
- ✅ États Financiers (Bilan, Compte de résultat, TFT)
- ✅ Bibliothèque OHADA
- ✅ NEXUS AI Experience
- ✅ Strategy & Business Plan Lab
- ✅ Documentation & Manuel utilisateur

---

## 🚀 ACCÈS RAPIDE

### Pour se connecter à l'application :
1. Aller sur https://expert-pi.vercel.app/
2. Utiliser un des comptes ci-dessus
3. Accéder au tableau de bord

### Pour tester le portail client :
1. Aller sur https://expert-pi.vercel.app/portal
2. Interface client avec données de démonstration
3. Pas de login requis (simulation)

---

**Dernière mise à jour**: 2 Février 2026
**Version**: 2.0.0
**Environnement**: Production (Vercel)
