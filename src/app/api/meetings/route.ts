import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";
import { AuditService } from "@/lib/audit";

const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

export async function GET(request: NextRequest) {
  try {
    const session = await AuthService.getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    const meetings = await prisma.meeting.findMany({
      where: clientId ? { clientId } : {},
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
    const session = await AuthService.getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!isValidObjectId(session.id)) {
      return NextResponse.json({ error: "Mode démonstration — création désactivée" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, type, startTime, endTime, location, meetingUrl, clientId } = body;

    if (!title || !startTime || !endTime) {
      return NextResponse.json({ error: "Champs requis manquants (title, startTime, endTime)" }, { status: 400 });
    }

    const meeting = await prisma.meeting.create({
      data: {
        title,
        description: description || undefined,
        type: type || "VIRTUELLE",
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
