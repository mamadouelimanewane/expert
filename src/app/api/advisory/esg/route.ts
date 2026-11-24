import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/api-auth";
import { canManageReviewResolution } from "@/lib/audit-review-policy";
import { AuditService } from "@/lib/audit";
import { isObjectId } from "@/lib/tenant-security";
import { genererRapportESG } from "@/lib/ohada/reporting-esg";
import { validerDonneesESG } from "@/lib/esg-assessment-policy";

const QUALITES = ["MEASURED", "ESTIMATED", "MIXED"] as const;
const text = (value: unknown, max = 5000) => typeof value === "string" ? value.trim().slice(0, max) : "";
const record = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));

export async function GET(request: Request) {
  const { session, denied } = await requireWriteAccess();
  if (denied) return denied;
  const clientId = new URL(request.url).searchParams.get("clientId");
  if (clientId && !isObjectId(clientId)) return NextResponse.json({ error: "Identifiant client invalide." }, { status: 400 });
  try {
    const assessments = await prisma.esgAssessment.findMany({
      where: { cabinetId: session.cabinetId, ...(clientId ? { clientId } : {}) },
      include: {
        client: { select: { id: true, companyName: true, firstName: true, lastName: true, country: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        reviewedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [{ periodYear: "desc" }, { version: "desc" }], take: 100,
    });
    return NextResponse.json({ assessments });
  } catch (error) {
    console.error("ESG assessments GET:", error);
    return NextResponse.json({ error: "Impossible de charger les évaluations ESG." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { session, denied } = await requireWriteAccess();
  if (denied) return denied;
  const body: unknown = await request.json().catch(() => null);
  if (!record(body)) return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  const clientId = text(body.clientId, 30), evidenceNotes = text(body.evidenceNotes), dataQuality = text(body.dataQuality, 20);
  if (!isObjectId(clientId)) return NextResponse.json({ error: "Sélectionnez un client valide." }, { status: 400 });
  if (!QUALITES.includes(dataQuality as typeof QUALITES[number])) return NextResponse.json({ error: "Précisez si les données sont mesurées, estimées ou mixtes." }, { status: 400 });
  if (evidenceNotes.length < 20) return NextResponse.json({ error: "Décrivez les sources et limites des données (20 caractères minimum)." }, { status: 400 });
  try {
    const client = await prisma.client.findFirst({ where: { id: clientId, cabinetId: session.cabinetId, isActive: true }, select: { id: true, companyName: true, firstName: true, lastName: true, country: true } });
    if (!client) return NextResponse.json({ error: "Client actif introuvable dans ce cabinet." }, { status: 404 });
    const legalName = client.companyName || `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim() || "Client";
    const validated = validerDonneesESG(body.input, legalName, client.country);
    if (!validated.ok) return NextResponse.json({ error: validated.message }, { status: 400 });
    const report = genererRapportESG(validated.input);
    let assessment = null;
    for (let attempt = 0; attempt < 5 && !assessment; attempt++) {
      const previous = await prisma.esgAssessment.findFirst({ where: { clientId, cabinetId: session.cabinetId, periodYear: validated.input.exercice }, orderBy: { version: "desc" }, select: { version: true } });
      try {
        assessment = await prisma.esgAssessment.create({
          data: {
            cabinetId: session.cabinetId,
            clientId, periodYear: validated.input.exercice, country: client.country,
            version: (previous?.version ?? 0) + 1, dataQuality, evidenceNotes,
            methodologyVersion: "ESG-ESTIMATE-1", emissionFactorVersion: "GENERIC-2.68-0.45-v1",
            input: validated.input as unknown as object, report: report as unknown as object,
            createdById: session.id,
          },
          include: { client: { select: { id: true, companyName: true, firstName: true, lastName: true, country: true } } },
        });
      } catch (error) {
        if ((error as { code?: string })?.code !== "P2002" || attempt === 4) throw error;
      }
    }
    if (!assessment) return NextResponse.json({ error: "Impossible de créer une version unique ; réessayez." }, { status: 409 });
    await AuditService.log({ action: "CREATE", entity: "ESG_ASSESSMENT", entityId: assessment.id, newValue: { clientId, periodYear: assessment.periodYear, version: assessment.version, dataQuality } });
    return NextResponse.json({ assessment, report }, { status: 201 });
  } catch (error) {
    console.error("ESG assessment POST:", error);
    return NextResponse.json({ error: "Impossible d’enregistrer cette évaluation ESG." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { session, denied } = await requireWriteAccess();
  if (denied) return denied;
  if (!canManageReviewResolution(session.role)) return NextResponse.json({ error: "La revue ESG est réservée à un expert ou administrateur." }, { status: 403 });
  const body: unknown = await request.json().catch(() => null);
  if (!record(body)) return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  const id = text(body.id, 30), reviewComment = text(body.reviewComment, 2000);
  if (!isObjectId(id)) return NextResponse.json({ error: "Identifiant d’évaluation invalide." }, { status: 400 });
  if (reviewComment.length < 20) return NextResponse.json({ error: "La revue doit comporter un commentaire motivé de 20 caractères minimum." }, { status: 400 });
  const previous = await prisma.esgAssessment.findFirst({ where: { id, cabinetId: session.cabinetId } });
  if (!previous) return NextResponse.json({ error: "Évaluation ESG introuvable." }, { status: 404 });
  if (previous.createdById === session.id) return NextResponse.json({ error: "La revue indépendante doit être effectuée par un autre membre habilité." }, { status: 403 });
  if (previous.status !== "DRAFT") return NextResponse.json({ error: "Cette version ESG a déjà été revue. Créez une nouvelle version pour la corriger." }, { status: 409 });

  // Compare-and-set: only one concurrent reviewer can change DRAFT to REVIEWED.
  const transition = await prisma.esgAssessment.updateMany({
    where: { id, cabinetId: session.cabinetId, status: "DRAFT", createdById: { not: session.id } },
    data: { status: "REVIEWED", reviewComment, reviewedById: session.id, reviewedAt: new Date() },
  });
  if (transition.count !== 1) {
    const current = await prisma.esgAssessment.findFirst({ where: { id, cabinetId: session.cabinetId } });
    if (!current) return NextResponse.json({ error: "Évaluation ESG introuvable." }, { status: 404 });
    if (current.createdById === session.id) return NextResponse.json({ error: "La revue indépendante doit être effectuée par un autre membre habilité." }, { status: 403 });
    return NextResponse.json({ error: "Cette version ESG vient d’être revue. Actualisez la liste avant de continuer." }, { status: 409 });
  }
  const assessment = await prisma.esgAssessment.findFirst({ where: { id, cabinetId: session.cabinetId } });
  if (!assessment) return NextResponse.json({ error: "La revue a été enregistrée, mais l’évaluation est introuvable." }, { status: 500 });
  await AuditService.log({ action: "REVIEW", entity: "ESG_ASSESSMENT", entityId: id, oldValue: { status: previous.status }, newValue: { status: assessment.status, reviewComment } });
  return NextResponse.json({ assessment });
}
