// ─────────────────────────────────────────────────────────────────────────────
// Assistant IA d'Audit sur Feuilles de Travail (Norme ISA 500 / ISA 700)
// Évaluation des assertions d'audit, calcul du risque résiduel et synthèse
// ─────────────────────────────────────────────────────────────────────────────

export type AssertionAudit =
    | "EXISTENCE"             // Réalité des actifs et passifs
    | "EXHAUSTIVITE"          // Aucun élément omis
    | "EVALUATION"            // Valorisation et dépréciation conformes SYSCOHADA
    | "DROITS_OBLIGATIONS"    // Propriété juridique effective
    | "PRESENTATION";         // Classification et information en annexe

export interface ConstatAuditeur {
    id: string;
    referenceCompte: string;
    libelle: string;
    descriptionDiligence: string;
    assertionVisee: AssertionAudit;
    conforme: boolean;
    anomalieDetectee?: string;
    montantAnomalieFCFA?: number;
    justificationFournie?: string;
}

export interface AnalyseSectionInput {
    cycleAudit: "TRESORERIE" | "IMMOBILISATIONS" | "STOCKS" | "CLIENTS" | "FOURNISSEURS" | "PAIE_SOCIAL" | "CAPITAUX";
    seuilSignificationFCFA: number;
    soldeComptableTotalFCFA: number;
    constats: ConstatAuditeur[];
}

export interface RecommandationDiligence {
    assertion: AssertionAudit;
    diligenceSuggeree: string;
    priorite: "HAUTE" | "MOYENNE" | "FAIBLE";
    referenceNormative: string;
}

export interface BilanRaisonnementAudit {
    cycleAudit: string;
    assertionsCouvertes: Record<AssertionAudit, { couverte: boolean; conforme: boolean; anomalies: number }>;
    totalAnomaliesRelevees: number;
    montantCumuleAnomaliesFCFA: number;
    ratioSurSeuilSignification: number;  // montantCumule / seuilSignification
    scoreRisqueResiduel: number;          // 0-100 (0 = zéro risque, 100 = risque critique)
    niveauRisque: "FAIBLE" | "MODERE" | "ELEVE" | "CRITIQUE";
    opinionProposeePourCycle: "SATISFAISANTE" | "AVEC_RESERVE" | "DESACCORD_SIGNIFICATIF";
    conclusionRapportSection: string;
    recommandationsDiligences: RecommandationDiligence[];
}

const ASSERTIONS_TOTALES: AssertionAudit[] = ["EXISTENCE", "EXHAUSTIVITE", "EVALUATION", "DROITS_OBLIGATIONS", "PRESENTATION"];

/**
 * Moteur de raisonnement expert d'audit sur les feuilles de travail.
 */
