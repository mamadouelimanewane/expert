// ─────────────────────────────────────────────────────────────────────────────
// Moteur de Secrétariat Juridique & Assemblées Générales (AUSCGIE OHADA)
// Calcul de la réserve légale 20%, dividendes, conventions réglementées et PV d'AGOA
// ─────────────────────────────────────────────────────────────────────────────

import type { PaysFiscal } from "@/lib/tax-simulator";

export type FormeJuridiqueOHADA = "SARL" | "SAS" | "SA" | "SNC" | "GIE";

export interface DonneesSocieteAG {
    raisonSociale: string;
    formeJuridique: FormeJuridiqueOHADA;
    capitalSocial: number;
    valeurNominaleTitre: number;
    nombreTitres: number;
    rccm: string;
    identifiantFiscal: string; // NINEA / IFU
    siegeSocial: string;
    ville: string;
    pays: PaysFiscal;
    dirigeantNom: string;
    dirigeantQualite: string; // "Gérant", "Directeur Général", "Président de SAS"
    commissaireAuxComptesNom?: string;
}

export interface DonneesFinancieresAG {
    exercice: number;
    dateAssemblee: string;
    resultatNetExercice: number; // Bénéfice (>0) ou Perte (<0)
    reportANouveauExistant: number; // Positif (bénéfice reporté) ou Négatif (pertes antérieures)
    reserveLegaleExistante: number;
    reservesStatutairesOuFacultatives?: number;
    dividendeProposeParTitre?: number;
}

export interface ConventionReglementee {
    id: string;
    personneConcernee: string;
    qualite: string; // Associé >10%, Gérant, Administrateur
    natureConvention: string;
    dateAutorisationPrealable?: string;
    montantOuEngagement: number;
    interetPourSociete: string;
}

export interface ResultatAffectation {
    capitalSocial: number;
    plafondReserveLegale20Pct: number; // 20% du capital social (AUSCGIE art. 346)
    dotationReserveLegaleRequise: number; // 10% du bénéfice jusqu'au plafond
    nouvelleReserveLegale: number;
    pertesAnterieuresApurees: number;
    beneficeDistribuable: number;
    dividendeTotalBrut: number;
    tauxIRVM: number; // Retenue à la source sur dividendes
    retenueIRVMTotal: number;
    dividendeNetTotal: number;
    dividendeNetParTitre: number;
    soldeReportANouveauFinal: number;
}

export interface ResolutionAG {
    numero: number;
    titre: string;
    texte: string;
    type: "ORDINAIRE" | "EXTRAORDINAIRE";
}

export interface LiasseAGOA {
    societe: DonneesSocieteAG;
    financier: DonneesFinancieresAG;
    affectation: ResultatAffectation;
    resolutions: ResolutionAG[];
    rapportSpecialConventions?: string;
    pvCompletAssemblee: string;
    formalitesDepotGreffe: {
        delaiMois: number; // 1 mois après l'AG (AUSCGIE art. 548)
        dateLimiteDepot: string;
        piecesRequises: string[];
    };
}

/**
 * Taux d'impôt sur le revenu des valeurs mobilières (IRVM / BRS dividende) par pays.
 */
export const TAUX_IRVM_PAR_PAYS: Record<PaysFiscal, number> = {
    sn: 0.10, // 10 % Sénégal (CGI art. 195)
    ci: 0.15, // 15 % Côte d'Ivoire (CGI art. 165)
    cm: 0.165,// 16.5 % Cameroun (15% + 10% CAC)
    bj: 0.10, // 10 % Bénin pour sociétés cotées ou 15% standard
};

/**
 * Calcule l'affectation légale du résultat conforme à l'article 346 de l'AUSCGIE.
 */
