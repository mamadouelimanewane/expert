// ─────────────────────────────────────────────────────────────────────────────
// Tableau de Bord & Scoring de Conformité Fiscale & Sociale OHADA / UEMOA
// Permet le suivi temps réel des obligations déclaratives et des pénalités
// ─────────────────────────────────────────────────────────────────────────────

import { OBLIGATIONS_FISCALES, type ObligationFiscale } from "./obligations-fiscales";

export type StatutObligation =
    | "A_FAIRE"         // échéance future > 7 jours
    | "URGENT"          // échéance dans 7 jours ou moins
    | "DEPOSE"          // déclaration effectuée
    | "EN_RETARD"       // date passée (retard <= 30 jours)
    | "PENALITE";       // en retard critique (> 30 jours)

export interface EcheanceConformite {
    obligationId: string;
    titre: string;
    categorie: string;
    pays: string;
    dateEcheance: Date;
    statut: StatutObligation;
    joursRestants: number;        // négatif si dépassé
    penaliteEstimee?: number;     // en FCFA si en retard
    reference: string;
}

export interface ScoreConformite {
    global: number;               // 0-100
    fiscal: number;
    social: number;
    detail: {
        aFaire: number;
        urgent: number;
        depose: number;
        enRetard: number;
        penalite: number;
    };
}

export interface TableauBordConformite {
    pays: string;
    annee: number;
    mois: number;
    echeances: EcheanceConformite[];
    score: ScoreConformite;
    prochaineEcheance: EcheanceConformite | null;
    alertes: string[];
}

/**
 * Calcule les échéances du mois pour un pays et une date de référence donnée.
 */
export function calculerEcheancesMois(
    pays: string,
    annee: number,
    mois: number,
    declarationsDeposees: string[] = [],
    dateReference: Date = new Date()
): EcheanceConformite[] {
    const codePays = pays.toUpperCase();
    const echeances: EcheanceConformite[] = [];

    // Filtrer les obligations applicables à ce pays
    const applicables = OBLIGATIONS_FISCALES.filter(
        (o) => o.pays.includes(codePays) || o.pays.includes("*")
    );

    for (const ob of applicables) {
        // Déterminer la date d'échéance : jourEcheance du mois/année
        const dateEch = new Date(annee, mois - 1, ob.jourEcheance, 23, 59, 59);

        // Différence en jours par rapport à la date de référence
        const diffMs = dateEch.getTime() - dateReference.getTime();
        const joursRestants = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        let statut: StatutObligation = "A_FAIRE";
        let penaliteEstimee: number | undefined = undefined;

        const estDepose = declarationsDeposees.includes(ob.id);

        if (estDepose) {
            statut = "DEPOSE";
        } else if (joursRestants < -30) {
            statut = "PENALITE";
            // Majoration légale de retard : 25% + intérêts de retard
            penaliteEstimee = 150_000;
        } else if (joursRestants < 0) {
            statut = "EN_RETARD";
            // Pénalité forfaitaire pour retard simple (10%)
            penaliteEstimee = 50_000;
        } else if (joursRestants <= 7) {
            statut = "URGENT";
        } else {
            statut = "A_FAIRE";
        }

        echeances.push({
            obligationId: ob.id,
            titre: ob.titre,
            categorie: ob.categorie,
            pays: codePays,
            dateEcheance: dateEch,
            statut,
            joursRestants,
            penaliteEstimee,
            reference: ob.reference,
        });
    }

    return echeances;
}

/**
 * Calcule les scores de conformité (global, fiscal, social) sur une base 0 - 100.
 */
