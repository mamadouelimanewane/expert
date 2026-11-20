import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";
import { AuditService } from "@/lib/audit";
import { analyserMontantOptionnel } from "@/lib/validation";

function clientName(c: { companyName: string | null; firstName: string | null; lastName: string | null } | null): string {
    if (!c) return "Client inconnu";
    return c.companyName || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "Client sans nom";
}

export async function GET(request: NextRequest) {
    try {
        await AuthService.requireAuth();

        const { searchParams } = new URL(request.url);
        let clientId = searchParams.get("clientId");

        const clients = await prisma.client.findMany({
            select: { id: true, companyName: true, firstName: true, lastName: true, country: true, fiscalRegime: true },
            orderBy: { companyName: "asc" },
        });

        if (!clientId) clientId = clients[0]?.id ?? null;

        if (!clientId) {
            return NextResponse.json({
                clients: [],
                selectedClientId: null,
                client: null,
                risks: [],
                financialData: null,
                declarations: [],
                taxRegimeComparison: null,
                taxRegimeComparisonUnavailable: "Aucun comparatif n'est fourni sans barèmes versionnés et vérifiés pour le pays et l'exercice du client.",
            });
        }

        const client = await prisma.client.findUnique({
            where: { id: clientId },
            select: { id: true, companyName: true, firstName: true, lastName: true, country: true, fiscalRegime: true },
        });

        const [risks, financialDataRows, declarations] = await Promise.all([
            prisma.fiscalRisk.findMany({ where: { clientId }, orderBy: { createdAt: "desc" } }),
            prisma.financialData.findMany({ where: { clientId }, orderBy: { year: "desc" }, take: 1 }),
            prisma.taxDeclaration.findMany({ where: { clientId }, orderBy: { dueDate: "desc" }, take: 15 }),
        ]);

        const financialData = financialDataRows[0] || null;
        // Ne pas chiffrer des taux génériques d'un pays à l'autre : le calcul
        // comparatif reste désactivé tant que les barèmes et critères d'éligibilité
        // ne sont pas rattachés à un paquet réglementaire vérifié par exercice.
        const taxRegimeComparison = null;

        return NextResponse.json({
            clients: clients.map((c) => ({ id: c.id, name: clientName(c), country: c.country, fiscalRegime: c.fiscalRegime })),
            selectedClientId: clientId,
            client: client ? { id: client.id, name: clientName(client), country: client.country, fiscalRegime: client.fiscalRegime } : null,
            risks,
            financialData,
            declarations,
            taxRegimeComparison,
            taxRegimeComparisonUnavailable: "Comparatif suspendu : barèmes nationaux et conditions d'éligibilité non versionnés pour cet exercice.",
        });
    } catch (error) {
        console.error("Erreur GET fiscalite/risks:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// Repérage de travaux à vérifier, sans en déduire automatiquement une infraction :
// 1. Déclarations en retard (échéance enregistrée et statut non déposé)
// 2. Variation marquée du CA à analyser par le collaborateur (signal indicatif).
async function runFiscalScan(clientId: string) {
    const [declarations, financialRows] = await Promise.all([
        prisma.taxDeclaration.findMany({ where: { clientId } }),
        prisma.financialData.findMany({ where: { clientId }, orderBy: { year: "desc" }, take: 2 }),
    ]);

    const existingRisks = await prisma.fiscalRisk.findMany({ where: { clientId }, select: { title: true } });
    const existingTitles = new Set(existingRisks.map((r) => r.title));

    let created = 0;
    const now = new Date();

    // Règle 1 : déclarations en retard
    const lateDeclarations = declarations.filter((d) => ["DRAFT", "PENDING", "REJECTED"].includes(d.status) && new Date(d.dueDate) < now);
    for (const decl of lateDeclarations) {
        const title = `Déclaration ${decl.type} en retard — période ${decl.period}`;
        if (existingTitles.has(title)) continue;
        await prisma.fiscalRisk.create({
            data: {
                title,
                description: `La déclaration ${decl.type} pour la période ${decl.period} avait une échéance au ${new Date(decl.dueDate).toLocaleDateString("fr-FR")} et n'a pas encore été soumise.`,
                level: "ELEVE",
                status: "IDENTIFIE",
                potentialImpact: decl.amount || null,
                clientId,
            },
        });
        existingTitles.add(title);
        created++;
    }

    // Signal de revue : une variation de CA ne prouve pas l'absence d'une
    // déclaration fiscale. On la présente comme un point à analyser, pas comme
    // un risque de non-déclaration.
    if (financialRows.length === 2) {
        const [current, previous] = financialRows;
        const growth = previous.ca !== 0 ? (current.ca - previous.ca) / previous.ca : 0;
        if (growth > 0.1) {
            const title = `Variation du CA à analyser — exercice ${current.year}`;
            if (!existingTitles.has(title)) {
                await prisma.fiscalRisk.create({
                    data: {
                        title,
                        description: `Le chiffre d'affaires a progressé de ${Math.round(growth * 100)}% entre ${previous.year} et ${current.year} (${previous.ca.toLocaleString("fr-FR")} → ${current.ca.toLocaleString("fr-FR")} FCFA). Vérifiez les seuils de régime, la TVA et les obligations applicables au pays et à l'activité. Ce signal ne constate aucune irrégularité.`,
                        level: "FAIBLE",
                        status: "IDENTIFIE",
                        potentialImpact: null,
                        clientId,
                    },
                });
                created++;
            }
        }
    }

    return { created, declarationsChecked: declarations.length, financialYearsAvailable: financialRows.length };
}

export async function POST(request: NextRequest) {
    try {
        const session = await AuthService.getSession();
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await request.json();

        if (body.action === "scan") {
            const { clientId } = body;
            if (!clientId) {
                return NextResponse.json({ error: "clientId requis" }, { status: 400 });
            }
            const result = await runFiscalScan(clientId);
            await AuditService.log({
                action: "PROCESS",
                entity: "FISCAL_RISK",
                entityId: clientId,
                details: `Analyse fiscale exécutée : ${result.declarationsChecked} déclaration(s) vérifiée(s), ${result.created} nouveau(x) risque(s) identifié(s).`,
            });
            return NextResponse.json(result);
        }

        const { title, description, level, potentialImpact, clientId } = body;
        if (!title || !description || !clientId) {
            return NextResponse.json({ error: "Champs requis manquants (titre, description, client)" }, { status: 400 });
        }

        const impact = analyserMontantOptionnel(potentialImpact);
        if (!impact.ok) {
            return NextResponse.json({ error: impact.raison }, { status: 400 });
        }

        // Le connecteur MongoDB de Prisma n'applique pas d'integrite
        // referentielle a l'ecriture : un clientId au format ObjectId valide
        // mais inexistant (client supprime, onglet reste ouvert) etait ecrit tel
        // quel. L'enregistrement devenait orphelin — invisible dans toutes les
        // vues filtrees par client, mais compte dans les totaux globaux.
        const clientExistant = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true } });
        if (!clientExistant) {
            return NextResponse.json({ error: "Client introuvable." }, { status: 404 });
        }

        const risk = await prisma.fiscalRisk.create({
            data: {
                title,
                description,
                level: level || "MOYEN",
                potentialImpact: impact.valeur,
                clientId,
                status: "IDENTIFIE",
            },
        });

        await AuditService.log({
            action: "CREATE",
            entity: "FISCAL_RISK",
            entityId: risk.id,
            details: `Risque fiscal créé manuellement : ${title}`,
        });

        return NextResponse.json({ risk }, { status: 201 });
    } catch (error) {
        console.error("Erreur POST fiscalite/risks:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await AuthService.getSession();
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: "id et status requis" }, { status: 400 });
        }

        const risk = await prisma.fiscalRisk.update({
            where: { id },
            data: { status },
        });

        await AuditService.log({
            action: "UPDATE",
            entity: "FISCAL_RISK",
            entityId: risk.id,
            details: `Statut du risque fiscal mis à jour : ${status}`,
        });

        return NextResponse.json({ risk });
    } catch (error) {
        console.error("Erreur PATCH fiscalite/risks:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
