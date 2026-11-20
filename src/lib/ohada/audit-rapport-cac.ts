// ─────────────────────────────────────────────────────────────────────────────
// Générateur de Rapports de Commissariat aux Comptes (ISA 700 / 705 / 706 & AUSCGIE)
// Rapport Général sur les Comptes Annuels & Rapport Spécial Conventions Réglementées
// ─────────────────────────────────────────────────────────────────────────────

export type OpinionCAC = "CERTIFICATION_SANS_RESERVE" | "CERTIFICATION_AVEC_RESERVES" | "REFUS_DE_CERTIFIER" | "IMPOSSIBILITE_DE_CONCLURE";

export interface KeyAuditMatter {
  titre: string;
  risqueIdentifie: string;
  reponseAuditApportee: string;
}

export interface ReserveAudit {
  titre: string;
  motif: string;
  incidenceChiffree?: number;
  compteSYSCOHADA?: string;
}

export interface DonneesRapportCAC {
  societe: {
    denomination: string;
    formeJuridique: string;
    rccm: string;
    siegeSocial: string;
    capitalSocial: number;
  };
  exerciceClos: string; // ex: "31 décembre 2025"
  chiffreAffaires: number;
  resultatNet: number;
  totalBilan: number;
  opinion: OpinionCAC;
  reserves: ReserveAudit[];
  pointsClesAudit: KeyAuditMatter[];
  conventionsReglementeesMentionnees: Array<{
    beneficiaire: string;
    natureConvention: string;
    montantExercice: number;
    autorisationPrealableConseil: boolean;
  }>;
  cabinet: {
    denomination: string;
    ville: string;
    associeSignataire: string;
    ordreNational: string; // ex: "ONECCA Sénégal" ou "OEC Côte d'Ivoire"
  };
  dateRapport: string;
}

export interface RapportCACResult {
  opinionRetenue: OpinionCAC;
  rapportGeneralTexte: string;
  rapportSpecialConventionsTexte: string;
  syntheseOpinion: string;
  referencesLegales: string[];
}

/**
 * Génère le rapport général et le rapport spécial de CAC conformes aux normes ISA et à l'AUSCGIE.
 */
