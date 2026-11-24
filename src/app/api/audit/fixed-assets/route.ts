import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuditService } from "@/lib/audit";

import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";
import { analyserMontant, analyserMontantOptionnel } from "@/lib/validation";
export async function GET(request: NextRequest) {
    const { session, denied } = await requireStaff();
    if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    if (clientId && !isObjectId(clientId)) return NextResponse.json({ error: "clientId invalide." }, { status: 400 });
    if (clientId && !await prisma.client.findFirst({ where: { id: clientId, cabinetId: session.cabinetId }, select: { id: true } })) return NextResponse.json({ error: "Client introuvable dans ce cabinet." }, { status: 404 });
    const assets = await prisma.fixedAsset.findMany({
      where: { cabinetId: session.cabinetId, ...(clientId ? { clientId } : {}) },
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
    const { session, denied } = await requireWriteAccess();
    if (denied) return denied;

  try {
    const body = await request.json();
    const { code, label, category, purchaseDate, value, location, clientId, depreciationMethod, usefulLifeYears, residualValue, serviceDate } = body;

    if (!code || !label || !purchaseDate || !value || !isObjectId(clientId)) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }
    const client = await prisma.client.findFirst({ where: { id: clientId, cabinetId: session.cabinetId }, select: { id: true } });
    if (!client) return NextResponse.json({ error: "Client introuvable dans ce cabinet." }, { status: 404 });

    // parseFloat("1 500 000") vaut 1 : une immobilisation saisie au format
    // d'affichage de l'application etait enregistree a 1 FCFA, et alimentait
    // ensuite le plan d'amortissement.
    const valeurAcquisition = analyserMontant(value, { min: 0 });
    if (!valeurAcquisition.ok) {
      return NextResponse.json({ error: valeurAcquisition.raison }, { status: 400 });
    }
    const valeurResiduelle = analyserMontantOptionnel(residualValue, { min: 0 });
    if (!valeurResiduelle.ok) {
      return NextResponse.json({ error: valeurResiduelle.raison }, { status: 400 });
    }

    const asset = await prisma.fixedAsset.create({
      data: {
        cabinetId: session.cabinetId,
        code,
        label,
        category: category || "Non catégorisé",
        purchaseDate: new Date(purchaseDate),
        value: valeurAcquisition.valeur,
        location,
        clientId,
        status: "TO_VERIFY",
        depreciationMethod: depreciationMethod || "LINEAIRE",
        usefulLifeYears: usefulLifeYears ? parseInt(usefulLifeYears, 10) : null,
        residualValue: valeurResiduelle.valeur ?? 0,
        serviceDate: serviceDate ? new Date(serviceDate) : null,
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
    const { session, denied } = await requireWriteAccess();
    if (denied) return denied;

  try {
    const body = await request.json();
    const { id, status, lastAuditDate } = body;

    if (!isObjectId(id)) {
      return NextResponse.json({ error: "id requis" }, { status: 400 });
    }

    const existing = await prisma.fixedAsset.findFirst({ where: { id, cabinetId: session.cabinetId }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "Immobilisation introuvable dans ce cabinet." }, { status: 404 });
    const result = await prisma.fixedAsset.updateMany({
      where: { id, cabinetId: session.cabinetId },
      data: {
        ...(status && { status }),
        ...(lastAuditDate !== undefined && { lastAuditDate: lastAuditDate ? new Date(lastAuditDate) : new Date() }),
      },
    });
    if (!result.count) return NextResponse.json({ error: "Immobilisation introuvable dans ce cabinet." }, { status: 404 });
    const asset = await prisma.fixedAsset.findFirst({ where: { id, cabinetId: session.cabinetId } });
    if (!asset) return NextResponse.json({ error: "Immobilisation introuvable après mise à jour." }, { status: 404 });

    return NextResponse.json({ asset });
  } catch (error) {
    console.error("Erreur PATCH fixed-assets:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
