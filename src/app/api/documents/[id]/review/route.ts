import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";
import { analyserMontant, normaliserDateISO } from "@/lib/validation";
import { AuditService } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };
const normaliserCle = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr-FR").replace(/[^a-z0-9]/g, "");

export async function PATCH(request: Request, { params }: Params) {
  const { session, denied } = await requireWriteAccess();
  if (denied) return denied;
  const { id } = await params;
  if (!isObjectId(id)) return NextResponse.json({ error: "Identifiant de document invalide." }, { status: 400 });
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  const input = body as Record<string, unknown>;
  const supplier = typeof input.supplier === "string" ? input.supplier.trim() : "";
  const invoiceNumber = typeof input.invoiceNumber === "string" ? input.invoiceNumber.trim() : "";
  const date = typeof input.date === "string" ? input.date.trim() : "";
  const amountValue = typeof input.totalTTC === "string" ? input.totalTTC.replace(/\b(FCFA|XOF)\b/gi, "").trim() : input.totalTTC;
  const tvaValue = typeof input.tva === "string" ? input.tva.replace(/\b(FCFA|XOF)\b/gi, "").trim() : input.tva;
  const total = amountValue === "" || amountValue === null || amountValue === undefined ? null : analyserMontant(amountValue, { min: 0 });
  const tva = tvaValue === "" || tvaValue === null || tvaValue === undefined ? null : analyserMontant(tvaValue, { min: 0 });
  if (supplier.length < 2 || supplier.length > 300 || invoiceNumber.length < 2 || invoiceNumber.length > 120 || !normaliserDateISO(date) || date.length > 50 || !total?.ok || total.valeur <= 0 || (tva && !tva.ok)) {
    return NextResponse.json({ error: "Fournisseur, numéro, date et montant TTC valides sont requis pour confirmer l’extraction." }, { status: 400 });
  }

  const document = await prisma.document.findFirst({ where: { id, cabinetId: session.cabinetId, type: "FACTURE" }, select: { id: true, clientId: true, originalName: true, ocrData: true, status: true } });
  if (!document) return NextResponse.json({ error: "Facture introuvable dans ce cabinet." }, { status: 404 });
  if (!document.clientId) return NextResponse.json({ error: "Cette facture n’est pas rattachée à un client." }, { status: 409 });
  const current = document.ocrData && typeof document.ocrData === "object" && !Array.isArray(document.ocrData) ? document.ocrData as Record<string, unknown> : {};
  const previousInvoice = current.invoiceData && typeof current.invoiceData === "object" ? current.invoiceData as Record<string, unknown> : {};
  const candidates = await prisma.document.findMany({ where: { cabinetId: session.cabinetId, clientId: document.clientId, type: "FACTURE", id: { not: id } }, take: 200, select: { id: true, originalName: true, ocrData: true, createdAt: true } });
  const duplicateCandidates = candidates.filter((candidate) => {
    if (!candidate.ocrData || typeof candidate.ocrData !== "object" || Array.isArray(candidate.ocrData)) return false;
    const candidateInvoice = (candidate.ocrData as Record<string, unknown>).invoiceData;
    if (!candidateInvoice || typeof candidateInvoice !== "object" || Array.isArray(candidateInvoice)) return false;
    const fields = candidateInvoice as Record<string, unknown>;
    return normaliserCle(String(fields.invoiceNumber ?? "")) === normaliserCle(invoiceNumber)
      && normaliserCle(String(fields.supplier ?? "")) === normaliserCle(supplier);
  }).map(({ id: duplicateId, originalName, createdAt }) => ({ id: duplicateId, name: originalName, createdAt }));
  if (duplicateCandidates.length && input.acknowledgeDuplicates !== true) {
    return NextResponse.json({ error: "Une ou plusieurs factures de ce client portent le même fournisseur et numéro.", duplicateCandidates }, { status: 409 });
  }

  const correctedInvoice = { ...previousInvoice, supplier, invoiceNumber, date, totalTTC: total.valeur, ...(tva?.ok ? { tva: tva.valeur } : {}) };
  const history = Array.isArray(current.humanReviewHistory) ? current.humanReviewHistory : [];
  const humanReviewHistory = [...history, { at: new Date().toISOString(), userId: session.id, before: previousInvoice, after: correctedInvoice, acknowledgedDuplicates: duplicateCandidates.map((candidate) => candidate.id) }];
  const updatedOcrData = {
    ...current,
    originalExtraction: current.originalExtraction ?? previousInvoice,
    invoiceData: correctedInvoice,
    manualReview: { status: "VALIDATED", validatedAt: new Date().toISOString(), validatedById: session.id },
    humanReviewHistory,
  } as Prisma.InputJsonValue;
  const updated = await prisma.document.update({ where: { id }, data: { ocrData: updatedOcrData }, select: { id: true, originalName: true, status: true, ocrData: true, updatedAt: true } });
  await AuditService.log({ action: "UPDATE", entity: "DOCUMENT_OCR_REVIEW", entityId: id, oldValue: { invoiceData: previousInvoice, status: (current.manualReview as { status?: string } | undefined)?.status ?? "PENDING" }, newValue: { invoiceData: correctedInvoice, status: "VALIDATED", duplicateCandidates: duplicateCandidates.map((candidate) => candidate.id) }, details: `Extraction OCR de « ${document.originalName} » vérifiée par ${session.name}.` });
  return NextResponse.json({ document: updated, duplicateCandidates });
}
