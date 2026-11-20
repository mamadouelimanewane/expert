// ─────────────────────────────────────────────────────────────────────────────
// Dossier de Travail CAC Automatisé (Norme ISA 230 / NEP 230 & Traçabilité)
// Organisation standardisée des papiers de travail et scellement d'intégrité
// ─────────────────────────────────────────────────────────────────────────────

import { generateHash } from "@/lib/blockchain-archiver";

export type StatutSection = "NON_COMMENCE" | "EN_COURS" | "REVUE_REQUISE" | "VALIDE";

export interface FeuilleTravail {
    id: string;
    reference: string;          // ex: "D.10.1", "T.20.3"
    titre: string;
    objectifs: string;
    assertions: Array<"EXISTENCE" | "EXHAUSTIVITE" | "EVALUATION" | "DROITS_OBLIGATIONS" | "PRESENTATION">;
    conclusions: string;
    redacteur: string;
    reviseur?: string;
    dateValidation?: string;
    statut: "EN_COURS" | "VALIDE" | "POINTS_EN_SUSPENS";
    anomaliesDetectees: number;
    montantAnomaliesFCFA: number;
}

export interface SectionDossier {
    code: string;               // "P", "G", "A", "B", "C", "D", "E", "F", "T", "R"
    nom: string;
    description: string;
    feuilles: FeuilleTravail[];
    statut: StatutSection;
    obligatoirePourOpinion: boolean;
}

export interface DossierAuditComplet {
    id: string;
    entite: string;
    exercice: number;
    dateCreation: string;
    seuilSignificationFCFA: number;
    seuilRemonteeAnomaliesFCFA: number;
    sections: SectionDossier[];
    dateScellement?: string;
    scellementSignataire?: string;
    hashIntegriteSHA256?: string;
    signatureCertificat?: string;
}

export interface BilanCompletude {
    tauxCompletudePourcentage: number; // 0-100
    sectionsValidees: number;
    sectionsEnAttente: number;
    totalFeuilles: number;
    totalAnomaliesRelevees: number;
    totalMontantAnomaliesFCFA: number;
    depassementSeuilSignification: boolean;
    pretPourEmissionOpinion: boolean;
    sectionsBloquantes: string[];
}

export interface DossierScelle {
    dossierId: string;
    entite: string;
    exercice: number;
    horodatage: string;
    signataire: string;
    hashSHA256: string;
    signatureCertificat: string;
    bilan: BilanCompletude;
    indexSommaire: string;
}

const SECTIONS_STANDARDS_ISA230: Omit<SectionDossier, "feuilles" | "statut">[] = [
    { code: "P", nom: "Dossier Permanent", description: "Statuts, RCCM, conventions réglementées, procès-verbaux d'AG et contrats stratégiques", obligatoirePourOpinion: true },
    { code: "G", nom: "Dossier Général & Planification", description: "Lettre de mission (ISA 210), plan de mission (ISA 300), seuils (ISA 320), circularisation (ISA 505)", obligatoirePourOpinion: true },
    { code: "A", nom: "Capitaux Propres & Emprunts", description: "Comptes de capitaux, réserves légales, report à nouveau, dettes financières à long terme (Classe 1)", obligatoirePourOpinion: true },
    { code: "B", nom: "Immobilisations", description: "Actifs corporels, incorporels et financiers, amortissements et dépréciations (Classe 2)", obligatoirePourOpinion: true },
    { code: "C", nom: "Stocks & En-cours", description: "Assistance à l'inventaire physique, valorisation FIFO/CUMP, dépréciation des stocks (Classe 3)", obligatoirePourOpinion: true },
    { code: "D", nom: "Clients & Ventes", description: "Circulations directes créances, balance âgée, dépréciations clients douteux (Classe 41)", obligatoirePourOpinion: true },
    { code: "E", nom: "Fournisseurs & Achats", description: "Coupure des achats (cut-off), circularisation fournisseurs, factures non parvenues (Classe 40)", obligatoirePourOpinion: true },
    { code: "F", nom: "Personnel & Social", description: "Cadrage paie-compta, cotisations de sécurité sociale, engagements de retraite (Classe 42, 43, 66)", obligatoirePourOpinion: true },
    { code: "T", nom: "Trésorerie & Banque", description: "Confirmations bancaires directes, états de rapprochement, contrôle de caisse (Classe 5)", obligatoirePourOpinion: true },
    { code: "R", nom: "Résultat & Revue Analytique", description: "Revue analytique des charges et produits, contrôle de conformité fiscale (Classes 6 et 7)", obligatoirePourOpinion: true },
];

/**
 * Initialise un dossier de travail CAC complet selon l'arborescence ISA 230.
 */
export function initialiserDossierCAC(
    entite: string,
    exercice: number,
    seuilSignificationFCFA: number
): DossierAuditComplet {
    const id = `CAC-${entite.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 8)}-${exercice}`;
    const seuilRemontee = Math.round(seuilSignificationFCFA * 0.05); // Seuil d'anomalies manifestement insignifiantes (5%)

    const sections: SectionDossier[] = SECTIONS_STANDARDS_ISA230.map((s) => ({
        ...s,
        feuilles: [],
        statut: "NON_COMMENCE",
    }));

    return {
        id,
        entite,
        exercice,
        dateCreation: new Date().toISOString(),
        seuilSignificationFCFA,
        seuilRemonteeAnomaliesFCFA: seuilRemontee,
        sections,
    };
}

/**
 * Ajoute ou met à jour une feuille de travail dans la section correspondante.
 */
