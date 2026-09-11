import { NextResponse } from "next/server";
import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Validation des corps de requête.
//
// Les routes écrivaient jusqu'ici `await request.json()` puis passaient le
// résultat tel quel à Prisma. Un champ manquant provoquait une erreur 500, un
// champ inattendu était accepté, et rien n'empêchait d'écrire une chaîne vide
// dans un identifiant fiscal. `zod` figurait déjà dans les dépendances sans
// être utilisé nulle part.
// ─────────────────────────────────────────────────────────────────────────────

export type ValidationOk<T> = { data: T; invalid: null };
export type ValidationKo = { data: null; invalid: NextResponse };

/**
 * Parse et valide le corps JSON d'une requête.
 *
 * ```ts
 * const { data, invalid } = await parseBody(request, clientCreateSchema);
 * if (invalid) return invalid;
 * ```
 */
export async function parseBody<T extends z.ZodTypeAny>(
    request: Request,
    schema: T
): Promise<ValidationOk<z.infer<T>> | ValidationKo> {
    let brut: unknown;

    try {
        brut = await request.json();
    } catch {
        return {
            data: null,
            invalid: NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 }),
        };
    }

    const resultat = schema.safeParse(brut);

    if (!resultat.success) {
        return {
            data: null,
            invalid: NextResponse.json(
                {
                    error: "Données invalides",
                    details: resultat.error.issues.map((i) => ({
                        champ: i.path.join(".") || "(racine)",
                        message: i.message,
                    })),
                },
                { status: 400 }
            ),
        };
    }

    return { data: resultat.data, invalid: null };
}

// ── Briques réutilisables ───────────────────────────────────────────────────

/** Identifiant MongoDB (ObjectId) : 24 caractères hexadécimaux. */
export const objectId = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Identifiant invalide");

/** Chaîne non vide, espaces de bordure supprimés. */
export const texteRequis = (max = 500) =>
    z.string().trim().min(1, "Champ requis").max(max);

/** Chaîne facultative : une valeur vide est normalisée en `undefined`. */
export const texteOptionnel = (max = 500) =>
    z
        .string()
        .trim()
        .max(max)
        .optional()
        .transform((v) => (v === "" ? undefined : v));

/** Montant monétaire en FCFA : positif, fini. */
export const montant = z
    .number({ invalid_type_error: "Montant numérique attendu" })
    .finite("Montant invalide")
    .nonnegative("Le montant ne peut pas être négatif");

/** Date acceptée en chaîne ISO ou en objet Date. */
export const dateISO = z.coerce.date({ invalid_type_error: "Date invalide" });

/** Code pays OHADA sur deux lettres (CI, SN, CM…). */
export const codePays = z
    .string()
    .trim()
    .toUpperCase()
    .length(2, "Code pays sur 2 lettres attendu");

// ── Schémas métier ──────────────────────────────────────────────────────────

export const clientCreateSchema = z
    .object({
        // Valeurs alignées sur les enums Prisma (prisma/schema.prisma).
        type: z.enum(["ENTREPRISE", "PARTICULIER", "ASSOCIATION"]).optional(),
        companyName: texteOptionnel(200),
        firstName: texteOptionnel(100),
        lastName: texteOptionnel(100),
        email: z.string().trim().email("Adresse email invalide"),
        phone: texteRequis(40),
        rccm: texteOptionnel(50),
        ninea: texteOptionnel(50),
        ifu: texteOptionnel(50),
        nif: texteOptionnel(50),
        fiscalRegime: z.enum(["REEL_NORMAL", "REEL_SIMPLIFIE", "CME", "MICRO_ENTREPRISE"]).optional(),
        sector: texteOptionnel(120),
        country: codePays.optional(),
        address: texteOptionnel(300),
        city: texteOptionnel(120),
        postalCode: texteOptionnel(20),
        subjectToTva: z.boolean().optional(),
        isActive: z.boolean().optional(),
    })
    .refine((v) => v.companyName || v.firstName || v.lastName, {
        message: "Renseignez une raison sociale ou un nom",
        path: ["companyName"],
    });

export const invoiceStatut = z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]);

// Modification partielle d'un client : mêmes règles que la création, tous
// les champs optionnels (une fiche se corrige champ par champ).
export const clientUpdateSchema = z
    .object({
        type: z.enum(["ENTREPRISE", "PARTICULIER", "ASSOCIATION"]).optional(),
        companyName: texteOptionnel(200),
        firstName: texteOptionnel(100),
        lastName: texteOptionnel(100),
        email: z.string().trim().email("Adresse email invalide").optional(),
        phone: texteOptionnel(40),
        rccm: texteOptionnel(50),
        ninea: texteOptionnel(50),
        ifu: texteOptionnel(50),
        nif: texteOptionnel(50),
        fiscalRegime: z.enum(["REEL_NORMAL", "REEL_SIMPLIFIE", "CME", "MICRO_ENTREPRISE"]).optional(),
        sector: texteOptionnel(120),
        country: codePays.optional(),
        address: texteOptionnel(300),
        city: texteOptionnel(120),
        postalCode: texteOptionnel(20),
        subjectToTva: z.boolean().optional(),
        isActive: z.boolean().optional(),
    })
    .refine((v) => Object.keys(v).length > 0, { message: "Aucun champ à modifier" });

