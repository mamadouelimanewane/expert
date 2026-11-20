import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";

export async function GET(request: Request) {
  const { denied } = await requireStaff();
  if (denied) return denied;
  const missionId = new URL(request.url).searchParams.get("missionId") ?? "";
  if (!isObjectId(missionId)) return NextResponse.json({ error: "missionId invalide." }, { status: 400 });

  const mission = await prisma.mission.findFirst({
    where: { id: missionId, type: "AUDIT" },
    include: {
      client: { select: { companyName: true, firstName: true, lastName: true, country: true } },
      createdBy: { select: { firstName: true, lastName: true } },
      assignedTo: { select: { firstName: true, lastName: true } },
    },
  });
  if (!mission) return NextResponse.json({ error: "Mission d’audit introuvable." }, { status: 404 });

  const [sections, samples, openReviewPoints, assessment] = await Promise.all([
    prisma.auditSection.findMany({ where: { missionId }, orderBy: { order: "asc" }, include: { items: { orderBy: { createdAt: "asc" } }, reviewedBy: { select: { firstName: true, lastName: true } } } }),
    prisma.auditSample.findMany({ where: { missionId }, orderBy: { createdAt: "asc" } }),
    prisma.auditReviewComment.findMany({ where: { missionId, status: "OPEN" }, orderBy: { createdAt: "asc" }, include: { createdBy: { select: { firstName: true, lastName: true } }, assignedTo: { select: { firstName: true, lastName: true } } } }),
    prisma.auditEngagementAssessment.findFirst({ where: { missionId }, include: { assessedBy: { select: { firstName: true, lastName: true } } } }),
  ]);

  const sectionsValidées = sections.filter((section) => section.reviewStatus === "REVIEWED" && section.conclusion);
  const testsValidés = samples.filter((sample) => sample.status === "REVIEWED");
  const sectionsEnAttente = sections.filter((section) => section.reviewStatus !== "REVIEWED" || !section.conclusion).map((section) => ({ name: section.name, progress: section.progress, conclusion: section.conclusion, reviewStatus: section.reviewStatus }));
  const testsEnAttente = samples.filter((sample) => sample.status !== "REVIEWED").map((sample) => ({ id: sample.id, procedureReference: sample.procedureReference, conclusion: sample.conclusion }));
  const client = mission.client.companyName || `${mission.client.firstName ?? ""} ${mission.client.lastName ?? ""}`.trim();

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    mission: { id: mission.id, title: mission.title, status: mission.status, type: mission.type, startDate: mission.startDate, deadline: mission.deadline, client, country: mission.client.country },
    équipe: { responsable: mission.assignedTo ? `${mission.assignedTo.firstName} ${mission.assignedTo.lastName}` : null, créateur: `${mission.createdBy.firstName} ${mission.createdBy.lastName}` },
    préalables: assessment ? { acceptation: assessment.acceptanceStatus, motifAcceptation: assessment.acceptanceRationale, indépendance: assessment.independenceStatus, motifIndépendance: assessment.independenceRationale, évaluéPar: assessment.assessedBy ? `${assessment.assessedBy.firstName} ${assessment.assessedBy.lastName}` : null, dateÉvaluation: assessment.updatedAt } : null,
    sectionsValidées: sectionsValidées.map((section) => ({ name: section.name, conclusion: section.conclusion, note: section.note, reviewNote: section.reviewNote, reviewedAt: section.reviewedAt, reviewedBy: section.reviewedBy ? `${section.reviewedBy.firstName} ${section.reviewedBy.lastName}` : null, diligences: section.items.map((item) => ({ description: item.description, assertion: item.assertion, status: item.status, reference: item.ref, commentaire: item.comment })) })),
    testsValidés: testsValidés.map((sample) => ({ procedureReference: sample.procedureReference, populationDescription: sample.populationDescription, populationSize: sample.populationSize, method: sample.method, sampleSize: sample.sampleSize, selectedItems: sample.selectedItems, exceptionsCount: sample.exceptionsCount, exceptionDetails: sample.exceptionDetails, conclusion: sample.conclusion, reviewedAt: sample.reviewedAt })),
    sectionsEnAttente,
    testsEnAttente,
    pointsDeRevueOuverts: openReviewPoints.map((comment) => ({ title: comment.title, referenceType: comment.referenceType, referenceId: comment.referenceId, referenceVersion: comment.referenceVersion, initialComment: comment.initialComment, createdBy: `${comment.createdBy.firstName} ${comment.createdBy.lastName}`, assignedTo: comment.assignedTo ? `${comment.assignedTo.firstName} ${comment.assignedTo.lastName}` : null, createdAt: comment.createdAt })),
    statutRapport: sectionsEnAttente.length === 0 && testsEnAttente.length === 0 && openReviewPoints.length === 0 ? "TRAVAUX_REVUS" : "PROVISOIRE_AVEC_POINTS_EN_ATTENTE",
    nature: "Synthèse des travaux documentés; ne constitue pas un rapport d’opinion d’audit.",
  });
}
