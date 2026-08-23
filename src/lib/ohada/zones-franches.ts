import { REGLES_FISCALES, type PaysFiscal } from "@/lib/tax-simulator";

// ─────────────────────────────────────────────────────────────────────────────
// Régimes de zones franches et zones économiques spéciales — zone OHADA.
//
// Donnée de RÉFÉRENCE, au même titre que le calendrier fiscal : les taux
// proviennent des textes instituant chaque régime et doivent être revus à
// chaque loi de finances. Chaque zone porte donc sa source.
//
// Le simulateur qui s'appuyait sur ce catalogue comportait deux erreurs de
// fond, corrigées ici :
//
//  1. L'EXONÉRATION DE TVA ÉTAIT COMPTÉE COMME UNE ÉCONOMIE de 18 % du chiffre
//     d'affaires. La TVA est collectée auprès du client puis reversée : elle ne
//     coûte rien à l'entreprise. L'exonérer n'apporte aucun gain sur le
//     résultat — tout au plus un avantage de trésorerie et de compétitivité
//     prix. Elle ne figure plus dans l'économie chiffrée.
//  2. LE TAUX D'IS DE DROIT COMMUN ÉTAIT FIGÉ À 30 % pour tous les pays, alors
//     qu'il est de 25 % en Côte d'Ivoire et de 33 % au Cameroun. Il est
//     désormais lu depuis le référentiel fiscal.
// ─────────────────────────────────────────────────────────────────────────────

export type ZoneFranche = {
    id: string;
    nom: string;
    pays: PaysFiscal | string;
    paysNom: string;
    drapeau: string;
    /** Taux d'impôt sur les sociétés applicable dans la zone, en %. */
    tauxIS: number;
    /** Exonération de TVA sur les opérations réalisées dans la zone. */
    exonerationTVA: boolean;
    /** Taux de droits de douane à l'importation, en %. */
    droitsDouane: number;
    /** Durée de l'avantage, en années. */
    dureeAnnees: number;
    /** Texte instituant le régime. */
    source: string;
};

export const ZONES_FRANCHES: ZoneFranche[] = [
    {
        id: "dakar",
        nom: "Zone économique spéciale de Dakar (DISEZ)",
        pays: "sn",
        paysNom: "Sénégal",
        drapeau: "🇸🇳",
        tauxIS: 15,
        exonerationTVA: true,
        droitsDouane: 0,
        dureeAnnees: 25,
        source: "Loi 2017-06 relative aux zones économiques spéciales",
    },
    {
        id: "abidjan",
        nom: "Zone franche de la biotechnologie et des TIC (VITIB)",
        pays: "ci",
        paysNom: "Côte d'Ivoire",
        drapeau: "🇨🇮",
        tauxIS: 0,
        exonerationTVA: true,
        droitsDouane: 0,
        dureeAnnees: 20,
        source: "Loi 2004-429 portant régime de la zone franche",
    },
    {
        id: "douala",
        nom: "Zone franche industrielle de Douala",
        pays: "cm",
        paysNom: "Cameroun",
        drapeau: "🇨🇲",
        tauxIS: 17,
        exonerationTVA: true,
        droitsDouane: 0,
        dureeAnnees: 25,
        source: "Ordonnance 90/001 créant le régime de la zone franche",
    },
    {
        id: "cotonou",
        nom: "Zone franche industrielle du Bénin",
        pays: "bj",
        paysNom: "Bénin",
        drapeau: "🇧🇯",
        tauxIS: 0,
        exonerationTVA: true,
        droitsDouane: 0,
        dureeAnnees: 15,
        source: "Loi 2005-16 portant régime des zones franches industrielles",
    },
];

export type ParametresSimulation = {
    /** Chiffre d'affaires prévisionnel annuel. */
    chiffreAffaires: number;
    /**
     * Taux de marge nette attendu, en %. Sert d'assiette à l'impôt sur les
     * sociétés. La version précédente le figeait à 30 % sans le dire.
     */
    tauxMargeNette: number;
    /** Valeur annuelle des importations soumises aux droits de douane. */
    valeurImportations?: number;
    /** Taux de droits de douane hors zone, en %. Défaut : 20 % (TEC UEMOA). */
    tauxDouaneHorsZone?: number;
};

