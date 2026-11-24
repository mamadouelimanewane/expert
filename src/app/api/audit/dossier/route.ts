import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuditConclusion, AuditItemStatus, type MissionType } from "@prisma/client";

import { requireStaff } from "@/lib/api-auth";
import { canManageReviewResolution, canReviewAuditSection, validReviewCommentText } from "@/lib/audit-review-policy";
import { AuditService } from "@/lib/audit";
const DEFAULT_SECTIONS = [
  "Trésorerie",
  "Immobilisations",
  "Stocks",
  "Créances clients",
  "Dettes fournisseurs",
  "Capitaux propres",
  "Fiscalité",
  "Paie",
  "Achèvements",
];

export async function GET(request: NextRequest) {
    const { session, denied } = await requireStaff();
    if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const missionId = searchParams.get("missionId");
    // Le dossier de travail sert aussi bien l'audit legal que la revision
    // comptable : meme structure de sections et de diligences, seul le type
    // de mission change.
    const type = (searchParams.get("type") || "AUDIT") as MissionType;

    const mission = missionId
      ? await prisma.mission.findUnique({
          where: { id: missionId },
          include: { client: { select: { id: true, companyName: true, firstName: true, lastName: true } }, assignedTo: { select: { firstName: true, lastName: true } } },
        })
      : await prisma.mission.findFirst({
          where: { type },
          include: { client: { select: { id: true, companyName: true, firstName: true, lastName: true } }, assignedTo: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: "desc" },
        });

    if (!mission) {
      return NextResponse.json({ error: `Aucune mission de type ${type} trouvée. Créez-en une pour ouvrir un dossier de travail.` }, { status: 404 });
    }

    let sections = await prisma.auditSection.findMany({
      where: { missionId: mission.id },
      orderBy: { order: "asc" },
      include: { items: true, reviewedBy: { select: { firstName: true, lastName: true } } },
    });

    // Bootstrap : première ouverture du dossier pour cette mission, on crée les sections
    // standard (programme vide, à compléter par l'auditeur) — pas de constats fabriqués.
    if (sections.length === 0) {
      await prisma.auditSection.createMany({
        data: DEFAULT_SECTIONS.map((name, i) => ({ name, order: i, missionId: mission.id })),
      });
      sections = await prisma.auditSection.findMany({
        where: { missionId: mission.id },
        orderBy: { order: "asc" },
        include: { items: true, reviewedBy: { select: { firstName: true, lastName: true } } },
      });
    }

    const sectionsOut = sections.map((s) => {
      const total = s.items.length;
      const done = s.items.filter((i) => i.status === "TERMINE").length;
      const progress = total > 0 ? Math.round((done / total) * 100) : 0;
      return { id: s.id, name: s.name, progress, conclusion: s.conclusion, note: s.note, reviewStatus: s.reviewStatus, reviewNote: s.reviewNote, reviewedBy: s.reviewedBy, reviewedAt: s.reviewedAt };
    });

    const globalProgress = sectionsOut.length > 0
      ? Math.round(sectionsOut.reduce((sum, s) => sum + s.progress, 0) / sectionsOut.length)
      : 0;

    const checklists: Record<string, any[]> = {};
    for (const s of sections) {
      checklists[s.id] = s.items.map((i) => ({
        id: i.id,
        description: i.description,
        assertion: i.assertion,
        status: i.status,
        ref: i.ref,
        comment: i.comment,
      }));
    }
    const [openReviewPoints, unreviewedSamples] = mission.type === "AUDIT"
      ? await Promise.all([
          prisma.auditReviewComment.count({ where: { missionId: mission.id, status: "OPEN" } }),
          prisma.auditSample.count({ where: { missionId: mission.id, status: "DRAFT" } }),
        ])
      : [0, 0];

    return NextResponse.json({
      globalProgress,
      mission: {
        id: mission.id,
        name: mission.title,
        clientId: mission.client.id,
        client: mission.client.companyName || `${mission.client.firstName ?? ""} ${mission.client.lastName ?? ""}`.trim(),
        auditor: mission.assignedTo ? `${mission.assignedTo.firstName} ${mission.assignedTo.lastName}` : "Non assigné",
        date: mission.deadline ? mission.deadline.toISOString() : null,
      },
      sections: sectionsOut,
      checklists,
      currentRole: session.role,
      openReviewPoints,
      unreviewedSamples,
    });
  } catch (error) {
    console.error("Erreur GET audit/dossier:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Enregistre la conclusion d'une section
export async function POST(req: Request) {
    const { session, denied } = await requireStaff();
    if (denied) return denied;

  try {
    const body: unknown = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
    const { sectionId, conclusion, note, action, reviewNote } = body as Record<string, unknown>;

    if (!sectionId) {
      return NextResponse.json({ error: "sectionId requis" }, { status: 400 });
    }

    const actuelle = await prisma.auditSection.findFirst({ where: { id: String(sectionId) }, include: { items: true, mission: { select: { type: true } } } });
    if (!actuelle) return NextResponse.json({ error: "Section introuvable." }, { status: 404 });
    if (action === "REVIEW") {
      if (!canManageReviewResolution(session.role)) return NextResponse.json({ error: "La revue de section est réservée à un expert ou administrateur." }, { status: 403 });
      if (actuelle.mission.type !== "AUDIT") return NextResponse.json({ error: "La revue hiérarchique de section est réservée aux missions d’audit." }, { status: 400 });
      if (actuelle.reviewStatus === "REVIEWED") return NextResponse.json({ error: "Cette section est déjà revue." }, { status: 409 });
      if (!canReviewAuditSection(actuelle.conclusion, actuelle.items.map((item) => item.status))) return NextResponse.json({ error: "Terminez et concluez toutes les diligences avant la revue hiérarchique." }, { status: 409 });
      if (!validReviewCommentText(reviewNote, 10, 3000)) return NextResponse.json({ error: "Un commentaire de revue (10 à 3 000 caractères) est requis." }, { status: 400 });
      const section = await prisma.auditSection.update({ where: { id: String(sectionId) }, data: { reviewStatus: "REVIEWED", reviewNote: String(reviewNote).trim(), reviewedById: session.id, reviewedAt: new Date() } });
      await AuditService.log({ action: "REVIEW", entity: "AUDIT_SECTION", entityId: section.id, oldValue: { reviewStatus: actuelle.reviewStatus }, newValue: { reviewStatus: section.reviewStatus, reviewNote: section.reviewNote, conclusion: actuelle.conclusion }, details: `Section « ${actuelle.name} » revue par ${session.name}.` });
      return NextResponse.json({ success: true, section });
    }
    if (action !== undefined) return NextResponse.json({ error: "Action de section invalide." }, { status: 400 });
    if (conclusion !== undefined && !(Object.values(AuditConclusion) as unknown[]).includes(conclusion)) return NextResponse.json({ error: "Conclusion de section invalide." }, { status: 400 });
    if (note !== undefined && note !== null && (typeof note !== "string" || note.length > 5000)) return NextResponse.json({ error: "La note de synthèse ne peut dépasser 5 000 caractères." }, { status: 400 });
    const section = await prisma.auditSection.update({ where: { id: actuelle.id }, data: { ...(conclusion !== undefined && { conclusion: conclusion as AuditConclusion }), ...(note !== undefined && { note: note as string | null }), ...(actuelle.reviewStatus === "REVIEWED" ? { reviewStatus: "PENDING", reviewedById: null, reviewedAt: null, reviewNote: null } : {}) } });
    await AuditService.log({ action: "UPDATE", entity: "AUDIT_SECTION", entityId: section.id, oldValue: { conclusion: actuelle.conclusion, note: actuelle.note, reviewStatus: actuelle.reviewStatus }, newValue: { conclusion: section.conclusion, note: section.note, reviewStatus: section.reviewStatus }, details: `Conclusion de la section « ${actuelle.name} » modifiée par ${session.name}.` });

    return NextResponse.json({ success: true, section });
  } catch (error) {
    console.error("Erreur POST audit/dossier:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Met à jour un item de checklist (statut, référence, commentaire)
export async function PATCH(req: Request) {
    const { session, denied } = await requireStaff();
    if (denied) return denied;

  try {
    const body: unknown = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
    const { itemId, status, ref, comment } = body as Record<string, unknown>;

    if (!itemId) {
      return NextResponse.json({ error: "itemId requis" }, { status: 400 });
    }

    const actuelle = await prisma.auditChecklistItem.findFirst({ where: { id: String(itemId) }, include: { section: { select: { id: true, name: true, missionId: true } } } });
    if (!actuelle) return NextResponse.json({ error: "Diligence introuvable." }, { status: 404 });
    if (status !== undefined && !(Object.values(AuditItemStatus) as unknown[]).includes(status)) return NextResponse.json({ error: "Statut de diligence invalide." }, { status: 400 });
    if (ref !== undefined && ref !== null && (typeof ref !== "string" || ref.length > 500)) return NextResponse.json({ error: "Référence de pièce invalide." }, { status: 400 });
    if (comment !== undefined && comment !== null && (typeof comment !== "string" || comment.length > 5000)) return NextResponse.json({ error: "Commentaire trop long." }, { status: 400 });
    const item = await prisma.auditChecklistItem.update({ where: { id: actuelle.id }, data: { ...(status !== undefined && { status: status as AuditItemStatus }), ...(ref !== undefined && { ref: ref as string | null }), ...(comment !== undefined && { comment: comment as string | null }) } });
    if (actuelle.section.missionId) {
      const section = await prisma.auditSection.findUnique({ where: { id: actuelle.section.id }, select: { reviewStatus: true, reviewedById: true } });
      if (section?.reviewStatus === "REVIEWED") await prisma.auditSection.update({ where: { id: actuelle.section.id }, data: { reviewStatus: "PENDING", reviewedById: null, reviewedAt: null, reviewNote: null } });
    }
    await AuditService.log({ action: "UPDATE", entity: "AUDIT_CHECKLIST_ITEM", entityId: item.id, oldValue: { status: actuelle.status, ref: actuelle.ref, comment: actuelle.comment }, newValue: { status: item.status, ref: item.ref, comment: item.comment, missionId: actuelle.section.missionId }, details: `Diligence de « ${actuelle.section.name} » modifiée par ${session.name}.` });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Erreur PATCH audit/dossier:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
