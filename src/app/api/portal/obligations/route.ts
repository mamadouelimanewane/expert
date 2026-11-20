import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { portalTokenFromRequest, withPortalClient } from "@/lib/portal-auth";

const LIBELLE_STATUT: Record<string, string> = {
  DRAFT: "EN PRÉPARATION", PENDING: "À VENIR", SUBMITTED: "TÉLÉTRANSMISE",
  VALIDATED: "RÉGLÉ", REJECTED: "REJETÉE",
};

export async function GET(req: Request) {
  try {
    const response = await withPortalClient(portalTokenFromRequest(req), async (client) => {
      const declarations = await prisma.taxDeclaration.findMany({
        where: { clientId: client.id }, orderBy: { dueDate: "asc" }, take: 50,
      });
      const now = Date.now();
      const obligations = declarations.map((declaration) => {
        const days = Math.ceil((declaration.dueDate.getTime() - now) / 86_400_000);
        const paid = declaration.status === "VALIDATED";
        return {
          id: declaration.id,
          type: `${declaration.type} — ${declaration.period}`,
          date: declaration.dueDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
          amount: declaration.amount != null ? `${declaration.amount.toLocaleString("fr-FR")} FCFA` : "À déterminer",
          status: paid ? "RÉGLÉ" : days <= 3 ? "URGENT" : days <= 14 ? "PROCHE" : LIBELLE_STATUT[declaration.status] ?? declaration.status,
          days,
        };
      });
      return NextResponse.json({ obligations, aucuneDonnee: declarations.length === 0 });
    });
    return response ?? NextResponse.json({ error: "Portail introuvable ou désactivé" }, { status: 401 });
  } catch (error) {
    console.error("Erreur API portail obligations:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
