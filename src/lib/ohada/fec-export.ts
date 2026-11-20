// ─────────────────────────────────────────────────────────────────────────────
// Générateur du Fichier des Écritures Comptables (FEC) & Piste d'Audit Fiable
// Format séquentiel normalisé pour les vérifications fiscales en zone OHADA.
// ─────────────────────────────────────────────────────────────────────────────

import { createHash } from "crypto";

export interface LigneEcritureFEC {
    journalCode: string;
    journalLib: string;
    ecritureNum: string;
    ecritureDate: string; // YYYYMMDD ou YYYY-MM-DD
    compteNum: string;
    compteLib: string;
    compteAuxNum?: string;
    compteAuxLib?: string;
    pieceRef: string;
    pieceDate: string;
    ecritureLib: string;
    debit: number;
    credit: number;
    ecritureLettrage?: string;
    dateLettrage?: string;
    validDate: string;
    montantDevise?: number;
    iDevise?: string;
}

export interface RapportValidationFEC {
    conformeAudit: boolean;
    totalLignes: number;
    totalDebit: number;
    totalCredit: number;
    ecartBalance: number;
    periodeDebut: string;
    periodeFin: string;
    anomalies: string[];
    empreinteSHA256: string;
    dateGeneration: string;
}

export interface ResultatExportFEC {
    nomFichier: string;
    contenuTexte: string;
    rapport: RapportValidationFEC;
}

function normaliserDate(dateStr: string): string {
    if (!dateStr) return "";
    const clean = dateStr.replace(/[^0-9]/g, "");
    if (clean.length === 8) return clean; // YYYYMMDD
    if (dateStr.includes("-") || dateStr.includes("/")) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
            const y = d.getUTCFullYear();
            const m = String(d.getUTCMonth() + 1).padStart(2, "0");
            const day = String(d.getUTCDate()).padStart(2, "0");
            return `${y}${m}${day}`;
        }
    }
    return dateStr;
}

function formaterMontant(montant: number): string {
    return Math.abs(montant || 0).toFixed(2).replace(".", ",");
}

/**
 * Valide et convertit une liste d'écritures comptables en Fichier des Écritures Comptables (FEC).
 */
export function genererFEC(
    identifiantFiscalContribuable: string,
    exercice: number,
    ecritures: LigneEcritureFEC[],
    options?: {
        separateur?: "\t" | "|";
        deviseParDefaut?: string;
    }
): ResultatExportFEC {
    const separateur = options?.separateur || "\t";
    const devise = options?.deviseParDefaut || "XOF";
    const anomalies: string[] = [];

    let totalDebit = 0;
    let totalCredit = 0;
    let dateMin = "99999999";
    let dateMax = "00000000";

    const lignesFormatees: string[] = [];

    // En-tête officiel des 18 colonnes normées FEC
    const entete = [
        "JournalCode",
        "JournalLib",
        "EcritureNum",
        "EcritureDate",
        "CompteNum",
        "CompteLib",
        "CompteAuxNum",
        "CompteAuxLib",
        "PieceRef",
        "PieceDate",
        "EcritureLib",
        "Debit",
        "Credit",
        "EcritureLettrage",
        "DateLettrage",
        "ValidDate",
        "Montantdevise",
        "Idevise",
    ].join(separateur);

    lignesFormatees.push(entete);

    // Contrôles de séquentialité
    const numerosVus = new Set<string>();

    for (let index = 0; index < ecritures.length; index++) {
        const e = ecritures[index];
        const num = (e.compteNum || "").trim();

        if (!num) {
            anomalies.push(`Ligne ${index + 1} : Compte comptable manquant.`);
        }

        const dateEcriture = normaliserDate(e.ecritureDate);
        if (dateEcriture < dateMin) dateMin = dateEcriture;
        if (dateEcriture > dateMax) dateMax = dateEcriture;

        const debit = Math.max(0, Number(e.debit) || 0);
        const credit = Math.max(0, Number(e.credit) || 0);

        if (debit === 0 && credit === 0) {
            anomalies.push(`Ligne ${index + 1} : Écriture avec débit et crédit nuls (${e.pieceRef}).`);
        }

        totalDebit += debit;
        totalCredit += credit;

        const ligne = [
            (e.journalCode || "OD").trim(),
            (e.journalLib || "Opérations diverses").trim(),
            (e.ecritureNum || `${index + 1}`).trim(),
            dateEcriture,
            num,
            (e.compteLib || "Compte général").trim(),
            (e.compteAuxNum || "").trim(),
            (e.compteAuxLib || "").trim(),
            (e.pieceRef || "SANS_REF").trim(),
            normaliserDate(e.pieceDate || e.ecritureDate),
            (e.ecritureLib || "Écriture comptable").trim(),
            formaterMontant(debit),
            formaterMontant(credit),
            (e.ecritureLettrage || "").trim(),
            normaliserDate(e.dateLettrage || ""),
            normaliserDate(e.validDate || e.ecritureDate),
            e.montantDevise ? formaterMontant(e.montantDevise) : "",
            e.montantDevise ? (e.iDevise || devise) : "",
        ].join(separateur);

        lignesFormatees.push(ligne);
    }

    const ecartBalance = Math.round(Math.abs(totalDebit - totalCredit) * 100) / 100;
    if (ecartBalance > 0.01) {
        anomalies.push(
            `Déséquilibre du grand livre : Total Débit (${totalDebit.toFixed(2)}) != Total Crédit (${totalCredit.toFixed(2)}). Écart : ${ecartBalance.toFixed(2)}.`
        );
    }

    const contenuTexte = lignesFormatees.join("\r\n");

    // Calcul du hachage d'intégrité SHA-256 (Piste d'Audit Fiable)
    const empreinteSHA256 = createHash("sha256").update(contenuTexte, "utf8").digest("hex");

    const ifuClean = (identifiantFiscalContribuable || "CONTRIBUABLE").replace(/[^a-zA-Z0-9]/g, "");
    const extension = separateur === "\t" ? "txt" : "csv";
    const nomFichier = `${ifuClean}FEC${exercice}1231.${extension}`;

    const rapport: RapportValidationFEC = {
        conformeAudit: anomalies.length === 0,
        totalLignes: ecritures.length,
        totalDebit: Math.round(totalDebit),
        totalCredit: Math.round(totalCredit),
        ecartBalance,
        periodeDebut: dateMin !== "99999999" ? dateMin : `${exercice}0101`,
        periodeFin: dateMax !== "00000000" ? dateMax : `${exercice}1231`,
        anomalies,
        empreinteSHA256,
        dateGeneration: new Date().toISOString(),
    };

    return {
        nomFichier,
        contenuTexte,
        rapport,
    };
}
