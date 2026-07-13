import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        client: { select: { companyName: true, firstName: true, lastName: true } },
        members: {
          include: { user: { select: { id: true, firstName: true, lastName: true, role: true } } },
          orderBy: { joinedAt: "asc" },
        },
        activities: {
          include: { user: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: "desc" },
          take: 30,
        },
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace introuvable" }, { status: 404 });
    }

    const memberIds = workspace.members.map((m) => m.userId);
    const availableUsers = await prisma.user.findMany({
      where: { isActive: true, id: { notIn: memberIds } },
      select: { id: true, firstName: true, lastName: true, role: true },
      orderBy: { firstName: "asc" },
    });

    return NextResponse.json({ workspace, availableUsers });
  } catch (error) {
    console.error("Erreur GET workspace detail:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await AuthService.getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, type, status, description, addMemberUserId, memberRole } = body;

    if (addMemberUserId) {
      const existingMember = await prisma.workspaceMember.findFirst({
        where: { workspaceId: id, userId: addMemberUserId },
      });
      if (!existingMember) {
        const user = await prisma.user.findUnique({ where: { id: addMemberUserId } });
        await prisma.workspaceMember.create({
          data: { workspaceId: id, userId: addMemberUserId, role: memberRole || "membre" },
        });
        await prisma.workspaceActivity.create({
          data: {
            workspaceId: id,
            userId: session.id,
            action: `a ajouté ${user ? `${user.firstName} ${user.lastName}` : "un collaborateur"} au workspace`,
          },
        });
      }
    } else {
      await prisma.workspace.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(type !== undefined && { type }),
          ...(status !== undefined && { status }),
          ...(description !== undefined && { description }),
        },
      });
      await prisma.workspaceActivity.create({
        data: { workspaceId: id, userId: session.id, action: "a mis à jour les informations du workspace" },
      });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        client: { select: { companyName: true, firstName: true, lastName: true } },
        members: { include: { user: { select: { id: true, firstName: true, lastName: true, role: true } } } },
        activities: {
          include: { user: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: "desc" },
          take: 30,
        },
      },
    });

    return NextResponse.json({ workspace });
  } catch (error) {
    console.error("Erreur PATCH workspace:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
