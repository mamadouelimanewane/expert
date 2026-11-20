import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withPortalClient } from "@/lib/portal-auth";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;
    const response = await withPortalClient(token, async (owner) => {
      const client = await prisma.client.findUnique({
        where: { id: owner.id },
        select: {
          id: true, companyName: true, firstName: true, lastName: true,
          email: true, phone: true, address: true, city: true, country: true,
          sector: true, rccm: true, healthScore: true, rating: true,
          portalEnabled: true, portalCreatedAt: true,
          tpeJournals: { orderBy: { createdAt: "desc" }, take: 20,
            select: { id: true, date: true, libelle: true, entree: true, sortie: true, montant: true, status: true } },
          missions: { where: { status: { not: "COMPLETED" } }, orderBy: { deadline: "asc" }, take: 5,
            select: { id: true, title: true, description: true, status: true, deadline: true } },
          declarations: { orderBy: { dueDate: "desc" }, take: 5,
            select: { id: true, type: true, period: true, dueDate: true, amount: true, status: true } },
          documents: { orderBy: { createdAt: "desc" }, take: 50,
            select: { id: true, originalName: true, fileName: true, type: true, status: true, fileUrl: true, createdAt: true } },
          _count: { select: { tpeJournals: true, missions: true, invoices: true } },
        },
      });
      if (!client) return NextResponse.json({ error: "Portail introuvable." }, { status: 404 });
      client.documents = client.documents.map((document) => ({
        ...document,
        fileUrl: `/api/portal/documents/${document.id}?token=${encodeURIComponent(token)}`,
      }));
      return NextResponse.json({ client });
    });
    return response ?? NextResponse.json({ error: "Portail introuvable ou désactivé." }, { status: 401 });
  } catch (error) {
    console.error("Portal API error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
