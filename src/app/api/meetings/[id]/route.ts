import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";
import { AuditService } from "@/lib/audit";
import { estIntrouvable } from "@/lib/api-auth";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await AuthService.getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { notes, status } = body;

    const meeting = await prisma.meeting.update({
      where: { id },
      data: {
        ...(notes !== undefined && { notes, reportGenerated: !!notes }),
        ...(status && { status }),
      },
    });

    await AuditService.log({
      action: "UPDATE",
      entity: "MEETING",
      entityId: meeting.id,
      details: `Compte-rendu mis à jour : ${meeting.title}`,
    });

    return NextResponse.json({ meeting });
  } catch (error) {
    if (estIntrouvable(error)) {
      return NextResponse.json({ error: "Réunion introuvable." }, { status: 404 });
    }
    console.error("Erreur PATCH meetings/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
