import prisma from "./prisma";

// Procédures internes génériques réelles (trames de contrôle interne
// standard pour un cabinet d'expertise-comptable en zone OHADA) — contenu
// de référence réutilisable, pas des statistiques d'activité inventées.
const STARTER_PROCEDURES: Array<{ title: string; category: string; content: string }> = [
  {
    title: "Procédure de clôture mensuelle",
    category: "Comptabilité",
    content: `1. OBJET
La présente procédure décrit les étapes de clôture comptable mensuelle applicables à l'ensemble des dossiers clients du cabinet, afin de garantir la fiabilité et la disponibilité des états financiers intermédiaires dans les délais convenus.

2. ACTEURS CONCERNÉS
- Collaborateur en charge du dossier (saisie et premier contrôle)
- Chef de mission / Réviseur (contrôle et validation)
- Expert-comptable (revue finale, le cas échéant)

3. DÉROULEMENT
Étape 1 — Collecte des pièces justificatives du mois (factures, relevés bancaires, bulletins de paie) au plus tard le 5 du mois suivant.
Étape 2 — Saisie et imputation comptable selon le plan comptable SYSCOHADA révisé.
Étape 3 — Lettrage des comptes de tiers (clients, fournisseurs) et rapprochement bancaire.
Étape 4 — Contrôle de cohérence : comptes d'attente soldés, comptes de TVA justifiés, immobilisations et amortissements du mois passés.
Étape 5 — Édition de la balance générale et revue par le chef de mission.
Étape 6 — Validation et archivage de la balance clôturée, transmission au client si applicable.

4. DÉLAI CIBLE
Clôture disponible au plus tard le 10 du mois suivant, sauf dossier à complexité particulière signalé au préalable.

5. CONTRÔLES CLÉS
- Aucun compte d'attente (471, 472...) non soldé en fin de clôture.
- Rapprochement bancaire à 100% des relevés reçus.
- Écarts de lettrage documentés et justifiés.

6. DOCUMENTS DE RÉFÉRENCE
Plan comptable SYSCOHADA révisé, manuel de procédures comptables du cabinet, calendrier fiscal du pays du client.`,
  },
  {
    title: "Procédure de revue qualité mission",
    category: "Contrôle Qualité",
    content: `1. OBJET
Cette procédure organise le contrôle qualité des missions du cabinet (tenue comptable, audit, conseil) préalablement à la remise de tout livrable au client, conformément aux exigences déontologiques de la profession d'expert-comptable en zone OHADA.

2. ACTEURS CONCERNÉS
- Collaborateur en charge de la mission (auto-contrôle)
- Chef de mission (revue de premier niveau)
- Associé / Expert-comptable superviseur (revue finale et signature)

3. NIVEAUX DE REVUE
Niveau 1 — Auto-contrôle par le préparateur : cohérence des chiffres, complétude des pièces, respect du programme de travail.
Niveau 2 — Revue du chef de mission : vérification des points clés, des zones de risque identifiées et des conclusions.
Niveau 3 — Revue finale de l'associé/expert-comptable : validation des jugements professionnels significatifs et du rapport avant émission.

4. POINTS DE CONTRÔLE STANDARD
- Le dossier de travail est complet et référencé.
- Les anomalies détectées ont été documentées et traitées (correction ou réserve).
- Les conclusions du dossier sont cohérentes avec les éléments probants rassemblés.
- Le rapport/livrable respecte le modèle et la charte du cabinet.

5. TRAÇABILITÉ
Chaque niveau de revue est daté et signé (physiquement ou électroniquement) dans le dossier. Toute observation non résolue avant émission du livrable doit être formellement validée par l'associé responsable.

6. RÉFÉRENCES
Code de déontologie de la profession comptable, normes professionnelles applicables, manuel qualité interne du cabinet.`,
  },
  {
    title: "Procédure d'onboarding client",
    category: "Clients",
    content: `1. OBJET
Cette procédure encadre l'accueil et l'intégration d'un nouveau client au sein du cabinet, de la signature de la lettre de mission à l'ouverture effective du dossier.

2. ÉTAPES

Étape 1 — Prise de connaissance et acceptation
Entretien préalable, évaluation des risques (KYC, conflits d'intérêts, compétence du cabinet sur le secteur), décision d'acceptation de la mission.

Étape 2 — Formalisation
Rédaction et signature de la lettre de mission précisant l'étendue des travaux, les honoraires, les délais et les obligations réciproques.

Étape 3 — Collecte des informations d'identification
Statuts, RCCM, NINEA/IFU/NIF selon le pays, pièces d'identité des dirigeants, justificatifs de siège social.

Étape 4 — Ouverture du dossier
Création de la fiche client dans le système du cabinet, paramétrage du régime fiscal, désignation du collaborateur référent et du chef de mission.

Étape 5 — Reprise des données existantes
Récupération de la dernière balance et des déclarations fiscales en cours, identification des points d'attention (litiges, contrôles fiscaux en cours, retards de dépôt).

Étape 6 — Réunion de lancement
Présentation de l'équipe, calendrier des livrables, canaux de communication et portail client.

3. DÉLAI CIBLE
Dossier opérationnel sous 15 jours ouvrés à compter de la signature de la lettre de mission.

4. DOCUMENTS DE RÉFÉRENCE
Modèle de lettre de mission du cabinet, check-list KYC, procédure d'acceptation et de maintien des missions.`,
  },
];

export async function ensureProcedureSeed(createdById: string) {
  const count = await prisma.procedure.count();
  if (count > 0) return;

  for (const p of STARTER_PROCEDURES) {
    await prisma.procedure.create({
      data: { ...p, status: "PUBLIEE", version: 1, createdById },
    });
  }
}
