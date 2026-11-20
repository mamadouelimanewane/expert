// ─────────────────────────────────────────────────────────────────────────────
// Matrice des Conventions Fiscales Internationales & Retenues Transfrontalières
// Référentiel UEMOA / Conventions bilatérales (France, Maroc, etc.).
// ─────────────────────────────────────────────────────────────────────────────

import type { PaysFiscal } from "@/lib/tax-simulator";

export type NatureFluxTransfrontalier =
    | "DIVIDENDES"
    | "INTERETS"
    | "REDEVANCES_LOGICIELS_BREVETS"
    | "ASSISTANCE_TECHNIQUE_MANAGEMENT_FEES"
    | "PRESTATIONS_DE_SERVICES_GENERALES"
    | "GAINS_IMMOBILIERS";

export interface RegleConventionnelle {
    tauxRetenueConventionnel: number; // en % (ex: 15 ou 0 si imposition exclusive dans l'État de résidence)
    etatImpositionExclusive?: "SOURCE" | "RESIDENCE" | "PARTAGEE";
    articleConvention: string;
    conditionsExigibles: string[];
    justificatifsRequis: string[];
}

export interface ConventionFiscaleBilateral {
    id: string;
    titre: string;
    paysSource: string; // Code ISO à 2 lettres (ex: SN, CI)
    paysBeneficiaire: string; // Code ISO à 2 lettres (ex: FR, MA, US, etc.)
    dateSignature: string;
    dateEntreeVigueur: string;
    estTraiteMultilateral?: boolean;
    regles: Record<NatureFluxTransfrontalier, RegleConventionnelle>;
}

export interface ResultatAnalyseTransfrontaliere {
    paysSource: string;
    paysBeneficiaire: string;
    natureFlux: NatureFluxTransfrontalier;
    montantBrutPaiement: number;
    conventionTrouvee: boolean;
    nomConvention?: string;
    tauxRetenueDroitCommun: number; // Taux sans convention (ex: 20%)
    tauxRetenueApplicable: number; // Taux avec convention (ex: 15% ou 0%)
    montantRetenuConventionnel: number;
    montantRetenuDroitCommun: number;
    economieFiscaleClient: number; // Gain immédiat grâce à la convention
    articleApplicable?: string;
    justificatifsObligatoires: string[];
    avertissementExpert: string;
}

/** Taux de droit commun de retenue à la source sur les paiements à des non-résidents. */
export const TAUX_DROIT_COMMUN_NON_RESIDENT: Record<string, Record<NatureFluxTransfrontalier, number>> = {
    SN: {
        DIVIDENDES: 10,
        INTERETS: 16,
        REDEVANCES_LOGICIELS_BREVETS: 20,
        ASSISTANCE_TECHNIQUE_MANAGEMENT_FEES: 20,
        PRESTATIONS_DE_SERVICES_GENERALES: 20,
        GAINS_IMMOBILIERS: 25,
    },
    CI: {
        DIVIDENDES: 15,
        INTERETS: 18,
        REDEVANCES_LOGICIELS_BREVETS: 20,
        ASSISTANCE_TECHNIQUE_MANAGEMENT_FEES: 20,
        PRESTATIONS_DE_SERVICES_GENERALES: 20,
        GAINS_IMMOBILIERS: 25,
    },
    CM: {
        DIVIDENDES: 16.5,
        INTERETS: 16.5,
        REDEVANCES_LOGICIELS_BREVETS: 16.5,
        ASSISTANCE_TECHNIQUE_MANAGEMENT_FEES: 16.5,
        PRESTATIONS_DE_SERVICES_GENERALES: 16.5,
        GAINS_IMMOBILIERS: 25,
    },
    BJ: {
        DIVIDENDES: 10,
        INTERETS: 15,
        REDEVANCES_LOGICIELS_BREVETS: 20,
        ASSISTANCE_TECHNIQUE_MANAGEMENT_FEES: 20,
        PRESTATIONS_DE_SERVICES_GENERALES: 20,
        GAINS_IMMOBILIERS: 25,
    },
};

const PAYS_UEMOA = ["SN", "CI", "BJ", "BF", "ML", "NE", "TG", "GW"];

