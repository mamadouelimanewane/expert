/**
 * Moteur Smart Collateral : Gages Agricoles & Warrants de Tierce Détention
 * Suivi des stocks nantis, valorisation mark-to-market, Loan-to-Value (LTV) et mainlevées
 * Conforme à l'Acte Uniforme OHADA portant organisation des Sûretés (AUS Art. 92 à 117)
 */

export type SpeculationAgricole = "CACAO" | "ARACHIDE" | "COTON" | "ANACARDE" | "CAFE" | "SESAME";

export interface LotStockNanti {
  idLot: string;
  speculation: SpeculationAgricole;
  entrepotNom: string;
  localisation: string;
  quantite_tonnes: number;
  qualiteGrade: string;
  numeroRecepisseEntrepot: string;
  nomTiersDetenteur: string;
}

export interface InputGageAgricole {
  societeEmprunteur: string;
  banquePreteuse: string;
  exercice: number;
  creditBancaireTire_XOF: number;
  seuilLtvAlerte_pct: number; // Ex: 80% (marge de sécurité 20%)
  prixSpotTonne_XOF: number;
  lots: LotStockNanti[];
}

export interface AnalyseLotValuation {
  idLot: string;
  speculation: string;
  quantite_tonnes: number;
  valeurMarchande_XOF: number;
  partDuCollatéral_pct: number;
}

export interface RapportGageAgricole {
  societeEmprunteur: string;
  banquePreteuse: string;
  dateValuation: string;
  totalQuantite_tonnes: number;
  valeurTotaleStock_XOF: number;
  creditBancaire_XOF: number;
  ratioLTV_pct: number; // Loan-To-Value
  seuilLtvAlerte_pct: number;
  statutCouverture: "SURCOUVERTURE_CONFORTABLE" | "COUVERTURE_OPTIMALE" | "ALERTE_APPEL_DE_MARGE";
  montantAppelDeMarge_XOF: number; // Montant de cash ou stock additionnel à fournir si LTV > seuil
  lotsAnalyse: AnalyseLotValuation[];
  simulationMainlevee: {
    tonnesALiberer: number;
    valeurMarchandeLot_XOF: number;
    remboursementCreditRequis_XOF: number;
    nouveauLTV_pct: number;
  };
  certificatTierceDetentionTexte: string;
}

