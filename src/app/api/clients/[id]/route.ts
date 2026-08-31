import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const { id } = await params;
        // `portalToken` vaut authentification au portail client : quiconque le
        // detient ouvre le dossier complet sans session ni mot de passe, et la
        // revocation d un compte staff ne l invalide pas. La route liste voisine
        // l excluait deja ; cette route detail renvoyait l objet brut, donc le
        // jeton — y compris vers les trois pages d impression d etats financiers
        // qui n appellent cet endpoint que pour lire une raison sociale, faisant
        // transiter le secret dans le navigateur de chaque collaborateur.
        const client = await prisma.client.findUnique({
            where: { id },
            omit: { portalToken: true },
        });
        if (!client) {
            return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
        }
        return NextResponse.json({ client });
    } catch (error) {
        console.error("Erreur GET clients/[id]:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
