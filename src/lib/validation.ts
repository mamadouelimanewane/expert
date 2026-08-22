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