export function ajouterFeuilleTravail(
    dossier: DossierAuditComplet,
    sectionCode: string,
    feuille: FeuilleTravail
): DossierAuditComplet {
    const sectionsModifiees = dossier.sections.map((sec) => {
        if (sec.code.toUpperCase() !== sectionCode.toUpperCase()) return sec;

        const indexExistante = sec.feuilles.findIndex((f) => f.reference === feuille.reference);
        let nouvellesFeuilles: FeuilleTravail[];

        if (indexExistante >= 0) {
            nouvellesFeuilles = [...sec.feuilles];
            nouvellesFeuilles[indexExistante] = feuille;
        } else {
            nouvellesFeuilles = [...sec.feuilles, feuille];
        }

        // Calcul du nouveau statut de la section
        const toutesValidees = nouvellesFeuilles.length > 0 && nouvellesFeuilles.every((f) => f.statut === "VALIDE");
        const aSuspension = nouvellesFeuilles.some((f) => f.statut === "POINTS_EN_SUSPENS");

        let nouveauStatut: StatutSection = "EN_COURS";
        if (toutesValidees) nouveauStatut = "VALIDE";
        else if (aSuspension) nouveauStatut = "REVUE_REQUISE";

        return {
            ...sec,
            feuilles: nouvellesFeuilles,
            statut: nouveauStatut,
        };
    });

    return {
        ...dossier,
        sections: sectionsModifiees,
    };
}

/**
 * Évalue la complétude du dossier et vérifie l'absence de points bloquants avant opinion.
 */
export function evaluerCompletudeDossier(dossier: DossierAuditComplet): BilanCompletude {
    const totalSections = dossier.sections.length;
    const sectionsValidees = dossier.sections.filter((s) => s.statut === "VALIDE").length;
    const sectionsEnAttente = totalSections - sectionsValidees;

    let totalFeuilles = 0;
    let totalAnomaliesRelevees = 0;
    let totalMontantAnomaliesFCFA = 0;
    const sectionsBloquantes: string[] = [];

    for (const sec of dossier.sections) {
        totalFeuilles += sec.feuilles.length;
        for (const f of sec.feuilles) {
            totalAnomaliesRelevees += f.anomaliesDetectees || 0;
            totalMontantAnomaliesFCFA += f.montantAnomaliesFCFA || 0;
        }

        if (sec.obligatoirePourOpinion && sec.statut !== "VALIDE") {
            sectionsBloquantes.push(`${sec.code} - ${sec.nom} (${sec.statut})`);
        }
    }

    const tauxCompletude = Math.round((sectionsValidees / totalSections) * 100);
    const depassementSeuil = totalMontantAnomaliesFCFA >= dossier.seuilSignificationFCFA;
    const pretPourOpinion = sectionsBloquantes.length === 0;

    return {
        tauxCompletudePourcentage: tauxCompletude,
        sectionsValidees,
        sectionsEnAttente,
        totalFeuilles,
        totalAnomaliesRelevees,
        totalMontantAnomaliesFCFA,
        depassementSeuilSignification: depassementSeuil,
        pretPourEmissionOpinion: pretPourOpinion,
        sectionsBloquantes,
    };
}

/**
 * Scelle le dossier d'audit avec horodatage et empreinte cryptographique SHA-256.
 */
export function scellerDossierAudit(
    dossier: DossierAuditComplet,
    signataire: string
): DossierScelle {
    const horodatage = new Date().toISOString();
    const bilan = evaluerCompletudeDossier(dossier);

    // Contenu sérialisé pour le calcul du hash d'intégrité
    const payload = JSON.stringify({
        id: dossier.id,
        entite: dossier.entite,
        exercice: dossier.exercice,
        seuil: dossier.seuilSignificationFCFA,
        sections: dossier.sections.map((s) => ({
            code: s.code,
            statut: s.statut,
            feuilles: s.feuilles.map((f) => ({
                ref: f.reference,
                anomalies: f.montantAnomaliesFCFA,
                statut: f.statut,
            })),
        })),
        signataire,
        horodatage,
    });

    const hashSHA256 = generateHash(payload);
    const signatureCertificat = `CERT-ISA230-${generateHash(hashSHA256 + signataire).substring(0, 16).toUpperCase()}`;

    // Index sommaire textuel
    let indexSommaire = `=== INDEX NUMÉRIQUE DU DOSSIER D'AUDIT (ISA 230) ===\n`;
    indexSommaire += `Entité : ${dossier.entite} | Exercice : ${dossier.exercice} | Réf : ${dossier.id}\n`;
    indexSommaire += `Scellé le : ${horodatage} par ${signataire}\n`;
    indexSommaire += `Empreinte SHA-256 : ${hashSHA256}\n`;
    indexSommaire += `Certificat d'intégrité : ${signatureCertificat}\n\n`;

    indexSommaire += `--- SOMMAIRE DES SECTIONS ---\n`;
    for (const sec of dossier.sections) {
        indexSommaire += `[${sec.statut}] Section ${sec.code} : ${sec.nom} (${sec.feuilles.length} feuille(s))\n`;
        for (const f of sec.feuilles) {
            indexSommaire += `    • ${f.reference} - ${f.titre} [${f.statut}] (Anomalies: ${f.montantAnomaliesFCFA.toLocaleString("fr-FR")} FCFA)\n`;
        }
    }

    return {
        dossierId: dossier.id,
        entite: dossier.entite,
        exercice: dossier.exercice,
        horodatage,
        signataire,
        hashSHA256,
        signatureCertificat,
        bilan,
        indexSommaire,
    };
}
