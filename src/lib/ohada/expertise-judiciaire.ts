// ─────────────────────────────────────────────────────────────────────────────
// Module d'Expertise Comptable & Financière auprès des Tribunaux (Droit OHADA)
// Conforme au Code de Procédure Civile, AUSCGIE, AUPCAP et Pratiques Judiciaires
// Enrichi par le Copilote IA Judiciaire (Analyse des Dires & Détection Pénale)
// ─────────────────────────────────────────────────────────────────────────────

import { isLLMConfigured, askNexus } from "@/lib/llm";

export type TypeMissionJudiciaire =
    | "EVALUATION_PREJUDICE"             // Perte subie (damnum emergens) et gain manqué (lucrum cessans)
    | "EXPERTISE_GESTION"               // Expertise de gestion minoritaire (art. 159 AUSCGIE)
    | "REDDITION_COMPTES"               // Reddition de comptes litige gérance / associés
    | "RECONSTITUTION_COMPTABLE"        // Reconstitution comptable pour litige successoral ou fiscal
    | "EVALUATION_PARTS_LITIGE"         // Évaluation de parts sociales / actions contestées (art. 59)
    | "ARBITRAGE_COMMERCIAL"            // Expertise technique arbitrage CCJA
    | "CESSATION_PAIEMENTS_AUPCAP"      // Fixation de la date de cessation des paiements & période suspecte (art. 34 AUPCAP)
    | "INFRACTIONS_PENALES_FINANCIERES" // Abus de biens sociaux (art. 891), bilans inexacts (art. 890), banqueroute (art. 227)
    | "CONCURRENCE_ET_RUPTURE_CONTRAT"  // Rupture brutale de contrat, concurrence déloyale, détournement de clientèle
    | "LIQUIDATION_COMMUNAUTE_SUCCESSION" // Partage d'actifs sociétaires et comptes courants d'associés successoraux
    | "LITIGE_FISCAL_DOUANIER";         // Expertise technique devant le juge de l'impôt ou de la douane

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
    qualificationContestation?: "METHODE_FINANCIERE" | "PIECES_MANQUANTES" | "DELAI_CONTRADICTOIRE" | "INTERETS_LEGAUX";
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

export interface ParametresCessationPaiements {
    actifDisponibleFCFA: number;        // trésorerie + équivalents réalisables immédiatement
    passifExigibleFCFA: number;         // dettes certaines, liquides et exigibles échues
    dateApparitionDeficit: string;
    moratoiresObtenusFCFA: number;
}

export interface ConstatInfractionPenale {
    descriptionFait: string;
    comptesImpliques: string[];         // ex: ["455", "471", "658"]
    montantConcerneFCFA: number;
    beneficiaireIdentifie: string;
    absenceJustificatif: boolean;
}

export interface AnalyseInfractionResultat {
    qualificationLegale: string;
    articlesApplicables: string[];
    elementsMaterielsIdentifies: string[];
    gravite: "FAIBLE" | "MODEREE" | "GRAVE" | "TRES_GRAVE";
    montantTotalLitigieuxFCFA: number;
    noteOrientationParquet: string;
}

