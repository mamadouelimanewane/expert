import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuditService } from "@/lib/audit";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";

export async function GET(request: NextRequest) {
  try {
    const { session, denied } = await requireStaff();
    if (denied) return denied;
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    if (clientId && !isObjectId(clientId)) return NextResponse.json({ error: "clientId invalide." }, { status: 400 });
    if (clientId && !await prisma.client.findFirst({ where: { id: clientId, cabinetId: session.cabinetId }, select: { id: true } })) return NextResponse.json({ error: "Client introuvable dans ce cabinet." }, { status: 404 });

    const correspondences = await prisma.correspondence.findMany({
      where: { cabinetId: session.cabinetId, ...(clientId ? { clientId } : {}) },
      include: {
        client: { select: { companyName: true, firstName: true, lastName: true } },
        createdBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ correspondences });
  } catch (error) {
    console.error("Erreur GET correspondences:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, denied } = await requireWriteAccess();
    if (denied) return denied;

    const body = await request.json();
    const { subject, type, content, recipientName, clientId } = body;

    if (!subject || !content) {
      return NextResponse.json({ error: "Objet et contenu requis" }, { status: 400 });
    }
    if (clientId) {
      if (!isObjectId(clientId)) return NextResponse.json({ error: "clientId invalide." }, { status: 400 });
      const client = await prisma.client.findFirst({ where: { id: clientId, cabinetId: session.cabinetId }, select: { id: true } });
      if (!client) return NextResponse.json({ error: "Client introuvable dans ce cabinet." }, { status: 404 });
    }

    const correspondence = await prisma.correspondence.create({
      data: {
        cabinetId: session.cabinetId,
        subject,
        type: type || "AUTRE",
        content,
        recipientName: recipientName || null,
        clientId: clientId || null,
        createdById: session.id,
      },
    });

    await AuditService.log({
      action: "CREATE",
      entity: "CORRESPONDENCE",
      entityId: correspondence.id,
      details: `Courrier enregistré : ${subject}`,
    });

    return NextResponse.json({ correspondence }, { status: 201 });
  } catch (error) {
    console.error("Erreur POST correspondences:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
