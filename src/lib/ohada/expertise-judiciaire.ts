// ─────────────────────────────────────────────────────────────────────────────
// Module d'Expertise Comptable & Financière auprès des Tribunaux (Droit OHADA)
// Conforme au Code de Procédure Civile, AUSCGIE (art. 159) et Pratiques Judiciaires
// ─────────────────────────────────────────────────────────────────────────────

export type TypeMissionJudiciaire =
    | "EVALUATION_PREJUDICE"       // Perte subie (damnum emergens) et gain manqué (lucrum cessans)
    | "EXPERTISE_GESTION"         // Expertise de gestion minoritaire (art. 159 AUSCGIE)
    | "REDDITION_COMPTES"         // Reddition de comptes litige gérance / associés
    | "RECONSTITUTION_COMPTABLE"  // Reconstitution comptable pour litige successoral ou fiscal
    | "EVALUATION_PARTS_LITIGE"   // Évaluation de parts sociales / actions contestées (art. 59)
    | "ARBITRAGE_COMMERCIAL";     // Expertise technique arbitrage CCJA

export type PhaseExpertise =
    | "DESIGNATION_ET_SAISINE"    // Réception ordonnance et consignation
    | "ACCEDITS_ET_CONTRADICTOIRE" // Réunions d'expertise et examen des pièces
    | "NOTE_DE_SYNTHESE"          // Envoi du document d'information / pré-rapport
    | "REPONSE_AUX_DIRES"         // Analyse des dires et mémoires des avocats
    | "DEPOT_RAPPORT_DEFINITIF"   // Dépôt au Greffe avec demande de taxe
    | "CLOTURE_ET_TAXE";          // Ordonnance de taxe rendue

export interface PartieLitige {
    qualite: "DEMANDEUR" | "DEFENDEUR" | "INTERVENANT";
    nomOuDenomination: string;
    conseilAvocat: string;
    adresse: string;
}

export interface DirePartie {
    id: string;
    dateReception: string;
    auteur: string;              // nom de l'avocat ou de la partie
    resumeArguments: string;
    reponseExpert: string;       // réfutation ou prise en compte par l'expert judiciaire
    impactChiffrageFCFA: number; // modification éventuelle du chiffrage
}

export interface ParametresEvaluationPrejudice {
    chiffreAffairesHistoriqueMoyenFCFA: number;
    chiffreAffairesReelConstatéFCFA: number;
    tauxMargeSurCoutVariablePourcentage: number; // ex: 35%
    dureePeriodePrejudiceMois: number;
    fraisDirectsSubisFCFA: number;
    tauxInteretLegalPourcentage: number; // ex: 6% (BCEAO / BEAC)
    dureeMoratoireAnnees: number;
}

export interface DossierExpertiseJudiciaire {
    id: string;
    tribunal: string;             // ex: "Tribunal de Commerce Hors Classe de Dakar"
    chambre: string;              // ex: "1ère Chambre Commerciale"
    numeroRG: string;             // Rôle Général
    numeroOrdonnance: string;
    dateOrdonnance: string;
    magistratOrdonnateur: string;
    expertNom: string;
    expertTitre: string;          // "Expert-comptable inscrit sur la liste des Experts Judiciaires"
    typeMission: TypeMissionJudiciaire;
    libelleLitige: string;
    parties: PartieLitige[];
    consignationInitialeFCFA: number;
    phaseActuelle: PhaseExpertise;
    dires: DirePartie[];
    heuresPassees: number;
    tauxHoraireExpertFCFA: number;
    deboursEngagesFCFA: number;
    prejudiceCalcule?: {
        gainManqueFCFA: number;
        perteSubieFCFA: number;
        interetsMoratoiresFCFA: number;
        prejudiceTotalFCFA: number;
    };
    dateDepotPrevue: string;
}