export function evaluerGageWarrantAgricole(
  input: InputGageAgricole,
  tonnesPourMainlevee = 50
): RapportGageAgricole {
  const totalTonnes = input.lots.reduce((acc, l) => acc + l.quantite_tonnes, 0);
  const valeurTotale = Math.round(totalTonnes * input.prixSpotTonne_XOF);

  const lotsAnalyse: AnalyseLotValuation[] = input.lots.map((l) => {
    const val = Math.round(l.quantite_tonnes * input.prixSpotTonne_XOF);
    const part = valeurTotale > 0 ? Math.round((val / valeurTotale) * 1000) / 10 : 0;
    return {
      idLot: l.idLot,
      speculation: l.speculation,
      quantite_tonnes: l.quantite_tonnes,
      valeurMarchande_XOF: val,
      partDuCollatéral_pct: part,
    };
  });

  const ratioLtv =
    valeurTotale > 0
      ? Math.round((input.creditBancaireTire_XOF / valeurTotale) * 1000) / 10
      : 100;

  let statut: RapportGageAgricole["statutCouverture"] = "COUVERTURE_OPTIMALE";
  let appelDeMarge = 0;

  if (ratioLtv > input.seuilLtvAlerte_pct) {
    statut = "ALERTE_APPEL_DE_MARGE";
    // Montant de crédit à rembourser pour ramener le LTV au seuil alerte
    const creditCible = (valeurTotale * input.seuilLtvAlerte_pct) / 100;
    appelDeMarge = Math.max(0, Math.round(input.creditBancaireTire_XOF - creditCible));
  } else if (ratioLtv <= 65) {
    statut = "SURCOUVERTURE_CONFORTABLE";
  }

  // Simulation d'une mainlevée partielle de tonnes pour export
  const tonnesReellesALiberer = Math.min(totalTonnes, tonnesPourMainlevee);
  const valeurLotLibere = Math.round(tonnesReellesALiberer * input.prixSpotTonne_XOF);
  // Remboursement requis pour garder au moins le même LTV
  const partLiberation = totalTonnes > 0 ? tonnesReellesALiberer / totalTonnes : 0;
  const remboursementRequis = Math.round(input.creditBancaireTire_XOF * partLiberation);

  const stockRestantApres = valeurTotale - valeurLotLibere;
  const creditRestantApres = input.creditBancaireTire_XOF - remboursementRequis;
  const nouveauLtv =
    stockRestantApres > 0
      ? Math.round((creditRestantApres / stockRestantApres) * 1000) / 10
      : 0;

  const numActe = `WARRANT-${input.lots[0]?.speculation || "AGRI"}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const certificatTexte = `================================================================================
ATTESTATION DE TIERCE DÉTENTION & CERTIFICAT DE NANTISSEMENT (WARRANT)
ACTE UNIFORME OHADA PORTANT ORGANISATION DES SÛRETÉS (ART. 92 À 117 AUS)
RÉFÉRENCE DE L'ACTE : ${numActe}
DATE D'ÉMISSION : ${new Date().toLocaleDateString("fr-FR")}
================================================================================

1. PARTIES CONTRACTANTES
- Débiteur Emprunteur : ${input.societeEmprunteur.toUpperCase()}
- Créancier Gagiste Bénéficiaire : ${input.banquePreteuse.toUpperCase()}
- Tiers Détenteur Agréé Dépositaire : ${input.lots[0]?.nomTiersDetenteur || "SOCIÉTÉ GÉNÉRALE DE SURVEILLANCE / ACE"}

2. ASSIETTE DU GAGE & VALORISATION DES STOCKS GAGÉS
- Spéculation nantie : ${input.lots.map((l) => l.speculation).join(", ")}
- Volume total sous contrôle effectif : ${totalTonnes.toLocaleString("fr-FR")} Tonnes
- Valeur vénale actuelle (Mark-to-Market) : ${valeurTotale.toLocaleString("fr-FR")} XOF
- Crédit bancaire garanti : ${input.creditBancaireTire_XOF.toLocaleString("fr-FR")} XOF
- Ratio de couverture (LTV) constaté : ${ratioLtv}% (Seuil de sécurité contractuel : ${input.seuilLtvAlerte_pct}%)

3. ENGAGEMENT DU TIERS DÉTENTEUR
Le tiers détenteur soussigné atteste détenir matériellement les marchandises décrites ci-dessus
dans ses magasins sous douane / entrepôts agréés et s'engage à ne délivrer aucun bon de sortie
sans l'accord exprès et la mainlevée formelle écrite de ${input.banquePreteuse}.
================================================================================`;

  return {
    societeEmprunteur: input.societeEmprunteur,
    banquePreteuse: input.banquePreteuse,
    dateValuation: new Date().toISOString().slice(0, 10),
    totalQuantite_tonnes: totalTonnes,
    valeurTotaleStock_XOF: valeurTotale,
    creditBancaire_XOF: input.creditBancaireTire_XOF,
    ratioLTV_pct: ratioLtv,
    seuilLtvAlerte_pct: input.seuilLtvAlerte_pct,
    statutCouverture: statut,
    montantAppelDeMarge_XOF: appelDeMarge,
    lotsAnalyse,
    simulationMainlevee: {
      tonnesALiberer: tonnesReellesALiberer,
      valeurMarchandeLot_XOF: valeurLotLibere,
      remboursementCreditRequis_XOF: remboursementRequis,
      nouveauLTV_pct: nouveauLtv,
    },
    certificatTierceDetentionTexte: certificatTexte,
  };
}