export function calculerScore(echeances: EcheanceConformite[]): ScoreConformite {
    if (echeances.length === 0) {
        return {
            global: 100,
            fiscal: 100,
            social: 100,
            detail: { aFaire: 0, urgent: 0, depose: 0, enRetard: 0, penalite: 0 },
        };
    }

    const detail = {
        depose: echeances.filter((e) => e.statut === "DEPOSE").length,
        aFaire: echeances.filter((e) => e.statut === "A_FAIRE").length,
        urgent: echeances.filter((e) => e.statut === "URGENT").length,
        enRetard: echeances.filter((e) => e.statut === "EN_RETARD").length,
        penalite: echeances.filter((e) => e.statut === "PENALITE").length,
    };

    const ponderer = (liste: EcheanceConformite[]) => {
        if (liste.length === 0) return 100;
        let points = 0;
        for (const item of liste) {
            if (item.statut === "DEPOSE") points += 100;
            else if (item.statut === "A_FAIRE") points += 85;
            else if (item.statut === "URGENT") points += 50;
            else if (item.statut === "EN_RETARD") points += 15;
            else if (item.statut === "PENALITE") points += 0;
        }
        return Math.round(points / liste.length);
    };

    const echeancesFiscales = echeances.filter((e) => e.categorie !== "SOCIAL");
    const echeancesSociales = echeances.filter((e) => e.categorie === "SOCIAL");

    return {
        global: ponderer(echeances),
        fiscal: ponderer(echeancesFiscales),
        social: ponderer(echeancesSociales),
        detail,
    };
}

/**
 * Construit le tableau de bord complet avec synthèse et alertes.
 */
export function genererTableauBord(
    pays: string,
    annee: number,
    mois: number,
    declarationsDeposees: string[] = [],
    dateReference: Date = new Date()
): TableauBordConformite {
    const echeances = calculerEcheancesMois(pays, annee, mois, declarationsDeposees, dateReference);
    const score = calculerScore(echeances);

    // Identifier la prochaine échéance à traiter
    const enAttente = echeances
        .filter((e) => e.statut === "A_FAIRE" || e.statut === "URGENT")
        .sort((a, b) => a.dateEcheance.getTime() - b.dateEcheance.getTime());
    const prochaineEcheance = enAttente[0] || null;

    // Déterminer les alertes prioritaires
    const alertes: string[] = [];
    const retards = echeances.filter((e) => e.statut === "EN_RETARD" || e.statut === "PENALITE");
    const urgents = echeances.filter((e) => e.statut === "URGENT");

    if (retards.length > 0) {
        alertes.push(`⚠️ ${retards.length} obligation(s) en retard déclaratif ou sous pénalité immédiate.`);
    }
    if (urgents.length > 0) {
        alertes.push(`⏳ ${urgents.length} déclaration(s) arrivant à échéance dans les 7 prochains jours.`);
    }
    if (score.global >= 90) {
        alertes.push(`✅ Conformité globale excellente (${score.global}/100) pour le pays ${pays.toUpperCase()}.`);
    }

    return {
        pays: pays.toUpperCase(),
        annee,
        mois,
        echeances,
        score,
        prochaineEcheance,
        alertes,
    };
}

/**
 * Rapport textuel prêt pour l'export ou l'impression client.
 */
export function genererRapportConformite(tableau: TableauBordConformite): string {
    let out = `=== AUDIT DE CONFORMITÉ FISCALE & SOCIALE (CABINET 360) ===\n`;
    out += `Juridiction : ${tableau.pays} | Période : ${tableau.mois}/${tableau.annee}\n`;
    out += `Score Global de Conformité : ${tableau.score.global}/100 (Fiscal: ${tableau.score.fiscal} | Social: ${tableau.score.social})\n\n`;

    out += `--- SYNTHÈSE DES OBLIGATIONS ---\n`;
    out += `• Déposées : ${tableau.score.detail.depose}\n`;
    out += `• À échéance normale : ${tableau.score.detail.aFaire}\n`;
    out += `• Urgentes (J-7) : ${tableau.score.detail.urgent}\n`;
    out += `• En retard : ${tableau.score.detail.enRetard}\n`;
    out += `• Sous pénalités : ${tableau.score.detail.penalite}\n\n`;

    if (tableau.alertes.length > 0) {
        out += `--- ALERTES & ACTIONS PRIORITAIRES ---\n`;
        for (const alt of tableau.alertes) {
            out += `${alt}\n`;
        }
        out += `\n`;
    }

    out += `--- DÉTAIL DES ÉCHÉANCES DU MOIS ---\n`;
    for (const ech of tableau.echeances) {
        const dateStr = ech.dateEcheance.toLocaleDateString("fr-FR");
        out += `[${ech.statut}] ${ech.titre} (Échéance: ${dateStr}) - ${ech.reference}\n`;
        if (ech.penaliteEstimee) {
            out += `    ⚠️ Pénalité estimée: ${ech.penaliteEstimee.toLocaleString("fr-FR")} FCFA\n`;
        }
    }

    return out;
}