export const CONVENTIONS_CATALOGUE: ConventionFiscaleBilateral[] = [
    // 1. Convention multilatérale UEMOA (Règlement 08/2008/CM/UEMOA)
    {
        id: "traite-uemoa-multilateral",
        titre: "Convention multilatérale UEMOA pour éviter les doubles impositions",
        paysSource: "UEMOA",
        paysBeneficiaire: "UEMOA",
        dateSignature: "2008-09-26",
        dateEntreeVigueur: "2010-01-01",
        estTraiteMultilateral: true,
        regles: {
            DIVIDENDES: {
                tauxRetenueConventionnel: 10,
                etatImpositionExclusive: "PARTAGEE",
                articleConvention: "Règlement 08/2008/CM/UEMOA art. 10",
                conditionsExigibles: ["Société distributrice et bénéficiaire résidentes dans l'espace UEMOA."],
                justificatifsRequis: ["Certificat de résidence fiscale de l'État UEMOA bénéficiaire."],
            },
            INTERETS: {
                tauxRetenueConventionnel: 15,
                etatImpositionExclusive: "PARTAGEE",
                articleConvention: "Règlement 08/2008/CM/UEMOA art. 11",
                conditionsExigibles: ["Créance rattachée à un établissement UEMOA."],
                justificatifsRequis: ["Contrat de prêt ou convention de compte courant enregistrée."],
            },
            REDEVANCES_LOGICIELS_BREVETS: {
                tauxRetenueConventionnel: 15,
                etatImpositionExclusive: "PARTAGEE",
                articleConvention: "Règlement 08/2008/CM/UEMOA art. 12",
                conditionsExigibles: ["Usage effectif d'un droit de propriété industrielle ou intellectuelle."],
                justificatifsRequis: ["Contrat de concession de licence avec justificatif de versement."],
            },
            ASSISTANCE_TECHNIQUE_MANAGEMENT_FEES: {
                tauxRetenueConventionnel: 0,
                etatImpositionExclusive: "RESIDENCE",
                articleConvention: "Règlement 08/2008/CM/UEMOA art. 7 (Bénéfices des entreprises)",
                conditionsExigibles: ["Absence d'établissement stable dans le pays de la source pour la réalisation de la mission."],
                justificatifsRequis: ["Certificat de résidence fiscale UEMOA", "Attestation de non-établissement stable sur place."],
            },
            PRESTATIONS_DE_SERVICES_GENERALES: {
                tauxRetenueConventionnel: 0,
                etatImpositionExclusive: "RESIDENCE",
                articleConvention: "Règlement 08/2008/CM/UEMOA art. 7",
                conditionsExigibles: ["Prestation effectuée par une entreprise résidente d'un autre État UEMOA."],
                justificatifsRequis: ["Certificat de résidence fiscale UEMOA."],
            },
            GAINS_IMMOBILIERS: {
                tauxRetenueConventionnel: 25,
                etatImpositionExclusive: "SOURCE",
                articleConvention: "Règlement 08/2008/CM/UEMOA art. 6",
                conditionsExigibles: ["Bien immobilier situé dans l'État de la source."],
                justificatifsRequis: ["Titre foncier et acte notarié de vente."],
            },
        },
    },

    // 2. Convention France - Sénégal (Convention du 29 mars 1974 modifiée)
    {
        id: "convention-france-senegal",
        titre: "Convention fiscale bilatérale France - Sénégal",
        paysSource: "SN",
        paysBeneficiaire: "FR",
        dateSignature: "1974-03-29",
        dateEntreeVigueur: "1976-06-01",
        regles: {
            DIVIDENDES: {
                tauxRetenueConventionnel: 15,
                etatImpositionExclusive: "PARTAGEE",
                articleConvention: "Convention France-Sénégal art. 16",
                conditionsExigibles: ["Bénéficiaire effectif résidant fiscalement en France."],
                justificatifsRequis: ["Formulaire Cerfa 5000 / 5001 de résidence fiscale validé par l'administration française."],
            },
            INTERETS: {
                tauxRetenueConventionnel: 15,
                etatImpositionExclusive: "PARTAGEE",
                articleConvention: "Convention France-Sénégal art. 18",
                conditionsExigibles: ["Prêt consenti par un établissement ou entreprise résidente de France."],
                justificatifsRequis: ["Attestation fiscale de résidence et contrat de prêt enregistré."],
            },
            REDEVANCES_LOGICIELS_BREVETS: {
                tauxRetenueConventionnel: 15,
                etatImpositionExclusive: "PARTAGEE",
                articleConvention: "Convention France-Sénégal art. 20",
                conditionsExigibles: ["Redevances pour l'usage ou la concession d'usage d'un droit d'auteur ou brevet."],
                justificatifsRequis: ["Contrat de licence", "Certificat de résidence fiscale française de l'année."],
            },
            ASSISTANCE_TECHNIQUE_MANAGEMENT_FEES: {
                tauxRetenueConventionnel: 15,
                etatImpositionExclusive: "PARTAGEE",
                articleConvention: "Convention France-Sénégal art. 20 (assimilation redevances/rémunérations pour assistance technique)",
                conditionsExigibles: ["Frais de siège ou assistance technique réelle et documentée."],
                justificatifsRequis: ["Rapport détaillé des prestations fournies", "Feuilles de temps", "Certificat Cerfa 5000."],
            },
            PRESTATIONS_DE_SERVICES_GENERALES: {
                tauxRetenueConventionnel: 0,
                etatImpositionExclusive: "RESIDENCE",
                articleConvention: "Convention France-Sénégal art. 7 (Bénéfices industriels et commerciaux)",
                conditionsExigibles: ["Aucun établissement stable de l'entreprise française au Sénégal."],
                justificatifsRequis: ["Attestation sur l'honneur d'absence d'établissement stable au Sénégal", "Certificat fiscal Cerfa 5000."],
            },
            GAINS_IMMOBILIERS: {
                tauxRetenueConventionnel: 25,
                etatImpositionExclusive: "SOURCE",
                articleConvention: "Convention France-Sénégal art. 6",
                conditionsExigibles: ["Immeuble situé au Sénégal."],
                justificatifsRequis: ["Acte de mutation immobilière."],
            },
        },
    },

    // 3. Convention France - Côte d'Ivoire (Convention du 6 avril 1966 modifiée)
    {
        id: "convention-france-cote-ivoire",
        titre: "Convention fiscale bilatérale France - Côte d'Ivoire",
        paysSource: "CI",
        paysBeneficiaire: "FR",
        dateSignature: "1966-04-06",
        dateEntreeVigueur: "1968-05-01",
        regles: {
            DIVIDENDES: {
                tauxRetenueConventionnel: 15,
                etatImpositionExclusive: "PARTAGEE",
                articleConvention: "Convention France-CI art. 15",
                conditionsExigibles: ["Bénéficiaire effectif résident français."],
                justificatifsRequis: ["Certificat de résidence fiscale Cerfa 5000."],
            },
            INTERETS: {
                tauxRetenueConventionnel: 15,
                etatImpositionExclusive: "PARTAGEE",
                articleConvention: "Convention France-CI art. 16",
                conditionsExigibles: ["Intérêts d'obligations ou de créances."],
                justificatifsRequis: ["Convention de prêt enregistrée", "Certificat fiscal."],
            },
            REDEVANCES_LOGICIELS_BREVETS: {
                tauxRetenueConventionnel: 10,
                etatImpositionExclusive: "PARTAGEE",
                articleConvention: "Convention France-CI art. 19",
                conditionsExigibles: ["Rémunération pour l'usage de droits de propriété industrielle ou intellectuelle."],
                justificatifsRequis: ["Contrat de licence", "Certificat de résidence fiscale."],
            },
            ASSISTANCE_TECHNIQUE_MANAGEMENT_FEES: {
                tauxRetenueConventionnel: 10,
                etatImpositionExclusive: "PARTAGEE",
                articleConvention: "Convention France-CI art. 19",
                conditionsExigibles: ["Assistance technique réelle avec valeur ajoutée identifiable."],
                justificatifsRequis: ["Dossier justificatif de la réalité des prestations", "Certificat fiscal."],
            },
            PRESTATIONS_DE_SERVICES_GENERALES: {
                tauxRetenueConventionnel: 0,
                etatImpositionExclusive: "RESIDENCE",
                articleConvention: "Convention France-CI art. 7",
                conditionsExigibles: ["Pas d'établissement stable en Côte d'Ivoire."],
                justificatifsRequis: ["Attestation de non-établissement stable", "Certificat fiscal."],
            },
            GAINS_IMMOBILIERS: {
                tauxRetenueConventionnel: 25,
                etatImpositionExclusive: "SOURCE",
                articleConvention: "Convention France-CI art. 5",
                conditionsExigibles: ["Bien situé en Côte d'Ivoire."],
                justificatifsRequis: ["Acte notarié."],
            },
        },
    },
];