export type ResultatSimulation = {
    zone: ZoneFranche;
    /** Résultat imposable retenu. */
    resultatImposable: number;
    tauxISDroitCommun: number;
    tauxISZone: number;
    isDroitCommun: number;
    isZone: number;
    /** Économie annuelle d'impôt sur les sociétés. */
    economieIS: number;
    /** Économie annuelle de droits de douane. */
    economieDouane: number;
    /** Économie annuelle totale, hors TVA. */
    economieAnnuelle: number;
    /** Économie sur toute la durée de l'avantage. */
    economieTotale: number;
    hypotheses: string[];
    avertissements: string[];
};

/** Taux extérieur commun UEMOA retenu par défaut hors zone franche. */
export const TEC_PAR_DEFAUT = 20;

export function simulerZoneFranche(
    zone: ZoneFranche,
    params: ParametresSimulation
): ResultatSimulation {
    const hypotheses: string[] = [];
    const avertissements: string[] = [];

    const ca = Math.max(0, Number(params.chiffreAffaires) || 0);
    const tauxMarge = Math.max(0, Number(params.tauxMargeNette) || 0);
    const resultatImposable = (ca * tauxMarge) / 100;

    // Taux de droit commun du pays, et non un 30 % appliqué partout.
    const regle = REGLES_FISCALES[zone.pays as PaysFiscal];
    const tauxISDroitCommun = regle ? regle.tauxIS * 100 : 30;

    if (!regle) {
        avertissements.push(
            `Aucun taux de droit commun connu pour ${zone.paysNom} : 30 % retenu par défaut.`
        );
    }

    const isDroitCommun = (resultatImposable * tauxISDroitCommun) / 100;
    const isZone = (resultatImposable * zone.tauxIS) / 100;
    const economieIS = Math.max(0, isDroitCommun - isZone);

    // Droits de douane : économie réelle, contrairement à la TVA.
    const importations = Math.max(0, Number(params.valeurImportations) || 0);
    const tauxHorsZone = params.tauxDouaneHorsZone ?? TEC_PAR_DEFAUT;
    const economieDouane = (importations * (tauxHorsZone - zone.droitsDouane)) / 100;

    if (importations === 0) {
        hypotheses.push(
            "Valeur des importations non renseignée : l'économie de droits de douane est chiffrée à zéro."
        );
    }

    if (zone.exonerationTVA) {
        hypotheses.push(
            "L'exonération de TVA n'entre pas dans l'économie chiffrée : la TVA est collectée " +
                "puis reversée, elle ne grève pas le résultat. Son intérêt est de trésorerie " +
                "et de compétitivité prix."
        );
    }

    const economieAnnuelle = economieIS + economieDouane;

    if (resultatImposable === 0) {
        avertissements.push(
            "Résultat imposable nul : l'avantage d'impôt sur les sociétés ne se matérialise " +
                "qu'en cas de bénéfice."
        );
    }

    hypotheses.push(
        `Résultat imposable estimé à ${tauxMarge} % du chiffre d'affaires. ` +
            "Ajustez ce taux : il détermine à lui seul l'économie d'impôt."
    );

    avertissements.push(
        "Simulation indicative. L'accès au régime est subordonné à un agrément et au respect " +
            "de conditions (investissement minimum, part exportée, emplois créés) que ce calcul " +
            "ne vérifie pas."
    );

    return {
        zone,
        resultatImposable,
        tauxISDroitCommun,
        tauxISZone: zone.tauxIS,
        isDroitCommun,
        isZone,
        economieIS,
        economieDouane,
        economieAnnuelle,
        economieTotale: economieAnnuelle * zone.dureeAnnees,
        hypotheses,
        avertissements,
    };
}
