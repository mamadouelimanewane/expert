import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuditService } from "@/lib/audit";

import { requireStaff } from "@/lib/api-auth";
export async function GET(request: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    const assets = await prisma.fixedAsset.findMany({
      where: clientId ? { clientId } : {},
      include: { client: { select: { companyName: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ assets });
  } catch (error) {
    console.error("Erreur GET fixed-assets:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

  try {
    const body = await request.json();
    const { code, label, category, purchaseDate, value, location, clientId } = body;

    if (!code || !label || !purchaseDate || !value || !clientId) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const asset = await prisma.fixedAsset.create({
      data: {
        code,
        label,
        category: category || "Non catégorisé",
        purchaseDate: new Date(purchaseDate),
        value: parseFloat(value),
        location,
        clientId,
        status: "TO_VERIFY",
      },
    });

    await AuditService.log({
      action: "CREATE",
      entity: "FIXED_ASSET",
      entityId: asset.id,
      details: `Immobilisation créée : ${label} (${code})`,
    });

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    console.error("Erreur POST fixed-assets:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

  try {
    const body = await request.json();
    const { id, status, lastAuditDate } = body;

    if (!id) {
      return NextResponse.json({ error: "id requis" }, { status: 400 });
    }

    const asset = await prisma.fixedAsset.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(lastAuditDate !== undefined && { lastAuditDate: lastAuditDate ? new Date(lastAuditDate) : new Date() }),
      },
    });

    return NextResponse.json({ asset });
  } catch (error) {
    console.error("Erreur PATCH fixed-assets:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
