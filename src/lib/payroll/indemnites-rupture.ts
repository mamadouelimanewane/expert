// ─────────────────────────────────────────────────────────────────────────────
// Calculateur d'Indemnités de Rupture de Contrat & Solde de Tout Compte (CCNI / OHADA)
// Conformité Code du Travail (Sénégal L.51+ / Côte d'Ivoire art. 16.7+) & CCNI
// ─────────────────────────────────────────────────────────────────────────────

import type { PaysFiscal } from "@/lib/tax-simulator";

export type MotifRupture = "LICENCIEMENT_MOTIF_PERSONNEL" | "LICENCIEMENT_ECONOMIQUE" | "DEMISSION" | "DEPART_RETRAITE" | "RUPTURE_CONVENTIONNELLE";
export type StatutSalarie = "OUVRIER_EMPLOYE" | "AGENT_MAITRISE" | "CADRE_DIRIGEANT";

export interface DonneesRuptureContrat {
  pays: PaysFiscal;
  nomSalarie: string;
  matricule?: string;
  statut: StatutSalarie;
  dateEmbauche: string; // YYYY-MM-DD
  dateFinContrat: string; // YYYY-MM-DD
  motif: MotifRupture;
  salaireMoyen12DerniersMois: number; // Salaire brut moyen de référence
  dernierSalaireBrut: number;
  joursCongesRestants: number;
  preavisEffectue: boolean; // Si false, préavis payé
  moisPreavisApplicable?: number; // 1, 2 ou 3 mois selon statut
  chargesSalarialesTaux?: number; // ex: 10%
}

export interface TrancheIndemnite {
  tranche: string;
  anneesDansTranche: number;
  tauxPourcentage: number;
  montantTranche: number;
}

export interface SoldeDeToutCompteDetail {
  ancienneteAnnees: number;
  ancienneteMois: number;
  ancienneteTotaleDecimale: number;

  salaireReferenceBrut: number;

  // 1. Indemnité de licenciement / départ
  indemniteDepart: number;
  detailTranches: TrancheIndemnite[];
  partExonereeFiscale: number;
  partTaxableFiscale: number;

  // 2. Indemnité de préavis
  indemnitePreavis: number;
  dureePreavisMois: number;

  // 3. Indemnité de congés payés
  indemniteCongesPayes: number;

  // 4. Dernier salaire proratisé si applicable
  salaireFinMois: number;

  // Totaux
  totalBrutRupture: number;
  retenuesEstimees: number;
  netAPayerSolde: number;

  textesLegaux: string[];
  recuPourSoldeTexte: string;
}

/**
 * Calcule l'ancienneté précise entre deux dates.
 */
export function calculerAnciennete(dateDebutStr: string, dateFinStr: string) {
  const d1 = new Date(dateDebutStr);
  const d2 = new Date(dateFinStr);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime()) || d2 < d1) {
    throw new Error("Dates d'embauche et de fin de contrat invalides.");
  }

  let annees = d2.getFullYear() - d1.getFullYear();
  let mois = d2.getMonth() - d1.getMonth();
  let jours = d2.getDate() - d1.getDate();

  if (jours < 0) {
    mois--;
  }
  if (mois < 0) {
    annees--;
    mois += 12;
  }

  const ancienneteTotaleDecimale = Math.round((annees + mois / 12) * 100) / 100;
  return { annees, mois, ancienneteTotaleDecimale };
}

/**
 * Calcule les indemnités de rupture et le solde de tout compte.
 */
