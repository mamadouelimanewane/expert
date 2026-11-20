import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";
import { classifyManualAccountingInput } from "@/lib/accounting-input";
import { AuditService } from "@/lib/audit";
import { ensureAccountingPeriodOpen } from "@/lib/accounting-period-lock";

export async function POST(request: Request) {
  const { denied } = await requireWriteAccess();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Objet JSON requis." }, { status: 400 });
  }
  const input = body as { clientId?: unknown; rawMessage?: unknown; source?: unknown };
  if (!isObjectId(input.clientId)) {
    return NextResponse.json({ error: "Sélectionnez un client valide." }, { status: 400 });
  }
  if (typeof input.rawMessage !== "string" || input.rawMessage.trim().length < 3 || input.rawMessage.length > 2_000) {
    return NextResponse.json({ error: "Le libellé doit contenir entre 3 et 2 000 caractères." }, { status: 400 });
  }

  const classification = classifyManualAccountingInput(input.rawMessage);
  if (!classification.ok) {
    return NextResponse.json({ error: classification.reason, entryCreated: false }, { status: 422 });
  }

  try {
    const client = await prisma.client.findUnique({
      where: { id: input.clientId },
      select: { id: true, companyName: true, firstName: true, lastName: true },
    });
    if (!client) return NextResponse.json({ error: "Client introuvable dans ce cabinet." }, { status: 404 });

    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const period = date.slice(0, 7);
    const periodState = await ensureAccountingPeriodOpen(client.id, period);
    if (!periodState.open) {
      return NextResponse.json({ error: `La période ${period} est verrouillée. Le brouillon n'a pas été créé.` }, { status: 409 });
    }
    const source = typeof input.source === "string" && ["MANUAL", "WHATSAPP", "VOICE"].includes(input.source)
      ? input.source
      : "MANUAL";
    const label = client.companyName || [client.firstName, client.lastName].filter(Boolean).join(" ") || "Client";
    const income = classification.direction === "ENTREE";

    const entry = await prisma.tpeJournal.create({
      data: {
        clientId: client.id,
        businessName: label,
        periode: period,
        date,
        libelle: input.rawMessage.trim(),
        entree: income ? classification.amount : 0,
        sortie: income ? 0 : classification.amount,
        source,
        rawContent: input.rawMessage.trim(),
        confidenceScore: classification.confidence,
        imputationNote: classification.reason,
        debitCompte: income ? "521000" : classification.account,
        debitIntitule: income ? "Banque / Caisse — à vérifier" : classification.accountLabel,
        creditCompte: income ? classification.account : "521000",
        creditIntitule: income ? classification.accountLabel : "Banque / Caisse — à vérifier",
        montant: classification.amount,
        status: "PENDING",
      },
    });

    await AuditService.log({
      action: "CREATE",
      entity: "TPE_JOURNAL",
      entityId: entry.id,
      details: `Brouillon créé depuis une saisie ${source}; revue humaine requise.`,
      newValue: {
        clientId: client.id,
        status: entry.status,
        amount: classification.amount,
        debitCompte: entry.debitCompte,
        creditCompte: entry.creditCompte,
        imputationNote: classification.reason,
      },
    });

    return NextResponse.json({
      success: true,
      entry,
      preImputation: {
        origin: "keyword_rules",
        explanation: classification.reason,
        requiresHumanApproval: true,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("[TPE Process Flow Error]", error);
    return NextResponse.json({ error: "Impossible de créer le brouillon comptable." }, { status: 500 });
  }
}
