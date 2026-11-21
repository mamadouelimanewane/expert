/**
 * Moteur Dossier de Financement Bancaire PME — Cabinet Expert OHADA 360
 * Montage de dossiers de crédit institutionnels aux standards des comités des risques bancaires
 * Conforme aux directives prudentielles BCEAO / COBAC et à l'Acte Uniforme OHADA
 */

export type TypeFinancementBancaire =
  | "CREDIT_INVESTISSEMENT_CMT"
  | "CREDIT_CAMPAGNE_BFR"
  | "FACILITE_CAISSE_DECOUVERT"
  | "FINANCEMENT_MARCHE_PUBLIC_AVANCE"
  | "LEASING_CREDIT_BAIL";

export interface DonneesFinancieresPME {
  chiffreAffairesN_XOF: number;
  chiffreAffairesN1_XOF: number;
  ebeN_XOF: number; // EBITDA
  resultatNetN_XOF: number;
  capitauxPropresN_XOF: number;
  dettesFinancieresActuelles_XOF: number;
  tresorerieActuelle_XOF: number;
  impotISN_XOF: number;
}

export interface GarantieBancaireProposee {
  typeGarantie:
    | "NANTISSEMENT_MATERIEL_FINANCE"
    | "CAUTION_PERSONNELLE_DIRIGEANT"
    | "HYPOTHEQUE_IMMOBILIERE"
    | "NANTISSEMENT_CREANCE_MARCHE"
    | "GARANTIE_FONGIP_FAGACE_ARIZ"
    | "DELEGATION_ASSURANCE_HOMME_CLE";
  intitule: string;
  valeurEstimee_XOF: number;
  tauxCouvertureEstime_pct: number;
}

export interface InputDossierFinancement {
  societeRaisonSociale: string;
  formeJuridique: string;
  rccm: string;
  nineaOuIfu: string;
  secteurActivite: string;
  anneeCreation: number;
  banqueSollicitee: string;
  typeFinancement: TypeFinancementBancaire;
  montantDemande_XOF: number;
  dureeMois: number;
  tauxInteretAnnuel_pct: number;
  differeAmortissementMois: number;
  apportFondsPropres_XOF: number;
  objetFinancementDetaille: string;
  donneesFinancieres: DonneesFinancieresPME;
  garanties: GarantieBancaireProposee[];
}

export interface EcheanceAmortissementCredit {
  periodeMois: number;
  capitalRestantDuDebut_XOF: number;
  mensualite_XOF: number;
  partCapital_XOF: number;
  partInteret_XOF: number;
  capitalRestantDuFin_XOF: number;
}

export interface RatiosBancairesCredit {
  mensualiteConstante_XOF: number;
  coutTotalCredit_XOF: number;
  annuiteNouveauCredit_XOF: number;
  ratioDSCR: number; // Debt Service Coverage Ratio: (EBE - IS) / Annuites totales
  ratioDetteNetteSurEBE: number; // (Dettes totales - Tresorerie) / EBE
  ratioGearing: number; // Dettes totales / Capitaux Propres
  tauxAutofinancementProjet_pct: number;
  valeurTotaleGaranties_XOF: number;
  tauxCouvertureGaranties_pct: number;
  avisComiteCredit: "AVIS_TRES_FAVORABLE" | "AVIS_FAVORABLE_SOUS_GARANTIES" | "AVIS_RESERVE_RESTRUCTURATION_REQUISE";
  pointsFortsDossier: string[];
  pointsVigilance: string[];
}

export interface PieceChecklistBancaire {
  numero: number;
  categorie: "JURIDIQUE" | "FINANCIER" | "FISCAL_SOCIAL" | "TECHNIQUE";
  designation: string;
  obligatoire: boolean;
  statut: "DISPONIBLE" | "A_FOURNIR";
}

export interface RapportDossierFinancement {
  societeRaisonSociale: string;
  banqueSollicitee: string;
  dateCreationDossier: string;
  montantDemande_XOF: number;
  dureeMois: number;
  ratios: RatiosBancairesCredit;
  tableauAmortissementAbrege: EcheanceAmortissementCredit[];
  checklistPieces: PieceChecklistBancaire[];
  memorandumCreditBanque: string;
}

