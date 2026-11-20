// ─────────────────────────────────────────────────────────────────────────────
// Module de Mapping Automatique Balance Générale ➔ Liasse SYSCOHADA
// Ventilation intelligente des comptes 1 à 8 vers Bilan, Compte de Résultat & TFT
// Conforme au Plan Comptable Général OHADA Révisé (SYSCOHADA)
// ─────────────────────────────────────────────────────────────────────────────

export interface LigneBalanceSYSCOHADA {
  compte: string;       // Numéro de compte (ex: "101000", "411100", "601100")
  intitule: string;     // Libellé (ex: "Capital social", "Clients ordinaires")
  soldeDebiteur: number; // FCFA
  soldeCrediteur: number;// FCFA
}

export interface PosteLiasseMappe {
  codePoste: string;    // Ex: "CA", "AA", "BA", "TA", "RA"
  intitulePoste: string;
  sectionLiasse: "BILAN_ACTIF" | "BILAN_PASSIF" | "COMPTE_RESULTAT";
  montantBrut: number;
  amortissementsProvisions: number;
  montantNet: number;
  comptesAssocies: string[];
}

export interface AnomalieBalance {
  code: string;
  compte: string;
  severite: "AVERTISSEMENT" | "BLOQUANT";
  message: string;
}

export interface LiasseMappeeSYSCOHADA {
  balanceEquilibree: boolean;
  totalDebitsBalance: number;
  totalCreditsBalance: number;
  ecartBalance: number;

  postesBilanActif: PosteLiasseMappe[];
  postesBilanPassif: PosteLiasseMappe[];
  postesCompteResultat: PosteLiasseMappe[];

  totalActifNetLiasse: number;
  totalPassifLiasse: number;
  resultatNetLiasse: number;

  anomaliesImputation: AnomalieBalance[];
  tauxCouvertureComptes: number; // % des comptes mappés sans orphelins
}

