// ─────────────────────────────────────────────────────────────────────────────
// Moteur de Gestion de Caisse & État de Rapprochement Bancaire (SYSCOHADA révisé)
// Brouillard, Billetage, Bouclier anti-caisse négative et Rapprochement normé
// ─────────────────────────────────────────────────────────────────────────────

export interface LigneCaisse {
    id: string;
    date: string;
    pieceJustificative: string;
    libelle: string;
    entree: number;
    sortie: number;
    soldeProgressif?: number;
    beneficiaire?: string;
    valide: boolean;
}

export interface BilletageCaisse {
    billets10000: number;
    billets5000: number;
    billets2000: number;
    billets1000: number;
    billets500: number;
    pieces500: number;
    pieces250: number;
    pieces200: number;
    pieces100: number;
    pieces50: number;
    pieces25: number;
    pieces10: number;
    pieces5: number;
}

export interface ProcesVerbalCaisse {
    dateArrete: string;
    heureArrete: string;
    caissierNom: string;
    controleurNom: string;
    soldeTheoriqueComptable: number;
    soldePhysiqueConstate: number;
    ecartCaisse: number; // Physique - Théorique (positif = excédent, négatif = déficit)
    billetage: BilletageCaisse;
    observations: string;
    estConforme: boolean;
}

export interface AlerteCaisseNegative {
    dateFranchissement: string;
    libelleOperation: string;
    montantOperation: number;
    soldeNegatifConstate: number;
    gravite: "CRITIQUE_FISCALE";
    risqueDescription: string;
    solutionPreconisee: string;
}

export interface SyntheseCaisse {
    soldeInitial: number;
    totalEntrees: number;
    totalSorties: number;
    soldeFinalTheorique: number;
    lignesAvecSolde: LigneCaisse[];
    alertesNegatives: AlerteCaisseNegative[];
    caisseSaine: boolean;
}

export interface OperationSuspenseBancaire {
    id: string;
    date: string;
    libelle: string;
    montant: number;
    sens: "DEBIT" | "CREDIT";
    origine: "NON_EN_BANQUE" | "NON_EN_COMPTABILITE";
    nature: "CHEQUE_CIRCULATION" | "REMISE_EN_COURS" | "AGIOS_FRAIS" | "VIREMENT_INCONNU" | "AUTRE";
}

export interface RapprochementBancaireResultat {
    dateRapprochement: string;
    compteTresorerie: string; // 5211
    nomBanque: string;
    numeroCompteBancaire: string;

    // Colonne 1 : Comptabilité (Compte 521)
    soldeComptableAvant: number;
    operationsAJourComptabilite: OperationSuspenseBancaire[];
    totalAjustementsComptaDebit: number;
    totalAjustementsComptaCredit: number;
    soldeComptableRectifie: number;

    // Colonne 2 : Relevé Bancaire
    soldeReleveBancaire: number;
    operationsEnSuspenseBanque: OperationSuspenseBancaire[];
    totalAjustementsBanqueDebit: number;
    totalAjustementsBanqueCredit: number;
    soldeBancaireRectifie: number;

    // Rapprochement
    ecartRapprochement: number;
    estRapproche: boolean;
}

/**
 * Calcule le total physique d'un inventaire de caisse à partir du billetage.
 */
export function calculerTotalBilletage(b: BilletageCaisse): number {
    return (
        b.billets10000 * 10000 +
        b.billets5000 * 5000 +
        b.billets2000 * 2000 +
        b.billets1000 * 1000 +
        b.billets500 * 500 +
        b.pieces500 * 500 +
        b.pieces250 * 250 +
        b.pieces200 * 200 +
        b.pieces100 * 100 +
        b.pieces50 * 50 +
        b.pieces25 * 25 +
        b.pieces10 * 10 +
        b.pieces5 * 5
    );
}

/**
 * Traite le brouillard de caisse, calcule les soldes progressifs et détecte toute caisse créditrice.
 */
export function analyserBrouillardCaisse(
    soldeInitial: number,
    lignes: LigneCaisse[]
): SyntheseCaisse {
    let soldeCourant = soldeInitial;
    let totalEntrees = 0;
    let totalSorties = 0;
    const lignesAvecSolde: LigneCaisse[] = [];
    const alertesNegatives: AlerteCaisseNegative[] = [];

    // Trier chronologiquement
    const triees = [...lignes].sort((a, b) => a.date.localeCompare(b.date));

    for (const l of triees) {
        totalEntrees += l.entree;
        totalSorties += l.sortie;
        soldeCourant = soldeCourant + l.entree - l.sortie;

        lignesAvecSolde.push({
            ...l,
            soldeProgressif: soldeCourant,
        });

        // Détection de caisse négative (motif de rejet de comptabilité fiscale)
        if (soldeCourant < 0) {
            alertesNegatives.push({
                dateFranchissement: l.date,
                libelleOperation: l.libelle,
                montantOperation: l.sortie,
                soldeNegatifConstate: soldeCourant,
                gravite: "CRITIQUE_FISCALE",
                risqueDescription:
                    "Caisse créditrice constatée en comptabilité : rejet systématique de comptabilité lors des vérifications fiscales pour présomption de recettes dissimulées.",
                solutionPreconisee:
                    "Régulariser par un apport de trésorerie de l'exploitant (compte 462 - Associé compte courant) ou enregistrer les recettes physiques préalables.",
            });
        }
    }

    return {
        soldeInitial,
        totalEntrees,
        totalSorties,
        soldeFinalTheorique: soldeCourant,
        lignesAvecSolde,
        alertesNegatives,
        caisseSaine: alertesNegatives.length === 0 && soldeCourant >= 0,
    };
}