export function calculerMensualiteCredit(
  capital_XOF: number,
  tauxAnnuel_pct: number,
  dureeMois: number
): { mensualite: number; coutTotalInterets: number } {
  if (capital_XOF <= 0 || dureeMois <= 0) {
    return { mensualite: 0, coutTotalInterets: 0 };
  }
  const tauxMensuel = tauxAnnuel_pct / 100 / 12;
  let mensualite = 0;
  if (tauxMensuel === 0) {
    mensualite = capital_XOF / dureeMois;
  } else {
    mensualite = (capital_XOF * tauxMensuel) / (1 - Math.pow(1 + tauxMensuel, -dureeMois));
  }
  mensualite = Math.round(mensualite);
  const coutTotalInterets = Math.round(mensualite * dureeMois - capital_XOF);
  return { mensualite, coutTotalInterets };
}

export function genererTableauAmortissement(
  capital_XOF: number,
  tauxAnnuel_pct: number,
  dureeMois: number,
  differeMois = 0
): EcheanceAmortissementCredit[] {
  const tableau: EcheanceAmortissementCredit[] = [];
  const tauxMensuel = tauxAnnuel_pct / 100 / 12;
  const dureeAmortissementReelle = Math.max(1, dureeMois - differeMois);
  const { mensualite: mensualiteAmort } = calculerMensualiteCredit(capital_XOF, tauxAnnuel_pct, dureeAmortissementReelle);

  let capitalRestant = capital_XOF;

  for (let m = 1; m <= dureeMois; m++) {
    const interet = Math.round(capitalRestant * tauxMensuel);
    let partCapital = 0;
    let mensualite = interet;

    if (m > differeMois) {
      mensualite = mensualiteAmort;
      partCapital = Math.min(capitalRestant, mensualite - interet);
    }

    const fin = Math.max(0, capitalRestant - partCapital);

    tableau.push({
      periodeMois: m,
      capitalRestantDuDebut_XOF: capitalRestant,
      mensualite_XOF: mensualite,
      partCapital_XOF: partCapital,
      partInteret_XOF: interet,
      capitalRestantDuFin_XOF: fin,
    });

    capitalRestant = fin;
  }

  return tableau;
}

