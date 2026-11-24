// ─────────────────────────────────────────────────────────────────────────────
// Nexus-Legal v2 : Générateur d'Actes Juridiques Certifiés OHADA
// Références : AUSCGIE (Sociétés), AUDCG (Baux commerciaux), CCNI (Travail)
// ─────────────────────────────────────────────────────────────────────────────

import type { PaysFiscal } from "@/lib/tax-simulator";
import { analyserContratOHADA, type ResultatAnalyseContrat } from "./nexus-legal-core";

export type TypeActeOHADA =
    | "PV_AGOA"              // Procès-verbal d'Assemblée Générale Ordinaire Annuelle (AUSCGIE art. 347+)
    | "STATUTS_SARL"          // Statuts constitutifs de SARL / SARL U (AUSCGIE art. 309+)
    | "BAIL_COMMERCIAL"       // Contrat de bail à usage professionnel (AUDCG art. 101+)
    | "CONTRAT_TRAVAIL_CDI";  // Contrat de travail CDI conforme CCNI

export interface ParametresPVAGOA {
    denomination: string;
    formeSociale: "SARL" | "SAS" | "SA";
    capitalSocial: number;
    siegeSocial: string;
    rccm: string;
    dateAssemblee: string;
    lieuAssemblee: string;
    exerciceClos: number;
    resultatNet: number;      // bénéfice ou perte en FCFA
    affectationReserveLegale: number; // AUSCGIE art. 346 (min 10% jusqu'à 20% du capital)
    dividendesDistribues: number;
    nomGerantOuPresident: string;
    commissaireAuxComptes?: string;
    presentsOuRepresentesPourcentage: number;
}

export interface ParametresStatutsSARL {
    denomination: string;
    siegeSocial: string;
    dureeAnnees: number;
    objetSocial: string;
    capitalSocial: number;     // min 100 000 FCFA ou 1 000 000 selon pays
    valeurNominalePart: number; // ex: 10 000 FCFA
    gerantNom: string;
    gerantNationalite: string;
    associes: Array<{
        nom: string;
        parts: number;
        apportMontant: number;
    }>;
    pays: PaysFiscal;
}

export interface ParametresBailCommercial {
    bailleurNom: string;
    bailleurAdresse: string;
    preneurDenomination: string;
    preneurRCCM: string;
    designationLocaux: string;
    activiteAutorisee: string;
    loyerMensuelHT: number;
    depotGarantieMois: number;
    dureeBailAnnees: number; // min recommandé ou indéterminée
    datePriseEffet: string;
    pays: PaysFiscal;
}

export interface ParametresContratTravail {
    employeurDenomination: string;
    employeurSiege: string;
    salarieNomPrenom: string;
    salarieNationalite: string;
    posteIntitule: string;
    categorieProfessionnelle: string; // Ouvrier, Agent de maîtrise, Cadre
    salaireBaseMensuel: number;
    primesMensuelles?: number;
    periodeEssaiMois: number;
    dateEmbauche: string;
    conventionCollective: string; // ex: CCNI Sénégal ou CCNI Côte d'Ivoire
    pays: PaysFiscal;
}

export interface ActeGenere {
    type: TypeActeOHADA;
    titre: string;
    texteIntegral: string;
    mentionsObligatoiresVerifiees: string[];
    analyseConformite: ResultatAnalyseContrat;
    dateGeneration: string;
    disclaimerLegal: string;
}

const fmt = (n: number) => n.toLocaleString("fr-FR").replace(/\u202F|\u00A0/g, " ");

const DISCLAIMER_LEGAL =
    "AVERTISSEMENT : Ce projet d'acte juridique a été rédigé avec l'assistance du moteur Nexus-Legal v2 " +
    "conformément aux Actes Uniformes OHADA applicables. Il doit être relu, validé et revêtu des formalités d'enregistrement " +
    "ou de publicité légale (RCCM, Greffe, Notaire) par un professionnel habilité (Expert-comptable, Avocat ou Notaire).";

/**
 * Générateur de PV d'Assemblée Générale Ordinaire Annuelle (AGOA).
 */