export const invoiceLineSchema = z.object({
    designation: texteOptionnel(300),
    quantity: z.number().finite().positive("Quantité strictement positive attendue"),
    unitPrice: montant,
});

export const invoiceCreateSchema = z.object({
    clientId: objectId,
    dueDate: dateISO,
    lines: z.array(invoiceLineSchema).min(1, "Au moins une ligne de facturation est requise"),
    taxRate: z.number().min(0).max(100).optional(),
    notes: texteOptionnel(2000),
});

export const invoiceUpdateSchema = z.object({
    id: objectId,
    status: invoiceStatut,
    paidDate: dateISO.optional(),
});

export const resetPasswordsSchema = z.object({
    emails: z
        .array(z.string().trim().email("Adresse email invalide"))
        .min(1, "Indiquez au moins une adresse")
        .max(50, "50 comptes au maximum par appel"),
});

// ─────────────────────────────────────────────────────────────────────────────
// Analyse des montants saisis.
//
// De nombreuses routes écrivaient `parseFloat(champ)` directement dans un
// Float Prisma. Deux corruptions silencieuses en découlaient :
//
//   parseFloat("1 500 000") === 1     (arrêt au premier espace)
//   parseFloat("abc")       === NaN   (valeur numérique JS valide, stockée
//                                      telle quelle, qui contamine ensuite
//                                      chaque reduce() d'agrégation)
//
// Or « 1 500 000 » et « 1.500.000 » sont exactement la manière dont
// l'application elle-même affiche les montants en FCFA. Un budget de mission
// ou des honoraires de lettre de mission pouvaient donc être enregistrés à
// 1 FCFA sans qu'aucune erreur ne soit levée.
//
// `analyserMontant` accepte les formats réellement saisis (séparateurs de
// milliers espace/point/virgule, décimale française) et refuse tout le reste
// plutôt que de deviner.
// ─────────────────────────────────────────────────────────────────────────────

export type MontantOk = { ok: true; valeur: number };
export type MontantKo = { ok: false; raison: string };

const MILLIERS_VIRGULE = /^[+-]?\d{1,3}(,\d{3})+$/;
const MILLIERS_POINT = /^[+-]?\d{1,3}(\.\d{3})+$/;
const NOMBRE_SIMPLE = /^[+-]?\d+(\.\d+)?$/;

