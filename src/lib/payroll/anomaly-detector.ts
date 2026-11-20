// ─────────────────────────────────────────────────────────────────────────────
// Détecteur d'Anomalies de Paie & Social (Contrôle Prédictif IA)
// Conforme CCNI Sénégal / Côte d'Ivoire & Pratiques Audit Social
// ─────────────────────────────────────────────────────────────────────────────

export type TypeAnomalie =
    | "HAUSSE_BRUTALE_SALAIRE"      // augmentation brut > 20% vs moyenne passée
    | "BAISSE_BRUTALE_SALAIRE"      // baisse brut > 15% vs moyenne passée
    | "TAUX_COTISATION_INCOHERENT"  // taux patronal hors intervalle [15%, 45%]
    | "NET_SUPERIEUR_BRUT"          // net > brut (anomalie mathématique critique)
    | "RETENUE_EXCESSIVE"           // retenues salariales + fiscales > 50% du brut
    | "CUMUL_ANNUEL_SUSPECT"        // cumul annuel incohérent avec le salaire mensuel
    | "ANOMALIE_CONGE_PAYE"         // indemnité congés payés hors limites
    | "DOUBLON_POTENTIEL";          // même matricule ou collision

export type NiveauRisque = "FAIBLE" | "MOYEN" | "ELEVE" | "CRITIQUE";

export interface BulletinInput {
    matricule: string;
    nomEmploye?: string;
    periode: string;        // "2025-01" format
    salaireBase: number;
    primes?: number;
    heuresSup?: number;
    avantagesNature?: number;
    cotisationsPatronales: number;
    cotisationsSalariales: number;
    retenueFiscale: number;
    netAPayer: number;
    congesPayes?: number;
    historiqueBrut?: number[];  // 3 derniers mois
    cumulAnnuelBrut?: number;
}

export interface AnomalieDetectee {
    type: TypeAnomalie;
    niveau: NiveauRisque;
    description: string;
    valeurDetectee: number;
    seuilAttendu: string;
    suggestionCorrection: string;
}

export interface ResultatAnalyse {
    matricule: string;
    periode: string;
    nomEmploye: string;
    salaireBrut: number;
    scoreRisque: number;          // 0-100
    niveauGlobal: NiveauRisque;
    anomalies: AnomalieDetectee[];
    bulletin: BulletinInput;
    dateAnalyse: string;
}

/**
 * Analyse unitaire d'un bulletin de paie.
 */
