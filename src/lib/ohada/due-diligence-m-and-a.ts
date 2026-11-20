// ─────────────────────────────────────────────────────────────────────────────
// Module Due Diligence Financière & M&A — Espace OHADA / UEMOA
// Quality of Earnings (QoE), EBITDA Normatif, Bridge Dette Nette & BFR Cible
// ─────────────────────────────────────────────────────────────────────────────

export type CategorieRetraitement =
  | "REMUNERATION_DIRIGEANT"     // Ajustement au niveau du marché
  | "CHARGE_PRODUIT_EXCEPTIONNEL" // Événement one-off non récurrent
  | "LITIGE_ET_PROVISION"        // Risque prud'homal, fiscal ou commercial
  | "LOYER_ET_FLUX_INTRAGROUPE"  // Normalisation des flux avec parties liées
  | "HONORAIRES_TRANSACTION"     // Frais de conseil/audit liés au deal
  | "EFFET_DE_CHANGE_EXCEPTIONNEL"; // Gain ou perte de change atypique

export interface RetraitementEbitda {
  id: string;
  libelle: string;
  categorie: CategorieRetraitement;
  montantImpactEbitda: number;   // Positif = réintégration (augmente l'EBITDA) ; Négatif = déduction
  justificationAuditeur: string;
}

export interface ElementDetteAssimilee {
  id: string;
  libelle: string;
  montant: number;               // FCFA
  typeElement: "PROVISION_LITIGE" | "ARRIERE_FISCAL_SOCIAL" | "INDEMNITE_RETRAITE" | "CAPEX_EN_RETARD" | "AUTRE";
  probabiliteDecaissement: number; // % (ex: 80%)
}

export interface DossierDueDiligence {
  nomCible: string;
  secteurActivite: string;
  chiffreAffairesHistorique: number;
  ebitdaComptableHistorique: number;
  retraitementsEbitda: RetraitementEbitda[];

  tresorerieActif: number;
  dettesFinancieresBrutes: number;
  elementsDetteAssimilee: ElementDetteAssimilee[];

  bfrReelCloture: number;
  bfrNormatifCible: number;      // BFR cible de référence (Peg)

  multipleEbitdaNegocie: number; // Multiple de valorisation (ex: 6.5x)
}

export interface ResultatDueDiligence {
  ebitdaComptable: number;
  totalAjustementsEbitda: number;
  ebitdaNormatifAjuste: number;
  margeEbitdaNormative: number;  // %

  detteFinanciereBrute: number;
  tresorerieDisponible: number;
  detteFinanciereNetteComptable: number;
  totalDettesAssimilees: number; // Debt-like items pondérés
  ajustementBfrSurPeg: number;   // Écart BFR réel vs BFR cible
  detteNetteAjusteeTotale: number;

  valeurEntrepriseEV: number;    // EV = EBITDA Normatif × Multiple
  valeurTitresEquityValue: number; // Equity Value = EV - Dette Nette Ajustée

  dealKillers: string[];
  recommandationsGarantieActifPassif: string[];
  rapportSyntheseExecutive: string;
}

