import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";

type Params = { params: Promise<{ id: string }> };

/** Détail d'une facture avec le client émetteur du dossier — pour l'édition et l'impression. */
export async function GET(request: Request, { params }: Params) {
    const { denied } = await requireStaff();
    if (denied) return denied;
    try {
        const { id } = await params;
        if (id.length !== 24) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: {
                client: {
                    select: { id: true, companyName: true, firstName: true, lastName: true, email: true, phone: true, address: true, city: true, country: true, rccm: true, ninea: true, ifu: true, nif: true, subjectToTva: true },
                },
            },
        });
        if (!invoice) return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
        return NextResponse.json({ invoice });
    } catch (error) {
        console.error("Erreur GET invoices/[id]:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
