// ─────────────────────────────────────────────────────────────────────────────
// Nexus Legal & Tax Co-Counsel – Moteur d'analyse juridique et fiscale OHADA
// Analyse de contrats, consultation fiscale, recherche de doctrine
// ─────────────────────────────────────────────────────────────────────────────

import type { PaysFiscal } from "@/lib/tax-simulator";

export type GraviteRisque = "FAIBLE" | "MODERE" | "ELEVE" | "CRITIQUE";

export interface RisqueContractuel {
  code: string;
  domaine: "CLAUSE_LEONINE" | "RISQUE_FISCAL" | "ETABLISSEMENT_STABLE" | "MANQUE_FORMALITE" | "NON_CONFORMITE_OHADA";
  article: string; // ex: "AUSCGIE art. 54" ou "CGI SN art. 17"
  risque: string;
  clauseIdentifiee?: string; // extrait du contrat
  recommandation: string;
  gravite: GraviteRisque;
}

export interface ResultatAnalyseContrat {
  risques: RisqueContractuel[];
  risquesParGravite: Record<GraviteRisque, number>;
  scoreConformite: number; // 0-100, 100 = aucun risque
  recommandationGlobale: string;
  disclaimer: string;
}

export interface ConsultationFiscale {
  sujet: string;
  pays: PaysFiscal;
  referencesDoctrine: string[];
  reponse: string; // texte structuré avec citations
  disclaimer: string;
}

