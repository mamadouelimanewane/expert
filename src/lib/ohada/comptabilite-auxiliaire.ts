// ─────────────────────────────────────────────────────────────────────────────
// Moteur de Comptabilité Auxiliaire & Gestion des Tiers (SYSCOHADA révisé)
// Balance âgée, Lettrage partiel/total, Délais de paiement (DSO/DPO), Créances douteuses
// ─────────────────────────────────────────────────────────────────────────────

export interface EcritureTiers {
    id: string;
    date: string;
    echeance?: string;
    numeroPiece: string;
    libelle: string;
    compteGeneral: string; // 4111, 4011, etc.
    compteAuxiliaire: string; // ex: CLI-001, FOU-002
    nomTiers: string;
    sens: "DEBIT" | "CREDIT";
    montant: number;
    codeLettrage?: string; // ex: "AA", "AB" si lettré
    montantLettre?: number;
}

export interface TrancheAgee {
    nonEchu: number;
    retard0a30: number;
    retard31a60: number;
    retard61a90: number;
    retardPlus90: number;
    totalDu: number;
}

export interface LigneBalanceAgee extends TrancheAgee {
    compteAuxiliaire: string;
    nomTiers: string;
    typeTiers: "CLIENT" | "FOURNISSEUR";
    nombreFactures: number;
    facturePlusAncienneDate?: string;
    statutRisque: "NORMAL" | "VIGILANCE" | "CONTENTIEUX_PROBABLE";
}

export interface SyntheseBalanceAgee {
    dateArrete: string;
    typeTiers: "CLIENT" | "FOURNISSEUR";
    lignes: LigneBalanceAgee[];
    totaux: TrancheAgee;
    delaiMoyenJours: number; // DSO pour clients, DPO pour fournisseurs
    montantRisqueEleve: number;
}

export interface PropositionReclassement416 {
    compteAuxiliaire: string;
    nomTiers: string;
    creanceTTC: number;
    tvaEstimee: number; // 18% par défaut UEMOA
    creanceHT: number;
    tauxDepreciationPropose: number; // 25%, 50%, 75%, 100%
    montantDepreciation: number;
    motif: string;
}

/**
 * Calcule l'écart en jours entre une date d'échéance et la date d'arrêté.
 */
function joursDeRetard(dateEcheance: string, dateArrete: Date): number {
    const ech = new Date(dateEcheance).getTime();
    const arr = dateArrete.getTime();
    if (isNaN(ech)) return 0;
    return Math.floor((arr - ech) / (1000 * 60 * 60 * 24));
}

/**
 * Calcule la balance âgée d'un portefeuille d'écritures non lettrées ou partiellement lettrées.
 */
export function calculerBalanceAgee(
    ecritures: EcritureTiers[],
    dateArreteStr?: string,
    typeTiers: "CLIENT" | "FOURNISSEUR" = "CLIENT"
): SyntheseBalanceAgee {
    const dateArrete = dateArreteStr ? new Date(dateArreteStr) : new Date();
    const groupeParTiers = new Map<string, EcritureTiers[]>();

    for (const ecriture of ecritures) {
        // Filtrer selon le type de compte (41x pour clients, 40x pour fournisseurs)
        const estClient = ecriture.compteGeneral.startsWith("41");
        const estFournisseur = ecriture.compteGeneral.startsWith("40");

        if (typeTiers === "CLIENT" && !estClient) continue;
        if (typeTiers === "FOURNISSEUR" && !estFournisseur) continue;

        const soldeRestant = ecriture.montant - (ecriture.montantLettre || 0);
        if (soldeRestant <= 0.01) continue; // Déjà totalement lettré

        const cle = ecriture.compteAuxiliaire || ecriture.nomTiers;
        if (!groupeParTiers.has(cle)) {
            groupeParTiers.set(cle, []);
        }
        groupeParTiers.get(cle)!.push(ecriture);
    }

    const lignes: LigneBalanceAgee[] = [];

    const totaux: TrancheAgee = {
        nonEchu: 0,
        retard0a30: 0,
        retard31a60: 0,
        retard61a90: 0,
        retardPlus90: 0,
        totalDu: 0,
    };

    let sommePondereeJours = 0;
    let volumeTotalPondere = 0;
    let montantRisqueEleve = 0;

    for (const [codeTiers, items] of groupeParTiers.entries()) {
        const nomTiers = items[0]?.nomTiers || codeTiers;
        let nonEchu = 0;
        let retard0a30 = 0;
        let retard31a60 = 0;
        let retard61a90 = 0;
        let retardPlus90 = 0;
        let totalDu = 0;

        let datePlusAncienne = items[0]?.date;

        for (const it of items) {
            const solde = it.montant - (it.montantLettre || 0);
            totalDu += solde;

            if (it.date && (!datePlusAncienne || it.date < datePlusAncienne)) {
                datePlusAncienne = it.date;
            }

            // Échéance par défaut = date d'écriture + 30 jours si non spécifiée
            const echeance = it.echeance || new Date(new Date(it.date).getTime() + 30 * 86400000).toISOString().slice(0, 10);
            const retard = joursDeRetard(echeance, dateArrete);

            if (retard > 0) {
                sommePondereeJours += retard * solde;
                volumeTotalPondere += solde;
            }

            if (retard <= 0) {
                nonEchu += solde;
            } else if (retard <= 30) {
                retard0a30 += solde;
            } else if (retard <= 60) {
                retard31a60 += solde;
            } else if (retard <= 90) {
                retard61a90 += solde;
            } else {
                retardPlus90 += solde;
            }
        }

        let statutRisque: LigneBalanceAgee["statutRisque"] = "NORMAL";
        if (retardPlus90 > 0) {
            statutRisque = "CONTENTIEUX_PROBABLE";
            montantRisqueEleve += retardPlus90;
        } else if (retard31a60 > 0 || retard61a90 > 0) {
            statutRisque = "VIGILANCE";
        }

        totaux.nonEchu += nonEchu;
        totaux.retard0a30 += retard0a30;
        totaux.retard31a60 += retard31a60;
        totaux.retard61a90 += retard61a90;
        totaux.retardPlus90 += retardPlus90;
        totaux.totalDu += totalDu;

        lignes.push({
            compteAuxiliaire: codeTiers,
            nomTiers,
            typeTiers,
            nombreFactures: items.length,
            facturePlusAncienneDate: datePlusAncienne,
            nonEchu: Math.round(nonEchu),
            retard0a30: Math.round(retard0a30),
            retard31a60: Math.round(retard31a60),
            retard61a90: Math.round(retard61a90),
            retardPlus90: Math.round(retardPlus90),
            totalDu: Math.round(totalDu),
            statutRisque,
        });
    }

    // Trier les lignes par total dû décroissant
    lignes.sort((a, b) => b.totalDu - a.totalDu);

    const delaiMoyenJours = volumeTotalPondere > 0 ? Math.round(sommePondereeJours / volumeTotalPondere) : 0;

    return {
        dateArrete: dateArrete.toISOString().slice(0, 10),
        typeTiers,
        lignes,
        totaux: {
            nonEchu: Math.round(totaux.nonEchu),
            retard0a30: Math.round(totaux.retard0a30),
            retard31a60: Math.round(totaux.retard31a60),
            retard61a90: Math.round(totaux.retard61a90),
            retardPlus90: Math.round(totaux.retardPlus90),
            totalDu: Math.round(totaux.totalDu),
        },
        delaiMoyenJours,
        montantRisqueEleve: Math.round(montantRisqueEleve),
    };
}

