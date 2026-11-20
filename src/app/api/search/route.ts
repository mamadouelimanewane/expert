import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";

export async function GET(request: Request) {
  const { denied } = await requireStaff();
  if (denied) return denied;
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return NextResponse.json({ results: [] });
  if (query.length > 100) return NextResponse.json({ error: "La recherche est limitée à 100 caractères." }, { status: 400 });

  try {
    const [clients, missions, documents, invoices] = await Promise.all([
      prisma.client.findMany({
        where: { OR: [
          { companyName: { contains: query, mode: "insensitive" } },
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ] }, take: 5, orderBy: { updatedAt: "desc" }, select: { id: true, companyName: true, firstName: true, lastName: true, email: true },
      }),
      prisma.mission.findMany({ where: { title: { contains: query, mode: "insensitive" } }, take: 5, orderBy: { updatedAt: "desc" }, include: { client: { select: { id: true, companyName: true, firstName: true, lastName: true } } } }),
      prisma.document.findMany({ where: { OR: [ { originalName: { contains: query, mode: "insensitive" } }, { fileName: { contains: query, mode: "insensitive" } } ] }, take: 5, orderBy: { createdAt: "desc" }, include: { client: { select: { id: true, companyName: true, firstName: true, lastName: true } } } }),
      prisma.invoice.findMany({ where: { OR: [ { invoiceNumber: { contains: query, mode: "insensitive" } }, { client: { is: { companyName: { contains: query, mode: "insensitive" } } } }, { client: { is: { firstName: { contains: query, mode: "insensitive" } } } }, { client: { is: { lastName: { contains: query, mode: "insensitive" } } } } ] }, take: 5, orderBy: { issueDate: "desc" }, include: { client: { select: { id: true, companyName: true, firstName: true, lastName: true } } } }),
    ]);
    const nom = (client: { companyName: string | null; firstName: string | null; lastName: string | null } | null) => client?.companyName || [client?.firstName, client?.lastName].filter(Boolean).join(" ") || "Client sans nom";
    const results = [
      ...clients.map((client) => ({ id: client.id, type: "CLIENT", label: nom(client), detail: client.email ?? "Dossier client", href: `/clients/${client.id}` })),
      ...missions.map((mission) => ({ id: mission.id, type: "MISSION", label: mission.title, detail: `${nom(mission.client)} · ${mission.status}`, href: `/missions/${mission.id}` })),
      ...invoices.map((invoice) => ({ id: invoice.id, type: "FACTURE", label: invoice.invoiceNumber, detail: `${nom(invoice.client)} · ${invoice.total.toLocaleString("fr-FR")} FCFA`, href: `/billing/${invoice.id}` })),
      ...documents.map((document) => ({ id: document.id, type: "DOCUMENT", label: document.originalName, detail: `${nom(document.client)} · ${document.type}`, href: `/api/documents/${document.id}/fichier` })),
    ];
    return NextResponse.json({ results: results.slice(0, 20) });
  } catch (error) {
    console.error("Erreur recherche globale:", error);
    return NextResponse.json({ error: "Recherche indisponible." }, { status: 500 });
  }
}