export function calculerAffectationResultat(
    societe: DonneesSocieteAG,
    financier: DonneesFinancieresAG
): ResultatAffectation {
    const plafondReserveLegale = Math.round(societe.capitalSocial * 0.20);
    const restePourPlafond = Math.max(0, plafondReserveLegale - financier.reserveLegaleExistante);

    let dotationReserveLegale = 0;
    let pertesApurees = 0;
    let baseDistribution = 0;

    if (financier.resultatNetExercice > 0) {
        // En cas de bénéfice net, dotation de 10% minimum à la réserve légale
        const dotationTheorique10Pct = Math.round(financier.resultatNetExercice * 0.10);
        dotationReserveLegale = Math.min(dotationTheorique10Pct, restePourPlafond);

        // Apurement des pertes antérieures prioritaires
        const resultatApresReserve = financier.resultatNetExercice - dotationReserveLegale;
        if (financier.reportANouveauExistant < 0) {
            const perteAbsolue = Math.abs(financier.reportANouveauExistant);
            pertesApurees = Math.min(resultatApresReserve, perteAbsolue);
            baseDistribution = resultatApresReserve - pertesApurees;
        } else {
            baseDistribution = resultatApresReserve + financier.reportANouveauExistant;
        }
    } else {
        // En cas de perte, pas de réserve légale
        baseDistribution = 0;
    }

    const nouvelleReserveLegale = financier.reserveLegaleExistante + dotationReserveLegale;

    // Calcul des dividendes proposés
    let dividendeTotalBrut = 0;
    if (financier.dividendeProposeParTitre && financier.dividendeProposeParTitre > 0) {
        dividendeTotalBrut = Math.min(
            baseDistribution,
            Math.round(financier.dividendeProposeParTitre * societe.nombreTitres)
        );
    } else if (baseDistribution > 0 && financier.resultatNetExercice > 0) {
        // Par défaut 50% du distribuable si non précisé
        dividendeTotalBrut = Math.round(baseDistribution * 0.50);
    }

    const soldeReportANouveauFinal =
        financier.resultatNetExercice > 0
            ? baseDistribution - dividendeTotalBrut
            : financier.reportANouveauExistant + financier.resultatNetExercice;

    const tauxIRVM = TAUX_IRVM_PAR_PAYS[societe.pays] || 0.10;
    const retenueIRVMTotal = Math.round(dividendeTotalBrut * tauxIRVM);
    const dividendeNetTotal = dividendeTotalBrut - retenueIRVMTotal;
    const dividendeNetParTitre = societe.nombreTitres > 0 ? Math.round((dividendeNetTotal / societe.nombreTitres) * 100) / 100 : 0;

    return {
        capitalSocial: societe.capitalSocial,
        plafondReserveLegale20Pct: plafondReserveLegale,
        dotationReserveLegaleRequise: dotationReserveLegale,
        nouvelleReserveLegale,
        pertesAnterieuresApurees: pertesApurees,
        beneficeDistribuable: Math.max(0, baseDistribution),
        dividendeTotalBrut,
        tauxIRVM,
        retenueIRVMTotal,
        dividendeNetTotal,
        dividendeNetParTitre,
        soldeReportANouveauFinal,
    };
}

/**
 * Génère la liasse juridique d'AG complète : Résolutions, Rapport Spécial et PV d'AGOA.
 */
