import { NextRequest, NextResponse } from "next/server";
import { MeetingType } from "@prisma/client";
import { analyserEnum, requireStaff, requireWriteAccess } from "@/lib/api-auth";
import prisma from "@/lib/prisma";
import { AuditService } from "@/lib/audit";
import { isObjectId } from "@/lib/tenant-security";

const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

export async function GET(request: NextRequest) {
  try {
    const { session, denied } = await requireStaff();
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    if (clientId && !isObjectId(clientId)) return NextResponse.json({ error: "clientId invalide." }, { status: 400 });
    if (clientId && !await prisma.client.findFirst({ where: { id: clientId, cabinetId: session.cabinetId }, select: { id: true } })) return NextResponse.json({ error: "Client introuvable dans ce cabinet." }, { status: 404 });

    const meetings = await prisma.meeting.findMany({
      where: { cabinetId: session.cabinetId, ...(clientId ? { clientId } : {}) },
      include: {
        client: { select: { companyName: true, firstName: true, lastName: true } },
        organizer: { select: { firstName: true, lastName: true } },
      },
      orderBy: { startTime: "desc" },
    });

    return NextResponse.json({ meetings });
  } catch (error) {
    console.error("Erreur GET meetings:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, denied } = await requireWriteAccess();
    if (denied) return denied;

    if (!isValidObjectId(session.id)) {
      return NextResponse.json({ error: "Mode démonstration — création désactivée" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, type, startTime, endTime, location, meetingUrl, clientId } = body;

    if (!title || !startTime || !endTime) {
      return NextResponse.json({ error: "Champs requis manquants (title, startTime, endTime)" }, { status: 400 });
    }
    const typeReunion = analyserEnum(type ?? "PRESENTIEL", Object.values(MeetingType), "Type de réunion");
    if (!typeReunion.ok) {
      return NextResponse.json({ error: typeReunion.raison }, { status: 400 });
    }
    const debut = new Date(startTime), fin = new Date(endTime);
    if (Number.isNaN(debut.getTime()) || Number.isNaN(fin.getTime())) {
      return NextResponse.json({ error: "Dates de début et de fin invalides." }, { status: 400 });
    }
    if (fin <= debut) {
      return NextResponse.json({ error: "La fin de la réunion doit être postérieure à son début." }, { status: 400 });
    }

    // Le connecteur MongoDB de Prisma n'applique pas d'integrite
    // referentielle a l'ecriture : un clientId au format ObjectId valide
    // mais inexistant (client supprime, onglet reste ouvert) etait ecrit tel
    // quel. L'enregistrement devenait orphelin — invisible dans toutes les
    // vues filtrees par client, mais compte dans les totaux globaux.
    if (clientId) {
      if (!isObjectId(clientId)) return NextResponse.json({ error: "Identifiant client invalide." }, { status: 400 });
      const client = await prisma.client.findFirst({ where: { id: clientId, cabinetId: session.cabinetId }, select: { id: true } });
      if (!client) {
        return NextResponse.json({ error: "Client introuvable." }, { status: 404 });
      }
    }

    const meeting = await prisma.meeting.create({
      data: {
        cabinetId: session.cabinetId,
        title,
        description: description || undefined,
        type: typeReunion.valeur,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location: location || undefined,
        meetingUrl: meetingUrl || undefined,
        clientId: clientId || undefined,
        organizerId: session.id,
      },
    });

    await AuditService.log({
      action: "CREATE",
      entity: "MEETING",
      entityId: meeting.id,
      details: `Réunion créée : ${meeting.title}`,
    });

    return NextResponse.json({ meeting }, { status: 201 });
  } catch (error) {
    console.error("Erreur POST meetings:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
