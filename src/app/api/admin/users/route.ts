import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";

// Liste des comptes collaborateurs réels du cabinet (modèle User). Accès réservé
// aux administrateurs.
export async function GET() {
  try {
    await AuthService.requireRole(["ADMIN"]);
  } catch {
    return NextResponse.json({ error: "Accès refusé : rôle administrateur requis" }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[API admin/users] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