export function analyserBulletin(bulletin: BulletinInput): ResultatAnalyse {
    const anomalies: AnomalieDetectee[] = [];
    const brut = (bulletin.salaireBase || 0) + (bulletin.primes || 0) + (bulletin.heuresSup || 0) + (bulletin.avantagesNature || 0);

    // 1. Contrôle mathématique critique : Net > Brut
    if (bulletin.netAPayer > brut && brut > 0) {
        anomalies.push({
            type: "NET_SUPERIEUR_BRUT",
            niveau: "CRITIQUE",
            description: `Le salaire net (${bulletin.netAPayer.toLocaleString("fr-FR")} FCFA) est supérieur au salaire brut total (${brut.toLocaleString("fr-FR")} FCFA).`,
            valeurDetectee: bulletin.netAPayer,
            seuilAttendu: `<= ${brut.toLocaleString("fr-FR")} FCFA`,
            suggestionCorrection: "Vérifier la déduction des cotisations ou l'omission éventuelle d'éléments de brut imposables.",
        });
    }

    // 2. Contrôle de variation brutale de salaire vs historique
    if (bulletin.historiqueBrut && bulletin.historiqueBrut.length > 0) {
        const moyenneHistorique = bulletin.historiqueBrut.reduce((acc, v) => acc + v, 0) / bulletin.historiqueBrut.length;
        if (moyenneHistorique > 0) {
            const variation = (brut - moyenneHistorique) / moyenneHistorique;
            if (variation > 0.20) {
                anomalies.push({
                    type: "HAUSSE_BRUTALE_SALAIRE",
                    niveau: "ELEVE",
                    description: `Augmentation de ${(variation * 100).toFixed(1)}% du salaire brut par rapport à la moyenne récente (${moyenneHistorique.toLocaleString("fr-FR")} FCFA).`,
                    valeurDetectee: brut,
                    seuilAttendu: `Variation <= +20% (max ${Math.round(moyenneHistorique * 1.2).toLocaleString("fr-FR")} FCFA)`,
                    suggestionCorrection: "Confirmer si cette variation correspond à une promotion, rappel ou prime exceptionnelle validée par la direction.",
                });
            } else if (variation < -0.15) {
                anomalies.push({
                    type: "BAISSE_BRUTALE_SALAIRE",
                    niveau: "MOYEN",
                    description: `Baisse inattendue de ${(Math.abs(variation) * 100).toFixed(1)}% du salaire brut par rapport à la moyenne passée.`,
                    valeurDetectee: brut,
                    seuilAttendu: `Variation >= -15%`,
                    suggestionCorrection: "Vérifier d'éventuelles retenues sur absences non justifiées ou erreur de saisie de la base contractuelle.",
                });
            }
        }
    }

    // 3. Contrôle de cohérence du taux patronal
    if (brut > 0) {
        const tauxPatronal = bulletin.cotisationsPatronales / brut;
        if (tauxPatronal < 0.12 || tauxPatronal > 0.45) {
            anomalies.push({
                type: "TAUX_COTISATION_INCOHERENT",
                niveau: "MOYEN",
                description: `Taux patronal effectif de ${(tauxPatronal * 100).toFixed(1)}% hors de la fourchette usuelle (15% - 40% en zone OHADA/UEMOA).`,
                valeurDetectee: Math.round(tauxPatronal * 100),
                seuilAttendu: "12% à 45%",
                suggestionCorrection: "Vérifier le barème de cotisations de la caisse sociale (IPRES/CSS au Sénégal, CNPS en CI).",
            });
        }
    }

    // 4. Retenues salariales + fiscales excessives
    const totalRetenues = (bulletin.cotisationsSalariales || 0) + (bulletin.retenueFiscale || 0);
    if (brut > 0 && totalRetenues > 0.50 * brut) {
        anomalies.push({
            type: "RETENUE_EXCESSIVE",
            niveau: "ELEVE",
            description: `Le total des retenues (${totalRetenues.toLocaleString("fr-FR")} FCFA) absorbe ${(totalRetenues / brut * 100).toFixed(1)}% du brut (> quotité cessible limite de 50%).`,
            valeurDetectee: totalRetenues,
            seuilAttendu: `<= 50% du salaire brut (${Math.round(brut * 0.5).toLocaleString("fr-FR")} FCFA)`,
            suggestionCorrection: "Vérifier le plafonnement de la quotité cessible et saisissable selon le Code du travail local.",
        });
    }

    // 5. Cumul annuel suspect
    if (bulletin.cumulAnnuelBrut && brut > 0) {
        const moisNum = parseInt(bulletin.periode.split("-")[1] || "1", 10);
        const ratioAttendu = brut * moisNum;
        if (bulletin.cumulAnnuelBrut > ratioAttendu * 1.6) {
            anomalies.push({
                type: "CUMUL_ANNUEL_SUSPECT",
                niveau: "MOYEN",
                description: `Le cumul brut déclaré (${bulletin.cumulAnnuelBrut.toLocaleString("fr-FR")} FCFA) dépasse substantiellement la trajectoire normale attendue au mois ${moisNum}.`,
                valeurDetectee: bulletin.cumulAnnuelBrut,
                seuilAttendu: `<= ${Math.round(ratioAttendu * 1.5).toLocaleString("fr-FR")} FCFA`,
                suggestionCorrection: "Vérifier s'il n'y a pas eu un double comptage ou une régularisation annuelle mal imputée.",
            });
        }
    }

    // Calcul du score de risque (0 - 100)
    let score = 0;
    for (const anom of anomalies) {
        switch (anom.niveau) {
            case "CRITIQUE": score += 45; break;
            case "ELEVE": score += 25; break;
            case "MOYEN": score += 15; break;
            case "FAIBLE": score += 5; break;
        }
    }
    const scoreRisque = Math.min(100, score);

    // Détermination du niveau global : reflète l'anomalie la plus sévère ou le score
    let niveauGlobal: NiveauRisque = "FAIBLE";
    if (anomalies.some((a) => a.niveau === "CRITIQUE") || scoreRisque >= 60) {
        niveauGlobal = "CRITIQUE";
    } else if (anomalies.some((a) => a.niveau === "ELEVE") || scoreRisque >= 25) {
        niveauGlobal = "ELEVE";
    } else if (anomalies.some((a) => a.niveau === "MOYEN") || scoreRisque >= 15) {
        niveauGlobal = "MOYEN";
    }

    return {
        matricule: bulletin.matricule,
        periode: bulletin.periode,
        nomEmploye: bulletin.nomEmploye || `Salarié ${bulletin.matricule}`,
        salaireBrut: brut,
        scoreRisque,
        niveauGlobal,
        anomalies,
        bulletin,
        dateAnalyse: new Date().toISOString(),
    };
}

