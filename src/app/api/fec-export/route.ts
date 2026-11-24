import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";
import { AuditService } from "@/lib/audit";
import { normaliserDateISO } from "@/lib/validation";
import { genererLignesFEC, formaterFichierFEC, nommerFichierFEC } from "@/lib/fec-export";

export async function GET(request: NextRequest) {
  const { session, denied } = await requireStaff();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const dateDebut = searchParams.get("dateDebut");
    const dateFin = searchParams.get("dateFin");

    if (!isObjectId(clientId) || !dateDebut || !dateFin) {
      return NextResponse.json({ error: "clientId, dateDebut et dateFin requis" }, { status: 400 });
    }

    const client = await prisma.client.findFirst({ where: { id: clientId, cabinetId: session.cabinetId } });
    if (!client) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });

    const borneDebut = normaliserDateISO(dateDebut);
    const borneFin = normaliserDateISO(dateFin);
    if (!borneDebut || !borneFin) {
      return NextResponse.json({ error: "dateDebut et dateFin doivent être des dates valides." }, { status: 400 });
    }

    // TpeJournal.date est une chaîne : le filtre Prisma `{ gte, lte }` était
    // donc une comparaison lexicographique. Sur une écriture stockée
    // « 15/01/2026 » — format que plusieurs points d'entrée écrivaient tel quel
    // avant normalisation — la comparaison excluait silencieusement l'écriture
    // de la période, et le FEC remis à l'administration était incomplet sans
    // qu'aucun message ne l'indique. Les écritures sont donc chargées sans
    // filtre de date, puis triées ici sur une date normalisée.
    const toutes = await prisma.tpeJournal.findMany({
      where: {
        clientId,
        cabinetId: session.cabinetId,
        source: { not: "WHATSAPP_TEST" },
      },
      select: {
        id: true, date: true, libelle: true, entree: true, sortie: true,
        debitCompte: true, debitIntitule: true, creditCompte: true, creditIntitule: true,
        montant: true, exportedAt: true,
      },
    });

    const datesIllisibles: string[] = [];
    const ecritures = toutes
      .map((e) => {
        const iso = normaliserDateISO(e.date);
        if (iso === null) datesIllisibles.push(`${e.date} — ${e.libelle}`);
        return iso === null ? null : { ...e, date: iso };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null)
      .filter((e) => e.date >= borneDebut && e.date <= borneFin)
      .sort((a, b) => a.date.localeCompare(b.date));

    // Un FEC amputé d'écritures est un document faux : on refuse plutôt que de
    // livrer un fichier silencieusement incomplet.
    if (datesIllisibles.length > 0) {
      return NextResponse.json(
        {
          error:
            "Des écritures de ce client portent une date illisible : le FEC serait incomplet. " +
            "Corrigez ces écritures avant d'exporter.",
          ecrituresConcernees: datesIllisibles.slice(0, 20),
          total: datesIllisibles.length,
        },
        { status: 409 }
      );
    }

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