export function mapperBalanceVersLiasse(
  lignes: LigneBalanceSYSCOHADA[]
): LiasseMappeeSYSCOHADA {
  let totalDebits = 0;
  let totalCredits = 0;
  const anomalies: AnomalieBalance[] = [];

  let actifImmobiliseBrut = 0;
  let amortissementsImmo = 0;

  let stocksBrut = 0;
  let provisionsStocks = 0;

  let creancesClientsBrut = 0;
  let provisionsClients = 0;

  let tresorerieActif = 0;
  let tresoreriePassif = 0;

  let capitauxPropres = 0;
  let dettesLMT = 0;
  let dettesExploitation = 0;
  let dettesFiscalesSociales = 0;

  let chiffreAffaires = 0;
  let autresProduitsExploitation = 0;
  let achatsConsommes = 0;
  let servicesExterieurs = 0;
  let impotsTaxes = 0;
  let chargesPersonnel = 0;
  let dotationsAmort = 0;
  let reprisesAmort = 0;
  let chargesFinancieres = 0;
  let produitsFinanciers = 0;
  let chargesHAO = 0;
  let produitsHAO = 0;
  let impotIS = 0;

  let nbComptesMappes = 0;

  for (const l of lignes) {
    const c = l.compte.trim();
    const deb = l.soldeDebiteur || 0;
    const cred = l.soldeCrediteur || 0;
    totalDebits += deb;
    totalCredits += cred;
    const solde = deb - cred; // Positif = débiteur, Négatif = créditeur

    // Détection caisse créditrice (Interdiction formelle SYSCOHADA)
    if (c.startsWith("53") && solde < 0) {
      anomalies.push({
        code: "CAISSE_CREDITRICE",
        compte: c,
        severite: "BLOQUANT",
        message: `Compte de caisse ${c} créditeur de ${Math.abs(solde).toLocaleString("fr-FR")} FCFA. Anomalie comptable majeure en SYSCOHADA.`,
      });
    }

    // Détection client créditeur anormal (doit être viré au compte 419)
    if (c.startsWith("411") && solde < 0 && Math.abs(solde) > 1_000_000) {
      anomalies.push({
        code: "CLIENT_CREDITEUR",
        compte: c,
        severite: "AVERTISSEMENT",
        message: `Compte client ${c} créditeur de ${Math.abs(solde).toLocaleString("fr-FR")} FCFA — à reclasser en 419 (Clients créditeurs / Avances reçues).`,
      });
    }

    // ─── CLASSE 1 : CAPITAUX PROPRES & DETTES FINANCIÈRES ───
    if (c.startsWith("10") || c.startsWith("11") || c.startsWith("12") || c.startsWith("14") || c.startsWith("15")) {
      capitauxPropres += cred - deb;
      nbComptesMappes++;
    } else if (c.startsWith("16") || c.startsWith("17")) {
      dettesLMT += cred - deb;
      nbComptesMappes++;
    }

    // ─── CLASSE 2 : IMMOBILISATIONS ───
    else if (c.startsWith("21") || c.startsWith("22") || c.startsWith("23") || c.startsWith("24") || c.startsWith("26") || c.startsWith("27")) {
      actifImmobiliseBrut += deb - cred;
      nbComptesMappes++;
    } else if (c.startsWith("28") || c.startsWith("29")) {
      amortissementsImmo += cred - deb;
      nbComptesMappes++;
    }

    // ─── CLASSE 3 : STOCKS ───
    else if (c.startsWith("31") || c.startsWith("32") || c.startsWith("33") || c.startsWith("36") || c.startsWith("37")) {
      stocksBrut += deb - cred;
      nbComptesMappes++;
    } else if (c.startsWith("39")) {
      provisionsStocks += cred - deb;
      nbComptesMappes++;
    }

    // ─── CLASSE 4 : TIERS ───
    else if (c.startsWith("41")) {
      if (c.startsWith("419")) {
        dettesExploitation += cred - deb;
      } else {
        creancesClientsBrut += deb - cred;
      }
      nbComptesMappes++;
    } else if (c.startsWith("49")) {
      provisionsClients += cred - deb;
      nbComptesMappes++;
    } else if (c.startsWith("40")) {
      dettesExploitation += cred - deb;
      nbComptesMappes++;
    } else if (c.startsWith("42") || c.startsWith("43") || c.startsWith("44")) {
      if (solde < 0) {
        dettesFiscalesSociales += cred - deb;
      } else {
        creancesClientsBrut += deb - cred;
      }
      nbComptesMappes++;
    } else if (c.startsWith("47")) {
      if (solde > 0) creancesClientsBrut += deb - cred;
      else dettesExploitation += cred - deb;
      nbComptesMappes++;
    }

    // ─── CLASSE 5 : TRÉSORERIE ───
    else if (c.startsWith("52") || c.startsWith("53") || c.startsWith("54") || c.startsWith("57") || c.startsWith("58")) {
      if (solde >= 0) tresorerieActif += solde;
      else tresoreriePassif += Math.abs(solde);
      nbComptesMappes++;
    } else if (c.startsWith("56")) {
      tresoreriePassif += cred - deb;
      nbComptesMappes++;
    }

    // ─── CLASSE 6 : CHARGES ───
    else if (c.startsWith("60")) {
      achatsConsommes += deb - cred;
      nbComptesMappes++;
    } else if (c.startsWith("61") || c.startsWith("62") || c.startsWith("63")) {
      servicesExterieurs += deb - cred;
      nbComptesMappes++;
    } else if (c.startsWith("64")) {
      impotsTaxes += deb - cred;
      nbComptesMappes++;
    } else if (c.startsWith("66")) {
      chargesPersonnel += deb - cred;
      nbComptesMappes++;
    } else if (c.startsWith("68")) {
      dotationsAmort += deb - cred;
      nbComptesMappes++;
    } else if (c.startsWith("67")) {
      chargesFinancieres += deb - cred;
      nbComptesMappes++;
    } else if (c.startsWith("65")) {
      servicesExterieurs += deb - cred;
      nbComptesMappes++;
    }

    // ─── CLASSE 7 : PRODUITS ───
    else if (c.startsWith("70")) {
      chiffreAffaires += cred - deb;
      nbComptesMappes++;
    } else if (c.startsWith("71") || c.startsWith("72") || c.startsWith("75")) {
      autresProduitsExploitation += cred - deb;
      nbComptesMappes++;
    } else if (c.startsWith("77")) {
      produitsFinanciers += cred - deb;
      nbComptesMappes++;
    } else if (c.startsWith("78")) {
      reprisesAmort += cred - deb;
      nbComptesMappes++;
    }

    // ─── CLASSE 8 : HAO & IS ───
    else if (c.startsWith("81") || c.startsWith("83") || c.startsWith("85")) {
      chargesHAO += deb - cred;
      nbComptesMappes++;
    } else if (c.startsWith("82") || c.startsWith("84") || c.startsWith("86")) {
      produitsHAO += cred - deb;
      nbComptesMappes++;
    } else if (c.startsWith("89")) {
      impotIS += deb - cred;
      nbComptesMappes++;
    }
  }

  // Calcul du résultat net du Compte de Résultat
  const totalProduits = chiffreAffaires + autresProduitsExploitation + produitsFinanciers + reprisesAmort + produitsHAO;
  const totalCharges = achatsConsommes + servicesExterieurs + impotsTaxes + chargesPersonnel + dotationsAmort + chargesFinancieres + chargesHAO + impotIS;
  const resultatNet = totalProduits - totalCharges;

  // Postes Bilan Actif
  const postesActif: PosteLiasseMappe[] = [
    {
      codePoste: "AZ",
      intitulePoste: "Total Actif Immobilisé",
      sectionLiasse: "BILAN_ACTIF",
      montantBrut: actifImmobiliseBrut,
      amortissementsProvisions: amortissementsImmo,
      montantNet: actifImmobiliseBrut - amortissementsImmo,
      comptesAssocies: ["21", "22", "23", "24", "28", "29"],
    },
    {
      codePoste: "BK",
      intitulePoste: "Total Actif Circulant (Stocks & Créances)",
      sectionLiasse: "BILAN_ACTIF",
      montantBrut: stocksBrut + creancesClientsBrut,
      amortissementsProvisions: provisionsStocks + provisionsClients,
      montantNet: (stocksBrut - provisionsStocks) + (creancesClientsBrut - provisionsClients),
      comptesAssocies: ["31-37", "41", "39", "49"],
    },
    {
      codePoste: "BQ",
      intitulePoste: "Trésorerie Actif (Disponibilités)",
      sectionLiasse: "BILAN_ACTIF",
      montantBrut: tresorerieActif,
      amortissementsProvisions: 0,
      montantNet: tresorerieActif,
      comptesAssocies: ["52", "53", "54"],
    },
  ];

  const totalActifNet = postesActif.reduce((s, p) => s + p.montantNet, 0);

  // Postes Bilan Passif
  const postesPassif: PosteLiasseMappe[] = [
    {
      codePoste: "CP",
      intitulePoste: "Capitaux Propres & Ressources Durables",
      sectionLiasse: "BILAN_PASSIF",
      montantBrut: capitauxPropres,
      amortissementsProvisions: 0,
      montantNet: capitauxPropres + resultatNet,
      comptesAssocies: ["10", "11", "12", "13", "14"],
    },
    {
      codePoste: "DF",
      intitulePoste: "Dettes Financières LMT",
      sectionLiasse: "BILAN_PASSIF",
      montantBrut: dettesLMT,
      amortissementsProvisions: 0,
      montantNet: dettesLMT,
      comptesAssocies: ["16", "17"],
    },
    {
      codePoste: "DP",
      intitulePoste: "Dettes Circulantes (Fournisseurs, Fisc, Social)",
      sectionLiasse: "BILAN_PASSIF",
      montantBrut: dettesExploitation + dettesFiscalesSociales,
      amortissementsProvisions: 0,
      montantNet: dettesExploitation + dettesFiscalesSociales,
      comptesAssocies: ["40", "42", "43", "44"],
    },
    {
      codePoste: "DT",
      intitulePoste: "Trésorerie Passif (Découverts & Crédits)",
      sectionLiasse: "BILAN_PASSIF",
      montantBrut: tresoreriePassif,
      amortissementsProvisions: 0,
      montantNet: tresoreriePassif,
      comptesAssocies: ["56"],
    },
  ];

  const totalPassif = postesPassif.reduce((s, p) => s + p.montantNet, 0);

  // Postes Compte de Résultat
  const postesCR: PosteLiasseMappe[] = [
    {
      codePoste: "TA",
      intitulePoste: "Chiffre d'Affaires HT",
      sectionLiasse: "COMPTE_RESULTAT",
      montantBrut: chiffreAffaires,
      amortissementsProvisions: 0,
      montantNet: chiffreAffaires,
      comptesAssocies: ["70"],
    },
    {
      codePoste: "RA",
      intitulePoste: "Achats Consommés",
      sectionLiasse: "COMPTE_RESULTAT",
      montantBrut: achatsConsommes,
      amortissementsProvisions: 0,
      montantNet: achatsConsommes,
      comptesAssocies: ["60"],
    },
    {
      codePoste: "RF",
      intitulePoste: "Charges de Personnel",
      sectionLiasse: "COMPTE_RESULTAT",
      montantBrut: chargesPersonnel,
      amortissementsProvisions: 0,
      montantNet: chargesPersonnel,
      comptesAssocies: ["66"],
    },
    {
      codePoste: "RQ",
      intitulePoste: "Impôt sur le Résultat (IS)",
      sectionLiasse: "COMPTE_RESULTAT",
      montantBrut: impotIS,
      amortissementsProvisions: 0,
      montantNet: impotIS,
      comptesAssocies: ["89"],
    },
    {
      codePoste: "XZ",
      intitulePoste: "RÉSULTAT NET DE L'EXERCICE",
      sectionLiasse: "COMPTE_RESULTAT",
      montantBrut: resultatNet,
      amortissementsProvisions: 0,
      montantNet: resultatNet,
      comptesAssocies: ["13"],
    },
  ];

  const ecartBalance = Math.abs(totalDebits - totalCredits);
  const balanceEquilibree = ecartBalance === 0;
  const tauxCouverture = lignes.length > 0 ? Math.round((nbComptesMappes / lignes.length) * 100) : 100;

  return {
    balanceEquilibree,
    totalDebitsBalance: totalDebits,
    totalCreditsBalance: totalCredits,
    ecartBalance,
    postesBilanActif: postesActif,
    postesBilanPassif: postesPassif,
    postesCompteResultat: postesCR,
    totalActifNetLiasse: totalActifNet,
    totalPassifLiasse: totalPassif,
    resultatNetLiasse: resultatNet,
    anomaliesImputation: anomalies,
    tauxCouvertureComptes: tauxCouverture,
  };
}
