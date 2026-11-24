import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { session, denied } = await requireStaff();
    if (denied) return denied;
    const { id } = await params;
    if (!isObjectId(id)) return NextResponse.json({ error: "Identifiant workspace invalide." }, { status: 400 });

    const workspace = await prisma.workspace.findFirst({
      where: { id, cabinetId: session.cabinetId },
      include: {
        client: { select: { companyName: true, firstName: true, lastName: true } },
        members: {
          where: { cabinetId: session.cabinetId },
          include: { user: { select: { id: true, firstName: true, lastName: true, role: true } } },
          orderBy: { joinedAt: "asc" },
        },
        activities: {
          where: { cabinetId: session.cabinetId },
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
      where: { isActive: true, cabinetId: session.cabinetId, id: { notIn: memberIds } },
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
    const { session, denied } = await requireWriteAccess();
    if (denied) return denied;

    const { id } = await params;
    if (!isObjectId(id)) return NextResponse.json({ error: "Identifiant workspace invalide." }, { status: 400 });
    const ownedWorkspace = await prisma.workspace.findFirst({ where: { id, cabinetId: session.cabinetId }, select: { id: true } });
    if (!ownedWorkspace) return NextResponse.json({ error: "Workspace introuvable dans ce cabinet." }, { status: 404 });
    const body = await request.json();
    const { name, type, status, description, addMemberUserId, memberRole } = body;

    if (addMemberUserId) {
      if (!isObjectId(addMemberUserId)) return NextResponse.json({ error: "Identifiant collaborateur invalide." }, { status: 400 });
      const existingMember = await prisma.workspaceMember.findFirst({
        where: { workspaceId: id, cabinetId: session.cabinetId, userId: addMemberUserId },
      });
      if (!existingMember) {
        const user = await prisma.user.findFirst({ where: { id: addMemberUserId, cabinetId: session.cabinetId } });
        if (!user) return NextResponse.json({ error: "Collaborateur introuvable dans ce cabinet." }, { status: 404 });
        await prisma.workspaceMember.create({
          data: { cabinetId: session.cabinetId, workspaceId: id, userId: addMemberUserId, role: memberRole || "membre" },
        });
        await prisma.workspaceActivity.create({
          data: {
            cabinetId: session.cabinetId,
            workspaceId: id,
            userId: session.id,
            action: `a ajouté ${user ? `${user.firstName} ${user.lastName}` : "un collaborateur"} au workspace`,
          },
        });
      }
    } else {
      await prisma.workspace.updateMany({
        where: { id, cabinetId: session.cabinetId },
        data: {
          ...(name !== undefined && { name }),
          ...(type !== undefined && { type }),
          ...(status !== undefined && { status }),
          ...(description !== undefined && { description }),
        },
      });
      await prisma.workspaceActivity.create({
        data: { cabinetId: session.cabinetId, workspaceId: id, userId: session.id, action: "a mis à jour les informations du workspace" },
      });
    }

    const workspace = await prisma.workspace.findFirst({
      where: { id, cabinetId: session.cabinetId },
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
