// ─────────────────────────────────────────────────────────────────────────────
// Module de Circularisation & Confirmations Directes des Tiers (ISA 505 / OHADA)
// Échantillonnage, génération des demandes, et rapprochement des réponses des tiers
// ─────────────────────────────────────────────────────────────────────────────

export type CategorieTiers = "FOURNISSEUR" | "CLIENT" | "BANQUE" | "AVOCAT";

export interface TiersACirculariser {
  id: string;
  categorie: CategorieTiers;
  numeroCompte: string; // ex: 401100 ou 411100 ou 521100
  denominationOuNom: string;
  adresse: string;
  emailContact?: string;
  soldeComptableLivre: number; // Solde au débit (client) ou au crédit (fournisseur)
  devise: string; // ex: "XOF"
}

export interface ReponseTiersConfirmation {
  tiersId: string;
  dateReponse: string;
  soldeConfirmeParTiers: number;
  montantReglementsEnCirculation: number;
  montantFacturesNonComptabilisees: number;
  commentairesTiers?: string;
}

export interface EcartRapprochementTiers {
  tiersId: string;
  denomination: string;
  categorie: CategorieTiers;
  soldeLivre: number;
  soldeConfirme: number;
  ecartBrut: number;
  justificationsRapprochement: {
    reglementsEnCours: number;
    facturesNonParvenuesOuEtablir: number;
    ecartInexplique: number;
  };
  statutAudit: "CONFORME" | "ECART_JUSTIFIE" | "ANOMALIE_NON_ELUCIDEE";
  risqueDetecte: string;
}

export interface CampagneCircularisationResult {
  exercice: number;
  dateCloture: string;
  nombreTiersSelectionnes: number;
  montantTotalSoldeAudite: number;
  tauxCouvertureMasse: number; // en %
  demandesGenerees: Array<{
    tiersId: string;
    lettreTexte: string;
  }>;
}

/**
 * Sélectionne les tiers à circulariser selon un seuil de signification ISA 320.
 */
export function selectionnerEchantillonCircularisation(
  tiersList: TiersACirculariser[],
  seuilSignification: number
): TiersACirculariser[] {
  // Sélectionne tous les tiers > seuil + échantillon représentatif
  return tiersList.filter(
    (t) => Math.abs(t.soldeComptableLivre) >= seuilSignification || Math.abs(t.soldeComptableLivre) === 0
  );
}

/**
 * Génère la lettre de demande de confirmation conforme à la norme ISA 505.
 */
export function genererLettreCircularisation(
  societeAuditee: { denomination: string; ville: string },
  tiers: TiersACirculariser,
  cabinetAudit: { denomination: string; adresse: string; email: string },
  dateCloture: string
): string {
  const f = (n: number) => n.toLocaleString("fr-FR").replace(/\u202F|\u00A0/g, " ") + " " + tiers.devise;

  return `DEMANDE DE CONFIRMATION DIRECTE DE SOLDE
(Norme Internationale d'Audit ISA 505 / Acte Uniforme OHADA - AUSCGIE)

À l'attention de la Direction Financière / Comptable
${tiers.denominationOuNom}
${tiers.adresse}

Fait à ${societeAuditee.ville}, le ${new Date().toISOString().split("T")[0]}

Madame, Monsieur,

Dans le cadre de la mission de Commissariat aux Comptes / d'Audit légal des états financiers de notre société ${societeAuditee.denomination.toUpperCase()} pour l'exercice clos le ${dateCloture}, nos Commissaires aux Comptes :

${cabinetAudit.denomination}
Adresse : ${cabinetAudit.adresse}
Courriel sécurisé : ${cabinetAudit.email}

procèdent à la vérification directe des soldes de nos comptes de tiers.

Selon nos écritures comptables arrêtées au ${dateCloture}, le solde de votre compte (${tiers.numeroCompte}) présentait une position de :
${f(tiers.soldeComptableLivre)} (${tiers.categorie === "FOURNISSEUR" ? "en notre faveur / solde créditeur" : "à votre charge / solde débiteur"}).

Nous vous remercions de bien vouloir leur confirmer directement, par retour de courriel ou courrier postal, la concordance de ce montant avec vos propres livres comptables, ou de leur indiquer le détail précis des éventuelles divergences (factures non parvenues, règlements en cours d'encaissement, litiges).

Cette demande a pour unique objet le contrôle régulier de nos comptes annuels et ne constitue en aucun cas une réclamation de paiement.

En vous remerciant pour votre diligence, nous vous prions d'agréer nos salutations distinguées.

Pour la Société ${societeAuditee.denomination}
La Direction Générale`;
}

/**
 * Rapproche la réponse reçue du tiers avec le grand livre du cabinet.
 */
export function rapprocherReponseTiers(
  tiers: TiersACirculariser,
  reponse: ReponseTiersConfirmation
): EcartRapprochementTiers {
  const ecartBrut = Math.round(tiers.soldeComptableLivre - reponse.soldeConfirmeParTiers);
  const totalJustifie = Math.round(reponse.montantReglementsEnCirculation + reponse.montantFacturesNonComptabilisees);
  const ecartInexplique = Math.abs(ecartBrut) - totalJustifie;

  let statutAudit: EcartRapprochementTiers["statutAudit"] = "CONFORME";
  let risqueDetecte = "Solde confirmé sans réserve.";

  if (Math.abs(ecartBrut) > 0) {
    if (Math.abs(ecartInexplique) <= 1000) {
      statutAudit = "ECART_JUSTIFIE";
      risqueDetecte = "Écart intégralement expliqué par les décalages de règlements ou factures en circulation.";
    } else {
      statutAudit = "ANOMALIE_NON_ELUCIDEE";
      risqueDetecte = `Écart inexpliqué de ${ecartInexplique.toLocaleString("fr-FR")} ${tiers.devise} : risque de passif non enregistré ou de créance fictive.`;
    }
  }

  return {
    tiersId: tiers.id,
    denomination: tiers.denominationOuNom,
    categorie: tiers.categorie,
    soldeLivre: tiers.soldeComptableLivre,
    soldeConfirme: reponse.soldeConfirmeParTiers,
    ecartBrut,
    justificationsRapprochement: {
      reglementsEnCours: reponse.montantReglementsEnCirculation,
      facturesNonParvenuesOuEtablir: reponse.montantFacturesNonComptabilisees,
      ecartInexplique: Math.max(0, ecartInexplique),
    },
    statutAudit,
    risqueDetecte,
  };
}
