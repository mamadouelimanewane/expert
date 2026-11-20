// ─────────────────────────────────────────────────────────────────────────────
// Générateur d'Attestations et Certificats de Retenue à la Source (BRS / BNC)
// Conforme au Code Général des Impôts (Sénégal art. 200+ ; UEMOA).
// ─────────────────────────────────────────────────────────────────────────────

import type { PaysFiscal } from "@/lib/tax-simulator";

export type TypeRetenueSource =
    | "BRS_PRESTATIONS_SERVICES_LOCALES" // 5 % Sénégal (art. 200)
    | "RETENUE_BNC_HONORAIRES"          // 10 % à 25 % selon pays
    | "RETENUE_NON_RESIDENTS_ETRANGERS" // 20 % standard ou taux conventionnel
    | "RETENUE_REVENUS_CAPITAUX_MOBILIERS" // IRVM 10 % à 15 %
    | "RETENUE_LOYERS_FONCIERS";        // 5 % à 15 % selon pays

export interface LigneFactureRetenue {
    numeroFacture: string;
    dateFacture: string;
    description: string;
    montantBrutHT: number;
    tauxRetenue: number; // en % (ex: 5)
    montantRetenu: number;
    montantNetRegle: number;
}

export interface EntitePartieFiscale {
    raisonSociale: string;
    identifiantFiscal: string; // NINEA, IFU, NIF
    registreCommerce?: string; // RCCM
    adresse: string;
    ville: string;
    pays: string;
    email?: string;
    telephone?: string;
}

export interface DonneesCertificatBRS {
    id: string;
    numeroCertificat: string;
    dateEmission: string;
    pays: PaysFiscal;
    typeRetenue: TypeRetenueSource;
    collecteur: EntitePartieFiscale;
    beneficiaire: EntitePartieFiscale;
    factures: LigneFactureRetenue[];
    totalBrutHT: number;
    totalRetenu: number;
    totalNetPaye: number;
    quittanceVersement?: {
        numeroQuittance: string;
        dateVersement: string;
        centreImpots: string;
        montantRecepisse: number;
    };
    signataireNom: string;
    signataireQualite: string;
    referenceLegale: string;
    cleControle: string;
}

/** Taux de retenue par défaut selon la nature et le pays. */
export const TAUX_RETENUE_DEFAUT: Record<PaysFiscal, Record<TypeRetenueSource, number>> = {
    sn: {
        BRS_PRESTATIONS_SERVICES_LOCALES: 5, // BRS 5 % CGI art. 200
        RETENUE_BNC_HONORAIRES: 10,
        RETENUE_NON_RESIDENTS_ETRANGERS: 20, // 20 % CGI art. 205
        RETENUE_REVENUS_CAPITAUX_MOBILIERS: 10,
        RETENUE_LOYERS_FONCIERS: 5,
    },
    ci: {
        BRS_PRESTATIONS_SERVICES_LOCALES: 7.5,
        RETENUE_BNC_HONORAIRES: 7.5,
        RETENUE_NON_RESIDENTS_ETRANGERS: 20,
        RETENUE_REVENUS_CAPITAUX_MOBILIERS: 15,
        RETENUE_LOYERS_FONCIERS: 15,
    },
    cm: {
        BRS_PRESTATIONS_SERVICES_LOCALES: 5.5,
        RETENUE_BNC_HONORAIRES: 11,
        RETENUE_NON_RESIDENTS_ETRANGERS: 16.5,
        RETENUE_REVENUS_CAPITAUX_MOBILIERS: 16.5,
        RETENUE_LOYERS_FONCIERS: 15,
    },
    bj: {
        BRS_PRESTATIONS_SERVICES_LOCALES: 5,
        RETENUE_BNC_HONORAIRES: 10,
        RETENUE_NON_RESIDENTS_ETRANGERS: 20,
        RETENUE_REVENUS_CAPITAUX_MOBILIERS: 10,
        RETENUE_LOYERS_FONCIERS: 10,
    },
};

/**
 * Génère une clé de contrôle d'authenticité pour le certificat de retenue.
 */
function genererCleVerification(collecteurId: string, beneficiaireId: string, total: number, date: string): string {
    const raw = `${collecteurId}|${beneficiaireId}|${total}|${date}|CABINET360_BRS_AUTH`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        hash = (hash << 5) - hash + raw.charCodeAt(i);
        hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, "0");
    return `BRS-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

/**
 * Construit un certificat légal de retenue à la source avec totaux et contrôles de cohérence.
 */
export function creerCertificatRetenueSource(params: {
    pays: PaysFiscal;
    typeRetenue: TypeRetenueSource;
    collecteur: EntitePartieFiscale;
    beneficiaire: EntitePartieFiscale;
    factures: Array<{
        numeroFacture: string;
        dateFacture: string;
        description: string;
        montantBrutHT: number;
        tauxRetenue?: number;
    }>;
    quittanceVersement?: {
        numeroQuittance: string;
        dateVersement: string;
        centreImpots: string;
        montantRecepisse: number;
    };
    signataireNom: string;
    signataireQualite?: string;
    dateEmission?: string;
}): DonneesCertificatBRS {
    const dateEmission = params.dateEmission || new Date().toISOString().slice(0, 10);
    const tauxParDefaut = TAUX_RETENUE_DEFAUT[params.pays][params.typeRetenue];

    const lignesFactures: LigneFactureRetenue[] = params.factures.map((f) => {
        const taux = f.tauxRetenue ?? tauxParDefaut;
        const brut = Math.max(0, f.montantBrutHT);
        const montantRetenu = Math.round((brut * taux) / 100);
        const montantNetRegle = brut - montantRetenu;
        return {
            numeroFacture: f.numeroFacture,
            dateFacture: f.dateFacture,
            description: f.description,
            montantBrutHT: brut,
            tauxRetenue: taux,
            montantRetenu,
            montantNetRegle,
        };
    });

    const totalBrutHT = lignesFactures.reduce((sum, l) => sum + l.montantBrutHT, 0);
    const totalRetenu = lignesFactures.reduce((sum, l) => sum + l.montantRetenu, 0);
    const totalNetPaye = totalBrutHT - totalRetenu;

    const annee = dateEmission.slice(0, 4);
    const cleControle = genererCleVerification(
        params.collecteur.identifiantFiscal,
        params.beneficiaire.identifiantFiscal,
        totalRetenu,
        dateEmission
    );
    const numeroCertificat = `CERT-${params.pays.toUpperCase()}-${annee}-${cleControle}`;

    const ref =
        params.pays === "sn"
            ? "CGI Sénégal art. 200 et suivants (Retenue à la source sur sommes versées à des tiers)"
            : params.pays === "ci"
            ? "CGI Côte d'Ivoire art. 94 et suivants (Prélèvement à la source)"
            : "Réglementation fiscale UEMOA / OHADA";

    return {
        id: `brs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        numeroCertificat,
        dateEmission,
        pays: params.pays,
        typeRetenue: params.typeRetenue,
        collecteur: params.collecteur,
        beneficiaire: params.beneficiaire,
        factures: lignesFactures,
        totalBrutHT,
        totalRetenu,
        totalNetPaye,
        quittanceVersement: params.quittanceVersement,
        signataireNom: params.signataireNom,
        signataireQualite: params.signataireQualite || "Expert-Comptable / Représentant Légal",
        referenceLegale: ref,
        cleControle,
    };
}
