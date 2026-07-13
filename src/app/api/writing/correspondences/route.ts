import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";
import { AuditService } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    const correspondences = await prisma.correspondence.findMany({
      where: clientId ? { clientId } : {},
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
    const session = await AuthService.getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { subject, type, content, recipientName, clientId } = body;

    if (!subject || !content) {
      return NextResponse.json({ error: "Objet et contenu requis" }, { status: 400 });
    }

    const correspondence = await prisma.correspondence.create({
      data: {
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