export interface RapportExpertiseGenere {
    titre: string;
    texteIntegral: string;
    montantPrejudiceRetenuFCFA: number;
    totalHonoraireEtTaxeFCFA: number;
    diresTraites: number;
    respectContradictoire: boolean;
    dateGeneration: string;
}

const fmt = (n: number) => n.toLocaleString("fr-FR").replace(/\u202F|\u00A0/g, " ");

/**
 * Calcule de façon rigoureuse le préjudice économique et commercial.
 */
export function calculerPrejudiceFinancier(params: ParametresEvaluationPrejudice) {
    const manqueAGagnerCA = Math.max(0, params.chiffreAffairesHistoriqueMoyenFCFA - params.chiffreAffairesReelConstatéFCFA);
    const gainManque = Math.round(manqueAGagnerCA * (params.tauxMargeSurCoutVariablePourcentage / 100));
    const perteSubie = Math.round(params.fraisDirectsSubisFCFA);
    const sousTotalPrejudice = gainManque + perteSubie;

    // Intérêts légaux moratoires
    const interets = Math.round(
        sousTotalPrejudice * (params.tauxInteretLegalPourcentage / 100) * params.dureeMoratoireAnnees
    );

    const total = sousTotalPrejudice + interets;

    return {
        gainManqueFCFA: gainManque,
        perteSubieFCFA: perteSubie,
        interetsMoratoiresFCFA: interets,
        prejudiceTotalFCFA: total,
    };
}

/**
 * Calcule l'état de frais et honoraires de l'expert (liquidation des dépens / demande de taxe).
 */
export function calculerEtatFraisExpertise(dossier: DossierExpertiseJudiciaire) {
    const honoraires = dossier.heuresPassees * dossier.tauxHoraireExpertFCFA;
    const totalFrais = honoraires + dossier.deboursEngagesFCFA;
    const soldeARecouvrer = totalFrais - dossier.consignationInitialeFCFA;

    return {
        honorairesFCFA: honoraires,
        deboursFCFA: dossier.deboursEngagesFCFA,
        totalTTCFCFA: totalFrais,
        consignationDejaPercueFCFA: dossier.consignationInitialeFCFA,
        soldeDemandeDeTaxeFCFA: soldeARecouvrer,
    };
}

/**
 * Rédige et compile le Rapport d'Expertise Judiciaire complet conforme aux exigences des tribunaux.
 */
