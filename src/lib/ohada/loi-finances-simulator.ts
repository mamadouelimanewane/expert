// ─────────────────────────────────────────────────────────────────────────────
// Simulateur d'Impact de Loi de Finances sur Portefeuille Clients (OHADA / UEMOA)
// Permet d'anticiper les réformes fiscales (taux IS, IMF, TVA, crédits d'impôt).
// ─────────────────────────────────────────────────────────────────────────────

import { REGLES_FISCALES, type PaysFiscal } from "@/lib/tax-simulator";

export type TypeChangement = "IS_TAUX" | "IMF_TAUX" | "TVA_TAUX" | "CREDIT_IMPOT";
export type PaysCode = PaysFiscal;

export interface ParamsSimulation {
    pays: PaysCode;
    typeChangement: TypeChangement;
    valeurActuelle: number; // ex: 0.30 pour 30% ou montant crédit
    valeurProposee: number; // ex: 0.25 pour 25% ou nouveau taux
    exercice: number;
    descriptionMesure?: string;
}

export interface DonneeClientSimulation {
    clientId: string;
    nom: string;
    resultatFiscal: number; // Bénéfice fiscal ou déficit si négatif
    chiffreAffaires?: number; // CA HT
    caTtc?: number; // CA TTC
    tvaCollectee?: number;
}

export interface ImpactClient {
    clientId: string;
    nom: string;
    chargeActuelle: number;
    chargeSimulee: number;
    delta: number; // chargeSimulee - chargeActuelle (négatif = économie)
    deltaPct: number;
    detail: {
        minimumAppliqueActuel: boolean;
        minimumAppliqueSimule: boolean;
        note?: string;
    };
}

export interface ResultatSimulation {
    params: ParamsSimulation;
    impacts: ImpactClient[];
    totalActuel: number;
    totalSimule: number;
    totalDelta: number;
    moyenneDelta: number;
    clientsConcernes: number;
    timestamp: string;
}

/**
 * Calcule l'impôt minimum forfaitaire (IMF) légal pour une entreprise donnée.
 */
function calculerIMF(pays: PaysCode, caHt: number, caTtc?: number, tauxPersonnalise?: number): number {
    const regle = REGLES_FISCALES[pays];
    const taux = tauxPersonnalise !== undefined ? tauxPersonnalise : regle.minimum.taux;
    const base = regle.minimum.base === "CA_TTC" ? (caTtc ?? caHt * 1.18) : caHt;

    let montant = base * taux;
    if (regle.minimum.plancher) montant = Math.max(montant, regle.minimum.plancher);
    if (regle.minimum.plafond) montant = Math.min(montant, regle.minimum.plafond);
    return Math.round(montant);
}

/**
 * Simule l'impact d'une réforme de la loi de finances sur l'ensemble d'un portefeuille.
 */
export function simulerImpactLoiFinances(
    params: ParamsSimulation,
    clients: DonneeClientSimulation[]
): ResultatSimulation {
    const regle = REGLES_FISCALES[params.pays] || REGLES_FISCALES.sn;

    const impacts: ImpactClient[] = clients.map((client) => {
        const caHt = client.chiffreAffaires ?? (client.resultatFiscal > 0 ? client.resultatFiscal * 4 : 20_000_000);
        const caTtc = client.caTtc ?? caHt * (1 + regle.tauxTVA);
        const imfBase = calculerIMF(params.pays, caHt, caTtc);

        let chargeActuelle = 0;
        let chargeSimulee = 0;
        let minimumAppliqueActuel = false;
        let minimumAppliqueSimule = false;
        let note: string | undefined;

        switch (params.typeChangement) {
            case "IS_TAUX": {
                const benefice = Math.max(0, client.resultatFiscal);
                const isBrutActuel = Math.round(benefice * params.valeurActuelle);
                const isBrutSimule = Math.round(benefice * params.valeurProposee);

                chargeActuelle = Math.max(isBrutActuel, imfBase);
                chargeSimulee = Math.max(isBrutSimule, imfBase);

                minimumAppliqueActuel = isBrutActuel < imfBase;
                minimumAppliqueSimule = isBrutSimule < imfBase;

                if (minimumAppliqueSimule && isBrutSimule < imfBase) {
                    note = "Plancher IMF atteint : la baisse de taux n'a pas d'effet sur cet exercice.";
                }
                break;
            }

            case "IMF_TAUX": {
                const benefice = Math.max(0, client.resultatFiscal);
                const isBrut = Math.round(benefice * regle.tauxIS);
                const imfActuel = calculerIMF(params.pays, caHt, caTtc, params.valeurActuelle);
                const imfSimule = calculerIMF(params.pays, caHt, caTtc, params.valeurProposee);

                chargeActuelle = Math.max(isBrut, imfActuel);
                chargeSimulee = Math.max(isBrut, imfSimule);

                minimumAppliqueActuel = isBrut < imfActuel;
                minimumAppliqueSimule = isBrut < imfSimule;
                break;
            }

            case "CREDIT_IMPOT": {
                const benefice = Math.max(0, client.resultatFiscal);
                const isBrut = Math.round(benefice * regle.tauxIS);
                chargeActuelle = Math.max(isBrut, imfBase);

                // Le crédit d'impôt s'impute sur l'IS dû, généralement sans pouvoir réduire en dessous de 0 (ou IMF selon pays)
                const montantCredit = params.valeurProposee;
                chargeSimulee = Math.max(0, chargeActuelle - montantCredit);
                note = `Crédit d'impôt imputé à hauteur de ${Math.min(chargeActuelle, montantCredit).toLocaleString("fr-FR")} F.`;
                break;
            }

            case "TVA_TAUX": {
                const tvaActuelle = client.tvaCollectee ?? Math.round(caHt * params.valeurActuelle);
                const assiette = params.valeurActuelle > 0 ? tvaActuelle / params.valeurActuelle : caHt;
                chargeActuelle = Math.round(tvaActuelle);
                chargeSimulee = Math.round(assiette * params.valeurProposee);
                note = "Flux de TVA collectée revalorisé.";
                break;
            }
        }

        const delta = chargeSimulee - chargeActuelle;
        const deltaPct = chargeActuelle > 0 ? Math.round((delta / chargeActuelle) * 1000) / 10 : 0;

        return {
            clientId: client.clientId,
            nom: client.nom,
            chargeActuelle,
            chargeSimulee,
            delta,
            deltaPct,
            detail: {
                minimumAppliqueActuel,
                minimumAppliqueSimule,
                note,
            },
        };
    });

    const totalActuel = impacts.reduce((sum, i) => sum + i.chargeActuelle, 0);
    const totalSimule = impacts.reduce((sum, i) => sum + i.chargeSimulee, 0);
    const totalDelta = totalSimule - totalActuel;
    const moyenneDelta = impacts.length > 0 ? Math.round(totalDelta / impacts.length) : 0;

    return {
        params,
        impacts,
        totalActuel,
        totalSimule,
        totalDelta,
        moyenneDelta,
        clientsConcernes: impacts.length,
        timestamp: new Date().toISOString(),
    };
}
