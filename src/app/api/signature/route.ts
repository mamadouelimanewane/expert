import { NextResponse } from "next/server";
import crypto from "crypto";
import { AuditService } from "@/lib/audit";

export async function POST(req: Request) {
  const body = await req.json();
  const { documentId, signatureData } = body;

  if (!documentId || !signatureData) {
    return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
  }

  // Empreinte d'intégrité calculée sur les données réelles reçues (document + signature + horodatage).
  // Ceci trace qu'une action de signature a eu lieu et permet de détecter une altération ultérieure,
  // mais ne constitue PAS une signature électronique qualifiée (eIDAS/AUSCGIE) — aucun prestataire de
  // confiance/tiers horodateur n'est connecté à ce jour.
  const timestamp = new Date().toISOString();
  const hash = crypto.createHash("sha256").update(documentId + signatureData + timestamp).digest("hex");

  await AuditService.log({
    action: "SIGNATURE_HASH_RECORDED",
    entity: "DOCUMENT",
    entityId: documentId,
    details: `Empreinte d'intégrité enregistrée pour le document ${documentId} (hash sha256-${hash.slice(0, 16)}...)`,
  });

  return NextResponse.json({
    success: true,
    certificateHash: hash,
    timestamp,
    legalNotice: "Empreinte d'intégrité interne (SHA-256 + horodatage), pas une signature électronique qualifiée.",
    message: "Signature enregistrée avec succès",
  });
}
