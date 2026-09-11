/**
 * Reconstitution d'une balance générale à partir d'un texte OCR ou d'un
 * tableau extrait d'un PDF.
 *
 * Une balance imprimée se présente en lignes « compte  intitulé  montants… »
 * avec 2 colonnes (débit / crédit), 3 (débit / crédit / solde), 4 (mouvements
 * débit / crédit + soldes débiteur / créditeur) ou 6 (à-nouveaux + mouvements
 * + soldes). L'OCR y introduit du bruit : « O » pour « 0 », « l » pour « 1 »,
 * séparateurs de milliers en espaces ou points, tirets pour zéro, colonnes
 * collées. Ce module ne fait aucune hypothèse sur la mise en page exacte : il
 * lit chaque ligne de droite à gauche (les montants d'abord), le compte à
 * gauche, l'intitulé au milieu, et remonte tout ce qu'il n'a pas su lire.
 *
 * Aucune valeur n'est inventée : une ligne illisible est rejetée avec son
 * texte d'origine, jamais complétée.
 */
import type { CompteBalance } from "./ohada/types";

export type LigneReconstituee = CompteBalance & {
    /** Texte d'origine, pour vérification à l'écran. */
    source: string;
    /** Nombre de montants lus sur la ligne (2, 3, 4, 6…). */
    colonnes: number;
    /** Faible si le compte ou un montant a dû être corrigé (O→0, l→1…). */
    confiance: "haute" | "moyenne" | "faible";
};

export type ResultatBalanceOCR = {
    lignes: LigneReconstituee[];
    rejets: { ligne: number; texte: string; raison: string }[];
    /** Lignes « TOTAL » lues sur le document, pour contrôle. */
    totauxDetectes: { debit: number; credit: number } | null;
    totauxCalcules: { debit: number; credit: number; equilibree: boolean; ecart: number };
    /** Concordance entre les totaux imprimés et la somme des lignes lues. */
    controleTotaux: "concordant" | "ecart" | "absent";
    /** Disposition des colonnes déduite de l'en-tête ou du nombre de montants. */
    disposition: "debit-credit" | "debit-credit-solde" | "mouvements-soldes" | "anouveaux-mouvements-soldes" | "solde-signe" | "inconnue";
};

