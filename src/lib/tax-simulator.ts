// ─────────────────────────────────────────────────────────────────────────────
// Simulation de l'imposition des bénéfices — zone OHADA / UEMOA.
//
// Corrections par rapport à la version précédente :
//
//  1. IMPÔT MINIMUM FORFAITAIRE ABSENT — tous ces pays imposent un minimum
//     assis sur le chiffre d'affaires, dû même en cas de déficit. Une
//     simulation qui l'ignore annonce zéro impôt à une entreprise déficitaire,
//     alors qu'elle en doit un.
//  2. `regime` ET `secteur` ÉTAIENT IGNORÉS — les deux paramètres étaient
//     acceptés puis jamais lus, ce qui laissait croire à un paramétrage.
//  3. CFCE MAL ASSISE — la CFCE est une contribution sénégalaise assise sur la
//     MASSE SALARIALE, pas sur le bénéfice imposable, et elle n'existe pas
//     ailleurs. Elle était appliquée à 3 % du bénéfice pour les quatre pays.
//  4. La TVA était additionnée aux charges fiscales. La TVA est neutre pour
//     l'entreprise : elle est collectée puis reversée, elle n'entre pas dans
//     le coût fiscal. Elle est désormais présentée à part, comme un flux.
// ─────────────────────────────────────────────────────────────────────────────

export type PaysFiscal = "sn" | "ci" | "cm" | "bj";
export type RegimeFiscal = "reel" | "simplifie";
export type SecteurActivite = "services" | "commerce" | "industrie" | "construction" | "immobilier" | "station_service" | "telecommunications" | "enseignement_prive" | "autre";

export interface TaxSimulation {
    /** Résultat fiscal (bénéfice imposable). Peut être négatif. */
    baseImposable: number;
    pays: PaysFiscal;
    regime: RegimeFiscal;
    secteur: SecteurActivite;
    /** Chiffre d'affaires hors taxes — requis pour l'impôt minimum. */
    chiffreAffaires?: number;
    /** Masse salariale brute annuelle — assiette de la CFCE au Sénégal. */
    masseSalariale?: number;
    /** CA TTC, requis pour fiabiliser l'IMF ivoirien. */
    chiffreAffairesTTC?: number;
    /** Produits encaissables, base des minima du CGI béninois. */
    produitsEncaissables?: number;
    /** CA HT de l'exercice précédent, base du minimum camerounais. */
    chiffreAffairesAnneePrecedente?: number;
    /** Centre fiscal requis pour établir l'éligibilité au taux PME camerounais. */
    centreFiscal?: "DGE" | "CIME" | "CDI" | "CSI";
    /** Taux minimum camerounais selon le régime/activité (CAC inclus). */
    minimumCamerounais?: "STANDARD" | "MARGE_ADMINISTREE";
}

export interface ResultatSimulation {
    /** Impôt sur les sociétés issu du barème. */
    is: number;
    /** Impôt minimum forfaitaire assis sur le chiffre d'affaires. */
    impotMinimum: number;
    /** Montant réellement dû : le plus élevé des deux. */
    isDu: number;
    /** `true` si c'est le minimum forfaitaire qui s'applique. */
    minimumApplique: boolean;
    /** Contribution forfaitaire à la charge de l'employeur (Sénégal). */
    cfce: number;
    /** Total des charges fiscales à la charge de l'entreprise. */
    total: number;
    /** TVA collectée estimée — flux neutre, hors coût fiscal. */
    tvaMoyenne: number;
    tauxIS: number;
    tauxTVA: number;
    editionReglementaire: string;
    sourceReglementaire: string;
    couvertureReglementaire: "PARTIELLE";
    hypotheses: string[];
    avertissements: string[];
}

interface RegleFiscale {
    libelle: string;
    /** Taux normal d'impôt sur les sociétés. */
    tauxIS: number;
    /** Taux applicables sous conditions en fonction du pays, du régime ou de l'activité. */
    tauxISPourCA?: { seuil: number; taux: number };
    tauxISParSecteur?: Partial<Record<SecteurActivite, number>>;
    /** Taux de TVA de droit commun. */
    tauxTVA: number;
    /** Impôt minimum : taux appliqué au chiffre d'affaires, plancher et plafond. */
    minimum: { taux: number; plancher: number; plafond?: number; tauxParSecteur?: Partial<Record<SecteurActivite, number>>; plancherParSecteur?: Partial<Record<SecteurActivite, number>>; base: "CA_HT" | "CA_TTC" | "PRODUITS_ENCAISSABLES" };
    /** Contribution assise sur la masse salariale (CFCE sénégalaise). */
    cfceSurMasseSalariale?: number;
}

/**
 * Paramètres par pays. Les taux sont ceux du droit commun et doivent être
 * revus à chaque loi de finances — d'où leur regroupement en un seul endroit.
 */