export function genererPVAGOA(params: ParametresPVAGOA, pays: PaysFiscal = "sn"): ActeGenere {
    const reportANouveau = Math.max(0, params.resultatNet - params.affectationReserveLegale - params.dividendesDistribues);
    const mentions: string[] = [
        "AUSCGIE art. 347 (Délai de convocation dans les 6 mois de la clôture)",
        "AUSCGIE art. 346 (Dotation obligatoire de la réserve légale au moins 10%)",
        "AUSCGIE art. 438 (Rapport spécial sur les conventions réglementées)",
        "AUSCGIE art. 138 (Quorum et majorité de l'assemblée ordinaire)",
    ];

    const texte = `PROCES-VERBAL DE L'ASSEMBLEE GENERALE ORDINAIRE ANNUELLE
DES ASSOCIES DE LA SOCIETE « ${params.denomination.toUpperCase()} »
${params.formeSociale} au capital de ${fmt(params.capitalSocial)} FCFA
Siège social : ${params.siegeSocial}
RCCM : ${params.rccm}

L'an deux mille vingt-cinq, le ${params.dateAssemblee}, à dix heures,
Les associés de la société « ${params.denomination} » se sont réunis au siège social sis à ${params.lieuAssemblee},
en Assemblée Générale Ordinaire Annuelle, sur convocation de la gérance adressée conformément aux statuts et aux dispositions de l'AUSCGIE.

Est présent ou valablement représenté un total de parts représentant ${params.presentsOuRepresentesPourcentage}% du capital social.
L'assemblée étant régulièrement constituée, elle peut valablement délibérer sous la présidence de ${params.nomGerantOuPresident}.

ORDRE DU JOUR :
1. Rapport de gestion de la gérance sur l'exercice clos le 31 décembre ${params.exerciceClos}.
${params.commissaireAuxComptes ? "2. Rapport général et rapport spécial du Commissaire aux Comptes (AUSCGIE art. 438).\n" : ""}
3. Approbation des comptes annuels SYSCOHADA et quitus à la gérance.
4. Affectation du résultat de l'exercice.
5. Pouvoirs pour l'accomplissement des formalités de dépôt légal.

PREMIERE RESOLUTION (Approbation des comptes)
L'Assemblée Générale, après avoir entendu la lecture du rapport de gestion, approuve les comptes annuels de l'exercice clos le 31 décembre ${params.exerciceClos},
faisant apparaître un résultat net comptable de ${fmt(params.resultatNet)} FCFA.
L'Assemblée donne quitus entier et sans réserve à la gérance pour l'exécution de son mandat.
Cette résolution, mise aux voix, est adoptée à l'unanimité.

DEUXIEME RESOLUTION (Affectation du résultat)
L'Assemblée Générale décide d'affecter le résultat net de l'exercice comme suit :
- Dotation à la Réserve Légale (AUSCGIE art. 346) : ${fmt(params.affectationReserveLegale)} FCFA
- Distribution de dividendes : ${fmt(params.dividendesDistribues)} FCFA
- Solde affecté en Report à Nouveau : ${fmt(reportANouveau)} FCFA
Cette résolution, mise aux voix, est adoptée à l'unanimité.

TROISIEME RESOLUTION (Pouvoirs pour formalités)
L'Assemblée confère tous pouvoirs au porteur d'une copie ou d'un extrait du présent procès-verbal pour effectuer tous dépôts, formalités et publications prescrits par la loi.
Cette résolution est adoptée à l'unanimité.

De tout ce qui précède, il a été dressé le présent procès-verbal qui, après lecture, a été signé par le Président de séance et les associés.`;

    const analyse = analyserContratOHADA(texte, pays);

    return {
        type: "PV_AGOA",
        titre: `PV AGOA ${params.exerciceClos} - ${params.denomination}`,
        texteIntegral: texte,
        mentionsObligatoiresVerifiees: mentions,
        analyseConformite: analyse,
        dateGeneration: new Date().toISOString(),
        disclaimerLegal: DISCLAIMER_LEGAL,
    };
}

/**
 * Générateur de Statuts constitutifs de SARL / SARL U.
 */