const SEP_MILLIERS = /[\s  .']/g;

/** Corrige les confusions OCR courantes dans un jeton qui doit être numérique. */
function corrigerChiffres(jeton: string): { valeur: string; corrige: boolean } {
    const avant = jeton;
    const apres = jeton
        .replace(/[Oo]/g, "0")
        .replace(/[lI|]/g, "1")
        .replace(/S/g, "5")
        .replace(/B/g, "8")
        .replace(/Z/g, "2");
    return { valeur: apres, corrige: apres !== avant };
}

/** Un jeton ressemble-t-il à un montant (après correction OCR) ? */
const MONTANT_RE = /^\(?-?(?:\d{1,3}(?:[\s  .']\d{3})+|\d+)(?:[.,]\d{1,2})?\)?$/;
// Un zéro est imprimé « - », que l'OCR lit aussi « — », « = », « ~ » ou « . ».
const ZERO_RE = /^[-–—_=~·.,]{1,3}$/;

function lireMontant(brut: string): { ok: boolean; valeur: number; corrige: boolean } {
    const j = brut.trim();
    if (ZERO_RE.test(j)) return { ok: true, valeur: 0, corrige: false };
    // Un jeton essentiellement numérique peut contenir des lettres mal lues
    // Seules les lettres confondues par l'OCR avec des chiffres (O, l, I, S,
    // B, Z) sont corrigées, et uniquement si le jeton contient au moins un
    // vrai chiffre : « 28.4OO.OOO » devient un montant, « BOB » reste un mot.
    const chiffres = (j.match(/\d/g) ?? []).length;
    const lettres = j.match(/[A-Za-z]/g) ?? [];
    let candidat = j, corrige = false;
    if (lettres.length > 0 && chiffres >= 1 && lettres.every((l) => /[OolISBZ]/.test(l))) { const c = corrigerChiffres(j); candidat = c.valeur; corrige = c.corrige; }
    if (!MONTANT_RE.test(candidat)) return { ok: false, valeur: 0, corrige };
    const negatif = /^\(.*\)$/.test(candidat) || candidat.startsWith("-");
    const s = candidat.replace(/[()\-]/g, "");
    // Décimales : « 1 250 000,50 » ou « 1250000.50 » (2 chiffres après le dernier séparateur)
    const dec = s.match(/^(.*?)[.,](\d{1,2})$/);
    let entier = s, cents = "0";
    if (dec) { entier = dec[1]; cents = dec[2]; }
    entier = entier.replace(SEP_MILLIERS, "").replace(/,/g, "");
    if (!/^\d+$/.test(entier)) return { ok: false, valeur: 0, corrige };
    const valeur = Number(entier) + Number(cents.padEnd(2, "0")) / 100;
    return { ok: true, valeur: negatif ? -valeur : valeur, corrige };
}

function lireCompte(brut: string): { ok: boolean; numero: string; corrige: boolean } {
    const j = brut.replace(/\s+/g, "");
    const c = corrigerChiffres(j);
    const numero = c.valeur.replace(/[^0-9]/g, "");
    // Comptes OHADA : classe 1 à 9, 3 à 13 chiffres. Un compte de 2 chiffres
    // est un en-tête de classe, pas une ligne de balance.
    if (!/^[1-9]\d{2,12}$/.test(numero) || numero.length !== c.valeur.length) return { ok: false, numero, corrige: c.corrige };
    return { ok: true, numero, corrige: c.corrige };
}

const EN_TETE_RE = /\b(compte|intitul|libell|d[eé]bit|cr[eé]dit|solde|mouvement|nouveau)/i;
const TOTAL_RE = /^\s*(total|sous[-\s]?total|totaux|cumul)\b/i;
const CLASSE_RE = /^\s*(total\s+)?classe\s+\d/i;

/** Découpe une ligne en jetons : colonnes séparées par « | », tabulation ou au moins 2 espaces ; sinon espaces simples. */
function jetons(ligne: string): string[] {
    const forts = ligne.split(/\s*\|\s*|\t|\s{2,}/).map((t) => t.trim()).filter(Boolean);
    // Le compte ayant déjà été retiré, « intitulé + montants » donne au moins 2 jetons forts.
    if (forts.length >= 2) return forts;
    return ligne.trim().split(/\s+/);
}

/**
 * Sépare, sur les jetons d'une ligne, les montants (à droite) du reste.
 * Les montants avec espaces de milliers arrivent découpés en plusieurs jetons
 * (« 28 400 000 » → « 28 », « 400 », « 000 ») : on recolle les groupes de 3.
 */
function extraireMontants(tokens: string[]): { montants: { valeur: number; corrige: boolean }[]; reste: string[] } {
    const montants: { valeur: number; corrige: boolean }[] = [];
    let i = tokens.length - 1;
    while (i >= 0 && montants.length < 6) {
        // Recoller « 28 400 000 » / « 400 000,00 » lus en jetons séparés
        let j = i, groupe = tokens[i];
        while (j - 1 >= 0 && /^\d{3}(?:[.,]\d{1,2})?$/.test(tokens[j]) && /^-?\d{1,3}$/.test(tokens[j - 1])) {
            groupe = tokens[j - 1] + " " + groupe; j--;
            if (!/^\d{3}$/.test(tokens[j])) break;
        }
        const m = lireMontant(groupe);
        if (!m.ok) break;
        montants.unshift({ valeur: m.valeur, corrige: m.corrige });
        i = j - 1;
    }
    return { montants, reste: tokens.slice(0, i + 1) };
}

function deduireDisposition(nb: number, enTete: string | null): ResultatBalanceOCR["disposition"] {
    if (enTete) {
        const h = enTete.toLowerCase();
        const soldes = (h.match(/solde/g) ?? []).length;
        const nouveaux = /nouveau|report|ouverture/.test(h);
        if (nouveaux && soldes >= 1) return "anouveaux-mouvements-soldes";
        if (soldes >= 2 || (soldes === 1 && /mouvement/.test(h) && nb >= 4)) return "mouvements-soldes";
        if (soldes === 1) return nb === 1 ? "solde-signe" : "debit-credit-solde";
    }
    if (nb === 1) return "solde-signe";
    if (nb === 2) return "debit-credit";
    if (nb === 3) return "debit-credit-solde";
    if (nb === 4 || nb === 5) return "mouvements-soldes";
    if (nb >= 6) return "anouveaux-mouvements-soldes";
    return "inconnue";
}

/** Choisit (débit, crédit) selon la disposition et le nombre de montants. */
function debitCredit(m: number[], disposition: ResultatBalanceOCR["disposition"]): { debit: number; credit: number } {
    const n = m.length;
    if (n === 1) return m[0] >= 0 ? { debit: m[0], credit: 0 } : { debit: 0, credit: -m[0] };
    if (disposition === "debit-credit" || disposition === "debit-credit-solde" || n <= 3) return { debit: Math.abs(m[0]), credit: Math.abs(m[1]) };
    // mouvements + soldes (4) ou à-nouveaux + mouvements + soldes (6) : les
    // soldes sont les deux derniers montants — c'est ce que le bilan attend.
    return { debit: Math.abs(m[n - 2]), credit: Math.abs(m[n - 1]) };
}

export function parserBalanceTexte(texte: string): ResultatBalanceOCR {
    const lignesBrutes = texte.split(/\r?\n/);
    const enTete = lignesBrutes.find((l) => EN_TETE_RE.test(l) && (l.match(EN_TETE_RE) ? (l.toLowerCase().match(/compte|d[eé]bit|cr[eé]dit|solde/g) ?? []).length >= 2 : false)) ?? null;

    const candidats: { idx: number; texte: string; numero: string; intitule: string; montants: { valeur: number; corrige: boolean }[]; compteCorrige: boolean }[] = [];
    const rejets: ResultatBalanceOCR["rejets"] = [];
    let totauxDetectes: { debit: number; credit: number } | null = null;

    lignesBrutes.forEach((brute, idx) => {
        const ligne = brute.trim();
        if (!ligne) return;
        if (ligne === enTete?.trim() || EN_TETE_RE.test(ligne) && (ligne.toLowerCase().match(/compte|d[eé]bit|cr[eé]dit|solde|intitul/g) ?? []).length >= 2) return;
        if (CLASSE_RE.test(ligne)) return;
        if (TOTAL_RE.test(ligne)) {
            const { montants } = extraireMontants(jetons(ligne));
            if (montants.length >= 2 && !totauxDetectes) {
                // Totaux généraux : même règle de colonnes que les lignes
                const v = montants.map((x) => x.valeur);
                totauxDetectes = v.length >= 4 ? { debit: Math.abs(v[v.length - 2]), credit: Math.abs(v[v.length - 1]) } : { debit: Math.abs(v[0]), credit: Math.abs(v[1]) };
            }
            return;
        }
        // Le compte est lu en tête de ligne indépendamment de la tokenisation :
        // l'OCR ne met souvent qu'un espace entre le compte et l'intitulé alors
        // que les colonnes de montants en ont plusieurs.
        const tete = ligne.match(/^([1-9][\dOolIS]{2,12})(?:\s+|(?=[A-Za-zÀ-ÿ]))(.*)$/);
        const compte = tete ? lireCompte(tete[1]) : { ok: false as const, numero: "", corrige: false };
        if (!tete || !compte.ok) {
            // Une ligne sans compte en tête n'est pas une ligne de balance
            // (titre, pied de page, libellé replié sur deux lignes) : ignorée
            // sauf si elle contient des montants — auquel cas on la signale.
            const { montants } = extraireMontants(jetons(ligne));
            if (montants.length >= 1 && /\d{3}/.test(ligne)) rejets.push({ ligne: idx + 1, texte: ligne, raison: "compte illisible en début de ligne" });
            return;
        }
        const t = jetons(tete[2]);
        if (t.length < 1) { rejets.push({ ligne: idx + 1, texte: ligne, raison: "aucun montant lu" }); return; }
        const { montants, reste } = extraireMontants(t);
        if (montants.length === 0) { rejets.push({ ligne: idx + 1, texte: ligne, raison: "aucun montant lu" }); return; }
        candidats.push({ idx, texte: ligne, numero: compte.numero, intitule: reste.join(" ").replace(/\s+/g, " ").trim(), montants, compteCorrige: compte.corrige });
    });

    // Disposition : la plus fréquente parmi les lignes lues
    const freq = new Map<number, number>();
    candidats.forEach((c) => freq.set(c.montants.length, (freq.get(c.montants.length) ?? 0) + 1));
    const nbDominant = [...freq.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0;
    const disposition = deduireDisposition(nbDominant, enTete);

    const lignes: LigneReconstituee[] = [];
    for (const c of candidats) {
        const v = c.montants.map((m) => m.valeur);
        const { debit, credit } = debitCredit(v, disposition);
        const corrige = c.compteCorrige || c.montants.some((m) => m.corrige);
        const incomplet = c.montants.length < Math.min(nbDominant, 2);
        lignes.push({
            numero: c.numero,
            intitule: c.intitule || c.numero,
            debit, credit,
            source: c.texte,
            colonnes: c.montants.length,
            confiance: incomplet ? "faible" : corrige ? "moyenne" : "haute",
        });
    }

    const totalDebit = lignes.reduce((s, l) => s + l.debit, 0);
    const totalCredit = lignes.reduce((s, l) => s + l.credit, 0);
    const ecart = Math.round((totalDebit - totalCredit) * 100) / 100;
    let controleTotaux: ResultatBalanceOCR["controleTotaux"] = "absent";
    if (totauxDetectes) {
        const td = totauxDetectes as { debit: number; credit: number };
        controleTotaux = Math.abs(td.debit - totalDebit) <= 1 && Math.abs(td.credit - totalCredit) <= 1 ? "concordant" : "ecart";
    }
    return {
        lignes, rejets, totauxDetectes,
        totauxCalcules: { debit: totalDebit, credit: totalCredit, equilibree: Math.abs(ecart) <= 1, ecart },
        controleTotaux, disposition,
    };
}

/**
 * Variante pour un tableau déjà découpé en cellules (PDF avec texte) :
 * chaque ligne est un tableau de cellules. On la ramène à une ligne de texte
 * séparée par « | » pour réutiliser le même analyseur.
 */
export function parserBalanceTableau(lignes: string[][]): ResultatBalanceOCR {
    const texte = lignes
        .map((cellules) => {
            const c = cellules.map((x) => String(x ?? "").trim());
            // Les cellules vides en tête sont retirées (marge, numéro de ligne) ;
            // celles du milieu deviennent « - » pour conserver l'alignement des
            // colonnes : une colonne Débit vide ne doit pas décaler le Crédit.
            while (c.length && !c[0]) c.shift();
            while (c.length && !c[c.length - 1]) c.pop();
            return c.map((x) => x || "-").join(" | ");
        })
        .filter(Boolean)
        .join("\n");
    return parserBalanceTexte(texte);
}
