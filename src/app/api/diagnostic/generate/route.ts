import { NextResponse } from "next/server";
import { DiagnosticService } from "@/lib/diagnostic";

import { requireStaff } from "@/lib/api-auth";
export async function POST(request: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const { clientId } = await request.json();

        // Un clientId absent ou mal forme basculait silencieusement sur un autre
        // dossier (le premier client dont le nom contient "Ivoirienne"). Comme le
        // diagnostic renvoye ne porte ni identifiant ni nom de client, la
        // substitution etait indetectable : les chiffres d'une societe
        // s'affichaient sous l'en-tete d'une autre, et pouvaient etre enchaines
        // vers /api/diagnostic/report qui les redige au nom du client fourni par
        // l'appelant.
        if (typeof clientId !== "string" || clientId.length !== 24) {
            return NextResponse.json({ error: "ClientId requis" }, { status: 400 });
        }

        const diagnostic = await DiagnosticService.getDiagnosticForClient(clientId);

        if (!diagnostic) {
            return NextResponse.json({ 
                error: "Données financières insuffisantes pour générer un diagnostic réel pour ce client." 
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            diagnostic
        });

    } catch (error) {
        console.error("[Diagnostic API] Error:", error);
        return NextResponse.json({ error: "Erreur lors de la génération du diagnostic" }, { status: 500 });
    }
}
