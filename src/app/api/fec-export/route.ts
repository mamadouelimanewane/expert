import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import { AuditService } from "@/lib/audit";
import { genererLignesFEC, formaterFichierFEC, nommerFichierFEC } from "@/lib/fec-export";

export async function GET(request: NextRequest) {
  const { denied } = await requireStaff();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const dateDebut = searchParams.get("dateDebut");
    const dateFin = searchParams.get("dateFin");

    if (!clientId || !dateDebut || !dateFin) {
      return NextResponse.json({ error: "clientId, dateDebut et dateFin requis" }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });

    const ecritures = await prisma.tpeJournal.findMany({
      where: {
        clientId,
        source: { not: "WHATSAPP_TEST" },
        date: { gte: dateDebut, lte: dateFin },
      },
      orderBy: { date: "asc" },
      select: {
        id: true, date: true, libelle: true, entree: true, sortie: true,
        debitCompte: true, debitIntitule: true, creditCompte: true, creditIntitule: true,
        montant: true, exportedAt: true,
      },
    });

    if (ecritures.length === 0) {
      return NextResponse.json({ error: "Aucune écriture pour ce client sur cette période." }, { status: 404 });
    }

    const lignes = genererLignesFEC(ecritures);
    const contenu = formaterFichierFEC(lignes);
    const nomFichier = nommerFichierFEC(client.ninea || client.companyName || client.id, dateFin);

    await AuditService.log({
      action: "EXPORT",
      entity: "FEC",
      entityId: clientId,
      details: `Export FEC : ${ecritures.length} écriture(s), période ${dateDebut} → ${dateFin}`,
    });

    return new NextResponse(contenu, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${nomFichier}"`,
      },
    });
  } catch (error) {
    console.error("Erreur GET fec-export:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