/**
 * Analyse une opération transfrontalière et applique la convention fiscale appropriée.
 */
export function analyserOperationTransfrontaliere(params: {
    paysSource: string; // Ex: "SN"
    paysBeneficiaire: string; // Ex: "FR", "CI", "BJ"
    natureFlux: NatureFluxTransfrontalier;
    montantBrutPaiement: number;
}): ResultatAnalyseTransfrontaliere {
    const src = (params.paysSource || "").trim().toUpperCase();
    const ben = (params.paysBeneficiaire || "").trim().toUpperCase();
    const montant = Math.max(0, params.montantBrutPaiement);

    const tauxDroitCommunTable = TAUX_DROIT_COMMUN_NON_RESIDENT[src] || TAUX_DROIT_COMMUN_NON_RESIDENT.SN;
    const tauxDroitCommun = tauxDroitCommunTable[params.natureFlux] ?? 20;

    // 1. Chercher si les deux pays appartiennent à l'UEMOA
    const estUEMOA = PAYS_UEMOA.includes(src) && PAYS_UEMOA.includes(ben);

    let conventionTrouvee: ConventionFiscaleBilateral | undefined;

    if (estUEMOA) {
        conventionTrouvee = CONVENTIONS_CATALOGUE.find((c) => c.id === "traite-uemoa-multilateral");
    } else {
        conventionTrouvee = CONVENTIONS_CATALOGUE.find(
            (c) => c.paysSource === src && c.paysBeneficiaire === ben
        );
    }

    if (!conventionTrouvee) {
        const montantDroitCommun = Math.round((montant * tauxDroitCommun) / 100);
        return {
            paysSource: src,
            paysBeneficiaire: ben,
            natureFlux: params.natureFlux,
            montantBrutPaiement: montant,
            conventionTrouvee: false,
            tauxRetenueDroitCommun: tauxDroitCommun,
            tauxRetenueApplicable: tauxDroitCommun,
            montantRetenuConventionnel: montantDroitCommun,
            montantRetenuDroitCommun: montantDroitCommun,
            economieFiscaleClient: 0,
            justificatifsObligatoires: ["Attestation d'immatriculation fiscale étrangère", "Facture détaillée"],
            avertissementExpert:
                "Aucune convention fiscale bilatérale en vigueur répertoriée entre ces deux pays. Le taux de droit commun interne s'applique intégralement.",
        };
    }

    const regle = conventionTrouvee.regles[params.natureFlux];
    const tauxApplicable = regle ? regle.tauxRetenueConventionnel : tauxDroitCommun;

    const montantRetenuDroitCommun = Math.round((montant * tauxDroitCommun) / 100);
    const montantRetenuConventionnel = Math.round((montant * tauxApplicable) / 100);
    const economieFiscaleClient = Math.max(0, montantRetenuDroitCommun - montantRetenuConventionnel);

    return {
        paysSource: src,
        paysBeneficiaire: ben,
        natureFlux: params.natureFlux,
        montantBrutPaiement: montant,
        conventionTrouvee: true,
        nomConvention: conventionTrouvee.titre,
        tauxRetenueDroitCommun: tauxDroitCommun,
        tauxRetenueApplicable: tauxApplicable,
        montantRetenuConventionnel,
        montantRetenuDroitCommun,
        economieFiscaleClient,
        articleApplicable: regle?.articleConvention,
        justificatifsObligatoires: regle?.justificatifsRequis || [],
        avertissementExpert:
            tauxApplicable === 0
                ? "Attention : l'application du taux 0 % exige impérativement la conservation du certificat de résidence fiscale et de l'attestation de non-établissement stable. En cas de contrôle sans ces pièces, la retenue sera redressée avec pénalités de retard."
                : `Taux conventionnel réduit à ${tauxApplicable} % (au lieu de ${tauxDroitCommun} %). Assurez-vous d'avoir obtenu le formulaire officiel d'attestation fiscale avant d'effectuer le virement.`,
    };
}
