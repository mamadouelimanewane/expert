import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";
import { normaliserPeriode } from "@/lib/validation";
import { canManageReviewResolution, validReviewCommentText } from "@/lib/audit-review-policy";
import { AuditService } from "@/lib/audit";

const CHECKLIST = [
  ["SCOPE", "Confirmer le périmètre et les dates de l’exercice"],
  ["JOURNALS", "Examiner les journaux et écritures de l’exercice"],
  ["BANK", "Rapprocher les banques et la trésorerie"],
  ["AUXILIARIES", "Lettrer les comptes auxiliaires clients et fournisseurs"],
  ["INVENTORY", "Documenter l’inventaire physique et la valorisation des stocks"],
  ["ASSETS", "Vérifier les immobilisations, acquisitions, sorties et amortissements"],
  ["PAYROLL", "Rapprocher la paie, les charges sociales et les paiements"],
  ["TAX", "Rapprocher les déclarations fiscales et les soldes comptables"],
  ["STATEMENTS", "Contrôler la balance, le bilan, le compte de résultat et les annexes"],
  ["DISCLOSURES", "Rassembler les pièces et informations à joindre aux états financiers"],
  ["REVIEW", "Documenter la revue finale et l’approbation de l’expert"],
] as const;

function lireIdentité(params: URLSearchParams) {
  const clientId = params.get("clientId") ?? "";
  const fiscalYear = Number(params.get("fiscalYear"));
  if (!isObjectId(clientId) || !Number.isInteger(fiscalYear) || fiscalYear < 2000 || fiscalYear > 2100) return null;
  return { clientId, fiscalYear };
}

async function lireEtatExercice(clientId: string, fiscalYear: number, cabinetId: string) {
  const periodes = Array.from({ length: 12 }, (_, index) => `${fiscalYear}-${String(index + 1).padStart(2, "0")}`);
  const [locks, pendingEntries] = await Promise.all([
    prisma.accountingPeriodLock.findMany({ where: { clientId, cabinetId, periode: { in: periodes } }, select: { periode: true, lockedAt: true, reason: true } }),
    prisma.tpeJournal.findMany({ where: { clientId, cabinetId, status: { in: ["PENDING", "APPROVED"] } }, select: { periode: true, status: true } }),
  ]);
  const moisVerrouilles = new Set(locks.map((lock) => lock.periode));
  const entriesOfYear = pendingEntries.filter((entry) => normaliserPeriode(entry.periode)?.startsWith(`${fiscalYear}-`));
  return {
    periods: periodes.map((periode) => ({ periode, verrouillee: moisVerrouilles.has(periode), lock: locks.find((lock) => lock.periode === periode) ?? null })),
    pendingEntries: entriesOfYear.length,
  };
}

export async function GET(request: Request) {
  const { session, denied } = await requireStaff();
  if (denied) return denied;
  const identity = lireIdentité(new URL(request.url).searchParams);
  if (!identity) return NextResponse.json({ error: "clientId et exercice (2000–2100) requis." }, { status: 400 });
  const client = await prisma.client.findFirst({ where: { id: identity.clientId, cabinetId: session.cabinetId }, select: { id: true, companyName: true, firstName: true, lastName: true } });
  if (!client) return NextResponse.json({ error: "Client introuvable dans ce cabinet." }, { status: 404 });
  const [close, state] = await Promise.all([
    prisma.yearEndClose.findFirst({ where: { clientId: identity.clientId, cabinetId: session.cabinetId, fiscalYear: identity.fiscalYear }, include: { items: { orderBy: { createdAt: "asc" }, include: { assignedTo: { select: { id: true, firstName: true, lastName: true } }, completedBy: { select: { firstName: true, lastName: true } } } }, createdBy: { select: { firstName: true, lastName: true } }, closedBy: { select: { firstName: true, lastName: true } } } }),
    lireEtatExercice(identity.clientId, identity.fiscalYear, session.cabinetId!),
  ]);
  return NextResponse.json({ client, fiscalYear: identity.fiscalYear, close, currentRole: session.role, ...state });
}

