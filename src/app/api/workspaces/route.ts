import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";

export async function GET() {
  try {
    const [workspaces, recentActivities] = await Promise.all([
      prisma.workspace.findMany({
        include: {
          client: { select: { companyName: true, firstName: true, lastName: true } },
          _count: { select: { members: true, activities: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.workspaceActivity.findMany({
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
    const session = await AuthService.getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, description, clientId } = body;

    if (!name) {
      return NextResponse.json({ error: "Nom du workspace requis" }, { status: 400 });
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        type: type || "AUTRE",
        description: description || null,
        clientId: clientId || null,
        createdById: session.id,
        members: { create: { userId: session.id, role: "owner" } },
        activities: { create: { userId: session.id, action: `a créé le workspace "${name}"` } },
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
