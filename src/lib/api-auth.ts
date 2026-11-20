import { NextResponse } from "next/server";
import { AuthService } from "./auth";
import { isObjectId } from "./tenant-security";

// ─────────────────────────────────────────────────────────────────────────────
// Contrôle d'accès au niveau de chaque route API — défense en profondeur.
//
// `src/middleware.ts` refuse déjà toute requête /api/ sans session valide. Ce
// helper double ce contrôle DANS le route handler : si le middleware venait à
// être contourné (mauvais `matcher`, faille de bypass, appel interne), la route
// refuserait quand même de répondre. Aucune route métier ne doit dépendre d'un
// seul point de contrôle.
// ─────────────────────────────────────────────────────────────────────────────

export type ApiSession = {
    id: string;
    email: string;
    name: string;
    role: string;
    cabinetId: string | null;
};

/** Rôles internes au cabinet, autorisés par défaut sur les routes métier. */
export const STAFF_ROLES = ["ADMIN", "EXPERT", "COLLABORATOR", "ASSISTANT"] as const;

/** Rôles habilités à modifier des données comptables ou financières. */
export const WRITE_ROLES = ["ADMIN", "EXPERT", "COLLABORATOR"] as const;

/** Rôles d'administration. */
export const ADMIN_ROLES = ["ADMIN"] as const;

type Granted = { session: ApiSession; denied: null };
type Denied = { session: null; denied: NextResponse };

/**
 * Vérifie que l'appelant dispose d'une session valide et d'un rôle autorisé.
 *
 * ```ts
 * const { session, denied } = await requireStaff();
 * if (denied) return denied;
 * ```
 */
export async function requireStaff(
    roles: readonly string[] = STAFF_ROLES
): Promise<Granted | Denied> {
    let session: ApiSession | null = null;

    try {
        session = await AuthService.getSession();
    } catch {
        session = null;
    }

    if (!session) {
        return {
            session: null,
            denied: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        };
    }

    // Do not let a valid legacy JWT without a tenant context reach handlers.
    // The database layer also scopes every query, but route-level checks are
    // needed for handlers that perform work before their first Prisma call.
    if (!isObjectId(session.cabinetId)) {
        return {
            session: null,
            denied: NextResponse.json(
                { error: "Aucun cabinet valide n'est associé à cette session." },
                { status: 403 }
            ),
        };
    }

    if (!roles.includes(session.role)) {
        return {
            session: null,
            denied: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
        };
    }

    return { session, denied: null };
}

/** Raccourci pour les routes réservées aux administrateurs. */
export function requireAdmin(): Promise<Granted | Denied> {
    return requireStaff(ADMIN_ROLES);
}

/** Raccourci pour les routes de modification de données métier. */
export function requireWriteAccess(): Promise<Granted | Denied> {
    return requireStaff(WRITE_ROLES);
}

/**
 * Vrai si l'erreur Prisma est un P2025 : « An operation failed because it
 * depends on one or more records that were required but not found. »
 *
 * Les PATCH qui mettent a jour par identifiant renvoyaient un 500
 * « Erreur serveur » quand l'identifiant n'existait pas, ce qui rend le
 * diagnostic trompeur cote appelant comme cote journalisation.
 */
export function estIntrouvable(error: unknown): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        (error as { code?: string }).code === "P2025"
    );
}

/**
 * Vérifie qu'une valeur reçue appartient à une énumération Prisma.
 *
 * Une valeur hors liste (« HIGH » pour une sévérité, « OPEN » pour un statut)
 * faisait échouer Prisma en PrismaClientValidationError, renvoyée en 500
 * « Erreur serveur » : l'appelant ne pouvait pas savoir que sa saisie était
 * en cause. Retourne un message listant les valeurs admises.
 */
export function analyserEnum<T extends string>(
    valeur: unknown,
    admises: readonly T[],
    libelle: string
): { ok: true; valeur: T } | { ok: false; raison: string } {
    if (typeof valeur === "string" && (admises as readonly string[]).includes(valeur)) {
        return { ok: true, valeur: valeur as T };
    }
    return {
        ok: false,
        raison: `${libelle} invalide : valeurs admises ${admises.join(", ")}.`,
    };
}
