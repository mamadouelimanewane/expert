// ─────────────────────────────────────────────────────────────────────────────
// Analyseur Intelligent de Quittances et Reçus Fiscaux (OCR / Parsing Textuel)
// Adapté aux quittances DGID (Sénégal - Senetaf), DGI (Côte d'Ivoire), etc.
// ─────────────────────────────────────────────────────────────────────────────

import type { DeclarationType } from "@prisma/client";

export interface QuittanceFiscaleExtraite {
    succes: boolean;
    confianceGlobale: number; // 0 à 100 %
    numeroQuittance: string | null;
    referenceTransaction: string | null;
    datePaiement: string | null; // YYYY-MM-DD
    montantPaye: number | null;
    identifiantContribuable: string | null; // NINEA ou IFU
    organismeEmetteur: "DGID_SENEGAL" | "DGI_COTE_IVOIRE" | "BANQUE_TRESOR" | "AUTRE";
    typeDeclarationDetecte: DeclarationType | null;
    periodeDetectee: string | null; // Ex: "2026-01"
    texteBrutExtrait: string;
    alertes: string[];
}

/**
 * Normalise un montant extrait d'une quittance (supprime les espaces, points de milliers, 'F', 'FCFA').
 */
export function parserMontantQuittance(chaine: string): number | null {
    if (!chaine) return null;
    let s = chaine.replace(/(FCFA|CFA|XOF|F)/gi, "").trim();
    // Gérer les séparateurs de milliers : points ou espaces suivis de 3 chiffres
    if (/^[0-9]{1,3}(?:\.[0-9]{3})+(?:,[0-9]{1,2})?$/.test(s)) {
        s = s.replace(/\./g, "").replace(",", ".");
    } else {
        s = s.replace(/[\s\u00A0\u202F]/g, "").replace(/[,]/g, ".");
    }
    const val = parseFloat(s);
    return !isNaN(val) && val > 0 ? Math.round(val) : null;
}

/**
 * Analyse le texte extrait d'un document PDF ou d'une image de quittance fiscale.
 */