export function calculerIndemnitesRupture(donnees: DonneesRuptureContrat): SoldeDeToutCompteDetail {
  const { annees, mois, ancienneteTotaleDecimale } = calculerAnciennete(donnees.dateEmbauche, donnees.dateFinContrat);
  const salRef = donnees.salaireMoyen12DerniersMois;

  // Barème CCNI classique (Sénégal & Côte d'Ivoire & zone OHADA) :
  // De 1 à 5 ans : 25% (Sénégal) ou 30% (Côte d'Ivoire) du salaire de référence par an
  // De 6 à 10 ans : 30% ou 35%
  // Au-delà de 10 ans : 40%
  const bareme =
    donnees.pays === "CI"
      ? [
          { nom: "1ère à 5ème année", min: 0, max: 5, taux: 30 },
          { nom: "6ème à 10ème année", min: 5, max: 10, taux: 35 },
          { nom: "Au-delà de 10 ans", min: 10, max: 999, taux: 40 },
        ]
      : [
          { nom: "1ère à 5ème année", min: 0, max: 5, taux: 25 },
          { nom: "6ème à 10ème année", min: 5, max: 10, taux: 30 },
          { nom: "Au-delà de 10 ans", min: 10, max: 999, taux: 40 },
        ];

  let indemniteDepart = 0;
  const detailTranches: TrancheIndemnite[] = [];

  // L'indemnité de licenciement est due si ancienneté >= 1 an (ou selon convention) et pas de démission / faute lourde
  const ouvreDroitIndemniteLicenciement =
    ancienneteTotaleDecimale >= 1 &&
    donnees.motif !== "DEMISSION";

  if (ouvreDroitIndemniteLicenciement) {
    let resteAnciennete = ancienneteTotaleDecimale;

    for (const palier of bareme) {
      if (resteAnciennete <= 0) break;
      const capacitePalier = palier.max - palier.min;
      const anneesDansCePalier = Math.min(resteAnciennete, capacitePalier);

      const montantTranche = Math.round(salRef * (palier.taux / 100) * anneesDansCePalier);
      indemniteDepart += montantTranche;

      detailTranches.push({
        tranche: palier.nom,
        anneesDansTranche: Math.round(anneesDansCePalier * 100) / 100,
        tauxPourcentage: palier.taux,
        montantTranche,
      });

      resteAnciennete -= anneesDansCePalier;
    }
  }

  // Majorations pour licenciement économique (ex: +20% à 50% selon accord)
  if (donnees.motif === "LICENCIEMENT_ECONOMIQUE") {
    indemniteDepart = Math.round(indemniteDepart * 1.2);
  }

  // Durée du préavis selon statut :
  // Ouvrier : 1 mois, Agent de maîtrise : 2 mois, Cadre : 3 mois
  const dureePreavisMois =
    donnees.moisPreavisApplicable ??
    (donnees.statut === "CADRE_DIRIGEANT" ? 3 : donnees.statut === "AGENT_MAITRISE" ? 2 : 1);

  const indemnitePreavis = !donnees.preavisEffectue ? Math.round(donnees.dernierSalaireBrut * dureePreavisMois) : 0;

  // Congés payés : (Salaire / 30) * jours
  const indemniteCongesPayes = Math.round((donnees.dernierSalaireBrut / 30) * donnees.joursCongesRestants);

  // Salaire fin de mois
  const salaireFinMois = donnees.dernierSalaireBrut;

  const totalBrutRupture = indemniteDepart + indemnitePreavis + indemniteCongesPayes + salaireFinMois;

  // Régime fiscal : L'indemnité légale de licenciement est exonérée d'IR/VRS
  const partExonereeFiscale = indemniteDepart;
  const partTaxableFiscale = totalBrutRupture - partExonereeFiscale;

  // Retenues salariales estimées sur les parties taxables (congés, préavis, salaire)
  const tauxCharges = donnees.chargesSalarialesTaux ?? 0.12;
  const retenuesEstimees = Math.round(partTaxableFiscale * tauxCharges);
  const netAPayerSolde = totalBrutRupture - retenuesEstimees;

  const f = (n: number) => n.toLocaleString("fr-FR") + " F CFA";

  const recuPourSoldeTexte = `REÇU POUR SOLDE DE TOUT COMPTE
(Articles du Code du Travail et CCNI)

Je soussigné(e), ${donnees.nomSalarie}${donnees.matricule ? ` (Matricule : ${donnees.matricule})` : ""},
Reconnais avoir reçu ce jour de mon employeur, la somme nette de :
${f(netAPayerSolde)} (${netAPayerSolde} FCFA)

En règlement définitif des éléments suivants :
- Indemnité légale de licenciement / rupture : ${f(indemniteDepart)}
- Indemnité compensatrice de préavis (${dureePreavisMois} mois) : ${f(indemnitePreavis)}
- Indemnité compensatrice de congés payés (${donnees.joursCongesRestants} jours) : ${f(indemniteCongesPayes)}
- Salaire du dernier mois / prorata : ${f(salaireFinMois)}
- Déduction cotisations sociales et retenues fiscales : -${f(retenuesEstimees)}

Fait en double exemplaire, à _________________, le ${donnees.dateFinContrat}
Mention manuscrite obligatoire : « Pour solde de tout compte sous réserve des droits reconnus par la loi »

Signature du Salarié                                    Pour l'Employeur`;

  return {
    ancienneteAnnees: annees,
    ancienneteMois: mois,
    ancienneteTotaleDecimale,
    salaireReferenceBrut: salRef,
    indemniteDepart,
    detailTranches,
    partExonereeFiscale,
    partTaxableFiscale,
    indemnitePreavis,
    dureePreavisMois,
    indemniteCongesPayes,
    salaireFinMois,
    totalBrutRupture,
    retenuesEstimees,
    netAPayerSolde,
    textesLegaux: [
      `Code du Travail ${donnees.pays === "CI" ? "Ivoirien (art. 16.7 et s.)" : "Sénégalais (art. L.51 et s.)"}`,
      "Convention Collective Nationale Interprofessionnelle (CCNI) - Barème d'indemnités de licenciement",
      "Régime fiscal des indemnités de rupture : exonération de l'indemnité légale de licenciement",
    ],
    recuPourSoldeTexte,
  };
}