export async function POST(request: Request) {
  const { session, denied } = await requireWriteAccess();
  if (denied) return denied;
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  const input = body as Record<string, unknown>;
  const search = new URLSearchParams({ clientId: typeof input.clientId === "string" ? input.clientId : "", fiscalYear: String(input.fiscalYear ?? "") });
  const identity = lireIdentité(search);
  if (!identity) return NextResponse.json({ error: "clientId et exercice valides requis." }, { status: 400 });
  const action = input.action;
  const client = await prisma.client.findFirst({ where: { id: identity.clientId, cabinetId: session.cabinetId }, select: { id: true } });
  if (!client) return NextResponse.json({ error: "Client introuvable dans ce cabinet." }, { status: 404 });

  if (action === "START") {
    try {
      const close = await prisma.yearEndClose.create({ data: { cabinetId: session.cabinetId, clientId: identity.clientId, fiscalYear: identity.fiscalYear, createdById: session.id } });
      await prisma.yearEndCloseItem.createMany({ data: CHECKLIST.map(([key, title]) => ({ cabinetId: session.cabinetId, closeId: close.id, key, title })) });
      await AuditService.log({ action: "CREATE", entity: "YEAR_END_CLOSE", entityId: close.id, newValue: { clientId: identity.clientId, fiscalYear: identity.fiscalYear }, details: `Clôture annuelle ${identity.fiscalYear} démarrée par ${session.name}.` });
      return NextResponse.json({ closeId: close.id }, { status: 201 });
    } catch (error) {
      if (typeof error === "object" && error !== null && (error as { code?: string }).code === "P2002") return NextResponse.json({ error: "Cette clôture annuelle existe déjà. Actualisez la page." }, { status: 409 });
      throw error;
    }
  }

  const close = await prisma.yearEndClose.findFirst({ where: { clientId: identity.clientId, cabinetId: session.cabinetId, fiscalYear: identity.fiscalYear }, include: { items: true } });
  if (!close) return NextResponse.json({ error: "Démarrez d’abord la clôture annuelle." }, { status: 404 });
  if (!canManageReviewResolution(session.role)) return NextResponse.json({ error: "La clôture ou réouverture annuelle est réservée à un expert ou administrateur." }, { status: 403 });
  if (action === "CLOSE") {
    if (close.status !== "OPEN") return NextResponse.json({ error: "Cet exercice est déjà clôturé." }, { status: 409 });
    const state = await lireEtatExercice(identity.clientId, identity.fiscalYear, session.cabinetId!);
    const missingItems = close.items.filter((item) => item.status !== "DONE").length;
    const unlockedPeriods = state.periods.filter((period) => !period.verrouillee).map((period) => period.periode);
    if (missingItems || unlockedPeriods.length || state.pendingEntries) return NextResponse.json({ error: "La clôture annuelle ne peut pas être validée tant que les contrôles ne sont pas terminés, que les douze périodes ne sont pas verrouillées et que des écritures restent en attente.", missingItems, unlockedPeriods, pendingEntries: state.pendingEntries }, { status: 409 });
    const transition = await prisma.yearEndClose.updateMany({ where: { id: close.id, cabinetId: session.cabinetId, status: "OPEN" }, data: { status: "CLOSED", closedAt: new Date(), closedById: session.id, reopenReason: null } });
    if (transition.count !== 1) return NextResponse.json({ error: "La clôture a déjà changé d’état. Actualisez la page." }, { status: 409 });
    const updated = await prisma.yearEndClose.findFirst({ where: { id: close.id, cabinetId: session.cabinetId } });
    if (!updated) return NextResponse.json({ error: "Clôture annuelle introuvable après validation." }, { status: 404 });
    await AuditService.log({ action: "CLOSE", entity: "YEAR_END_CLOSE", entityId: close.id, oldValue: { status: close.status }, newValue: { status: updated.status, closedById: session.id }, details: `Exercice ${identity.fiscalYear} clôturé par ${session.name}.` });
    return NextResponse.json({ close: updated });
  }
  if (action === "REOPEN") {
    const reason = typeof input.reason === "string" ? input.reason.trim() : "";
    if (close.status !== "CLOSED") return NextResponse.json({ error: "Cet exercice n’est pas clôturé." }, { status: 409 });
    if (!validReviewCommentText(reason, 10, 1000)) return NextResponse.json({ error: "Un motif de réouverture (10 à 1 000 caractères) est requis." }, { status: 400 });
    const updated = await prisma.yearEndClose.update({ where: { id: close.id, cabinetId: session.cabinetId }, data: { status: "OPEN", closedAt: null, closedById: null, reopenReason: reason } });
    await AuditService.log({ action: "REOPEN", entity: "YEAR_END_CLOSE", entityId: close.id, oldValue: { status: close.status, closedById: close.closedById }, newValue: { status: updated.status, reopenReason: reason, reopenedById: session.id }, details: `Exercice ${identity.fiscalYear} rouvert par ${session.name}. Motif : ${reason}` });
    return NextResponse.json({ close: updated });
  }
  return NextResponse.json({ error: "Action attendue : START, CLOSE ou REOPEN." }, { status: 400 });
}

