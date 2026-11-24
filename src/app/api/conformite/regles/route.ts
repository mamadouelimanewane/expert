import { NextResponse } from "next/server";
import { ClientType, DeclarationType, FiscalRegime } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import { canManageReviewResolution } from "@/lib/audit-review-policy";
import { AuditService } from "@/lib/audit";
import { isObjectId } from "@/lib/tenant-security";

const PERIODICITES = ["MENSUELLE", "TRIMESTRIELLE", "ANNUELLE"] as const;
const CATEGORIES = ["TVA", "IS", "SOCIAL", "RAS", "BIC", "AUTRE"] as const;
const TAX_PROFILE_FLAGS = ["vatRegistered", "employer", "withholdingAgent"] as const;
const CODE_PAYS = /^[A-Z]{2}$/;
const CODE_OBLIGATION = /^[a-z0-9][a-z0-9_-]{1,79}$/;
const texte = (value: unknown, max = 2000) => typeof value === "string" ? value.trim().slice(0, max) : "";
const objet = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));
function listeChaine(value: unknown, autorises?: readonly string[]) {
  if (value === undefined) return { valid: true, values: [] as string[] };
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) return { valid: false, values: [] as string[] };
  const values = [...new Set(value.map((item) => item.trim()).filter(Boolean))];
  return { valid: values.length === value.length && (!autorises || values.every((item) => autorises.includes(item))), values };
}
const dateOptionnelle = (value: unknown): Date | null | undefined => {
  if (value === null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export async function GET(request: Request) {
  const { denied } = await requireStaff();
  if (denied) return denied;
  const params = new URL(request.url).searchParams;
  const country = params.get("country")?.trim().toUpperCase();
  const obligationCode = params.get("obligationCode")?.trim();
  if (country && !CODE_PAYS.test(country)) return NextResponse.json({ error: "Code pays invalide." }, { status: 400 });
  try {
    const rules = await prisma.regulatoryObligationRule.findMany({
      where: { ...(country ? { country } : {}), ...(obligationCode ? { obligationCode } : {}) },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        reviewedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [{ country: "asc" }, { obligationCode: "asc" }, { version: "desc" }],
      take: 250,
    });
    return NextResponse.json({ rules });
  } catch (error) {
    console.error("Regulatory rules GET:", error);
    return NextResponse.json({ error: "Impossible de charger les règles du cabinet." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { session, denied } = await requireWriteAccess();
  if (denied) return denied;
  const body: unknown = await request.json().catch(() => null);
  if (!objet(body)) return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });

  const country = texte(body.country, 2).toUpperCase();
  const obligationCode = texte(body.obligationCode, 80).toLowerCase();
  const title = texte(body.title, 200), description = texte(body.description, 3000);
  const category = texte(body.category, 60).toUpperCase();
  const sourceTitle = texte(body.sourceTitle, 250), sourceUrl = texte(body.sourceUrl, 1000);
  const sourceArticle = texte(body.sourceArticle, 250);
  const applicabilityNotes = texte(body.applicabilityNotes, 2000);
  const clientTypes = listeChaine(body.clientTypes, Object.values(ClientType));
  const fiscalRegimes = listeChaine(body.fiscalRegimes, Object.values(FiscalRegime));
  const sectors = listeChaine(body.sectors);
  const requiredTaxProfileFlags = listeChaine(body.requiredTaxProfileFlags, TAX_PROFILE_FLAGS);
  const periodicity = texte(body.periodicity, 20).toUpperCase();
  const declarationType = texte(body.declarationType, 40);
  const dueDay = Number(body.dueDay), dueMonth = body.dueMonth === null || body.dueMonth === "" || body.dueMonth === undefined ? null : Number(body.dueMonth);
  const effectiveFrom = dateOptionnelle(body.effectiveFrom), effectiveUntil = dateOptionnelle(body.effectiveUntil);
  const sourcePublishedAt = dateOptionnelle(body.sourcePublishedAt);

  if (!CODE_PAYS.test(country)) return NextResponse.json({ error: "Saisissez un code pays ISO à deux lettres." }, { status: 400 });
  if (!clientTypes.valid || clientTypes.values.length === 0) return NextResponse.json({ error: "Sélectionnez au moins une forme de client concernée." }, { status: 400 });
  if (!fiscalRegimes.valid || !sectors.valid || !requiredTaxProfileFlags.valid || sectors.values.length > 30 || sectors.values.some((sector) => sector.length > 50)) return NextResponse.json({ error: "Périmètre de régime, secteur ou profil fiscal invalide." }, { status: 400 });
  if (!CODE_OBLIGATION.test(obligationCode)) return NextResponse.json({ error: "Le code doit utiliser 2 à 80 caractères minuscules, chiffres, tirets ou tirets bas." }, { status: 400 });
  if (title.length < 3 || description.length < 10 || category.length < 2) return NextResponse.json({ error: "Le titre, la description et la catégorie sont obligatoires." }, { status: 400 });
  if (applicabilityNotes.length < 20) return NextResponse.json({ error: "Décrivez les entités, régimes ou conditions d’assujettissement (20 caractères minimum)." }, { status: 400 });
  if (!Object.values(DeclarationType).includes(declarationType as DeclarationType)) return NextResponse.json({ error: "Type de déclaration invalide." }, { status: 400 });
  if (!CATEGORIES.includes(category as typeof CATEGORIES[number])) return NextResponse.json({ error: "Catégorie réglementaire invalide." }, { status: 400 });
  if (!PERIODICITES.includes(periodicity as typeof PERIODICITES[number])) return NextResponse.json({ error: "Périodicité invalide." }, { status: 400 });
  if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) return NextResponse.json({ error: "Le jour d’échéance doit être compris entre 1 et 31." }, { status: 400 });
  if (periodicity === "MENSUELLE" && dueMonth !== null) return NextResponse.json({ error: "Une règle mensuelle ne doit pas préciser de mois d’échéance." }, { status: 400 });
  if (periodicity === "TRIMESTRIELLE" && (dueMonth === null || !Number.isInteger(dueMonth) || dueMonth < 1 || dueMonth > 3)) return NextResponse.json({ error: "Pour une périodicité trimestrielle, le mois d’échéance dans le trimestre doit être de 1 à 3." }, { status: 400 });
  if (periodicity === "ANNUELLE" && (dueMonth === null || !Number.isInteger(dueMonth) || dueMonth < 1 || dueMonth > 12)) return NextResponse.json({ error: "Pour une périodicité annuelle, le mois d’échéance doit être de 1 à 12." }, { status: 400 });
  if (effectiveFrom === undefined || effectiveUntil === undefined || sourcePublishedAt === undefined) return NextResponse.json({ error: "Une date de validité ou de publication n’est pas valide." }, { status: 400 });
  if (!effectiveFrom || (effectiveUntil && effectiveUntil < effectiveFrom)) return NextResponse.json({ error: "La date de début d’effet est requise et doit précéder la date de fin." }, { status: 400 });
  if (sourceTitle.length < 3) return NextResponse.json({ error: "Indiquez le titre du texte officiel source." }, { status: 400 });
  try {
    const url = new URL(sourceUrl);
    if (url.protocol !== "https:") throw new Error("url");
  } catch {
    return NextResponse.json({ error: "La source doit être une URL HTTPS consultable." }, { status: 400 });
  }
  try {
    let rule = null;
    for (let attempt = 0; attempt < 5 && !rule; attempt++) {
      const previous = await prisma.regulatoryObligationRule.findFirst({
        where: { country, obligationCode },
        orderBy: { version: "desc" }, select: { version: true },
      });
      try {
        rule = await prisma.regulatoryObligationRule.create({
          data: {
            country, obligationCode, version: (previous?.version ?? 0) + 1,
            title, description, category, declarationType: declarationType as DeclarationType,
            periodicity, dueDay, dueMonth, applicabilityNotes, sourceTitle, sourceUrl, sourceArticle: sourceArticle || null,
            sourcePublishedAt, effectiveFrom, effectiveUntil,
            clientTypes: clientTypes.values as ClientType[], fiscalRegimes: fiscalRegimes.values as FiscalRegime[],
            sectors: sectors.values.map((sector) => sector.toUpperCase()), requiredTaxProfileFlags: requiredTaxProfileFlags.values,
            createdById: session.id,
          },
        });
      } catch (error) {
        if ((error as { code?: string })?.code !== "P2002" || attempt === 4) throw error;
      }
    }
    if (!rule) return NextResponse.json({ error: "Impossible de créer une version unique ; réessayez." }, { status: 409 });
    await AuditService.log({ action: "CREATE", entity: "REGULATORY_RULE", entityId: rule.id, newValue: { country, obligationCode, version: rule.version, status: rule.status, sourceUrl } });
    return NextResponse.json({ rule }, { status: 201 });
  } catch (error) {
    console.error("Regulatory rules POST:", error);
    return NextResponse.json({ error: "Impossible d’enregistrer cette version de règle." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { session, denied } = await requireWriteAccess();
  if (denied) return denied;
  if (!canManageReviewResolution(session.role)) return NextResponse.json({ error: "La validation des règles est réservée à un expert ou administrateur." }, { status: 403 });
  const body: unknown = await request.json().catch(() => null);
  if (!objet(body)) return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  const id = texte(body.id, 30), action = texte(body.action, 20).toUpperCase(), reviewComment = texte(body.reviewComment, 2000);
  if (!isObjectId(id)) return NextResponse.json({ error: "Identifiant de règle invalide." }, { status: 400 });
  if (reviewComment.length < 20) return NextResponse.json({ error: "La note de revue doit décrire les contrôles effectués (20 caractères minimum)." }, { status: 400 });

  try {
    const previous = await prisma.regulatoryObligationRule.findFirst({ where: { id } });
    if (!previous) return NextResponse.json({ error: "Version de règle introuvable." }, { status: 404 });
    if (action === "RETIRE") {
      if (previous.status !== "VERIFIED") return NextResponse.json({ error: "Seule une règle validée peut être retirée." }, { status: 409 });
      const retiredAt = new Date();
      const endOfValidity = new Date(Date.UTC(retiredAt.getUTCFullYear(), retiredAt.getUTCMonth(), retiredAt.getUTCDate() - 1, 23, 59, 59, 999));
      if (previous.effectiveFrom > endOfValidity) return NextResponse.json({ error: "Cette version n’est pas encore entrée en vigueur ; créez une nouvelle version avec la bonne période d’effet." }, { status: 409 });
      const effectiveUntil = previous.effectiveUntil && previous.effectiveUntil < endOfValidity ? previous.effectiveUntil : endOfValidity;
      const result = await prisma.regulatoryObligationRule.updateMany({
        where: { id, status: "VERIFIED" }, data: { status: "RETIRED", reviewComment, retiredAt, effectiveUntil },
      });
      if (result.count !== 1) return NextResponse.json({ error: "Cette règle a changé d’état. Actualisez la liste." }, { status: 409 });
      await prisma.regulatoryObligationActivation.deleteMany({ where: { ruleId: id } });
      await AuditService.log({ action: "UPDATE", entity: "REGULATORY_RULE", entityId: id, oldValue: { status: previous.status }, newValue: { status: "RETIRED", reviewComment } });
      return NextResponse.json({ ok: true, status: "RETIRED" });
    }
    if (action !== "VALIDATE") return NextResponse.json({ error: "Action attendue : VALIDATE ou RETIRE." }, { status: 400 });
    if (previous.status !== "DRAFT") return NextResponse.json({ error: "Seule une version brouillon peut être validée." }, { status: 409 });
    if (previous.createdById === session.id) return NextResponse.json({ error: "La validation doit être réalisée par une autre personne habilitée." }, { status: 403 });

    const earlierVersions = await prisma.regulatoryObligationRule.findMany({
      where: { country: previous.country, obligationCode: previous.obligationCode, status: { in: ["VERIFIED", "RETIRED"] }, id: { not: id } },
      select: { id: true, effectiveFrom: true, effectiveUntil: true, retiredAt: true, version: true },
    });
    const nextEnd = previous.effectiveUntil?.getTime() ?? Number.POSITIVE_INFINITY;
    const periodOverlap = earlierVersions.some((item) => {
      const retiredEnd = item.retiredAt
        ? new Date(Date.UTC(item.retiredAt.getUTCFullYear(), item.retiredAt.getUTCMonth(), item.retiredAt.getUTCDate() - 1, 23, 59, 59, 999)).getTime()
        : Number.POSITIVE_INFINITY;
      const existingEnd = Math.min(item.effectiveUntil?.getTime() ?? Number.POSITIVE_INFINITY, retiredEnd);
      return previous.effectiveFrom.getTime() <= existingEnd && item.effectiveFrom.getTime() <= nextEnd;
    });
    if (periodOverlap) return NextResponse.json({ error: "La période d’effet recouvre une version antérieure. Retirez ou datez correctement les versions avant validation." }, { status: 409 });

    try {
      await prisma.regulatoryObligationActivation.create({
        data: { country: previous.country, obligationCode: previous.obligationCode, ruleId: previous.id },
      });
    } catch (error) {
      if ((error as { code?: string })?.code === "P2002") {
        return NextResponse.json({ error: "Une version de cette obligation est déjà active. Retirez-la avant d’en valider une autre." }, { status: 409 });
      }
      throw error;
    }
    const result = await prisma.regulatoryObligationRule.updateMany({
      where: { id, status: "DRAFT", createdById: { not: session.id } },
      data: { status: "VERIFIED", reviewedById: session.id, reviewedAt: new Date(), reviewComment },
    });
    if (result.count !== 1) {
      await prisma.regulatoryObligationActivation.deleteMany({ where: { ruleId: id } });
      return NextResponse.json({ error: "Cette version vient d’être validée ou modifiée. Actualisez la liste." }, { status: 409 });
    }
    await AuditService.log({ action: "REVIEW", entity: "REGULATORY_RULE", entityId: id, oldValue: { status: previous.status }, newValue: { status: "VERIFIED", version: previous.version, reviewComment } });
    return NextResponse.json({ ok: true, status: "VERIFIED" });
  } catch (error) {
    console.error("Regulatory rules PATCH:", error);
    return NextResponse.json({ error: "Impossible de mettre à jour la validation de cette règle." }, { status: 500 });
  }
}
