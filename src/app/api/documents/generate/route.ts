import { NextResponse } from "next/server";

import { requireStaff } from "@/lib/api-auth";

// ─────────────────────────────────────────────────────────────────────────────
// Génération de livrables — non branchée.
//
// Cette route attendait 2 secondes ("simuler le temps de génération"), puis
// créait un vrai Document en base avec fileUrl = "/mock-document.pdf" (fichier
// inexistant dans le dépôt), fileSize codé en dur, status PROCESSED, rattaché
// au client réel — donc visible sur son portail — et attribué à
// prisma.user.findFirst(), c'est-à-dire à un collaborateur arbitraire qui
// n'avait rien fait. Aucun PDF n'était produit : le client cliquait sur un
// lien mort, et la piste d'audit du document désignait la mauvaise personne.
//
// Aucun moteur de génération PDF n'est branché. Tant qu'il ne l'est pas, la
// route refuse explicitement plutôt que d'enregistrer un livrable fantôme —
// même politique que /api/declarations/e-depot.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST() {
    const { denied } = await requireStaff();
    if (denied) return denied;

    return NextResponse.json(
        {
            notConfigured: true,
            error:
                "La génération automatique de livrables n'est pas disponible : aucun moteur de production PDF n'est branché. " +
                "Utilisez les pages d'impression (états financiers, déclarations) qui produisent un document réel depuis le navigateur.",
        },
        { status: 501 }
    );
}