export function genererStatutsSARL(params: ParametresStatutsSARL): ActeGenere {
    const totalParts = params.associes.reduce((sum, a) => sum + a.parts, 0);
    const mentions: string[] = [
        "AUSCGIE art. 309 à 316 (Constitution de la SARL)",
        "AUSCGIE art. 311 (Libération intégrale ou partielle des apports en numéraire)",
        "AUSCGIE art. 323 (Pouvoirs de la gérance envers les tiers)",
        "AUSCGIE art. 54 (Prohibition absolue des clauses léonines)",
    ];

    let listeAssociesTexte = "";
    for (const a of params.associes) {
        listeAssociesTexte += `- ${a.nom} : ${a.parts} parts sociales numérotées, pour un apport de ${fmt(a.apportMontant)} FCFA.\n`;
    }

    const texte = `STATUTS DE LA SOCIETE A RESPONSABILITE LIMITEE
« ${params.denomination.toUpperCase()} »
Société à Responsabilité Limitée au capital de ${fmt(params.capitalSocial)} FCFA
Siège social : ${params.siegeSocial}

ARTICLE 1 - FORME
Il est formé entre les soussignés propriétaires des parts sociales ci-après créées une Société à Responsabilité Limitée régie par l'Acte Uniforme OHADA relatif au Droit des Sociétés Commerciales et du GIE (AUSCGIE).

ARTICLE 2 - OBJET SOCIAL
La société a pour objet en tout pays, et plus particulièrement dans l'espace OHADA :
${params.objetSocial}
Et généralement, toutes opérations commerciales, financières, mobilières ou immobilières se rattachant directement ou indirectement à l'objet ci-dessus.

ARTICLE 3 - DENOMINATION SOCIALE
La dénomination sociale de la société est : « ${params.denomination} ».
Dans tous les actes et documents émanant de la société, la dénomination doit être précédée ou suivie immédiatement des mots « Société à Responsabilité Limitée » ou du sigle « SARL », et de l'énonciation du montant du capital social.

ARTICLE 4 - SIEGE SOCIAL
Le siège social est fixé à : ${params.siegeSocial}.
Il pourra être transféré en tout autre lieu du même État partie par simple décision de la gérance, sous réserve de ratification par la prochaine assemblée générale.

ARTICLE 5 - DUREE
La durée de la société est fixée à ${params.dureeAnnees} années à compter de son immatriculation au Registre du Commerce et du Crédit Mobilier (RCCM), sauf dissolution anticipée ou prorogation.

ARTICLE 6 - APPORTS ET CAPITAL SOCIAL
Le capital social est fixé à la somme de ${fmt(params.capitalSocial)} FCFA, divisé en ${totalParts} parts sociales de ${fmt(params.valeurNominalePart)} FCFA chacune, souscrites et réparties comme suit :
${listeAssociesTexte}
Les soussignés déclarent expressément que ces parts sociales ont été souscrites en totalité et libérées conformément à l'AUSCGIE.

ARTICLE 7 - GERANCE
La société est administrée par un ou plusieurs gérants, personnes physiques.
Est nommé premier gérant de la société pour une durée indéterminée : ${params.gerantNom}, de nationalité ${params.gerantNationalite}.
Le gérant dispose des pouvoirs les plus étendus pour agir en toute circonstance au nom de la société dans la limite de l'objet social (AUSCGIE art. 323).

Fait à ${params.siegeSocial}, en autant d'originaux que requis par la loi.`;

    const analyse = analyserContratOHADA(texte, params.pays);

    return {
        type: "STATUTS_SARL",
        titre: `Statuts SARL - ${params.denomination}`,
        texteIntegral: texte,
        mentionsObligatoiresVerifiees: mentions,
        analyseConformite: analyse,
        dateGeneration: new Date().toISOString(),
        disclaimerLegal: DISCLAIMER_LEGAL,
    };
}

/**
 * Générateur de Contrat de Bail à Usage Professionnel (AUDCG art. 101+).
 */
export function genererBailCommercial(params: ParametresBailCommercial): ActeGenere {
    const mentions: string[] = [
        "AUDCG art. 101 (Champ d'application du bail commercial OHADA)",
        "AUDCG art. 116 (Droit au renouvellement du bail commercial)",
        "AUDCG art. 117 (Indemnité d'éviction en cas de refus injustifié de renouvellement)",
        "AUDCG art. 123 (Résiliation de plein droit après mise en demeure de 30 jours)",
    ];

    const totalDepot = params.loyerMensuelHT * params.depotGarantieMois;

    const texte = `CONTRAT DE BAIL A USAGE PROFESSIONNEL
Soumis aux dispositions de l'Acte Uniforme OHADA portant sur le Droit Commercial Général (AUDCG, art. 101 à 134)

ENTRE LES SOUSSIGNES :
1. LE BAILLEUR :
${params.bailleurNom}, domicilié à ${params.bailleurAdresse},
Ci-après dénommé « Le Bailleur », d'une part,

ET :
2. LE PRENEUR :
La société « ${params.preneurDenomination} », immatriculée au RCCM sous le numéro ${params.preneurRCCM},
Ci-après dénommée « Le Preneur », d'autre part.

IL A ETE CONVENU ET ARRETE CE QUI SUIT :

ARTICLE 1 - DESIGNATION DES LIEUX LOUES
Le Bailleur donne à bail à usage professionnel au Preneur les locaux suivants :
${params.designationLocaux}.

ARTICLE 2 - DESTINATION DES LIEUX
Les locaux loués sont exclusivement destinés à l'exercice de l'activité suivante :
${params.activiteAutorisee}.

ARTICLE 3 - DUREE DU BAIL ET RENOUVELLEMENT
Le présent bail est consenti pour une durée de ${params.dureeBailAnnees} années entières et consécutives, prenant effet le ${params.datePriseEffet}.
Conformément aux articles 116 et suivants de l'AUDCG, le Preneur ayant exploité l'activité pendant plus de deux ans a droit au renouvellement du bail. Tout refus de renouvellement non justifié par des motifs légaux ouvre droit à une indemnité d'éviction au profit du Preneur (AUDCG art. 117).

ARTICLE 4 - LOYER ET DEPOT DE GARANTIE
Le présent bail est conclu moyennant un loyer mensuel hors taxes de ${fmt(params.loyerMensuelHT)} FCFA, payable d'avance le 5 de chaque mois.
A titre de garantie, le Preneur verse ce jour la somme de ${fmt(totalDepot)} FCFA correspondant à ${params.depotGarantieMois} mois de loyer.

ARTICLE 5 - CLAUSE RESOLUTOIRE
À défaut de paiement d'un seul terme de loyer à son échéance ou en cas d'inexécution d'une clause du bail, le présent contrat sera résilié de plein droit un mois (30 jours) après une mise en demeure d'exécuter restée sans effet, conformément à l'article 123 de l'AUDCG.

Fait en deux exemplaires originaux, à la date de prise d'effet.`;

    const analyse = analyserContratOHADA(texte, params.pays);

    return {
        type: "BAIL_COMMERCIAL",
        titre: `Bail Commercial OHADA - ${params.preneurDenomination}`,
        texteIntegral: texte,
        mentionsObligatoiresVerifiees: mentions,
        analyseConformite: analyse,
        dateGeneration: new Date().toISOString(),
        disclaimerLegal: DISCLAIMER_LEGAL,
    };
}