export function genererLiasseAGOA(
    societe: DonneesSocieteAG,
    financier: DonneesFinancieresAG,
    conventions: ConventionReglementee[] = []
): LiasseAGOA {
    const affectation = calculerAffectationResultat(societe, financier);

    // Calcul de la date limite de dépôt au greffe : date AG + 30 jours (AUSCGIE art. 548)
    const dateAg = new Date(financier.dateAssemblee);
    const dateLimite = new Date(dateAg.getTime() + 30 * 86400000);
    const dateLimiteStr = dateLimite.toISOString().slice(0, 10);

    // Résolutions d'AGOA
    const resolutions: ResolutionAG[] = [
        {
            numero: 1,
            titre: "Approbation des comptes annuels et quitus aux dirigeants",
            texte: `L'Assemblée Générale, après avoir entendu la lecture du rapport de gestion de la direction générale et pris connaissance des états financiers de synthèse SYSCOHADA de l'exercice clos le 31 décembre ${financier.exercice}, approuve lesdits comptes tels qu'ils ont été présentés, ainsi que les opérations traduites dans ces comptes et résumées dans ces rapports. En conséquence, l'Assemblée Générale donne au ${societe.dirigeantQualite}, M./Mme ${societe.dirigeantNom}, quitus entier, définitif et sans réserve de sa gestion pour l'exercice écoulé.`,
            type: "ORDINAIRE",
        },
        {
            numero: 2,
            titre: "Affectation du résultat de l'exercice",
            texte:
                financier.resultatNetExercice > 0
                    ? `L'Assemblée Générale constate que l'exercice se solde par un bénéfice net comptable de ${financier.resultatNetExercice.toLocaleString("fr-FR")} FCFA. Sur proposition de la direction, l'Assemblée décide d'affecter ce bénéfice de la manière suivante :\n` +
                      `- Dotation obligatoire à la réserve légale (art. 346 AUSCGIE) : ${affectation.dotationReserveLegaleRequise.toLocaleString("fr-FR")} FCFA (la portant à ${affectation.nouvelleReserveLegale.toLocaleString("fr-FR")} FCFA);\n` +
                      (affectation.pertesAnterieuresApurees > 0 ? `- Apurement des pertes antérieures : ${affectation.pertesAnterieuresApurees.toLocaleString("fr-FR")} FCFA;\n` : "") +
                      `- Distribution de dividendes bruts : ${affectation.dividendeTotalBrut.toLocaleString("fr-FR")} FCFA (soit ${(affectation.dividendeTotalBrut / societe.nombreTitres).toFixed(2)} FCFA par titre, net de retenue IRVM de ${(affectation.tauxIRVM * 100).toFixed(0)} % soit ${affectation.dividendeNetParTitre.toLocaleString("fr-FR")} FCFA net) ;\n` +
                      `- Solde affecté au Report à Nouveau : ${affectation.soldeReportANouveauFinal.toLocaleString("fr-FR")} FCFA.`
                    : `L'Assemblée Générale constate que l'exercice se solde par une perte nette comptable de ${Math.abs(financier.resultatNetExercice).toLocaleString("fr-FR")} FCFA. L'Assemblée décide d'inscrire cette perte en totalité au compte Report à Nouveau débiteur, portant son solde à ${affectation.soldeReportANouveauFinal.toLocaleString("fr-FR")} FCFA.`,
            type: "ORDINAIRE",
        },
        {
            numero: 3,
            titre: "Examen des conventions réglementées",
            texte:
                conventions.length > 0
                    ? `L'Assemblée Générale, statuant sur le rapport spécial relatif aux conventions visées aux articles 350 et suivants (ou 438 et suivants) de l'Acte Uniforme OHADA, prend acte des conventions conclues ou poursuivies au cours de l'exercice et approuve expressément chacune d'elles.`
                    : `L'Assemblée Générale constate qu'aucune convention nouvelle entrant dans le champ d'application de l'article 350 (ou 438) de l'Acte Uniforme OHADA n'a été conclue au cours de l'exercice écoulé.`,
            type: "ORDINAIRE",
        },
        {
            numero: 4,
            titre: "Pouvoirs pour l'accomplissement des formalités de dépôt",
            texte: `L'Assemblée Générale donne tous pouvoirs au porteur d'une copie ou d'un extrait du présent procès-verbal pour effectuer tous dépôts, formalités et publications prescrits par l'Acte Uniforme OHADA auprès du greffe du Tribunal de Commerce chargé du RCCM.`,
            type: "ORDINAIRE",
        },
    ];

    // Rapport Spécial des conventions
    let rapportSpecialConventions: string | undefined;
    if (conventions.length > 0) {
        rapportSpecialConventions =
            `RAPPORT SPÉCIAL SUR LES CONVENTIONS RÉGLEMENTÉES\n` +
            `Exercice clos le 31 décembre ${financier.exercice}\n` +
            `Société : ${societe.raisonSociale} (${societe.formeJuridique})\n\n` +
            `Mesdames, Messieurs les Associés / Actionnaires,\n\n` +
            `En application des dispositions de l'Acte Uniforme révisé relatif au droit des sociétés commerciales et du GIE, nous vous présentons notre rapport sur les conventions intervenues directement ou par personne interposée entre la société et ses dirigeants ou associés disposant d'une fraction des droits de vote supérieure à 10 % :\n\n` +
            conventions
                .map(
                    (c, i) =>
                        `${i + 1}. Convention avec M./Mme ${c.personneConcernee} (${c.qualite}) :\n` +
                        `   • Nature : ${c.natureConvention}\n` +
                        `   • Montant ou engagement : ${c.montantOuEngagement.toLocaleString("fr-FR")} FCFA\n` +
                        `   • Justification économique : ${c.interetPourSociete}`
                )
                .join("\n\n") +
            `\n\nFait à ${societe.ville}, le ${financier.dateAssemblee}\nLa Direction Générale.`;
    }

    // PV Complet
    const pvCompletAssemblee =
        `RÉPUBLIQUE DU ${societe.pays.toUpperCase()}\n` +
        `TRIBUNAL DE COMMERCE - REGISTRE DU COMMERCE ET DU CRÉDIT MOBILIER\n\n` +
        `PROCÈS-VERBAL DE L'ASSEMBLÉE GÉNÉRALE ORDINAIRE ANNUELLE\n` +
        `DE LA SOCIÉTÉ "${societe.raisonSociale.toUpperCase()}"\n` +
        `${societe.formeJuridique} au capital de ${societe.capitalSocial.toLocaleString("fr-FR")} FCFA\n` +
        `Siège social : ${societe.siegeSocial}, ${societe.ville}\n` +
        `RCCM : ${societe.rccm} | NINEA/IFU : ${societe.identifiantFiscal}\n\n` +
        `L'an ${new Date(financier.dateAssemblee).getFullYear()} et le ${new Date(financier.dateAssemblee).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })},\n` +
        `les associés/actionnaires de la société se sont réunis au siège social en Assemblée Générale Ordinaire Annuelle, sur convocation régulière de la direction.\n\n` +
        `ORDRE DU JOUR :\n` +
        resolutions.map((r) => `${r.numero}. ${r.titre}`).join("\n") +
        `\n\nDÉLIBÉRATIONS ET RÉSOLUTIONS ADOPTÉES :\n\n` +
        resolutions.map((r) => `--- RÉSOLUTION N° ${r.numero} ---\n${r.texte}`).join("\n\n") +
        `\n\nPlus rien n'étant à l'ordre du jour, la séance est levée.\nDe tout ce qui précède, il a été dressé le présent procès-verbal.\n\n` +
        `Le ${societe.dirigeantQualite} : ${societe.dirigeantNom}\n` +
        `Signatures des associés présents ou représentés.`;

    return {
        societe,
        financier,
        affectation,
        resolutions,
        rapportSpecialConventions,
        pvCompletAssemblee,
        formalitesDepotGreffe: {
            delaiMois: 1,
            dateLimiteDepot: dateLimiteStr,
            piecesRequises: [
                "1 expédition du procès-verbal de l'Assemblée Générale approuvant les comptes",
                "1 exemplaire des états financiers de synthèse SYSCOHADA (Bilan, Compte de résultat, TFT, Notes annexes)",
                "1 exemplaire du rapport de gestion des dirigeants",
                "Rapport du commissaire aux comptes (le cas échéant)",
                "Quittance de paiement des droits de greffe RCCM",
            ],
        },
    };
}