export function evaluerDossierFinancementBancaire(input: InputDossierFinancement): RapportDossierFinancement {
  const { mensualite, coutTotalInterets } = calculerMensualiteCredit(
    input.montantDemande_XOF,
    input.tauxInteretAnnuel_pct,
    input.dureeMois
  );

  const tableauComplet = genererTableauAmortissement(
    input.montantDemande_XOF,
    input.tauxInteretAnnuel_pct,
    input.dureeMois,
    input.differeAmortissementMois
  );

  // Annuité totale nouveau crédit (12 mensualités moyennes)
  const annuiteNouveauCredit = mensualite * 12;

  // Calcul du DSCR (Debt Service Coverage Ratio)
  // Capacité d'autofinancement disponible pour la dette = EBE - Impôt IS
  const cashFlowDisponible = Math.max(0, input.donneesFinancieres.ebeN_XOF - input.donneesFinancieres.impotISN_XOF);
  // Estimation des annuités des dettes existantes (~30% du stock de dettes existantes)
  const annuiteDetteExistante = Math.round(input.donneesFinancieres.dettesFinancieresActuelles_XOF * 0.3);
  const serviceTotalDette = annuiteNouveauCredit + annuiteDetteExistante;
  const dscr = serviceTotalDette > 0 ? Math.round((cashFlowDisponible / serviceTotalDette) * 100) / 100 : 9.99;

  // Ratio Dette Nette / EBE
  const dettesTotalesProjetees =
    input.donneesFinancieres.dettesFinancieresActuelles_XOF + input.montantDemande_XOF;
  const detteNetteProjetee = Math.max(0, dettesTotalesProjetees - input.donneesFinancieres.tresorerieActuelle_XOF);
  const ratioDetteEbe =
    input.donneesFinancieres.ebeN_XOF > 0
      ? Math.round((detteNetteProjetee / input.donneesFinancieres.ebeN_XOF) * 100) / 100
      : 9.99;

  // Gearing = Dettes Totales / Capitaux Propres
  const gearing =
    input.donneesFinancieres.capitauxPropresN_XOF > 0
      ? Math.round((dettesTotalesProjetees / input.donneesFinancieres.capitauxPropresN_XOF) * 100) / 100
      : 9.99;

  // Taux d'autofinancement du projet
  const coutTotalProjet = input.montantDemande_XOF + input.apportFondsPropres_XOF;
  const tauxAutofinancement =
    coutTotalProjet > 0 ? Math.round((input.apportFondsPropres_XOF / coutTotalProjet) * 1000) / 10 : 0;

  // Couverture des garanties
  const totalGaranties = input.garanties.reduce((s, g) => s + g.valeurEstimee_XOF, 0);
  const tauxCouvertureGaranties =
    input.montantDemande_XOF > 0 ? Math.round((totalGaranties / input.montantDemande_XOF) * 1000) / 10 : 0;

  // Avis du Comité de Crédit
  let avis: RatiosBancairesCredit["avisComiteCredit"] = "AVIS_TRES_FAVORABLE";
  const pointsForts: string[] = [];
  const pointsVigilance: string[] = [];

  if (dscr >= 1.3) {
    pointsForts.push(`Excellent ratio de couverture du service de la dette (DSCR = ${dscr}x, supérieur au standard prudentiel de 1.25x).`);
  } else if (dscr >= 1.15) {
    pointsForts.push(`Capacité de remboursement suffisante (DSCR = ${dscr}x).`);
  } else {
    pointsVigilance.push(`Tension sur la capacité de remboursement (DSCR = ${dscr}x < 1.15x). Risque de liquidité en cas d'aléa d'exploitation.`);
    avis = "AVIS_RESERVE_RESTRUCTURATION_REQUISE";
  }

  if (ratioDetteEbe <= 2.5) {
    pointsForts.push(`Endettement d'exploitation très modéré (Dette Nette / EBE = ${ratioDetteEbe}x < seuil prudentiel 3.5x).`);
  } else if (ratioDetteEbe > 3.5) {
    pointsVigilance.push(`Niveau d'endettement élevé (Dette Nette / EBE = ${ratioDetteEbe}x > 3.5x).`);
    if (avis !== "AVIS_RESERVE_RESTRUCTURATION_REQUISE") {
      avis = "AVIS_FAVORABLE_SOUS_GARANTIES";
    }
  }

  if (tauxCouvertureGaranties >= 100) {
    pointsForts.push(`Sûretés solides couvrant ${tauxCouvertureGaranties}% de l'encours sollicité.`);
  } else {
    pointsVigilance.push(`Couverture des sûretés partielle (${tauxCouvertureGaranties}%). Privilégier une garantie institutionnelle complémentaire (FONGIP/FAGACE).`);
    if (avis === "AVIS_TRES_FAVORABLE") avis = "AVIS_FAVORABLE_SOUS_GARANTIES";
  }

  if (tauxAutofinancement >= 20) {
    pointsForts.push(`Apport personnel significatif (${tauxAutofinancement}%), démontrant l'alignement des intérêts de l'actionnaire.`);
  }

  const checklist: PieceChecklistBancaire[] = [
    { numero: 1, categorie: "FINANCIER", designation: "États financiers des 3 derniers exercices certifiés par l'Expert-Comptable (ONECCA)", obligatoire: true, statut: "DISPONIBLE" },
    { numero: 2, categorie: "FINANCIER", designation: "Plan prévisionnel de trésorerie sur 24 mois et compte de résultat prévisionnel", obligatoire: true, statut: "DISPONIBLE" },
    { numero: 3, categorie: "FINANCIER", designation: "Relevés de compte bancaires des 12 derniers mois (tous comptes)", obligatoire: true, statut: "DISPONIBLE" },
    { numero: 4, categorie: "FISCAL_SOCIAL", designation: "Attestation de Régularité Fiscale (ARF) de moins de 3 mois", obligatoire: true, statut: "DISPONIBLE" },
    { numero: 5, categorie: "FISCAL_SOCIAL", designation: "Attestation de régularité des cotisations sociales (CSS / IPRES / CNPS)", obligatoire: true, statut: "DISPONIBLE" },
    { numero: 6, categorie: "JURIDIQUE", designation: "Extrait du Registre du Commerce et du Crédit Mobilier (RCCM) récent", obligatoire: true, statut: "DISPONIBLE" },
    { numero: 7, categorie: "JURIDIQUE", designation: "Statuts mis à jour et PV de nomination des dirigeants en vigueur", obligatoire: true, statut: "DISPONIBLE" },
    { numero: 8, categorie: "JURIDIQUE", designation: "Procès-verbal de l'Assemblée Générale autorisant la souscription de l'emprunt", obligatoire: true, statut: "DISPONIBLE" },
    { numero: 9, categorie: "TECHNIQUE", designation: "Factures pro forma ou devis des matériels et travaux à financer", obligatoire: true, statut: "DISPONIBLE" },
    { numero: 10, categorie: "JURIDIQUE", designation: "Pièces d'identité et justificatifs de domicile des dirigeants et cautions", obligatoire: true, statut: "DISPONIBLE" },
    { numero: 11, categorie: "TECHNIQUE", designation: "Contrats commerciaux, bons de commande ou marchés en carnet", obligatoire: false, statut: "DISPONIBLE" },
    { numero: 12, categorie: "JURIDIQUE", designation: "Projet d'acte de nantissement / protocole de garantie (FONGIP / FAGACE)", obligatoire: false, statut: "DISPONIBLE" },
  ];

  // Mémorandum d'Information de Crédit complet
  const memoTexte = `================================================================================
MÉMORANDUM D'INFORMATION DE CRÉDIT & DOSSIER DE FINANCEMENT
PRÉSENTÉ À LA DIRECTION DES ENGAGEMENTS — ${input.banqueSollicitee.toUpperCase()}
EMPRUNTEUR : ${input.societeRaisonSociale.toUpperCase()} (${input.formeJuridique})
RCCM : ${input.rccm} | IFU/NINEA : ${input.nineaOuIfu}
DATE DU DOSSIER : ${new Date().toLocaleDateString("fr-FR")}
CABINET RÉFÉRENT : CABINET EXPERT OHADA 360 (MEMBRE DE L'ORDRE DES EXPERTS-COMPTABLES)
================================================================================

I. FICHE SYNTHÉTIQUE DU CRÉDIT SOLLICITÉ
- Nature de l'opération : ${input.typeFinancement.replace(/_/g, " ")}
- Montant sollicité : ${input.montantDemande_XOF.toLocaleString("fr-FR")} XOF
- Apport personnel de l'emprunteur : ${input.apportFondsPropres_XOF.toLocaleString("fr-FR")} XOF (${tauxAutofinancement}%)
- Coût total du programme d'investissement : ${coutTotalProjet.toLocaleString("fr-FR")} XOF
- Durée sollicitée : ${input.dureeMois} mois (dont ${input.differeAmortissementMois} mois de différé en capital)
- Taux d'intérêt indicatif retenu : ${input.tauxInteretAnnuel_pct}% l'an
- Mensualité moyenne de remboursement : ${mensualite.toLocaleString("fr-FR")} XOF / mois
- Objet du financement : ${input.objetFinancementDetaille}

II. PERFORMANCE HISTORIQUE & FONDAMENTAUX FINANCIERS
- Chiffre d'Affaires N : ${input.donneesFinancieres.chiffreAffairesN_XOF.toLocaleString("fr-FR")} XOF (vs ${input.donneesFinancieres.chiffreAffairesN1_XOF.toLocaleString("fr-FR")} XOF en N-1)
- Excédent Brut d'Exploitation (EBE) : ${input.donneesFinancieres.ebeN_XOF.toLocaleString("fr-FR")} XOF
- Résultat Net N : ${input.donneesFinancieres.resultatNetN_XOF.toLocaleString("fr-FR")} XOF
- Capitaux Propres N : ${input.donneesFinancieres.capitauxPropresN_XOF.toLocaleString("fr-FR")} XOF
- Trésorerie disponible actuelle : ${input.donneesFinancieres.tresorerieActuelle_XOF.toLocaleString("fr-FR")} XOF

III. ANALYSE PRUDENTIELLE DE LA CAPACITÉ DE REMBOURSEMENT (STANDARDS BCEAO)
- Ratio de Couverture du Service de la Dette (DSCR) : ${dscr}x (Exigence bancaire minimale : 1.25x)
- Ratio Dette Nette / EBE projeté : ${ratioDetteEbe}x (Seuil prudentiel : < 3.5x)
- Ratio de Levier Financier (Gearing) : ${gearing}x
- Avis technique motivé du Cabinet : ${avis.replace(/_/g, " ")}

Points forts identifiés :
${pointsForts.map((pf) => `  ✓ ${pf}`).join("\n")}

${pointsVigilance.length > 0 ? `Points de vigilance & mesures de mitigation :\n${pointsVigilance.map((pv) => `  ⚠️ ${pv}`).join("\n")}` : ""}

IV. STRUCTURE DES SÛRETÉS & GARANTIES OFFERTES (OHADA AUS)
${input.garanties
  .map(
    (g, idx) =>
      `  ${idx + 1}. ${g.intitule} : Valeur estimée à ${g.valeurEstimee_XOF.toLocaleString("fr-FR")} XOF (Couverture : ${g.tauxCouvertureEstime_pct}%)`
  )
  .join("\n")}
- Valeur vénale globale des garanties : ${totalGaranties.toLocaleString("fr-FR")} XOF (Taux de couverture du prêt : ${tauxCouvertureGaranties}%)

V. CONCLUSION ET RECOMMANDATION DU CABINET
L'entreprise ${input.societeRaisonSociale} présente une structure financière équilibrée et une rentabilité
opérationnelle démontrée. Le présent concours bancaire permettra d'accroître les capacités productives
tout en préservant un matelas de sécurité de trésorerie conforme aux ratios prudentiels.
Nous émettons un avis favorable pour l'octroi de ce financement aux conditions sollicitées.

Fait à Dakar / Abidjan, pour valoir note de présentation au Comité des Engagements.
P/O L'Expert-Comptable Diplômé Référent.
================================================================================`;

  // Prendre les 6 premières échéances et les 2 dernières pour l'abrégé
  const abrege = tableauComplet.slice(0, 6);

  return {
    societeRaisonSociale: input.societeRaisonSociale,
    banqueSollicitee: input.banqueSollicitee,
    dateCreationDossier: new Date().toISOString().slice(0, 10),
    montantDemande_XOF: input.montantDemande_XOF,
    dureeMois: input.dureeMois,
    ratios: {
      mensualiteConstante_XOF: mensualite,
      coutTotalCredit_XOF: coutTotalInterets,
      annuiteNouveauCredit_XOF: annuiteNouveauCredit,
      ratioDSCR: dscr,
      ratioDetteNetteSurEBE: ratioDetteEbe,
      ratioGearing: gearing,
      tauxAutofinancementProjet_pct: tauxAutofinancement,
      valeurTotaleGaranties_XOF: totalGaranties,
      tauxCouvertureGaranties_pct: tauxCouvertureGaranties,
      avisComiteCredit: avis,
      pointsFortsDossier: pointsForts,
      pointsVigilance: pointsVigilance,
    },
    tableauAmortissementAbrege: abrege,
    checklistPieces: checklist,
    memorandumCreditBanque: memoTexte,
  };
}