export function analyserMontant(
    brut: unknown,
    options: { min?: number; max?: number } = {}
): MontantOk | MontantKo {
    let valeur: number;

    if (typeof brut === "number") {
        if (!Number.isFinite(brut)) return { ok: false, raison: "Montant non numérique." };
        valeur = brut;
    } else if (typeof brut === "string") {
        // Espaces ordinaires, insécables et fines insécables : tous utilisés
        // comme séparateurs de milliers par les navigateurs francophones.
        const nettoye = brut.replace(/[\s\u00a0\u202f']/g, "");
        if (nettoye === "") return { ok: false, raison: "Montant absent." };

        let normalise: string;
        if (MILLIERS_VIRGULE.test(nettoye)) {
            normalise = nettoye.replace(/,/g, "");
        } else if (MILLIERS_POINT.test(nettoye)) {
            normalise = nettoye.replace(/\./g, "");
        } else if (nettoye.includes(",") && nettoye.includes(".")) {
            // Les deux séparateurs : le dernier rencontré porte la décimale.
            const decimale = nettoye.lastIndexOf(",") > nettoye.lastIndexOf(".") ? "," : ".";
            const millier = decimale === "," ? "." : ",";
            normalise = nettoye.split(millier).join("").replace(decimale, ".");
        } else {
            normalise = nettoye.replace(",", ".");
        }

        if (!NOMBRE_SIMPLE.test(normalise)) {
            return { ok: false, raison: `Montant illisible : « ${brut} ».` };
        }
        valeur = Number(normalise);
        if (!Number.isFinite(valeur)) return { ok: false, raison: "Montant non numérique." };
    } else {
        return { ok: false, raison: "Montant absent." };
    }

    if (options.min !== undefined && valeur < options.min) {
        return { ok: false, raison: `Le montant doit être supérieur ou égal à ${options.min}.` };
    }
    if (options.max !== undefined && valeur > options.max) {
        return { ok: false, raison: `Le montant doit être inférieur ou égal à ${options.max}.` };
    }

    return { ok: true, valeur };
}

/**
 * Variante pour les champs optionnels : une valeur absente (undefined, null,
 * chaîne vide) est acceptée et vaut `null`. Une valeur présente mais illisible
 * reste refusée — c'est précisément ce que `champ ? parseFloat(champ) : null`
 * laissait passer.
 */
export function analyserMontantOptionnel(
    brut: unknown,
    options: { min?: number; max?: number } = {}
): { ok: true; valeur: number | null } | MontantKo {
    if (brut === undefined || brut === null || (typeof brut === "string" && brut.trim() === "")) {
        return { ok: true, valeur: null };
    }
    return analyserMontant(brut, options);
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalisation des dates d'écriture.
//
// `TpeJournal.date` est une chaîne (ligne brute du client), écrite telle quelle
// par plusieurs points d'entrée. L'export FEC la compare ensuite
// lexicographiquement (`date: { gte, lte }`) et la met en forme via `new Date()` :
// une écriture saisie « 15/01/2026 » sortait donc de la période demandée sans
// aucun signalement, ou produisait une colonne EcritureDate vide dans un fichier
// remis à l'administration.
//
// Toutes les dates sont donc ramenées à « AAAA-MM-JJ » à l'écriture, et une date
// illisible fait rejeter la ligne au lieu d'être acceptée puis perdue.
// ─────────────────────────────────────────────────────────────────────────────

const ISO = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/;
const JOUR_MOIS_ANNEE = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/;

function assembler(annee: string, mois: string, jour: string): string | null {
    const a = Number(annee);
    const m = Number(mois);
    const j = Number(jour);
    if (m < 1 || m > 12 || j < 1 || j > 31) return null;

    const d = new Date(Date.UTC(a, m - 1, j));
    // Rejette les dates qui « débordent » (31 février → 3 mars).
    if (d.getUTCFullYear() !== a || d.getUTCMonth() !== m - 1 || d.getUTCDate() !== j) return null;

    return `${annee.padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(j).padStart(2, "0")}`;
}

/** Ramène une date saisie à « AAAA-MM-JJ », ou `null` si elle est illisible. */
export function normaliserDateISO(brut: unknown): string | null {
    if (brut instanceof Date) {
        return isNaN(brut.getTime()) ? null : brut.toISOString().substring(0, 10);
    }
    if (typeof brut !== "string") return null;

    const valeur = brut.trim();
    if (valeur === "") return null;

    const iso = ISO.exec(valeur);
    if (iso) return assembler(iso[1], iso[2], iso[3]);

    const jma = JOUR_MOIS_ANNEE.exec(valeur);
    if (jma) return assembler(jma[3], jma[2], jma[1]);

    // Chaîne ISO complète avec heure (« 2026-01-15T10:30:00Z »).
    if (/^\d{4}-\d{2}-\d{2}T/.test(valeur)) {
        const d = new Date(valeur);
        return isNaN(d.getTime()) ? null : d.toISOString().substring(0, 10);
    }

    return null;
}

const MOIS_FR: Record<string, string> = {
    janvier: "01", janv: "01", jan: "01",
    fevrier: "02", "février": "02", fev: "02", "fév": "02",
    mars: "03", mar: "03",
    avril: "04", avr: "04",
    mai: "05",
    juin: "06", jun: "06",
    juillet: "07", juil: "07", jul: "07",
    aout: "08", "août": "08", aou: "08",
    septembre: "09", sept: "09", sep: "09",
    octobre: "10", oct: "10",
    novembre: "11", nov: "11",
    decembre: "12", "décembre": "12", dec: "12", "déc": "12",
};

/**
 * Ramène une période comptable à la forme canonique « AAAA-MM ».
 *
 * Le hub WhatsApp, l'import de transactions et les états financiers emploient
 * « 2026-06 » ; la saisie manuelle acceptait « JUIN-2026 » : les écritures
 * ainsi datées n'entraient jamais dans le bilan du mois. Formes reconnues :
 * « 2026-06 », « 06/2026 », « JUIN-2026 », « juin 2026 », « Sept-2026 ».
 * Retourne `null` si la période est illisible.
 */
export function normaliserPeriode(brut: unknown): string | null {
    if (typeof brut !== "string") return null;
    const v = brut.trim().toLowerCase();
    let m = v.match(/^(\d{4})-(\d{1,2})$/);
    if (m) return valider(m[1], m[2]);
    m = v.match(/^(\d{1,2})[/-](\d{4})$/);
    if (m) return valider(m[2], m[1]);
    m = v.match(/^([a-zéû]+)\.?[\s-]+(\d{4})$/);
    if (m && MOIS_FR[m[1]]) return `${m[2]}-${MOIS_FR[m[1]]}`;
    return null;
}

function valider(annee: string, mois: string): string | null {
    const mm = Number(mois);
    if (!Number.isInteger(mm) || mm < 1 || mm > 12) return null;
    return `${annee}-${String(mm).padStart(2, "0")}`;
}
