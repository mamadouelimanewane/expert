import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      where: { isActive: true },
      select: {
        id: true,
        companyName: true,
        firstName: true,
        lastName: true,
        country: true,
        rccm: true,
        ninea: true,
        ifu: true,
        nif: true,
        kycStatus: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    const registry = clients.map((c) => ({
      id: c.id,
      name: c.companyName || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "Client sans nom",
      country: c.country,
      hasIdentifiers: !!(c.rccm || c.ninea || c.ifu || c.nif),
      lastUpdate: c.updatedAt.toLocaleDateString("fr-FR"),
      status: c.kycStatus === "valid" ? "Validé" : c.kycStatus === "invalid" ? "Invalide" : "Non renseigné",
    }));

    const total = registry.length;
    const validCount = registry.filter((c) => c.status === "Validé").length;
    const invalidCount = registry.filter((c) => c.status === "Invalide").length;
    const pendingCount = registry.filter((c) => c.status === "Non renseigné").length;
    const coveragePct = total > 0 ? Math.round((validCount / total) * 100) : null;

    return NextResponse.json({
      registry,
      kpis: { total, validCount, invalidCount, pendingCount, coveragePct },
    });
  } catch (error) {
    console.error("Erreur GET compliance/kyc:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
