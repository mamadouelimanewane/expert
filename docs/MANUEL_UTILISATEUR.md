# 📘 MANUEL D'UTILISATION COMPLET — CABINET 360 v3.0

Bienvenue dans le manuel d'utilisation officiel de **Cabinet 360**, l'ERP de nouvelle génération conçu pour les experts-comptables de la zone OHADA. Ce "handbook" détaille de manière exhaustive l'intégralité des modules, pages et fonctionnalités de la plateforme.

---

## 📑 TABLE DES MATIÈRES

1. [Chapitre 1 : Introduction & Prise en Main](#chapitre-1--introduction--prise-en-main)
2. [Chapitre 2 : Le Tableau de Bord (Dashboard)](#chapitre-2--le-tableau-de-bord-dashboard)
3. [Chapitre 3 : Production Comptable & Liasse Fiscale IA](#chapitre-3--production-comptable--liasse-fiscale-ia)
4. [Chapitre 4 : Audit Légal & Intelligence Artificielle](#chapitre-4--audit-légal--intelligence-artificielle)
5. [Chapitre 5 : Gestion des Dépenses & Scanner OCR](#chapitre-5--gestion-des-dépenses--scanner-ocr)
6. [Chapitre 6 : Fintech & Hub de Paiement (Mobile Money)](#chapitre-6--fintech--hub-de-paiement-mobile-money)
7. [Chapitre 7 : L'Écosystème TPE (Le Portail Client)](#chapitre-7--lécosystème-tpe-le-portail-client)
8. [Chapitre 8 : Mission Control (Super Admin SaaS)](#chapitre-8--mission-control-super-admin-saas)
9. [Chapitre 9 : Developer Hub (API & Webhooks)](#chapitre-9--developer-hub-api--webhooks)
10. [Chapitre 10 : Paramètres, Sécurité & Support](#chapitre-10--paramètres-sécurité--support)

---

## Chapitre 1 : Introduction & Prise en Main

Cabinet 360 est une solution SaaS (Software as a Service) accessible depuis n'importe quel navigateur web (Chrome, Safari, Edge). L'interface a été pensée pour être "Dark Mode" (Thème sombre) afin de réduire la fatigue oculaire lors des longues sessions de saisie ou de révision.

### 1.1. La Barre de Navigation Latérale (Sidebar)
Sur la gauche de votre écran se trouve le menu principal. Il est divisé en grands "Hubs" :
- **Hub Pilotage :** Tableaux de bord, CRM, Temps passés.
- **Hub Production :** Liasse Fiscale, Saisie, Révision.
- **Hub Audit :** Analyse FEC, CAC, Détection de fraudes.
- **Hub Fintech :** Paiements Mobile Money, Analyse de solvabilité.
- **Hub Écosystème :** Portail Client, APIs, Administration.

### 1.2. La Barre Supérieure (Header)
En haut de l'écran, vous retrouvez :
- **Le fil d'Ariane (Breadcrumb) :** Vous indique exactement où vous vous trouvez (ex: `Accueil > Fintech > Hub Paiements`).
- **L'Avatar Utilisateur :** Permet d'accéder à votre profil, de changer vos mots de passe et de vous déconnecter.
- **La Cloche de Notifications :** Vous avertit lorsqu'un client a uploadé un nouveau document, ou qu'un paiement Mobile Money a été reçu.

---

## Chapitre 2 : Le Tableau de Bord (Dashboard)

Le Tableau de bord est la première page que vous voyez après la connexion (`/dashboard`). C'est le centre névralgique de votre cabinet.

### 2.1. Les Indicateurs Clés de Performance (KPIs)
Le haut du tableau de bord affiche vos métriques en temps réel :
- **Chiffre d'Affaires :** Le total facturé sur l'année en cours (exprimé en Francs CFA).
- **Missions Actives :** Le nombre de dossiers de révision, tenue ou audit en cours de traitement par vos collaborateurs.
- **Productivité :** Le ratio de temps facturable saisi dans le module "Timesheets".

### 2.2. Graphiques et Visualisations
- **Courbe de Trésorerie :** Un graphique dynamique permettant de voir l'évolution des encaissements mois par mois.
- **Dossiers en souffrance :** Une liste rouge mettant en évidence les tâches en retard (ex: Déclaration de TVA non soumise à J-2).

---

## Chapitre 3 : Production Comptable & Liasse Fiscale IA

Cette section révolutionne la manière dont un cabinet clôture ses comptes annuels. La page cible est `/liasse-fiscale`.

### 3.1. Le Principe du Zéro-Saisie
Historiquement, la Liasse Fiscale OHADA (SYSCOHADA Révisé) nécessitait un paramétrage lourd sur Excel. Dans Cabinet 360, ce processus est remplacé par l'Intelligence Artificielle.

### 3.2. Comment générer une Liasse Fiscale ?
1. **Naviguez** vers la page `Production > Liasse Fiscale IA`.
2. **Importez la Balance :** Dans la zone en pointillés ("Drop Zone"), glissez-déposez le fichier de la Balance Générale au format Excel (`.xlsx`) ou `.csv`.
3. **Le Moteur de Mappage :** L'algorithme (exécuté 100% côté navigateur pour le secret professionnel) analyse les numéros de comptes :
   - Comptes de Classe 1 à 5 : Dirigés vers le **Bilan** (Actif / Passif).
   - Comptes de Classe 6 à 8 : Dirigés vers le **Compte de Résultat** (Charges / Produits).
4. **Visualisation en Temps Réel :** Les totaux se mettent à jour instantanément. Le logiciel vous confirme par une alerte visuelle (Vert) si l'Actif est strictement égal au Passif.
5. **Exportation :** Une fois validée, la liasse peut être imprimée ou exportée en PDF pour dépôt aux impôts.

---

## Chapitre 4 : Audit Légal & Intelligence Artificielle

Ce module (`/audit-legal`) est conçu pour les missions de Commissariat aux Comptes ou de révision approfondie.

### 4.1. L'Analyseur FEC (Fichier des Écritures Comptables)
Le FEC est le standard informatique de l'administration fiscale. Le logiciel l'analyse pour trouver les fraudes ou les erreurs humaines.

### 4.2. Fonctionnement du Scanner d'Anomalies
1. **Chargement :** Sélectionnez un fichier FEC (Excel).
2. **Détection de Caisse Créditrice :** Le système vérifie jour par jour si le solde du compte 57 (Caisse) devient négatif (ce qui est physiquement impossible et fiscalement puni).
3. **Détection des Écritures de Week-end :** L'algorithme croise la date de saisie comptable avec le calendrier et lève une alerte sur les lignes saisies un Dimanche (risque de manipulation par le dirigeant).
4. **Montants Suspects (Loi de Benford) :** Les décaissements avec des "comptes ronds" (ex: 5 000 000 FCFA tout pile) sans centimes sont flaggués pour vérification par l'auditeur.

### 4.3. Le Score de Risque
Un jauge circulaire indique le "Score de Risque" global du dossier. Plus il y a d'anomalies détectées, plus la jauge vire au Rouge (Alerte Maximale).

---

## Chapitre 5 : Gestion des Dépenses & Scanner OCR

Situé dans `/expense-notes`, ce module élimine la frappe au clavier pour vos collaborateurs.

### 5.1. La Technologie Tesseract OCR
OCR signifie *Optical Character Recognition* (Reconnaissance Optique de Caractères). Cabinet 360 embarque un mini-cerveau artificiel capable de "lire" les images.

### 5.2. Guide d'utilisation du Scanner de reçus
1. **Capture :** Uploadez l'image (JPG, PNG) d'un ticket de caisse de restaurant, d'essence ou de fournitures.
2. **Animation de Scan :** Une barre lumineuse balaye l'image pour vous indiquer que le moteur Neural (IA) travaille.
3. **Extraction :** Le système isole et remplit de lui-même :
   - Le montant TTC.
   - Le montant de la TVA (calculé ou lu).
   - La date de la facture.
   - Le nom probable du Marchand.
4. **Validation :** Le collaborateur n'a plus qu'à cliquer sur "Valider" pour passer l'écriture en comptabilité.

---

## Chapitre 6 : Fintech & Hub de Paiement (Mobile Money)

La facturation traditionnelle meurt à cause des retards de paiement. Ce module (`/fintech/payments`) transforme le cabinet en une plateforme de paiement en ligne.

### 6.1. Le Générateur de Liens de Paiement
Vous souhaitez facturer 500 000 FCFA à un client pour la clôture de son bilan ?
1. Allez sur **Hub Paiements**.
2. Renseignez le montant et le nom du client.
3. Sélectionnez le fournisseur (Wave, Orange Money, MTN ou Moov).
4. Cliquez sur "Générer le Lien".
5. Le système crée un **QR Code dynamique** et un lien court (ex: `cabinet360.pay/123`).

### 6.2. Le Suivi des Transactions
- **Transactions Récentes :** À droite de l'écran, vous voyez l'état des paiements. Un paiement généré est `EN ATTENTE` (jaune).
- Lorsqu'un client paie sur son téléphone, un signal informatique (Webhook) est reçu par le logiciel. La transaction passe instantanément en statut `PAYÉ` (vert) avec une animation.
- La facture comptable associée est automatiquement lettrée.

---

## Chapitre 7 : L'Écosystème TPE (Le Portail Client)

Le module `/portal/tpe-client` n'est pas conçu pour le comptable, mais pour le **Client du comptable** (le chef d'entreprise de la TPE).

### 7.1. Une Interface "Mobile-First"
Parce que le dirigeant d'un restaurant n'a pas le temps d'ouvrir son ordinateur, ce portail est conçu avec de gros boutons et de gros textes, parfaitement lisibles sur smartphone.

### 7.2. Que peut faire le client sur ce portail ?
- **Suivre sa santé :** Une jauge "Score de Santé" (sur 200 points) vulgarise les concepts financiers. Le dirigeant sait instantanément si sa trésorerie est dans le vert ou le rouge.
- **Envoyer une dépense :** Un gros bouton bleu "Envoyer une dépense" active l'appareil photo du téléphone. Le reçu est envoyé directement au module OCR de l'expert-comptable.
- **Chat Collaboratif :** Un module de messagerie permet de poser une question rapide ("Est-ce que je peux déduire cet achat ?") à son gestionnaire de dossier au cabinet.

---

## Chapitre 8 : Mission Control (Super Admin SaaS)

Ce module (`/settings/saas-admin`) est une forteresse réservée exclusivement au Propriétaire/Fondateur du logiciel. Il permet de gérer le logiciel dans un modèle "Multi-Tenant" (Scalabilité vers des centaines de cabinets).

### 8.1. Le Pilotage Financier (MRR)
- **MRR (Monthly Recurring Revenue) :** Le revenu récurrent mensuel généré par la vente des abonnements de votre logiciel est suivi via un graphique analytique sur 6 mois.
- **KPIs d'usage :** Vous voyez le nombre total de factures générées et le nombre d'utilisateurs sur l'ensemble des cabinets mondiaux utilisant votre produit.

### 8.2. Gestion des Abonnements (Plans)
Le logiciel gère les cabinets clients selon 3 niveaux de facturation :
- **Basic (25 000 FCFA/mois) :** Idéal pour les petits cabinets.
- **Pro (65 000 FCFA/mois) :** Débloque l'Intelligence Artificielle et l'OCR.
- **Enterprise (150 000 FCFA/mois) :** Volume illimité.

### 8.3. Administration des Cabinets
Un tableau liste tous les abonnés (ex: Cabinet Ndiaye Dakar, Fiduciaire Douala).
En tant que Super Admin, vous disposez d'un "Bouton d'arrêt d'urgence" rouge permettant de **Suspendre** l'accès d'un cabinet s'il ne paie pas son abonnement mensuel.

---

## Chapitre 9 : Developer Hub (API & Webhooks)

Situé dans `/settings/api-keys`, cet espace (Inspiré par Stripe) permet l'interconnexion (Interopérabilité) avec d'autres logiciels du marché.

### 9.1. Les Clés API (Secrètes)
Pour qu'un logiciel de caisse externe puisse envoyer des factures à Cabinet 360 :
1. Le développeur externe génère une clé (`c360_live_sk_...`).
2. Cette clé est une preuve d'identité cryptographique. Si elle fuite, le bouton rouge "Révoquer" la rend inutilisable en une milliseconde.

### 9.2. Documentation Embarquée
Plus besoin de chercher des PDF. La documentation est interactive :
- Chaque "Endpoint" (ex: `POST /api/v1/invoices`) affiche un exemple de code source prêt à copier-coller pour l'intégration.

### 9.3. Les Webhooks et Logs
- **Logs API :** Permet de tracer chaque tentative de connexion (Succès: 200 OK, Échec: 401 Unauthorized), incluant l'adresse IP et le temps de réponse.
- **Webhooks :** Permettent d'envoyer un signal informatique à un autre logiciel dès qu'un événement survient dans Cabinet 360 (ex: Dès qu'une facture est créée, envoyer une requête au CRM externe).

---

## Chapitre 10 : Paramètres, Sécurité & Support

### 10.1. Le Principe du Zéro-Trust (Confiance Zéro)
Cabinet 360 gère des données sous le sceau du secret professionnel. Pour cette raison :
- **Le traitement "Edge" :** Lorsque vous uploadez un fichier Excel de comptabilité (Liasse, Balance), le fichier n'est **jamais** envoyé à une Intelligence Artificielle basée en Amérique ou en Europe. L'algorithme Javascript s'exécute localement dans la mémoire RAM de votre propre navigateur (`SheetJS`, `Tesseract.js`). Ainsi, aucune fuite réseau n'est possible.

### 10.2. Support Technique
En cas de problème bloquant, l'administrateur peut utiliser la console développeur ou contacter le support via les informations présentes dans le `README.md` du dépôt logiciel.

---
*Ce manuel est la source de vérité pour l'utilisation fonctionnelle de Cabinet 360 v3.0.*