export function calculerDueDiligence(dossier: DossierDueDiligence): ResultatDueDiligence {
  const dealKillers: string[] = [];
  const recsGAP: string[] = [];

  // 1. Calcul du Quality of Earnings (QoE) / EBITDA Normatif
  let totalAjustements = 0;
  for (const ret of dossier.retraitementsEbitda) {
    totalAjustements += ret.montantImpactEbitda;
  }

  const ebitdaNormatif = dossier.ebitdaComptableHistorique + totalAjustements;
  const margeEbitdaNormative =
    dossier.chiffreAffairesHistorique > 0
      ? Math.round((ebitdaNormatif / dossier.chiffreAffairesHistorique) * 1000) / 10
      : 0;

  // 2. Calcul du Bridge Dette Nette Ajustée
  const detteNetteComptable = dossier.dettesFinancieresBrutes - dossier.tresorerieActif;

  let totalDettesAssimilees = 0;
  for (const item of dossier.elementsDetteAssimilee) {
    const montantPondere = Math.round((item.montant * item.probabiliteDecaissement) / 100);
    totalDettesAssimilees += montantPondere;

    if (item.montant >= 50_000_000 && item.probabiliteDecaissement >= 70) {
      dealKillers.push(
        `Risque critique non comptabilisé : ${item.libelle} pour ${item.montant.toLocaleString("fr-FR")} FCFA (proba ${item.probabiliteDecaissement}%). Déduction obligatoire du prix.`
      );
    }
  }

  // Ajustement BFR vs Peg : si BFR réel < BFR Cible, le repreneur devra réinjecter du cash (dette-like)
  const ajustementBfr = dossier.bfrReelCloture - dossier.bfrNormatifCible;

  // Dette nette ajustée globale
  // Si ajustementBfr est négatif (manque de BFR), cela alourdit la dette nette ajustée (diminue l'Equity Value)
  const detteNetteAjusteeTotale = detteNetteComptable + totalDettesAssimilees - ajustementBfr;

  // 3. Valorisation : EV & Equity Value
  const ev = Math.round(ebitdaNormatif * dossier.multipleEbitdaNegocie);
  const equityValue = ev - detteNetteAjusteeTotale;

  // 4. Alertes & Recommandations pour le contrat SPA / GAP
  if (ebitdaNormatif <= 0) {
    dealKillers.push(
      "DANGER : L'EBITDA normatif après retraitements est nul ou négatif. Le modèle économique n'est pas viable sans restructuration lourde."
    );
  }

  recsGAP.push(
    "Clause de révision de prix sur la base des comptes de clôture audités contradictoirement à la date de réalisation (Closing Accounts)."
  );
  recsGAP.push(
    "Séquestre bancaire de garantie (Escrow Account) d'au moins 15% à 20% du prix d'acquisition pendant 24 à 36 mois."
  );
  recsGAP.push(
    "Garantie spécifique d'indemnisation euro pour euro sans franchise sur les passifs fiscaux, douaniers et sociaux antérieurs au closing."
  );

  const fmt = (n: number) => n.toLocaleString("fr-FR");
  const rapportSyntheseExecutive =
    `RAPPORT EXÉCUTIF DE FINANCIAL DUE DILIGENCE (M&A / PRIVATE EQUITY)\n` +
    `Cible : ${dossier.nomCible} (${dossier.secteurActivite})\n\n` +
    `1. QUALITY OF EARNINGS (QoE) :\n` +
    `- EBITDA comptable historique : ${fmt(dossier.ebitdaComptableHistorique)} FCFA\n` +
    `- Ajustements de normalisation : ${fmt(totalAjustements)} FCFA\n` +
    `- EBITDA NORMATIF RÉCURRENT : ${fmt(ebitdaNormatif)} FCFA (Marge : ${margeEbitdaNormative}%)\n\n` +
    `2. BRIDGE VALEUR D'ENTREPRISE ➔ EQUITY VALUE (Multiple retenu : ${dossier.multipleEbitdaNegocie}x) :\n` +
    `- Valeur d'Entreprise (Enterprise Value) : ${fmt(ev)} FCFA\n` +
    `- Moins Dette financière brute : -${fmt(dossier.dettesFinancieresBrutes)} FCFA\n` +
    `- Plus Trésorerie disponible : +${fmt(dossier.tresorerieActif)} FCFA\n` +
    `- Moins Dettes assimilées (Debt-like items) : -${fmt(totalDettesAssimilees)} FCFA\n` +
    `- Ajustement BFR vs Peg normatif : ${ajustementBfr >= 0 ? "+" : ""}${fmt(ajustementBfr)} FCFA\n` +
    `- VALEUR DES TITRES (EQUITY VALUE / PRIX DES ACTIONS) : ${fmt(equityValue)} FCFA\n\n` +
    `3. CONCLUSION AUDITEUR M&A :\n` +
    (dealKillers.length > 0
      ? `Points d'alerte majeurs (Deal Killers) : ${dealKillers.join(" | ")}`
      : `Aucun deal killer majeur. Transaction recommandée sous réserve de l'application de la GAP.`);

  return {
    ebitdaComptable: dossier.ebitdaComptableHistorique,
    totalAjustementsEbitda: totalAjustements,
    ebitdaNormatifAjuste: ebitdaNormatif,
    margeEbitdaNormative,
    detteFinanciereBrute: dossier.dettesFinancieresBrutes,
    tresorerieDisponible: dossier.tresorerieActif,
    detteFinanciereNetteComptable: detteNetteComptable,
    totalDettesAssimilees,
    ajustementBfrSurPeg: ajustementBfr,
    detteNetteAjusteeTotale,
    valeurEntrepriseEV: ev,
    valeurTitresEquityValue: equityValue,
    dealKillers,
    recommandationsGarantieActifPassif: recsGAP,
    rapportSyntheseExecutive,
  };
}
