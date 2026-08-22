import { NextResponse } from "next/server";
import { AuthService } from "./auth";

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