export const REGLES_FISCALES: Record<PaysFiscal, RegleFiscale> = {
    sn: {
        libelle: "Sénégal",
        tauxIS: 0.3,
        tauxTVA: 0.18,
        minimum: { taux: 0.005, plancher: 0, plafond: 5_000_000, base: "CA_HT" },
        cfceSurMasseSalariale: 0.03,
    },
    ci: {
        libelle: "Côte d'Ivoire",
        tauxIS: 0.25,
        tauxISParSecteur: { telecommunications: 0.3 },
        tauxTVA: 0.18,
        minimum: { taux: 0.005, plancher: 3_000_000, plafond: 35_000_000, base: "CA_TTC" },
    },
    cm: {
        libelle: "Cameroun",
        // Taux effectifs incluant les CAC de 10 %. Le taux SME est conditionné
        // au CA annuel <= 3 Md et aux critères de rattachement administratif.
        tauxIS: 0.33,
        tauxISPourCA: { seuil: 3_000_000_000, taux: 0.275 },
        tauxTVA: 0.1925,
        minimum: { taux: 0.022, plancher: 0, base: "CA_HT" },
    },
    bj: {
        libelle: "Bénin",
        tauxIS: 0.3,
        tauxTVA: 0.18,
        tauxISParSecteur: { enseignement_prive: 0.25 },
        minimum: { taux: 0.015, plancher: 500_000, tauxParSecteur: { construction: 0.03, immobilier: 0.1 }, plancherParSecteur: { station_service: 250_000 }, base: "PRODUITS_ENCAISSABLES" },
    },
};

/**
 * Coefficient de marge retenu, par secteur, pour estimer le chiffre d'affaires
 * lorsqu'il n'est pas fourni. C'est une hypothèse grossière, signalée comme
 * telle dans `hypotheses` : renseigner `chiffreAffaires` reste préférable.
 */
const MARGE_PAR_SECTEUR: Record<SecteurActivite, number> = {
    services: 0.25,
    commerce: 0.08,
    industrie: 0.15,
    construction: 0.2,
    immobilier: 0.25,
    station_service: 0.04,
    telecommunications: 0.3,
    enseignement_prive: 0.3,
    autre: 0.2,
};

const EDITIONS: Record<PaysFiscal, { edition: string; source: string }> = {
    sn: { edition: "CGI Sénégal 2025 — à réviser avec la LFI 2026", source: "https://dgid-digitale.dgid.sn/loi-reglement" },
    ci: { edition: "CGI Côte d’Ivoire 2025 + Annexe fiscale 2026", source: "https://www.fiscalitelocale.dgi.gouv.ci/legislation.php" },
    cm: { edition: "CGI Cameroun mis à jour au 1er janvier 2026", source: "https://www.impots.cm/fr/documents/39" },
    bj: { edition: "CGI Bénin 2026", source: "https://api.impots.bj/media/6984ebbbb7bc0_B%C3%A9nin-Code%20G%C3%A9n%C3%A9ral%20des%20Imp%C3%B4ts%202026.pdf" },
};

