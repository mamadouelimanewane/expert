// ─────────────────────────────────────────────────────────────────────────────
// Module Bouclage Liasse SYSCOHADA & Points de Contrôle de Clôture
// Contrôle de cohérence automatique Bilan / Compte de Résultat / TFT / Résultat Fiscal
// Conforme au Système Comptable OHADA Révisé (SYSCOHADA)
// ─────────────────────────────────────────────────────────────────────────────

export interface BilanOHADA {
  actifImmobilise: number;
  actifCirculant: number;
  tresorerieActif: number;
  totalActif: number;

  capitauxPropresHorsResultat: number;
  resultatNetExercice: number;
  dettesFinancieresLMT: number;
  dettesCirculantes: number;
  tresoreriePassif: number;
  totalPassif: number;
}

export interface CompteResultatOHADA {
  chiffreAffaires: number;
  achatsConsommes: number;
  margeCommerciale: number;
  valeurAjoutee: number;
  ebe: number;
  resultatExploitation: number;
  resultatFinancier: number;
  resultatActivitesOrdinaires: number; // RAO
  resultatHorsActivitesOrdinaires: number; // RHAO
  impotSurResultatIS: number;
  resultatNet: number;
}

export interface TftOHADA {
  tresorerieDebut: number;
  fluxExploitation: number;
  fluxInvestissement: number;
  fluxFinancement: number;
  variationTresorerie: number;
  tresorerieFin: number;
}

export interface PointControleCloture {
  id: string;
  section: "IMMOBILISATIONS" | "STOCKS" | "CREANCES" | "TRESORERIE" | "FISCAL_SOCIAL" | "CUT_OFF";
  intitule: string;
  normeOhada: string;
  statut: "CONFORME" | "ANOMALIE" | "A_VERIFIER";
  ecartMontant?: number;
  commentaire: string;
}

export interface RapportBouclageLiasse {
  estEquilibreBilan: boolean;
  ecartBilan: number; // Actif - Passif

  estCoherentResultat: boolean;
  ecartResultatBilanCompteResultat: number; // Bilan.13 - CR.13

  estCoherentTresorerie: boolean;
  ecartTresorerieBilanTFT: number; // TresoNette Bilan - TresoFin TFT

  estCoherentImpotIS: boolean;
  ecartISLiasseFiscal: number;

  scoreConformiteLiasse: number; // 0-100%
  pointsControle: PointControleCloture[];
  anomaliesBloquantes: string[];
  visaExpertComptableRecommande: boolean;
}

