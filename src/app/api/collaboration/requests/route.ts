import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import { AuditService } from "@/lib/audit";

export async function GET() {
  const { denied } = await requireStaff();
  if (denied) return denied;

  try {
    const requetes = await prisma.clientRequest.findMany({
      include: { client: { select: { companyName: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      requetes: requetes.map((r) => ({
        id: r.id,
        clientId: r.clientId,
        client: r.client.companyName || `${r.client.firstName ?? ""} ${r.client.lastName ?? ""}`.trim() || "—",
        type: r.type,
        details: r.details,
        priorite: r.priorite,
        statut: r.statut,
      })),
    });
  } catch (error) {
    console.error("Erreur GET collaboration/requests:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { denied } = await requireStaff();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { clientId, type, details, priorite } = body;

    if (!clientId || !type || !details || !priorite) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const requete = await prisma.clientRequest.create({
      data: { clientId, type, details, priorite, statut: "A_ENVOYER" },
    });

    await AuditService.log({
      action: "CREATE",
      entity: "CLIENT_REQUEST",
      entityId: requete.id,
      details: `Requête client créée : ${type}`,
    });

    return NextResponse.json({ requete }, { status: 201 });
  } catch (error) {
    console.error("Erreur POST collaboration/requests:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const { denied } = await requireStaff();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { id, statut } = body;

    if (!id || !statut) {
      return NextResponse.json({ error: "id et statut requis" }, { status: 400 });
    }

    const requete = await prisma.clientRequest.update({ where: { id }, data: { statut } });
    return NextResponse.json({ requete });
  } catch (error) {
    console.error("Erreur PATCH collaboration/requests:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { denied } = await requireStaff();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

    await prisma.clientRequest.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE collaboration/requests:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