export function evaluerFeuillesTravail(input: AnalyseSectionInput): BilanRaisonnementAudit {
    const assertionsCouvertes: Record<AssertionAudit, { couverte: boolean; conforme: boolean; anomalies: number }> = {
        EXISTENCE: { couverte: false, conforme: true, anomalies: 0 },
        EXHAUSTIVITE: { couverte: false, conforme: true, anomalies: 0 },
        EVALUATION: { couverte: false, conforme: true, anomalies: 0 },
        DROITS_OBLIGATIONS: { couverte: false, conforme: true, anomalies: 0 },
        PRESENTATION: { couverte: false, conforme: true, anomalies: 0 },
    };

    let totalAnomaliesRelevees = 0;
    let montantCumuleAnomaliesFCFA = 0;

    for (const c of input.constats) {
        const item = assertionsCouvertes[c.assertionVisee];
        if (item) {
            item.couverte = true;
            if (!c.conforme) {
                item.conforme = false;
                item.anomalies += 1;
                totalAnomaliesRelevees += 1;
                montantCumuleAnomaliesFCFA += c.montantAnomalieFCFA || 0;
            }
        }
    }

    const ratioSeuil = input.seuilSignificationFCFA > 0
        ? montantCumuleAnomaliesFCFA / input.seuilSignificationFCFA
        : 0;

    // Calcul du score de risque résiduel (0-100)
    let scoreRisque = 0;

    // 1. Manque de couverture d'assertions obligatoires (+12 pts par assertion non auditée)
    const nonCouvertes = ASSERTIONS_TOTALES.filter((a) => !assertionsCouvertes[a].couverte);
    scoreRisque += nonCouvertes.length * 12;

    // 2. Présence d'anomalies non ajustées
    scoreRisque += Math.min(50, Math.round(ratioSeuil * 60));

    scoreRisque = Math.min(100, scoreRisque);

    let niveauRisque: "FAIBLE" | "MODERE" | "ELEVE" | "CRITIQUE" = "FAIBLE";
    if (scoreRisque >= 75 || ratioSeuil >= 1.0) niveauRisque = "CRITIQUE";
    else if (scoreRisque >= 45 || ratioSeuil >= 0.5) niveauRisque = "ELEVE";
    else if (scoreRisque >= 20) niveauRisque = "MODERE";

    let opinionCycle: "SATISFAISANTE" | "AVEC_RESERVE" | "DESACCORD_SIGNIFICATIF" = "SATISFAISANTE";
    if (ratioSeuil >= 1.0) {
        opinionCycle = "DESACCORD_SIGNIFICATIF";
    } else if (ratioSeuil >= 0.5 || nonCouvertes.length >= 2) {
        opinionCycle = "AVEC_RESERVE";
    }

    // Génération des recommandations méthodologiques
    const recommandations: RecommandationDiligence[] = [];
    for (const a of nonCouvertes) {
        recommandations.push({
            assertion: a,
            diligenceSuggeree: `Effectuer un sondage spécifique sur l'assertion ${a} pour le cycle ${input.cycleAudit}.`,
            priorite: a === "EXISTENCE" || a === "EVALUATION" ? "HAUTE" : "MOYENNE",
            referenceNormative: "Norme ISA 500 (Caractère probant des éléments d'audit)",
        });
    }

    if (montantCumuleAnomaliesFCFA > 0) {
        recommandations.push({
            assertion: "EVALUATION",
            diligenceSuggeree: `Notifier à la direction le tableau de reclassement pour ${montantCumuleAnomaliesFCFA.toLocaleString("fr-FR")} FCFA d'écarts cumulés.`,
            priorite: ratioSeuil >= 0.8 ? "HAUTE" : "MOYENNE",
            referenceNormative: "Norme ISA 450 (Évaluation des anomalies détectées)",
        });
    }

    // Rédaction de la conclusion de section d'audit
    let conclusion = `CONCLUSION DU COMMISSAIRE AUX COMPTES SUR LE CYCLE « ${input.cycleAudit} » :\n`;
    conclusion += `Au terme des contrôles effectués conformément aux normes internationales d'audit (ISA),\n`;

    if (opinionCycle === "SATISFAISANTE") {
        conclusion += `les éléments probants recueillis sont suffisants et appropriés. Les soldes du cycle (solde audité : ${input.soldeComptableTotalFCFA.toLocaleString("fr-FR")} FCFA) `;
        conclusion += `sont réguliers, sincères et donnent une image fidèle, sans anomalie significative au regard du seuil fixé à ${input.seuilSignificationFCFA.toLocaleString("fr-FR")} FCFA.`;
    } else if (opinionCycle === "AVEC_RESERVE") {
        conclusion += `des anomalies ou limitations partielles de contrôle ont été relevées pour un montant cumulé de ${montantCumuleAnomaliesFCFA.toLocaleString("fr-FR")} FCFA `;
        conclusion += `(représentant ${(ratioSeuil * 100).toFixed(1)}% du seuil de signification). Une réserve spécifique ou observation devra être formulée dans la note de synthèse.`;
    } else {
        conclusion += `les anomalies non corrigées atteignent ${montantCumuleAnomaliesFCFA.toLocaleString("fr-FR")} FCFA et dépassent le seuil de signification. `;
        conclusion += `Ce désaccord significatif impacte directement l'opinion globale sur les états financiers annuels (ISA 705).`;
    }

    return {
        cycleAudit: input.cycleAudit,
        assertionsCouvertes,
        totalAnomaliesRelevees,
        montantCumuleAnomaliesFCFA,
        ratioSurSeuilSignification: Math.round(ratioSeuil * 100) / 100,
        scoreRisqueResiduel: scoreRisque,
        niveauRisque,
        opinionProposeePourCycle: opinionCycle,
        conclusionRapportSection: conclusion,
        recommandationsDiligences: recommandations,
    };
}