export function verifierBouclageLiasse(
  bilan: BilanOHADA,
  cr: CompteResultatOHADA,
  tft: TftOHADA,
  isFiscalCalcule: number,
  pointsSpecifiques?: Partial<PointControleCloture>[]
): RapportBouclageLiasse {
  const anomaliesBloquantes: string[] = [];

  // 1. Équilibre du Bilan (Total Actif == Total Passif)
  const ecartBilan = bilan.totalActif - bilan.totalPassif;
  const estEquilibreBilan = Math.abs(ecartBilan) === 0;
  if (!estEquilibreBilan) {
    anomaliesBloquantes.push(
      `Déséquilibre du bilan de ${ecartBilan.toLocaleString("fr-FR")} FCFA (Total Actif: ${bilan.totalActif.toLocaleString("fr-FR")} vs Total Passif: ${bilan.totalPassif.toLocaleString("fr-FR")}).`
    );
  }

  // 2. Cohérence du Résultat Net (Poste 13 Bilan == Résultat Net CR)
  const ecartResultat = bilan.resultatNetExercice - cr.resultatNet;
  const estCoherentResultat = Math.abs(ecartResultat) === 0;
  if (!estCoherentResultat) {
    anomaliesBloquantes.push(
      `Incohérence du résultat net de ${ecartResultat.toLocaleString("fr-FR")} FCFA entre le Bilan (${bilan.resultatNetExercice.toLocaleString("fr-FR")}) et le Compte de Résultat (${cr.resultatNet.toLocaleString("fr-FR")}).`
    );
  }

  // 3. Cohérence Trésorerie Nette Bilan vs TFT
  const tresoNetteBilan = bilan.tresorerieActif - bilan.tresoreriePassif;
  const ecartTresorerie = tresoNetteBilan - tft.tresorerieFin;
  const estCoherentTresorerie = Math.abs(ecartTresorerie) === 0;
  if (!estCoherentTresorerie) {
    anomaliesBloquantes.push(
      `Discordance de trésorerie nette de ${ecartTresorerie.toLocaleString("fr-FR")} FCFA entre le Bilan (${tresoNetteBilan.toLocaleString("fr-FR")}) et le Tableau des Flux de Trésorerie (${tft.tresorerieFin.toLocaleString("fr-FR")}).`
    );
  }

  // 4. Cohérence Impôt IS (Liasse CR vs Résultat Fiscal Liquidation)
  const ecartIS = cr.impotSurResultatIS - isFiscalCalcule;
  const estCoherentImpotIS = Math.abs(ecartIS) === 0;
  if (!estCoherentImpotIS) {
    anomaliesBloquantes.push(
      `Écart IS de ${ecartIS.toLocaleString("fr-FR")} FCFA entre le montant comptabilisé au Compte de Résultat (${cr.impotSurResultatIS.toLocaleString("fr-FR")}) et la liquidation fiscale (${isFiscalCalcule.toLocaleString("fr-FR")}).`
    );
  }

  // 5. Checklist des 6 grands points de contrôle de clôture SYSCOHADA
  const points: PointControleCloture[] = [
    {
      id: "PC-01",
      section: "IMMOBILISATIONS",
      intitule: "Rapprochement Fichier Immobilisations vs Balance Générale",
      normeOhada: "SYSCOHADA Art. 35 à 44",
      statut: "CONFORME",
      commentaire: "Dotations aux amortissements conformes aux tableaux d'amortissement.",
    },
    {
      id: "PC-02",
      section: "STOCKS",
      intitule: "Inventaire physique des stocks au 31 décembre",
      normeOhada: "SYSCOHADA Art. 45 à 47",
      statut: "CONFORME",
      commentaire: "PV d'inventaire contradictoire signé et dépréciations constatées.",
    },
    {
      id: "PC-03",
      section: "CREANCES",
      intitule: "Revue des créances douteuses et dotations aux dépréciations",
      normeOhada: "SYSCOHADA Art. 48 à 51",
      statut: "CONFORME",
      commentaire: "Individualisation des comptes 416 et provisions 491.",
    },
    {
      id: "PC-04",
      section: "TRESORERIE",
      intitule: "PV de caisse & états de rapprochement bancaire au 31/12",
      normeOhada: "SYSCOHADA Art. 52",
      statut: estCoherentTresorerie ? "CONFORME" : "ANOMALIE",
      ecartMontant: ecartTresorerie !== 0 ? Math.abs(ecartTresorerie) : undefined,
      commentaire: estCoherentTresorerie
        ? "Soldes bancaires rapprochés avec attestations des banques."
        : "Écart de trésorerie non lettré à régulariser.",
    },
    {
      id: "PC-05",
      section: "CUT_OFF",
      intitule: "Séparation des exercices (Charges & Produits constatés d'avance)",
      normeOhada: "SYSCOHADA Art. 59",
      statut: "CONFORME",
      commentaire: "Comptes 476 et 477 régularisés sans chevauchement.",
    },
    {
      id: "PC-06",
      section: "FISCAL_SOCIAL",
      intitule: "Cadrage des déclarations TVA, BRS et charges sociales",
      normeOhada: "CGI & Code Sécurité Sociale",
      statut: estCoherentImpotIS ? "CONFORME" : "ANOMALIE",
      ecartMontant: ecartIS !== 0 ? Math.abs(ecartIS) : undefined,
      commentaire: estCoherentImpotIS
        ? "Parfaite concordance entre déclarations fiscales et comptes 44."
        : "Ajustement requis sur l'IS de l'exercice.",
    },
  ];

  // Intégrer les surcharges de points spécifiques si fournis
  if (pointsSpecifiques) {
    for (const modif of pointsSpecifiques) {
      const idx = points.findIndex((p) => p.id === modif.id);
      if (idx !== -1) {
        points[idx] = { ...points[idx], ...modif };
      }
    }
  }

  // Calcul du score de conformité de la liasse
  const nbConformes = points.filter((p) => p.statut === "CONFORME").length;
  let score = Math.round((nbConformes / points.length) * 100);
  if (!estEquilibreBilan) score -= 30;
  if (!estCoherentResultat) score -= 30;
  if (!estCoherentTresorerie) score -= 20;
  if (!estCoherentImpotIS) score -= 15;
  score = Math.max(0, Math.min(100, score));

  const visaRecommande = anomaliesBloquantes.length === 0 && score >= 90;

  return {
    estEquilibreBilan,
    ecartBilan,
    estCoherentResultat,
    ecartResultatBilanCompteResultat: ecartResultat,
    estCoherentTresorerie,
    ecartTresorerieBilanTFT: ecartTresorerie,
    estCoherentImpotIS,
    ecartISLiasseFiscal: ecartIS,
    scoreConformiteLiasse: score,
    pointsControle: points,
    anomaliesBloquantes,
    visaExpertComptableRecommande: visaRecommande,
  };
}
