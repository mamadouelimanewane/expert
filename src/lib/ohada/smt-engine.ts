// ─────────────────────────────────────────────────────────────────────────────
// Moteur SMT (Système Minimal de Trésorerie) — Conforme SYSCOHADA Révisé
// AUDCIF Articles 13, 27 à 30 : États financiers simplifiés pour TPE / Micro-entreprises
// ─────────────────────────────────────────────────────────────────────────────

export type CategorieActiviteSMT = "COMMERCE_NEGOCE" | "ARTISANAT" | "SERVICES";

export const SEUILS_ELIGIBILITE_SMT: Record<CategorieActiviteSMT, { libelle: string; seuilCA: number }> = {
    COMMERCE_NEGOCE: { libelle: "Ventes de marchandises / Négoce", seuilCA: 60_000_000 },
    ARTISANAT: { libelle: "Activités artisanales et assimilées", seuilCA: 40_000_000 },
    SERVICES: { libelle: "Prestations de services", seuilCA: 30_000_000 },
};

export interface FluxTresorerieSMT {
    id: string;
    date: string;
    libelle: string;
    categorie:
        | "RECETTE_VENTES"
        | "RECETTE_SERVICES"
        | "ACHAT_MARCHANDISES"
        | "CHARGES_LOYER"
        | "CHARGES_SALAIRES"
        | "CHARGES_IMPOTS_TAXES"
        | "AUTRES_DEPENSES"
        | "INVESTISSEMENT"
        | "FINANCEMENT_APPORT"
        | "FINANCEMENT_EMPRUNT";
    montant: number;
    modeReglement: "ESPECES" | "BANQUE" | "MOBILE_MONEY";
}

export interface LigneBilanSMT {
    code: string;
    intitule: string;
    montant: number;
}

export interface BilanSMT {
    actif: {
        immobilisations: number;
        stocks: number;
        creances: number;
        tresorerieActif: number;
        totalActif: number;
    };
    passif: {
        capitauxPropres: number;
        dettesFinancieres: number;
        dettesExploitation: number;
        tresoreriePassif: number;
        totalPassif: number;
    };
    equilibre: boolean;
    ecart: number;
}

export interface CompteResultatSMT {
    recettesVentes: number;
    recettesServices: number;
    totalRecettesExploitation: number;
    achatsMarchandises: number;
    loyersEtChargesLocatives: number;
    salairesEtChargesPersonnel: number;
    impotsEtTaxesPayes: number;
    autresChargesExploitation: number;
    totalDepensesExploitation: number;
    excedentTresorerieExploitation: number; // Recettes - Dépenses
    soldeInvestissement: number;
    soldeFinancement: number;
    variationNetteTresorerie: number;
}

export interface DiagnosticEligibiliteSMT {
    chiffreAffairesTotal: number;
    categorie: CategorieActiviteSMT;
    seuilLegal: number;
    estEligibleSMT: boolean;
    pourcentageSeuil: number;
    recommandation: string;
}

export interface EtatsFinanciersSMT {
    exercice: number;
    diagnostic: DiagnosticEligibiliteSMT;
    bilan: BilanSMT;
    compteResultat: CompteResultatSMT;
    tresorerieFinExercice: number;
}

/**
 * Vérifie l'éligibilité légale d'une entreprise au Système Minimal de Trésorerie (SMT).
 */
export function verifierEligibiliteSMT(
    chiffreAffaires: number,
    categorie: CategorieActiviteSMT = "COMMERCE_NEGOCE"
): DiagnosticEligibiliteSMT {
    const config = SEUILS_ELIGIBILITE_SMT[categorie];
    const seuilLegal = config.seuilCA;
    const estEligibleSMT = chiffreAffaires <= seuilLegal;
    const pourcentageSeuil = Math.round((chiffreAffaires / seuilLegal) * 100);

    let recommandation = "";
    if (estEligibleSMT) {
        recommandation = `Éligible de plein droit au SMT SYSCOHADA (${pourcentageSeuil}% du plafond de ${seuilLegal.toLocaleString("fr-FR")} FCFA).`;
    } else {
        recommandation = `Seuil dépassé (${pourcentageSeuil}% du plafond). L'entité doit obligatoirement basculer vers le Système Normal SYSCOHADA.`;
    }

    return {
        chiffreAffairesTotal: chiffreAffaires,
        categorie,
        seuilLegal,
        estEligibleSMT,
        pourcentageSeuil,
        recommandation,
    };
}

/**
 * Génère les états financiers SMT à partir des flux de trésorerie et d'inventaire extra-comptable.
 */