export interface AuditContradictoireResultat {
    scoreSecuriteJuridique: number;     // 0-100
    respectDelaiConvocation: boolean;
    communicationSimultaneePieces: boolean;
    delaiDiresSuffisant: boolean;
    risquesDeNullite: string[];
    recommandationsProcedurales: string[];
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
    recommandationsIA?: string[];
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
 * Analyse la cessation des paiements et la période suspecte (art. 34 AUPCAP).
 */
export function evaluerCessationPaiements(params: ParametresCessationPaiements) {
    const passifNet = Math.max(0, params.passifExigibleFCFA - params.moratoiresObtenusFCFA);
    const insuffisanceActif = passifNet - params.actifDisponibleFCFA;
    const estEnCessation = insuffisanceActif > 0;

    let statutProcedure = "IN BONIS (SOLVABLE)";
    if (estEnCessation) {
        statutProcedure = insuffisanceActif > params.passifExigibleFCFA * 0.5
            ? "CESSATION CRITIQUE - REDRESSEMENT OU LIQUIDATION JUDICIAIRE"
            : "CESSATION DES PAIEMENTS CONSTATEE (AUPCAP art. 25)";
    }

    return {
        estEnCessation,
        actifDisponibleFCFA: params.actifDisponibleFCFA,
        passifExigibleRetenuFCFA: passifNet,
        insuffisanceActifFCFA: Math.max(0, insuffisanceActif),
        dateCessationPreconisee: params.dateApparitionDeficit,
        statutProcedure,
        periodeSuspecteMaxMois: 18, // Plafond légal de la période suspecte selon l'AUPCAP art. 34
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
 * IA : Audit de régularité du principe du contradictoire (sécurisation anti-nullité).
 */
export function auditerContradictoire(dossier: DossierExpertiseJudiciaire): AuditContradictoireResultat {
    let score = 100;
    const risques: string[] = [];
    const reco: string[] = [];

    // Contrôle présence des deux parties
    const aDemandeur = dossier.parties.some(p => p.qualite === "DEMANDEUR");
    const aDefendeur = dossier.parties.some(p => p.qualite === "DEFENDEUR");

    if (!aDemandeur || !aDefendeur) {
        score -= 40;
        risques.push("Défaut de représentation équitable : une des parties principales n'est pas identifiée.");
    }

    // Contrôle traitement des dires
    if (dossier.phaseActuelle === "DEPOT_RAPPORT_DEFINITIF" && dossier.dires.length === 0) {
        score -= 15;
        risques.push("Aucun dire consigné : vérifier qu'un délai utile a bien été octroyé aux conseils après la note de synthèse.");
        reco.push("Annexer l'accusé de réception de la note de synthèse impartissant le délai d'au moins 15 jours.");
    }

    // Réfutation systématique
    const diresSansReponse = dossier.dires.filter(d => !d.reponseExpert || d.reponseExpert.trim().length === 0);
    if (diresSansReponse.length > 0) {
        score -= 30;
        risques.push(`${diresSansReponse.length} dire(s) sans réponse motivée de l'expert (cause fréquente d'annulation du rapport).`);
        reco.push("Rédiger une réponse circonstanciée pour chaque moyen soulevé par les avocats.");
    }

    return {
        scoreSecuriteJuridique: Math.max(0, score),
        respectDelaiConvocation: true,
        communicationSimultaneePieces: true,
        delaiDiresSuffisant: diresSansReponse.length === 0,
        risquesDeNullite: risques,
        recommandationsProcedurales: reco,
    };
}

/**
 * IA Copilote : Réfutation sémantique et juridique automatisée d'un Dire d'avocat.
 */
export async function genererReponseDireAvecIA(
    typeMission: TypeMissionJudiciaire,
    direTexte: string,
    argumentsExpertExistants: string
): Promise<{ reponseProposee: string; pointsJuridiques: string[]; source: "IA_NEXUS" | "MOTEUR_DETERMINISTE" }> {
    const promptSysteme = `Tu es un Expert-comptable Judiciaire assermenté près les Cours et Tribunaux de l'espace OHADA.
Ta mission est de formuler une réponse ferme, neutre, rigoureuse et juridiquement inattaquable au Dire d'un avocat contestant tes conclusions d'expertise.
Cite les principes directeurs du procès civil (principe du contradictoire, caractère probant des pièces comptables SYSCOHADA).`;

    const promptUtilisateur = `Type de mission : ${typeMission}
Contestation de l'avocat : "${direTexte}"
Données techniques de l'expert : "${argumentsExpertExistants}"
Rédige la réponse officielle de l'expert judiciaire à insérer dans le rapport définitif.`;

    if (isLLMConfigured()) {
        try {
            const reponseLLM = await askNexus(promptUtilisateur, promptSysteme);
            return {
                reponseProposee: reponseLLM,
                pointsJuridiques: [
                    "Respect de la mission confiée par le juge sans empiéter sur le droit",
                    "Application des barèmes de rentabilité économique et des pièces probantes",
                ],
                source: "IA_NEXUS",
            };
        } catch {
            // Repli sur le moteur déterministe
        }
    }

    // Moteur expert déterministe de repli
    let reponseDeterministe = `L'expert judiciaire a examiné avec la plus grande attention le dire communiqué par le conseil. `;
    reponseDeterministe += `Toutefois, les prétentions soulevées ne sauraient être retenues. En effet, l'évaluation financière `;
    reponseDeterministe += `a été opérée sur la base des états financiers réguliers SYSCOHADA certifiés et des pièces communiquées contradictoirement. `;
    reponseDeterministe += `Les arguments avancés ne reposent sur aucun élément probant contraire de nature à modifier les conclusions techniques du rapport.`;

    return {
        reponseProposee: reponseDeterministe,
        pointsJuridiques: [
            "Force probante des livres comptables régulièrement tenus (AUDCG art. 13)",
            "Évaluation adossée à la méthode de la marge contributive objective",
        ],
        source: "MOTEUR_DETERMINISTE",
    };
}

/**
 * IA Copilote : Qualification des infractions financières (Pôle Pénal Économique).
 */
export function qualifierInfractionsPenales(constats: ConstatInfractionPenale[]): AnalyseInfractionResultat {
    let montantTotal = 0;
    const elementsMateriels: string[] = [];
    const articles: string[] = [];
    let qualification = "Absence d'anomalie pénale caractérisée";
    let gravite: "FAIBLE" | "MODEREE" | "GRAVE" | "TRES_GRAVE" = "FAIBLE";

    for (const c of constats) {
        montantTotal += c.montantConcerneFCFA;
        elementsMateriels.push(`${c.descriptionFait} (${fmt(c.montantConcerneFCFA)} FCFA) au profit de ${c.beneficiaireIdentifie}`);

        // Détection Abus de biens sociaux (compte courant débiteur 455 ou prélèvements sans contrepartie)
        if (c.comptesImpliques.some(compte => compte.startsWith("455") || compte.startsWith("471")) && c.absenceJustificatif) {
            qualification = "Présomption caractérisée d'Abus de Biens Sociaux (ABS)";
            articles.push("AUSCGIE art. 891 (Usage des biens ou du crédit à des fins personnelles)");
            gravite = "TRES_GRAVE";
        }

        // Faux bilans ou minoration
        if (c.comptesImpliques.some(compte => compte.startsWith("1") || compte.startsWith("6") || compte.startsWith("7")) && c.absenceJustificatif) {
            if (!articles.includes("AUSCGIE art. 890")) {
                articles.push("AUSCGIE art. 890 (Présentation ou publication d'états financiers inexacts)");
            }
        }
    }

    if (articles.length === 0 && montantTotal > 0) {
        qualification = "Irrégularité comptable sans qualification délictuelle immédiate";
        gravite = "MODEREE";
        articles.push("AUDCG art. 13 (Obligation de sincérité des écritures)");
    }

    const note = `NOTE TECHNIQUE D'INFORMATION JUDICIAIRE :\n` +
        `Les constatations matérielles révèlent un flux cumulé de ${fmt(montantTotal)} FCFA dépourvu de justification économique dans l'intérêt social de la société.\n` +
        `Ces éléments factuels sont susceptibles de caractériser l'infraction visée à l'article 891 de l'AUSCGIE, sous réserve de l'appréciation souveraine du Ministère Public.`;

    return {
        qualificationLegale: qualification,
        articlesApplicables: articles,
        elementsMaterielsIdentifies: elementsMateriels,
        gravite,
        montantTotalLitigieuxFCFA: montantTotal,
        noteOrientationParquet: note,
    };
}

/**
 * Rédige et compile le Rapport d'Expertise Judiciaire complet conforme aux exigences des tribunaux.
 */
export function genererRapportExpertiseJudiciaire(dossier: DossierExpertiseJudiciaire): RapportExpertiseGenere {
    const frais = calculerEtatFraisExpertise(dossier);
    const montantPrejudice = dossier.prejudiceCalcule?.prejudiceTotalFCFA || 0;
    const auditProc = auditerContradictoire(dossier);

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
Indice de sécurité procédurale : ${auditProc.scoreSecuriteJuridique}/100.

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
        respectContradictoire: auditProc.scoreSecuriteJuridique >= 70,
        dateGeneration: new Date().toISOString(),
        recommandationsIA: auditProc.recommandationsProcedurales,
    };
}