// Patterns de détection dans les contrats (analyse lexicale déterministe)
const PATTERNS_CLAUSES_LEONINES = [
  { regex: /profit[s]?\s+(?:exclusif|intégral|total)/i, article: "AUSCGIE art. 54", risque: "Clause attribuant la totalité des profits à un seul associé" },
  { regex: /totalit[eé]\s+des\s+profits/i, article: "AUSCGIE art. 54", risque: "Clause attribuant la totalité des profits à un seul associé" },
  { regex: /perd(?:re|ra)\s+(?:tous|l[' ]ensemble)/i, article: "AUSCGIE art. 54", risque: "Clause faisant supporter toutes les pertes par un seul associé" },
  { regex: /sans\s+contribution\s+aux\s+pertes/i, article: "AUSCGIE art. 54", risque: "Exonération totale de contribution aux pertes" },
  { regex: /exclus[e]?\s+de\s+(?:tous\s+)?b[eé]n[eé]fices/i, article: "AUSCGIE art. 54", risque: "Clause excluant un associé de tout bénéfice" },
];

const PATTERNS_RISQUES_FISCAUX = [
  { regex: /prix\s+(?:fixe|forfaitaire)\s+(?:sans\s+)?TVA/i, article: "CGI art. 318", risque: "Prix mentionné sans TVA – risque de solidarité fiscale" },
  { regex: /paiement\s+en\s+esp[eè]ces?\s+(?:supérieur|excédant|au[- ]delà)/i, article: "CGI art. 25bis", risque: "Paiement en espèces susceptible de dépasser le seuil légal" },
  { regex: /abandon(?:ner|nement)\s+de\s+cr[eé]ance/i, article: "CGI art. 17", risque: "Abandon de créance à déductibilité fiscale conditionnelle" },
];

const PATTERNS_ETABLISSEMENT_STABLE = [
  { regex: /repr[eé]sentant\s+(?:exclusif|permanent|général)/i, article: "Conventions fiscales UEMOA / OCDE art. 5", risque: "Représentant permanent pouvant constituer un établissement stable taxable localement" },
  { regex: /bureau\s+de\s+liaison/i, article: "Conventions fiscales art. 5", risque: "Bureau de liaison – qualifier si activités préparatoires ou core business" },
  { regex: /prestation[s]?\s+(?:de\s+)?services?\s+(?:pendant|durant|sur)\s+(?:\d+)\s+mois/i, article: "BCEAO / Conventions fiscales art. 5§3", risque: "Prestation de services dépassant potentiellement 6 mois → établissement stable de services" },
];

const PATTERNS_FORMALITES = [
  { regex: /clause\s+(?:de\s+)?non[- ]concurrence/i, article: "AUSCGIE art. 15 / Code travail", risque: "Clause de non-concurrence – vérifier limitation géographique et temporelle" },
  { regex: /droit\s+applicable\s+:\s*(?!droit\s+(?:sénégalais|ivoirien|camerounais|béninois|ohada))/i, article: "Traité OHADA art. 10", risque: "Droit applicable hors OHADA – les actes uniformes sont d'ordre public et s'appliquent impérativement" },
];

export function analyserContratOHADA(texteContrat: string, pays: PaysFiscal): ResultatAnalyseContrat {
  const risques: RisqueContractuel[] = [];
  let code = 1;

  // 1. Clauses léonines (AUSCGIE art. 54)
  for (const pattern of PATTERNS_CLAUSES_LEONINES) {
    const match = texteContrat.match(pattern.regex);
    if (match) {
      risques.push({
        code: `LEO-${String(code++).padStart(3, "0")}`,
        domaine: "CLAUSE_LEONINE",
        article: pattern.article,
        risque: pattern.risque,
        clauseIdentifiee: match[0],
        recommandation: "Supprimer ou rééquilibrer cette clause. Les clauses léonines sont réputées non écrites (art. 54 AUSCGIE) et n'ont aucun effet juridique.",
        gravite: "CRITIQUE",
      });
      break; // une seule alerte par famille de clause léonine suffit
    }
  }

  // 2. Risques fiscaux
  for (const pattern of PATTERNS_RISQUES_FISCAUX) {
    const match = texteContrat.match(pattern.regex);
    if (match) {
      risques.push({
        code: `FISC-${String(code++).padStart(3, "0")}`,
        domaine: "RISQUE_FISCAL",
        article: pattern.article,
        risque: pattern.risque,
        clauseIdentifiee: match[0],
        recommandation: `Réviser la clause pour conformité ${pays === "SN" ? "CGI Sénégal" : pays === "CI" ? "CGI Côte d'Ivoire" : "CGI applicable"}. Consulter votre expert-comptable.`,
        gravite: "MODERE",
      });
    }
  }

  // 3. Établissement stable
  for (const pattern of PATTERNS_ETABLISSEMENT_STABLE) {
    const match = texteContrat.match(pattern.regex);
    if (match) {
      risques.push({
        code: `ES-${String(code++).padStart(3, "0")}`,
        domaine: "ETABLISSEMENT_STABLE",
        article: pattern.article,
        risque: pattern.risque,
        clauseIdentifiee: match[0],
        recommandation: "Qualifier précisément la nature de la présence. Si établissement stable constitué, obligations déclaratives IS et TVA locales. Prévoir clause d'indemnisation fiscale.",
        gravite: "ELEVE",
      });
    }
  }

  // 4. Formalités manquantes
  for (const pattern of PATTERNS_FORMALITES) {
    const match = texteContrat.match(pattern.regex);
    if (match) {
      risques.push({
        code: `FORM-${String(code++).padStart(3, "0")}`,
        domaine: "MANQUE_FORMALITE",
        article: pattern.article,
        risque: pattern.risque,
        clauseIdentifiee: match[0],
        recommandation: "Vérifier la conformité avec le droit OHADA applicable. Les Actes Uniformes s'appliquent de plein droit dans les 17 États parties.",
        gravite: "MODERE",
      });
    }
  }

  // Comptage par gravité
  const risquesParGravite: Record<GraviteRisque, number> = { FAIBLE: 0, MODERE: 0, ELEVE: 0, CRITIQUE: 0 };
  for (const r of risques) risquesParGravite[r.gravite]++;

  // Score de conformité (100 = parfait, diminue par risque)
  const penalites = risquesParGravite.CRITIQUE * 30 + risquesParGravite.ELEVE * 15 + risquesParGravite.MODERE * 8 + risquesParGravite.FAIBLE * 3;
  const scoreConformite = Math.max(0, 100 - penalites);

  const recommandationGlobale =
    risquesParGravite.CRITIQUE > 0
      ? "⛔ Contrat non conforme OHADA. Des clauses réputées non écrites ont été identifiées. Ne pas signer avant révision par un juriste OHADA."
      : risquesParGravite.ELEVE > 0
      ? "⚠️ Risques élevés détectés. Révision juridique et fiscale fortement recommandée avant signature."
      : risquesParGravite.MODERE > 0
      ? "🔶 Points d'attention. Faire valider par votre expert-comptable ou juriste."
      : "✅ Aucun risque majeur détecté par l'analyse automatique. Une revue humaine reste conseillée.";

  return {
    risques,
    risquesParGravite,
    scoreConformite,
    recommandationGlobale,
    disclaimer: "⚠️ Cette analyse automatique est fournie à titre informatif et ne constitue pas un avis juridique ou fiscal opposable. Elle ne remplace pas la consultation d'un avocat ou d'un expert-comptable.",
  };
}

export function genererConsultationFiscaleSync(sujet: string, contexte: string, pays: PaysFiscal): ConsultationFiscale {
  const paysLabel: Record<PaysFiscal, string> = {
    SN: "Sénégal",
    CI: "Côte d'Ivoire",
    CM: "Cameroun",
    BJ: "Bénin",
    TG: "Togo",
    BF: "Burkina Faso",
    ML: "Mali",
    NE: "Niger",
    GN: "Guinée",
    GA: "Gabon",
    CG: "Congo",
    CD: "RDC",
  };
  const label = paysLabel[pays] ?? pays;

  const referencesDoctrine = [
    `CGI ${label} – dispositions générales sur l'impôt sur les sociétés et retenues à la source`,
    "Acte Uniforme OHADA relatif au droit des sociétés commerciales (AUSCGIE)",
    "Directive UEMOA n°01/2008/CM/UEMOA relative au régime de la TVA",
    "Règlement UEMOA n°09/2010/CM/UEMOA sur les transactions courantes",
  ];

  const reponse = `**Consultation Fiscale & Juridique – ${sujet}**\n\nPays d'application : ${label}\n\n**Contexte analysé :**\n${contexte}\n\n**Références doctrinales et réglementaires :**\n${referencesDoctrine.map((r) => `• ${r}`).join("\n")}\n\n**Analyse de premier niveau :**\n1. Vérifier la qualification des flux au regard des conventions de non double imposition (zone UEMOA / OCDE).\n2. Appliquer les retenues à la source (BRS / BIRC) selon les seuils du CGI de ${label}.\n3. Archiver les justificatifs probants (contrats, quittances, états certifiés).\n\n*Note : Pour une rédaction personnalisée intégrant les derniers arrêts CCJA, activez les clés API Nexus.*`;

  return {
    sujet,
    pays,
    referencesDoctrine,
    reponse,
    disclaimer: "⚠️ Cette consultation est fournie à titre informatif et ne constitue pas un avis fiscal opposable. Consultez un expert-comptable ou un conseiller fiscal agréé.",
  };
}