/**
 * Génère le Procès-Verbal de caisse physique contradictoire.
 */
export function etablirProcesVerbalCaisse(params: {
    dateArrete: string;
    caissierNom: string;
    controleurNom: string;
    soldeTheoriqueComptable: number;
    billetage: BilletageCaisse;
    observations?: string;
}): ProcesVerbalCaisse {
    const soldePhysiqueConstate = calculerTotalBilletage(params.billetage);
    const ecartCaisse = soldePhysiqueConstate - params.soldeTheoriqueComptable;

    return {
        dateArrete: params.dateArrete,
        heureArrete: new Date().toLocaleTimeString("fr-FR"),
        caissierNom: params.caissierNom,
        controleurNom: params.controleurNom,
        soldeTheoriqueComptable: params.soldeTheoriqueComptable,
        soldePhysiqueConstate,
        ecartCaisse,
        billetage: params.billetage,
        observations:
            params.observations ||
            (ecartCaisse === 0
                ? "Parfaite concordance entre l'encaisse physique et le solde comptable."
                : `Écart constaté de ${ecartCaisse.toLocaleString("fr-FR")} FCFA à justifier ou régulariser.`),
        estConforme: Math.abs(ecartCaisse) <= 100, // Tolérance 100 FCFA pour petites pièces
    };
}

/**
 * Établit l'État de Rapprochement Bancaire formel selon les normes SYSCOHADA.
 */
export function calculerRapprochementBancaire(params: {
    dateRapprochement: string;
    nomBanque: string;
    numeroCompteBancaire: string;
    compteTresorerie?: string;
    soldeComptableAvant: number;
    soldeReleveBancaire: number;
    operationsSuspense: OperationSuspenseBancaire[];
}): RapprochementBancaireResultat {
    const compteTresorerie = params.compteTresorerie || "5211";

    const operationsCompta = params.operationsSuspense.filter(
        (o) => o.origine === "NON_EN_COMPTABILITE"
    );
    const operationsBanque = params.operationsSuspense.filter(
        (o) => o.origine === "NON_EN_BANQUE"
    );

    // Ajustements sur la comptabilité :
    // - Recettes sur relevé non comptabilisées -> Débit compte 521 (augmente le solde)
    // - Frais/agios sur relevé non comptabilisés -> Crédit compte 521 (diminue le solde)
    const comptaDebit = operationsCompta
        .filter((o) => o.sens === "DEBIT")
        .reduce((sum, o) => sum + o.montant, 0);
    const comptaCredit = operationsCompta
        .filter((o) => o.sens === "CREDIT")
        .reduce((sum, o) => sum + o.montant, 0);

    const soldeComptableRectifie = params.soldeComptableAvant + comptaDebit - comptaCredit;

    // Ajustements sur la banque :
    // - Remises de chèques en compta non encore au relevé -> Augmente le solde bancaire
    // - Chèques émis non encore présentés à l'encaissement -> Diminue le solde bancaire
    const banqueDebit = operationsBanque
        .filter((o) => o.sens === "DEBIT")
        .reduce((sum, o) => sum + o.montant, 0);
    const banqueCredit = operationsBanque
        .filter((o) => o.sens === "CREDIT")
        .reduce((sum, o) => sum + o.montant, 0);

    const soldeBancaireRectifie = params.soldeReleveBancaire + banqueDebit - banqueCredit;

    const ecartRapprochement = Math.abs(soldeComptableRectifie - soldeBancaireRectifie);

    return {
        dateRapprochement: params.dateRapprochement,
        compteTresorerie,
        nomBanque: params.nomBanque,
        numeroCompteBancaire: params.numeroCompteBancaire,
        soldeComptableAvant: params.soldeComptableAvant,
        operationsAJourComptabilite: operationsCompta,
        totalAjustementsComptaDebit: comptaDebit,
        totalAjustementsComptaCredit: comptaCredit,
        soldeComptableRectifie,
        soldeReleveBancaire: params.soldeReleveBancaire,
        operationsEnSuspenseBanque: operationsBanque,
        totalAjustementsBanqueDebit: banqueDebit,
        totalAjustementsBanqueCredit: banqueCredit,
        soldeBancaireRectifie,
        ecartRapprochement,
        estRapproche: ecartRapprochement <= 1,
    };
}
