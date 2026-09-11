import { NextRequest, NextResponse } from "next/server";
import { FraudAlertSeverity, FraudAlertStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";
import { analyserEnum } from "@/lib/api-auth";
import { AuditService } from "@/lib/audit";
import { analyserMontantOptionnel } from "@/lib/validation";

export async function GET(request: NextRequest) {
    try {
        const session = await AuthService.getSession();
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const severity = searchParams.get("severity");

        const where: Record<string, unknown> = {};
        if (status) {
            const s = analyserEnum(status, Object.values(FraudAlertStatus), "Statut");
            if (!s.ok) return NextResponse.json({ error: s.raison }, { status: 400 });
            where.status = s.valeur;
        }
        if (severity) {
            const s = analyserEnum(severity, Object.values(FraudAlertSeverity), "Sévérité");
            if (!s.ok) return NextResponse.json({ error: s.raison }, { status: 400 });
            where.severity = s.valeur;
        }

        const alerts = await prisma.fraudAlert.findMany({
            where,
            include: {
                client: { select: { id: true, companyName: true, firstName: true, lastName: true } },
                transaction: { select: { id: true, date: true, description: true, amount: true, type: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        // Répartition réelle par règle déclenchée (remplace les compteurs FRAUD_TYPES fixes)
        const byRule = await prisma.fraudAlert.groupBy({
            by: ["ruleTriggered"],
            _count: { _all: true },
        });

        return NextResponse.json({
            alerts,
            ruleCounts: byRule.map((r) => ({ rule: r.ruleTriggered, count: r._count._all })),
        });
    } catch (error) {
        console.error("Erreur GET fraud-alerts:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// Règles de détection simples, réutilisées de la logique d'anomalies FEC (audit-legal)
// et du calcul de risque existant (AuditService.calculateRiskScore) : dimanche, montant rond, montant atypique.
async function runFraudScan() {
    const transactions = await prisma.bankTransaction.findMany({
        include: { invoice: { include: { client: true } } },
        orderBy: { date: "desc" },
    });

    if (transactions.length === 0) {
        return { created: 0, scanned: 0 };
    }

    const amounts = transactions.map((t) => Math.abs(t.amount));
    const avgAmount = amounts.reduce((s, a) => s + a, 0) / amounts.length;

    // Alertes déjà générées, pour éviter les doublons à chaque nouveau scan
    const existing = await prisma.fraudAlert.findMany({
        where: { transactionId: { not: null } },
        select: { transactionId: true, ruleTriggered: true },
    });
    const existingKeys = new Set(existing.map((e) => `${e.transactionId}::${e.ruleTriggered}`));

    let created = 0;

    for (const tx of transactions) {
        const amount = Math.abs(tx.amount);
        const clientId = tx.invoice?.client?.id || null;
        const clientLabel = tx.invoice?.client?.companyName || null;

        const flags: { rule: string; title: string; description: string; severity: "FAIBLE" | "MOYENNE" | "ELEVEE" | "CRITIQUE" }[] = [];

        // Règle 1 : écriture passée un dimanche
        if (new Date(tx.date).getDay() === 0) {
            flags.push({
                rule: "DIMANCHE",
                title: "Transaction enregistrée un dimanche",
                description: `La transaction « ${tx.description} » (${amount.toLocaleString("fr-FR")} FCFA) a été enregistrée un dimanche, jour non ouvré habituel.`,
                severity: "FAIBLE",
            });
        }

        // Règle 2 : montant rond suspect (>= 500 000 et multiple de 100 000)
        if (amount >= 500000 && amount % 100000 === 0) {
            flags.push({
                rule: "MONTANT_ROND",
                title: "Montant rond suspect",
                description: `Montant de ${amount.toLocaleString("fr-FR")} FCFA parfaitement rond, potentiellement indicateur d'une écriture non justifiée.`,
                severity: "MOYENNE",
            });
        }

        // Règle 3 : montant très supérieur à la moyenne observée (> 3x la moyenne, avec plancher)
        if (avgAmount > 0 && amount > avgAmount * 3 && amount >= 1000000) {
            flags.push({
                rule: "MONTANT_ATYPIQUE",
                title: "Montant très supérieur à la moyenne",
                description: `Montant de ${amount.toLocaleString("fr-FR")} FCFA, soit plus de 3x la moyenne observée (${Math.round(avgAmount).toLocaleString("fr-FR")} FCFA) sur les transactions bancaires.`,
                severity: "ELEVEE",
            });
        }

        for (const flag of flags) {
            const key = `${tx.id}::${flag.rule}`;
            if (existingKeys.has(key)) continue;

            await prisma.fraudAlert.create({
                data: {
                    title: flag.title + (clientLabel ? ` — ${clientLabel}` : ""),
                    description: flag.description,
                    severity: flag.severity,
                    status: "NOUVELLE",
                    amount,
                    ruleTriggered: flag.rule,
                    clientId,
                    transactionId: tx.id,
                },
            });
            existingKeys.add(key);
            created++;
        }
    }

    return { created, scanned: transactions.length };
}

export async function POST(request: NextRequest) {
    try {
        const session = await AuthService.getSession();
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await request.json();

        if (body.action === "scan") {
            const result = await runFraudScan();
            await AuditService.log({
                action: "PROCESS",
                entity: "FRAUD_ALERT",
                details: `Scan de fraude exécuté : ${result.scanned} transaction(s) analysée(s), ${result.created} nouvelle(s) alerte(s).`,
            });
            return NextResponse.json(result);
        }

        // Création manuelle d'une alerte
        const { title, description, severity, amount, ruleTriggered, clientId, transactionId } = body;
        if (!title || !description || !ruleTriggered) {
            return NextResponse.json({ error: "Champs requis manquants (titre, description, règle)" }, { status: 400 });
        }

        const montant = analyserMontantOptionnel(amount);
        if (!montant.ok) {
            return NextResponse.json({ error: montant.raison }, { status: 400 });
        }
        const gravite = analyserEnum(severity ?? "MOYENNE", Object.values(FraudAlertSeverity), "Sévérité");
        if (!gravite.ok) {
            return NextResponse.json({ error: gravite.raison }, { status: 400 });
        }

        const alert = await prisma.fraudAlert.create({
            data: {
                title,
                description,
                severity: gravite.valeur,
                amount: montant.valeur,
                ruleTriggered,
                clientId: clientId || null,
                transactionId: transactionId || null,
                status: "NOUVELLE",
            },
        });

        await AuditService.log({
            action: "CREATE",
            entity: "FRAUD_ALERT",
            entityId: alert.id,
            details: `Alerte de fraude créée manuellement : ${title}`,
        });

        return NextResponse.json({ alert }, { status: 201 });
    } catch (error) {
        console.error("Erreur POST fraud-alerts:", error);
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

        const alert = await prisma.fraudAlert.update({
            where: { id },
            data: { status },
            include: {
                client: { select: { id: true, companyName: true, firstName: true, lastName: true } },
                transaction: { select: { id: true, date: true, description: true, amount: true, type: true } },
            },
        });

        await AuditService.log({
            action: "UPDATE",
            entity: "FRAUD_ALERT",
            entityId: alert.id,
            details: `Statut de l'alerte de fraude mis à jour : ${status}`,
        });

        return NextResponse.json({ alert });
    } catch (error) {
        console.error("Erreur PATCH fraud-alerts:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
