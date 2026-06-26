# 🏢 Cabinet 360 - Plateforme SaaS Expert OHADA

<div align="center">

![Cabinet 360](https://img.shields.io/badge/Version-2.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-Latest-2D3748)
![License](https://img.shields.io/badge/License-Proprietary-red)

**Logiciel de gestion tout-en-un pour cabinets d'expertise comptable en zone OHADA**

> 🆕 **Dernière mise à jour majeure** : Intégration de l'Intelligence Artificielle (OCR & Analyse FEC)

[🚀 Accéder à l'application (Local)](http://localhost:3000) • [📖 Documentation](#-documentation)

</div>

---

## 🎯 À Propos
**Cabinet 360** est l'outil ultime pour les experts-comptables modernes de l'espace OHADA. 
Plus qu'un ERP, c'est un assistant pro-actif qui élimine les saisies fastidieuses (grâce à la lecture automatique de factures), automatise les liasses fiscales et traque la fraude comptable via intelligence artificielle.

---

## ✨ Nouveautés & Modules Premium (v2.0)

1. **📊 Liasse Fiscale IA (Générateur SYSCOHADA)**
   - Importez une Balance Générale (XLSX, CSV).
   - L'application mappe les comptes et génère instantanément votre **Bilan (Actif/Passif)** et **Compte de Résultat**.
   - Calculs 100% exécutés dans le navigateur (Zéro-Trust) pour une sécurité maximale.

2. **🛡️ Audit Légal IA (FEC Analyzer)**
   - Importez un Fichier des Écritures Comptables.
   - Algorithme de détection : Alertes sur les soldes de caisse (57) créditeurs, les écritures passées le dimanche, et les montants "ronds" suspects.

3. **📸 Scanner de Notes de Frais (Tesseract OCR)**
   - Chargez l'image d'un ticket de caisse. L'OCR (Reconnaissance Optique) extrait le montant HT, la TVA, la date et le marchand.

---

## 📋 Fonctionnalités Classiques

### 🏦 Gestion Client (CRM)
- Fiche client complète avec identifiants OHADA (RCCM, NINEA, IFU)
- Gestion des missions et du budget.

### ⏱️ Suivi du Temps & Rentabilité (Timesheets)
- Saisie des temps par collaborateur.
- Vue croisée : Chiffre d'affaires facturé VS Coût horaire passé.

### 💰 Facturation
- Émission de factures aux normes UEMOA.
- Tableau de bord avec suivi de la trésorerie et intégration directe dans la comptabilité.

---

## 🛠️ Stack Technique

- **Frontend & Backend** : Next.js 16 (App Router), React 19, TypeScript
- **Design** : Tailwind CSS v4, Framer Motion, Lucide Icons
- **Base de données** : PostgreSQL / MongoDB avec Prisma ORM
- **Intelligence Artificielle** : Tesseract.js (OCR WebAssembly)
- **Traitement de fichiers** : SheetJS (xlsx)

---

## 🚀 Installation & Lancement Rapide

### Prérequis
- Node.js 18+
- Un accès réseau pour le premier lancement de l'OCR (téléchargement du modèle linguistique `fra`).

### Démarrage

```bash
# 1. Cloner le repository
git clone https://github.com/mamadouelimanewane/expert.git
cd expert/cabinet-expert-ohada

# 2. Installer les dépendances
npm install

# 3. Base de données
# Le projet utilise Prisma. Assurez-vous d'avoir configuré le fichier .env
npx prisma generate
npx prisma db push

# 4. Peupler la base avec les données de simulation (CA et Dashboard)
npm run seed:invoices

# 5. Démarrer le projet
npm run dev
```

L'application est maintenant disponible sur **http://localhost:3000**

---

## 🔒 Sécurité et Zéro-Trust
Pour assurer le **secret professionnel de l'expert-comptable**, l'ensemble des modules d'Intelligence Artificielle et de traitement des fichiers (Balances, FEC, Tickets) s'exécute côté client (Navigateur). 
Aucun fichier financier n'est envoyé à une API d'Intelligence Artificielle tierce. La puissance de calcul est déportée sur votre ordinateur (`Edge computing`).

---

## 📞 Support & Contacts
Pour un accompagnement sur le déploiement sur VPS ou Vercel, ou pour remonter une erreur :
- **Email**: contact@cabinet360.com
- **Créateur**: Mamadou Eliman Ewane

<div align="center">
Fait avec ❤️ pour les experts-comptables d'Afrique.
</div>