export function simulateCorporateTax(params: TaxSimulation): ResultatSimulation {
    const regle = REGLES_FISCALES[params.pays];
    const hypotheses: string[] = [];
    const avertissements: string[] = [];

    if (!regle) {
        throw new Error(`Pays fiscal non pris en charge : ${params.pays}`);
    }

    const base = Number(params.baseImposable) || 0;

    // ── Chiffre d'affaires ──────────────────────────────────────────────────
    let chiffreAffaires = Number(params.chiffreAffaires) || 0;
    if (chiffreAffaires <= 0) {
        const marge = MARGE_PAR_SECTEUR[params.secteur] ?? MARGE_PAR_SECTEUR.services;
        chiffreAffaires = base > 0 ? base / marge : 0;
        hypotheses.push(
            `Chiffre d'affaires non renseigné : estimé à partir d'une marge de ` +
                `${(marge * 100).toFixed(0)} % pour le secteur « ${params.secteur} ». ` +
                `Renseignez-le pour fiabiliser l'impôt minimum.`
        );
    }

    // ── Impôt sur les sociétés ──────────────────────────────────────────────
    let tauxIS = regle.tauxIS;
    const chiffreAffairesExplicite = Number(params.chiffreAffaires) > 0;
    if (regle.tauxISPourCA && chiffreAffairesExplicite && chiffreAffaires <= regle.tauxISPourCA.seuil && ["CIME", "CDI", "CSI"].includes(params.centreFiscal ?? "")) {
        tauxIS = regle.tauxISPourCA.taux;
    } else if (regle.tauxISPourCA && chiffreAffairesExplicite && chiffreAffaires <= regle.tauxISPourCA.seuil && !params.centreFiscal) {
        avertissements.push("Le CA passe le seuil PME camerounais, mais le centre fiscal n’est pas indiqué : le taux de droit commun est retenu faute de pouvoir confirmer l’éligibilité.");
    } else if (regle.tauxISPourCA && !chiffreAffairesExplicite) {
        avertissements.push("Chiffre d’affaires manquant : le taux réduit conditionnel ne peut pas être évalué ; le taux de droit commun est retenu.");
    }
    if (regle.tauxISParSecteur?.[params.secteur] !== undefined) {
        tauxIS = regle.tauxISParSecteur[params.secteur]!;
    }

    const is = Math.max(0, base) * tauxIS;

    // ── Impôt minimum forfaitaire ───────────────────────────────────────────
    // Dû même en l'absence de bénéfice : c'est précisément le cas que la
    // version précédente chiffrait à zéro.
    let assietteMinimum = chiffreAffaires;
    if (params.pays === "cm") {
        assietteMinimum = Number(params.chiffreAffairesAnneePrecedente) || chiffreAffaires;
        if (!params.chiffreAffairesAnneePrecedente) hypotheses.push("CA de l’exercice précédent non fourni : le minimum camerounais est estimé avec le CA courant.");
    }
    if (regle.minimum.base === "PRODUITS_ENCAISSABLES") {
        assietteMinimum = Number(params.produitsEncaissables) || chiffreAffaires;
        if (!params.produitsEncaissables) hypotheses.push("Produits encaissables non fournis : le chiffre d’affaires est utilisé comme approximation du minimum fiscal.");
    }
    if (regle.minimum.base === "CA_TTC") {
        assietteMinimum = Number(params.chiffreAffairesTTC) || chiffreAffaires * (1 + regle.tauxTVA);
        if (!params.chiffreAffairesTTC) hypotheses.push("CA TTC non fourni : estimé au taux normal, sans distinguer exonérations, taux réduits ou opérations hors champ.");
    }
    const tauxMinimum = regle.minimum.tauxParSecteur?.[params.secteur] ?? regle.minimum.taux;
    let impotMinimum = assietteMinimum * tauxMinimum;
    if (params.pays === "cm") {
        const tauxMinimumCm = params.regime === "simplifie"
            ? 0.055
            : params.minimumCamerounais === "MARGE_ADMINISTREE" ? 0.154 : 0.022;
        impotMinimum = assietteMinimum * tauxMinimumCm;
        if (params.regime !== "simplifie" && !params.minimumCamerounais) {
            avertissements.push("La catégorie du minimum camerounais (2 % ou 14 %, majorée des CAC) n’est pas renseignée : le taux standard est utilisé à titre indicatif.");
        }
    }
    const plancherMinimum = regle.minimum.plancherParSecteur?.[params.secteur] ?? regle.minimum.plancher;
    impotMinimum = Math.max(impotMinimum, plancherMinimum);
    if (regle.minimum.plafond !== undefined) {
        impotMinimum = Math.min(impotMinimum, regle.minimum.plafond);
    }
    if (params.pays === "cm") avertissements.push("Minimum camerounais : taux et base varient selon l’activité, le régime et les règles du CGI. Le montant affiché est une estimation à confirmer.");

    const isDu = Math.max(is, impotMinimum);
    const minimumApplique = impotMinimum > is;

    if (base <= 0) {
        avertissements.push(
            `Résultat fiscal nul ou déficitaire : l'impôt minimum forfaitaire de ` +
                `${Math.round(impotMinimum).toLocaleString("fr-FR")} FCFA reste dû.`
        );
    } else if (minimumApplique) {
        avertissements.push(
            "L'impôt minimum forfaitaire dépasse l'impôt sur les sociétés : c'est lui qui s'applique."
        );
    }

    // ── CFCE (Sénégal uniquement, assise sur la masse salariale) ────────────
    let cfce = 0;
    if (regle.cfceSurMasseSalariale) {
        const masseSalariale = Number(params.masseSalariale) || 0;
        cfce = masseSalariale * regle.cfceSurMasseSalariale;
        if (masseSalariale <= 0) {
            hypotheses.push(
                "Masse salariale non renseignée : la CFCE (3 % de la masse salariale) est chiffrée à zéro."
            );
        }
    }

    // ── TVA : flux neutre, présenté séparément ──────────────────────────────
    const tvaMoyenne = chiffreAffaires * regle.tauxTVA;
    hypotheses.push(
        "La TVA est collectée puis reversée : elle n'entre pas dans le coût fiscal de l'entreprise."
    );

    return {
        is,
        impotMinimum,
        isDu,
        minimumApplique,
        cfce,
        total: isDu + cfce,
        tvaMoyenne,
        tauxIS,
        tauxTVA: regle.tauxTVA,
        editionReglementaire: EDITIONS[params.pays].edition,
        sourceReglementaire: EDITIONS[params.pays].source,
        couvertureReglementaire: "PARTIELLE",
        hypotheses,
        avertissements,
    };
}