export function genererRapportsCAC(donnees: DonneesRapportCAC): RapportCACResult {
  const f = (n: number) => n.toLocaleString("fr-FR").replace(/\u202F|\u00A0/g, " ") + " F CFA";

  // 1. Libellé de l'opinion (ISA 700 / 705)
  let libelleOpinion = "";
  let syntheseOpinion = "";

  switch (donnees.opinion) {
    case "CERTIFICATION_SANS_RESERVE":
      libelleOpinion = `À notre avis, les états financiers de synthèse ci-joints sont réguliers et sincères et donnent une image fidèle du résultat des opérations de l'exercice écoulé ainsi que de la situation financière et du patrimoine de la société ${donnees.societe.denomination} à la fin de cet exercice, conformément aux règles du Système Comptable OHADA (SYSCOHADA).`;
      syntheseOpinion = "Certification pure et simple sans réserve.";
      break;

    case "CERTIFICATION_AVEC_RESERVES":
      libelleOpinion = `À notre avis, à l'exception de l'incidence des faits décrits dans la section « Fondement de l'opinion avec réserves », les états financiers de synthèse ci-joints donnent une image fidèle du résultat et de la situation financière de la société ${donnees.societe.denomination}, conformément au SYSCOHADA.`;
      syntheseOpinion = `Certification assortie de ${donnees.reserves.length} réserve(s).`;
      break;

    case "REFUS_DE_CERTIFIER":
      libelleOpinion = `En raison de la gravité des faits décrits dans la section « Fondement du refus de certifier », nous formulons une opinion défavorable (refus de certifier) et estimons que les états financiers ne donnent pas une image fidèle de la situation patrimoniale de la société.`;
      syntheseOpinion = "Refus de certifier pour désaccord profond sur les comptes.";
      break;

    case "IMPOSSIBILITE_DE_CONCLURE":
      libelleOpinion = `En raison de l'impossibilité d'obtenir des éléments probants suffisants et appropriés, nous ne sommes pas en mesure d'exprimer une opinion sur les états financiers annuels.`;
      syntheseOpinion = "Impossibilité d'exprimer une opinion (limitation d'étendue majeure).";
      break;
  }

  // Section des réserves (si applicables)
  const texteReserves =
    donnees.reserves.length > 0
      ? `\nFONDEMENT DE L'OPINION AVEC RÉSERVES (OU DU REFUS) :\n` +
        donnees.reserves
          .map(
            (r, i) =>
              `${i + 1}. ${r.titre} : ${r.motif}${r.incidenceChiffree ? ` (Incidence estimée sur le résultat : ${f(r.incidenceChiffree)})` : ""}`
          )
          .join("\n") +
        "\n"
      : "";

  // Section des points clés de l'audit (ISA 701)
  const texteKAM =
    donnees.pointsClesAudit.length > 0
      ? `\nJUSTIFICATION DES APPRÉCIATIONS (POINTS CLÉS DE L'AUDIT - ISA 701) :\n` +
        donnees.pointsClesAudit
          .map(
            (k, i) =>
              `• Point clé ${i + 1} : ${k.titre}\n  - Risque d'audit : ${k.risqueIdentifie}\n  - Procédures mises en œuvre : ${k.reponseAuditApportee}`
          )
          .join("\n\n") +
        "\n"
      : "";

  // RAPPORT GÉNÉRAL COMPLET
  const rapportGeneralTexte = `RAPPORT DU COMMISSAIRE AUX COMPTES SUR LES ÉTATS FINANCIERS DE SYNTHÈSE
EXERCICE CLOS LE ${donnees.exerciceClos.toUpperCase()}

À l'Assemblée Générale Ordinaire des Actionnaires / Associés de la société ${donnees.societe.denomination.toUpperCase()}
${donnees.societe.formeJuridique} au capital de ${f(donnees.societe.capitalSocial)}
Siège social : ${donnees.societe.siegeSocial}
RCCM : ${donnees.societe.rccm}

I. OPINION SUR LES ÉTATS FINANCIERS DE SYNTHÈSE
En exécution de la mission qui nous a été confiée par votre Assemblée Générale, nous avons effectué l'audit des états financiers de synthèse de la société ${donnees.societe.denomination}, comprenant le Bilan, le Compte de Résultat, le Tableau des Flux de Trésorerie (TFT) et les Notes Annexes pour l'exercice clos le ${donnees.exerciceClos}.
Ces états financiers font apparaître un total bilan de ${f(donnees.totalBilan)}, un chiffre d'affaires hors taxes de ${f(donnees.chiffreAffaires)} et un résultat net de ${f(donnees.resultatNet)}.

Opinion :
${libelleOpinion}
${texteReserves}
II. FONDEMENT DE L'OPINION ET INDÉPENDANCE
Nous avons effectué notre audit selon les Normes Internationales d'Audit (ISA) adoptées dans l'espace OHADA. Nous sommes indépendants de la société conformément au Code de déontologie des professionnels de l'expertise comptable et du commissariat aux comptes de l'OHADA.
${texteKAM}
III. VÉRIFICATIONS ET INFORMATIONS SPÉCIFIQUES (AUSCGIE art. 715)
Nous avons également procédé, conformément aux normes d'audit applicables dans l'espace OHADA, aux vérifications spécifiques prévues par l'Acte Uniforme relatif au droit des sociétés commerciales :
1. Nous n'avons pas d'observation à formuler sur la sincérité et la concordance avec les états financiers de synthèse des informations données dans le rapport de gestion du Conseil d'Administration / de la Gérance.
2. Nous nous sommes assurés du respect de l'égalité entre les associés.

Fait à ${donnees.cabinet.ville}, le ${donnees.dateRapport}

Pour le Cabinet ${donnees.cabinet.denomination}
Membre de ${donnees.cabinet.ordreNational}

${donnees.cabinet.associeSignataire}
Commissaire aux Comptes Associé`;

  // RAPPORT SPÉCIAL SUR LES CONVENTIONS RÉGLEMENTÉES (AUSCGIE art. 438 et s. & art. 716)
  const detailConventions =
    donnees.conventionsReglementeesMentionnees.length === 0
      ? "Nous vous informons qu'il ne nous a été donné avis d'aucune convention visée aux articles 438 et suivants de l'Acte Uniforme OHADA (AUSCGIE)."
      : donnees.conventionsReglementeesMentionnees
          .map(
            (c, i) =>
              `${i + 1}. Convention avec ${c.beneficiaire} :\n   - Nature et objet : ${c.natureConvention}\n   - Montant imputé sur l'exercice : ${f(c.montantExercice)}\n   - Statut d'autorisation : ${c.autorisationPrealableConseil ? "Autorisée préalablement par le Conseil d'Administration" : "Non autorisée préalablement (irrégularité formelle)"}`
          )
          .join("\n\n");

  const rapportSpecialConventionsTexte = `RAPPORT SPÉCIAL DU COMMISSAIRE AUX COMPTES
SUR LES CONVENTIONS RÉGLEMENTÉES
(Articles 438 à 448 et 716 de l'Acte Uniforme OHADA - AUSCGIE)

À l'Assemblée Générale de la société ${donnees.societe.denomination.toUpperCase()}
Exercice clos le ${donnees.exerciceClos}

En notre qualité de Commissaire aux Comptes de votre société, nous vous présentons notre rapport sur les conventions réglementées.
Il ne nous appartient pas de rechercher l'existence éventuelle de conventions non portées à notre connaissance, mais de vous communiquer les caractéristiques et les modalités essentielles de celles qui nous ont été signalées.

Conventions intervenues au cours de l'exercice ou antérieures poursuivies :
${detailConventions}

Fait à ${donnees.cabinet.ville}, le ${donnees.dateRapport}

${donnees.cabinet.denomination}
${donnees.cabinet.associeSignataire}`;

  return {
    opinionRetenue: donnees.opinion,
    rapportGeneralTexte,
    rapportSpecialConventionsTexte,
    syntheseOpinion,
    referencesLegales: [
      "Norme Internationale d'Audit ISA 700 (Fondement de l'opinion sur les états financiers)",
      "Norme Internationale d'Audit ISA 701 (Communication des points clés de l'audit - KAM)",
      "Norme Internationale d'Audit ISA 705 (Modifications apportées à l'opinion)",
      "AUSCGIE art. 710 à 717 (Missions, vérifications et rapports des commissaires aux comptes)",
      "AUSCGIE art. 438 à 448 (Régime des conventions réglementées dans les sociétés commerciales)",
    ],
  };
}