export function genererRapportExpertiseJudiciaire(dossier: DossierExpertiseJudiciaire): RapportExpertiseGenere {
    const frais = calculerEtatFraisExpertise(dossier);
    const montantPrejudice = dossier.prejudiceCalcule?.prejudiceTotalFCFA || 0;

    let texteParties = "";
    for (const p of dossier.parties) {
        texteParties += `• ${p.qualite} : ${p.nomOuDenomination}, représenté(e) par Maître ${p.conseilAvocat} (${p.adresse})\n`;
    }

    let texteDires = "";
    if (dossier.dires.length === 0) {
        texteDires = "Aucun dire n'a été formulé par les parties à l'issue de la communication du document de synthèse.\n";
    } else {
        for (const [idx, d] of dossier.dires.entries()) {
            texteDires += `\n--- DIRE N° ${idx + 1} (${d.auteur} - Reçu le ${d.dateReception}) ---\n`;
            texteDires += `Argumentation des parties : ${d.resumeArguments}\n`;
            texteDires += `RÉPONSE DE L'EXPERT JUDICIAIRE : ${d.reponseExpert}\n`;
            if (d.impactChiffrageFCFA !== 0) {
                texteDires += `Incidence sur l'évaluation : ${fmt(d.impactChiffrageFCFA)} FCFA\n`;
            }
        }
    }

    const texte = `RAPPORT D'EXPERTISE JUDICIAIRE FINANCIERE ET COMPTABLE
Déposé au Greffe du : ${dossier.tribunal}
Section / Chambre : ${dossier.chambre}
Instance : N° RG ${dossier.numeroRG}
Ordonnance de désignation : N° ${dossier.numeroOrdonnance} du ${dossier.dateOrdonnance}
Magistrat délégataire : ${dossier.magistratOrdonnateur}

EXPERT JUDICIAIRE DESIGNE :
${dossier.expertNom}
${dossier.expertTitre}
Ayant prêté le serment légal devant la Cour d'Appel.

PARTIES EN CAUSE :
${texteParties}
OBJET DU LITIGE :
${dossier.libelleLitige}
Type de mission judiciaire : ${dossier.typeMission}

I. HISTORIQUE ET RESPECT DU PRINCIPE DU CONTRADICTOIRE
L'expert a scrupuleusement respecté les principes directeurs du procès civil et commercial, et en particulier le principe du contradictoire.
Les parties et leurs conseils ont été régulièrement convoqués aux réunions d'accédits tenues les dates d'usage.
Un document de synthèse provisoire a été communiqué aux conseils des parties avec un délai de 15 jours imparti pour la formulation de leurs dires éventuels.

II. EXAMEN DES PIECES ET CONSTATATIONS TECHNIQUES
L'expert a procédé à l'analyse minutieuse des livres comptables SYSCOHADA, relevés bancaires, déclarations fiscales et pièces justificatives produites par les deux parties.
Les diligences ont permis d'établir avec certitude la réalité et la consistance des flux financiers litigieux.

III. REPONSE MOTIVEE AUX DIRES DES CONSEILS
${texteDires}
IV. EVALUATION FINANCIERE DEFINITIVE ET PREJUDICE
Sur la base des constatations techniques et des méthodes financières universellement admises, les montants s'établissent comme suit :
- Perte subie (damnum emergens) : ${fmt(dossier.prejudiceCalcule?.perteSubieFCFA || 0)} FCFA
- Gain manqué (lucrum cessans) : ${fmt(dossier.prejudiceCalcule?.gainManqueFCFA || 0)} FCFA
- Intérêts moratoires légaux : ${fmt(dossier.prejudiceCalcule?.interetsMoratoiresFCFA || 0)} FCFA
TOTAL DU PREJUDICE FINANCIER RETENU : ${fmt(montantPrejudice)} FCFA

V. ETAT DE FRAIS, HONORAIRES ET DEMANDE DE TAXE
Conformément aux dispositions tarifaires judiciaires :
- Rémunération de l'expert (${dossier.heuresPassees} heures à ${fmt(dossier.tauxHoraireExpertFCFA)} FCFA/h) : ${fmt(frais.honorairesFCFA)} FCFA
- Débours et frais de déplacement justifiés : ${fmt(frais.deboursFCFA)} FCFA
TOTAL DE LA DEMANDE DE TAXE : ${fmt(frais.totalTTCFCFA)} FCFA
À déduire consignation initiale versée au Greffe : ${fmt(frais.consignationDejaPercueFCFA)} FCFA
SOLDE REVENANT A L'EXPERT : ${fmt(frais.soldeDemandeDeTaxeFCFA)} FCFA

CONCLUSION SOUMISE AU TRIBUNAL :
Telles sont les constatations de fait et les conclusions techniques, sincères et objectives, que l'expert soumet respectueusement à la justice du Tribunal.

Fait pour servir et valoir ce que de droit,
Le ${new Date().toLocaleDateString("fr-FR")}
L'Expert Judiciaire,
${dossier.expertNom}`;

    return {
        titre: `Rapport d'Expertise Judiciaire RG ${dossier.numeroRG} - ${dossier.tribunal}`,
        texteIntegral: texte,
        montantPrejudiceRetenuFCFA: montantPrejudice,
        totalHonoraireEtTaxeFCFA: frais.totalTTCFCFA,
        diresTraites: dossier.dires.length,
        respectContradictoire: true,
        dateGeneration: new Date().toISOString(),
    };
}