export function analyserTexteQuittance(texteBrut: string): QuittanceFiscaleExtraite {
    const alertes: string[] = [];
    const texte = texteBrut || "";

    // 1. Détecter l'organisme émetteur
    let organisme: QuittanceFiscaleExtraite["organismeEmetteur"] = "AUTRE";
    if (/direction\s+g[eé]n[eé]rale\s+des\s+imp[oô]ts\s+et\s+des\s+domaines|dgid|s[eé]n[eé]gal|senetaf/i.test(texte)) {
        organisme = "DGID_SENEGAL";
    } else if (/direction\s+g[eé]n[eé]rale\s+des\s+imp[oô]ts|dgi|c[oô]te\s+d['’]ivoire|e-imp[oô]ts/i.test(texte)) {
        organisme = "DGI_COTE_IVOIRE";
    } else if (/tr[eé]sor\s+public|banque|re[cç]u\s+de\s+versement/i.test(texte)) {
        organisme = "BANQUE_TRESOR";
    }

    // 2. Extraire le numéro de quittance
    let numeroQuittance: string | null = null;
    const motifQuittance = [
        // Priorité aux références structurées typiques DGID/DGI
        /\b(QUIT-[0-9]{4}-[A-Z]{2,5}-[0-9A-Z]+)\b/i,
        /\b(CERT-[A-Z]{2}-[0-9]{4}-[0-9A-Z\-]+)\b/i,
        /\b(REC-[0-9]{4}-[0-9A-Z]+)\b/i,
        // Après le libellé "N° de quittance :"
        /(?:n[°o]\s+de\s+quittance|quittance\s+n[°o])\s*[:\s]\s*([A-Z0-9\-_\/]{5,40})/i,
        // Générique : "Quittance : XXXX" mais sans capturer un mot seul comme "FISCAL"
        /(?:quittance|re[cç]u)\s*(?:de\s+paiement)?\s*[:\s#]\s*([A-Z][A-Z0-9\-_\/]{4,39})\b/i,
    ];

    for (const regex of motifQuittance) {
        const m = texte.match(regex);
        if (m && m[1]) {
            numeroQuittance = m[1].trim();
            break;
        }
    }

    // 3. Extraire le montant
    let montantPaye: number | null = null;
    const motifMontant = [
        /(?:montant\s+(?:pay[eé]|r[eé]gl[eé]|acquitt[eé]|total|vers[eé]))\s*[:\s]\s*([0-9\s.,]+)\s*(?:f|cfa|fcfa|xof)?/i,
        /([0-9]{1,3}(?:[.\s][0-9]{3})+)\s*(?:f\s*cfa|fcfa|xof)/i,
        /(?:total\s+pay[eé]|net\s+[aà]\s+payer)\s*[:\s]\s*([0-9\s.,]+)/i,
    ];

    for (const regex of motifMontant) {
        const m = texte.match(regex);
        if (m && m[1]) {
            const parsed = parserMontantQuittance(m[1]);
            if (parsed && parsed > 0) {
                montantPaye = parsed;
                break;
            }
        }
    }

    // 4. Extraire l'identifiant fiscal (NINEA 9 ou 10 chiffres, IFU, NIF)
    let identifiantContribuable: string | null = null;
    const motifNinea = /(?:ninea|ifu|nif|ncc|immatriculation)\s*[:\s#]\s*([0-9a-zA-Z]{7,15})/i;
    const mNinea = texte.match(motifNinea);
    if (mNinea && mNinea[1]) {
        identifiantContribuable = mNinea[1].trim();
    } else {
        // Recherche brute de séquence NINEA sénégalais (ex: 9 chiffres)
        const bruteNinea = texte.match(/\b([0-9]{9,10}[A-Z0-9]?)\b/);
        if (bruteNinea && bruteNinea[1]) {
            identifiantContribuable = bruteNinea[1];
        }
    }

    // 5. Extraire la date de paiement
    let datePaiement: string | null = null;
    const motifDate = [
        /(?:date(?:\s+de\s+paiement|\s+du\s+versement|\s+d'encaissement)?)\s*[:\s]\s*([0-3]?[0-9][\/\-.][0-1]?[0-9][\/\-.](?:20)?[0-9]{2})/i,
        /\b([0-3][0-9]\/[0-1][0-9]\/20[2-3][0-9])\b/,
    ];

    for (const regex of motifDate) {
        const m = texte.match(regex);
        if (m && m[1]) {
            const parties = m[1].split(/[\/\-.]/);
            if (parties.length === 3) {
                const j = parties[0].padStart(2, "0");
                const m = parties[1].padStart(2, "0");
                let a = parties[2];
                if (a.length === 2) a = `20${a}`;
                datePaiement = `${a}-${m}-${j}`;
                break;
            }
        }
    }

    // 6. Identifier le type d'impôt
    let typeDeclaration: DeclarationType | null = null;
    if (/\btva\b|taxe\s+sur\s+la\s+valeur\s+ajout[eé]e/i.test(texte)) {
        typeDeclaration = "TVA";
    } else if (/\bis\b|imp[oô]t\s+sur\s+les\s+soci[eé]t[eé]s|acompte\s+is/i.test(texte)) {
        typeDeclaration = "IS";
    } else if (/\birpp\b|retenue\s+sur\s+salaires|trimf|its\b/i.test(texte)) {
        typeDeclaration = "IRPP";
    } else if (/cotisation|ipres|css|cnps|sécurité\s+sociale/i.test(texte)) {
        typeDeclaration = "COTISATION_SOCIALE";
    }

    // 7. Détecter la période (ex: Janvier 2026, 2026-01)
    let periodeDetectee: string | null = null;
    const moisNoms: Record<string, string> = {
        janvier: "01",
        fevrier: "02",
        février: "02",
        mars: "03",
        avril: "04",
        mai: "05",
        juin: "06",
        juillet: "07",
        aout: "08",
        août: "08",
        septembre: "09",
        octobre: "10",
        novembre: "11",
        decembre: "12",
        décembre: "12",
    };

    const motifMois = new RegExp(
        `(janvier|f[eé]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[eé]cembre)\\s+(20[2-3][0-9])`,
        "i"
    );
    const mMois = texte.match(motifMois);
    if (mMois && mMois[1] && mMois[2]) {
        const mKey = mMois[1].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const moisNum = moisNoms[mKey] || "01";
        periodeDetectee = `${mMois[2]}-${moisNum}`;
    }

    // Score de confiance
    let score = 0;
    if (numeroQuittance) score += 35;
    if (montantPaye) score += 35;
    if (datePaiement) score += 15;
    if (identifiantContribuable) score += 15;

    if (!numeroQuittance) alertes.push("Numéro de quittance non détecté.");
    if (!montantPaye) alertes.push("Montant acquitté introuvable dans le texte.");
    if (!datePaiement) alertes.push("Date d'opération manquante.");

    return {
        succes: score >= 50,
        confianceGlobale: Math.min(100, score),
        numeroQuittance,
        referenceTransaction: numeroQuittance,
        datePaiement,
        montantPaye,
        identifiantContribuable,
        organismeEmetteur: organisme,
        typeDeclarationDetecte: typeDeclaration,
        periodeDetectee,
        texteBrutExtrait: texte.slice(0, 500),
        alertes,
    };
}