/**
 * Analyse un ensemble de bulletins (contrôle de lot).
 */
export function analyserLot(bulletins: BulletinInput[]): ResultatAnalyse[] {
    const resultats: ResultatAnalyse[] = [];
    const matriculesVus = new Map<string, number>();

    for (const b of bulletins) {
        const res = analyserBulletin(b);

        // Détection de doublons dans le lot
        const cle = `${b.matricule}_${b.periode}`;
        if (matriculesVus.has(cle)) {
            res.anomalies.push({
                type: "DOUBLON_POTENTIEL",
                niveau: "CRITIQUE",
                description: `Doublon potentiel : le matricule ${b.matricule} apparaît plusieurs fois pour la période ${b.periode}.`,
                valeurDetectee: 2,
                seuilAttendu: "1 bulletin unique par matricule/période",
                suggestionCorrection: "Supprimer le bulletin redondant ou vérifier l'attribution des matricules.",
            });
            res.scoreRisque = Math.min(100, res.scoreRisque + 40);
            res.niveauGlobal = "CRITIQUE";
        } else {
            matriculesVus.set(cle, 1);
        }

        resultats.push(res);
    }

    return resultats;
}

/**
 * Synthèse textuelle d'audit pour le cabinet.
 */
export function genererRapportAnomalies(resultats: ResultatAnalyse[]): string {
    const total = resultats.length;
    const critiques = resultats.filter(r => r.niveauGlobal === "CRITIQUE").length;
    const eleves = resultats.filter(r => r.niveauGlobal === "ELEVE").length;
    const avecAnomalies = resultats.filter(r => r.anomalies.length > 0).length;

    let rapport = `=== RAPPORT DE DÉTECTION D'ANOMALIES DE PAIE (CABINET 360) ===\n`;
    rapport += `Date d'analyse : ${new Date().toLocaleDateString("fr-FR")}\n`;
    rapport += `Bulletins contrôlés : ${total}\n`;
    rapport += `Dossiers avec anomalies : ${avecAnomalies} / ${total}\n`;
    rapport += `Alertes critiques : ${critiques} | Alertes élevées : ${eleves}\n\n`;

    if (avecAnomalies === 0) {
        rapport += `✅ Aucun écart ou anomalie détectée sur ce lot. Les équilibres paie/social sont conformes.\n`;
        return rapport;
    }

    rapport += `--- DÉTAIL DES BULLETINS SIGNALÉS ---\n`;
    for (const r of resultats.filter(res => res.anomalies.length > 0)) {
        rapport += `\n[${r.niveauGlobal}] ${r.matricule} - ${r.nomEmploye} (${r.periode}) - Score Risque: ${r.scoreRisque}/100\n`;
        for (const anom of r.anomalies) {
            rapport += `  • [${anom.type}] ${anom.description}\n`;
            rapport += `    Suggestion : ${anom.suggestionCorrection}\n`;
        }
    }

    return rapport;
}
