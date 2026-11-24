import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";

export async function GET() {
  try {
    const { session, denied } = await requireStaff();
    if (denied) return denied;
    const [workspaces, recentActivities] = await Promise.all([
      prisma.workspace.findMany({
        where: { cabinetId: session.cabinetId },
        include: {
          client: { select: { companyName: true, firstName: true, lastName: true } },
          _count: { select: { members: true, activities: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.workspaceActivity.findMany({
        where: { cabinetId: session.cabinetId },
        include: {
          user: { select: { firstName: true, lastName: true } },
          workspace: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    return NextResponse.json({ workspaces, recentActivities });
  } catch (error) {
    console.error("Erreur GET workspaces:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, denied } = await requireWriteAccess();
    if (denied) return denied;

    const body = await request.json();
    const { name, type, description, clientId } = body;

    if (!name) {
      return NextResponse.json({ error: "Nom du workspace requis" }, { status: 400 });
    }
    if (clientId) {
      if (!isObjectId(clientId)) return NextResponse.json({ error: "clientId invalide." }, { status: 400 });
      const client = await prisma.client.findFirst({ where: { id: clientId, cabinetId: session.cabinetId }, select: { id: true } });
      if (!client) return NextResponse.json({ error: "Client introuvable dans ce cabinet." }, { status: 404 });
    }

    const workspace = await prisma.workspace.create({
      data: {
        cabinetId: session.cabinetId,
        name,
        type: type || "AUTRE",
        description: description || null,
        clientId: clientId || null,
        createdById: session.id,
        members: { create: { cabinetId: session.cabinetId, userId: session.id, role: "owner" } },
        activities: { create: { cabinetId: session.cabinetId, userId: session.id, action: `a créé le workspace "${name}"` } },
      },
      include: {
        client: { select: { companyName: true, firstName: true, lastName: true } },
        _count: { select: { members: true, activities: true } },
      },
    });

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error) {
    console.error("Erreur POST workspaces:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