/**
 * Exécute un lettrage (total ou partiel) entre une ou plusieurs factures et un règlement.
 */
export function lettrerEcritures(
    factures: EcritureTiers[],
    reglements: EcritureTiers[],
    nouveauCodeLettrage: string
): { facturesMisesAJour: EcritureTiers[]; reglementsMisAJour: EcritureTiers[]; soldeNonLettre: number } {
    let montantDisponible = reglements.reduce((s, r) => s + (r.montant - (r.montantLettre || 0)), 0);

    const facturesMisesAJour: EcritureTiers[] = [];
    const reglementsMisAJour: EcritureTiers[] = [];

    for (const f of factures) {
        const resteAPayer = f.montant - (f.montantLettre || 0);
        if (montantDisponible <= 0 || resteAPayer <= 0) {
            facturesMisesAJour.push(f);
            continue;
        }

        const montantImpute = Math.min(resteAPayer, montantDisponible);
        const nouveauMontantLettre = (f.montantLettre || 0) + montantImpute;
        montantDisponible -= montantImpute;

        facturesMisesAJour.push({
            ...f,
            montantLettre: nouveauMontantLettre,
            codeLettrage: nouveauCodeLettrage,
        });
    }

    for (const r of reglements) {
        reglementsMisAJour.push({
            ...r,
            montantLettre: r.montant,
            codeLettrage: nouveauCodeLettrage,
        });
    }

    return {
        facturesMisesAJour,
        reglementsMisAJour,
        soldeNonLettre: Math.max(0, montantDisponible),
    };
}

/**
 * Détecte les créances clientes nécessitant un reclassement en compte 416 (Créances douteuses)
 * et propose la dotation aux dépréciations (compte 659 / 491).
 */
export function detecterReclassements416(
    balanceAgee: SyntheseBalanceAgee,
    tauxTVA = 0.18
): PropositionReclassement416[] {
    const propositions: PropositionReclassement416[] = [];

    for (const l of balanceAgee.lignes) {
        if (l.typeTiers !== "CLIENT") continue;

        // Condition : retard > 90 jours ou cumul de retard critique
        if (l.retardPlus90 > 0) {
            const creanceTTC = l.retardPlus90;
            const creanceHT = Math.round(creanceTTC / (1 + tauxTVA));
            const tvaEstimee = creanceTTC - creanceHT;

            // Barème prudentiel :
            // Si le retard > 90j représente plus de 80% du total dû : dépréciation 100% de la base HT
            // Sinon dépréciation progressive 50%
            const partRetard = creanceTTC / l.totalDu;
            const tauxDepreciation = partRetard >= 0.8 ? 1.0 : 0.5;
            const montantDepreciation = Math.round(creanceHT * tauxDepreciation);

            propositions.push({
                compteAuxiliaire: l.compteAuxiliaire,
                nomTiers: l.nomTiers,
                creanceTTC,
                creanceHT,
                tvaEstimee,
                tauxDepreciationPropose: tauxDepreciation * 100,
                montantDepreciation,
                motif: `Créance impayée depuis plus de 90 jours (${Math.round(partRetard * 100)}% de l'encours du client).`,
            });
        }
    }

    return propositions;
}