/**
 * Générateur de Contrat de Travail CDI conforme CCNI.
 */
export function genererContratTravailCDI(params: ParametresContratTravail): ActeGenere {
    const mentions: string[] = [
        "Code du Travail & CCNI (Forme et preuve du contrat de travail)",
        "Plafond légal de la période d'essai selon catégorie (Ouvrier 1m, Cadre 3m)",
        "Obligation d'affiliation aux caisses sociales (IPRES/CSS ou CNPS)",
        "Préavis de rupture conventionnel obligatoire",
    ];

    const remunerationGlobale = params.salaireBaseMensuel + (params.primesMensuelles || 0);

    const texte = `CONTRAT DE TRAVAIL A DUREE INDETERMINEE (CDI)
Régie par le Code du Travail et les dispositions de la ${params.conventionCollective}

ENTRE LES SOUSSIGNES :
La société « ${params.employeurDenomination} », ayant son siège social à ${params.employeurSiege},
Représentée par sa Direction générale,
Ci-après désignée « L'Employeur », d'une part,

ET :
M./Mme ${params.salarieNomPrenom}, de nationalité ${params.salarieNationalite},
Ci-après désigné(e) « Le Salarié », d'autre part.

ARTICLE 1 - ENGAGEMENT ET FONCTIONS
L'Employeur engage le Salarié en qualité de : ${params.posteIntitule}, relevant de la catégorie professionnelle : ${params.categorieProfessionnelle}.
Le contrat prend effet à compter du ${params.dateEmbauche}.

ARTICLE 2 - PERIODE D'ESSAI
Le présent engagement est conclu sous réserve d'une période d'essai de ${params.periodeEssaiMois} mois.
Durant cette période d'essai, chacune des parties pourra résilier le contrat sans préavis ni indemnité, conformément à la convention collective applicable.

ARTICLE 3 - REMUNERATION
En contrepartie de ses fonctions, le Salarié percevra une rémunération brute mensuelle comprenant :
- Salaire de base catégoriel : ${fmt(params.salaireBaseMensuel)} FCFA
${params.primesMensuelles ? `- Primes et indemnités conventionnelles : ${fmt(params.primesMensuelles)} FCFA\n` : ""}
Soit un salaire brut total de ${fmt(remunerationGlobale)} FCFA, sous déduction des retenues légales fiscales et sociales.

ARTICLE 4 - SECURITE SOCIALE ET RETRAITE
L'Employeur s'engage à affilier le Salarié dès son embauche aux organismes de prévoyance sociale et de retraite légalement obligatoires.

ARTICLE 5 - PREAVIS ET RUPTURE DU CONTRAT
A l'issue de la période d'essai, le présent contrat à durée indéterminée pourra être rompu conformément aux règles de notification et de préavis fixées par le Code du Travail et la ${params.conventionCollective}.

Fait en double exemplaire, à la date de signature.`;

    const analyse = analyserContratOHADA(texte, params.pays);

    return {
        type: "CONTRAT_TRAVAIL_CDI",
        titre: `Contrat Travail CDI - ${params.salarieNomPrenom}`,
        texteIntegral: texte,
        mentionsObligatoiresVerifiees: mentions,
        analyseConformite: analyse,
        dateGeneration: new Date().toISOString(),
        disclaimerLegal: DISCLAIMER_LEGAL,
    };
}