export async function PATCH(request: Request) {
  const { session, denied } = await requireWriteAccess();
  if (denied) return denied;
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  const input = body as Record<string, unknown>;
  const itemId = typeof input.itemId === "string" ? input.itemId : "";
  if (!isObjectId(itemId)) return NextResponse.json({ error: "Identifiant de contrôle invalide." }, { status: 400 });
  const item = await prisma.yearEndCloseItem.findFirst({ where: { id: itemId, cabinetId: session.cabinetId }, include: { close: true } });
  if (!item) return NextResponse.json({ error: "Contrôle de clôture introuvable." }, { status: 404 });
  if (item.close.status !== "OPEN") return NextResponse.json({ error: "La clôture annuelle est figée; demandez sa réouverture à un expert." }, { status: 409 });
  const status = input.status;
  if (status !== undefined && !["PENDING", "DONE"].includes(String(status))) return NextResponse.json({ error: "Statut de contrôle invalide." }, { status: 400 });
  const evidence = input.evidence === undefined ? item.evidence : input.evidence === null ? null : typeof input.evidence === "string" ? input.evidence.trim() : undefined;
  const notes = input.notes === undefined ? item.notes : input.notes === null ? null : typeof input.notes === "string" ? input.notes.trim() : undefined;
  const assignedToId = input.assignedToId === undefined ? item.assignedToId : input.assignedToId === null || input.assignedToId === "" ? null : input.assignedToId;
  if (evidence === undefined || (typeof evidence === "string" && evidence.length > 1000) || notes === undefined || (typeof notes === "string" && notes.length > 3000)) return NextResponse.json({ error: "Référence ou note invalide (1 000 et 3 000 caractères maximum)." }, { status: 400 });
  if (assignedToId !== null && (typeof assignedToId !== "string" || !isObjectId(assignedToId))) return NextResponse.json({ error: "Responsable invalide." }, { status: 400 });
  if (assignedToId) {
    const user = await prisma.user.findFirst({ where: { id: assignedToId, cabinetId: session.cabinetId, isActive: true, role: { not: "CLIENT" } }, select: { id: true } });
    if (!user) return NextResponse.json({ error: "Responsable introuvable ou inactif dans ce cabinet." }, { status: 400 });
  }
  const nextStatus = String(status ?? item.status);
  if (item.key === "REVIEW" && nextStatus === "DONE" && !canManageReviewResolution(session.role)) return NextResponse.json({ error: "L’approbation finale de l’exercice est réservée à un expert ou administrateur." }, { status: 403 });
  if (nextStatus === "DONE" && !validReviewCommentText(evidence, 5, 1000)) return NextResponse.json({ error: "Ajoutez une référence de pièce ou de contrôle (5 caractères minimum) avant de terminer." }, { status: 400 });
  const updated = await prisma.yearEndCloseItem.update({ where: { id: item.id, cabinetId: session.cabinetId }, data: { status: nextStatus, evidence, notes, assignedToId: assignedToId as string | null, completedById: nextStatus === "DONE" ? session.id : null, completedAt: nextStatus === "DONE" ? new Date() : null }, include: { assignedTo: { select: { id: true, firstName: true, lastName: true } }, completedBy: { select: { firstName: true, lastName: true } } } });
  await AuditService.log({ action: "UPDATE", entity: "YEAR_END_CLOSE_ITEM", entityId: item.id, oldValue: { status: item.status, evidence: item.evidence, notes: item.notes, assignedToId: item.assignedToId }, newValue: { status: updated.status, evidence: updated.evidence, notes: updated.notes, assignedToId: updated.assignedToId, completedById: updated.completedById }, details: `Contrôle « ${item.title} » mis à jour par ${session.name}.` });
  return NextResponse.json({ item: updated });
}