export function genererEtatsSMT(params: {
    exercice: number;
    categorie: CategorieActiviteSMT;
    flux: FluxTresorerieSMT[];
    inventaire?: {
        immobilisationsNet?: number;
        stocksFinaux?: number;
        creancesClientsFin?: number;
        dettesFournisseursFin?: number;
        dettesFiscalesSocialesFin?: number;
        tresorerieInitiale?: number;
    };
}): EtatsFinanciersSMT {
    const { exercice, categorie, flux, inventaire = {} } = params;

    let recettesVentes = 0;
    let recettesServices = 0;
    let achatsMarchandises = 0;
    let loyersEtChargesLocatives = 0;
    let salairesEtChargesPersonnel = 0;
    let impotsEtTaxesPayes = 0;
    let autresChargesExploitation = 0;

    let investissementDecaisse = 0;
    let financementApports = 0;
    let financementEmprunts = 0;

    for (const f of flux) {
        switch (f.categorie) {
            case "RECETTE_VENTES":
                recettesVentes += f.montant;
                break;
            case "RECETTE_SERVICES":
                recettesServices += f.montant;
                break;
            case "ACHAT_MARCHANDISES":
                achatsMarchandises += f.montant;
                break;
            case "CHARGES_LOYER":
                loyersEtChargesLocatives += f.montant;
                break;
            case "CHARGES_SALAIRES":
                salairesEtChargesPersonnel += f.montant;
                break;
            case "CHARGES_IMPOTS_TAXES":
                impotsEtTaxesPayes += f.montant;
                break;
            case "AUTRES_DEPENSES":
                autresChargesExploitation += f.montant;
                break;
            case "INVESTISSEMENT":
                investissementDecaisse += f.montant;
                break;
            case "FINANCEMENT_APPORT":
                financementApports += f.montant;
                break;
            case "FINANCEMENT_EMPRUNT":
                financementEmprunts += f.montant;
                break;
        }
    }

    const totalRecettesExploitation = recettesVentes + recettesServices;
    const totalDepensesExploitation =
        achatsMarchandises +
        loyersEtChargesLocatives +
        salairesEtChargesPersonnel +
        impotsEtTaxesPayes +
        autresChargesExploitation;

    const excedentTresorerieExploitation = totalRecettesExploitation - totalDepensesExploitation;
    const soldeInvestissement = -investissementDecaisse;
    const soldeFinancement = financementApports + financementEmprunts;
    const variationNetteTresorerie =
        excedentTresorerieExploitation + soldeInvestissement + soldeFinancement;

    const tresorerieInitiale = inventaire.tresorerieInitiale || 0;
    const tresorerieFinExercice = tresorerieInitiale + variationNetteTresorerie;

    const diagnostic = verifierEligibiliteSMT(totalRecettesExploitation, categorie);

    // Bilan SMT
    const immobilisations = inventaire.immobilisationsNet || Math.max(0, investissementDecaisse);
    const stocks = inventaire.stocksFinaux || 0;
    const creances = inventaire.creancesClientsFin || 0;
    const tresorerieActif = Math.max(0, tresorerieFinExercice);
    const totalActif = immobilisations + stocks + creances + tresorerieActif;

    const tresoreriePassif = tresorerieFinExercice < 0 ? Math.abs(tresorerieFinExercice) : 0;
    const dettesExploitation =
        (inventaire.dettesFournisseursFin || 0) + (inventaire.dettesFiscalesSocialesFin || 0);
    const dettesFinancieres = financementEmprunts;

    // Capitaux propres calculés pour équilibrer le bilan SMT
    const capitauxPropres = totalActif - (dettesFinancieres + dettesExploitation + tresoreriePassif);
    const totalPassif = capitauxPropres + dettesFinancieres + dettesExploitation + tresoreriePassif;

    return {
        exercice,
        diagnostic,
        bilan: {
            actif: {
                immobilisations,
                stocks,
                creances,
                tresorerieActif,
                totalActif,
            },
            passif: {
                capitauxPropres,
                dettesFinancieres,
                dettesExploitation,
                tresoreriePassif,
                totalPassif,
            },
            equilibre: totalActif === totalPassif,
            ecart: Math.abs(totalActif - totalPassif),
        },
        compteResultat: {
            recettesVentes,
            recettesServices,
            totalRecettesExploitation,
            achatsMarchandises,
            loyersEtChargesLocatives,
            salairesEtChargesPersonnel,
            impotsEtTaxesPayes,
            autresChargesExploitation,
            totalDepensesExploitation,
            excedentTresorerieExploitation,
            soldeInvestissement,
            soldeFinancement,
            variationNetteTresorerie,
        },
        tresorerieFinExercice,
    };
}
