/**
 * Script de seed — données de démonstration Cabinet 360
 * Usage: npx ts-node scripts/seed-demo.ts
 * ou:    npx tsx scripts/seed-demo.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding demo data...\n");

    // 1. Récupérer des clients existants
    const clients = await prisma.client.findMany({ take: 6 });
    if (clients.length === 0) {
        console.error("❌ Aucun client en base. Créez des clients d'abord.");
        process.exit(1);
    }
    console.log(`✓ Found ${clients.length} clients`);

    // 2. Récupérer des missions existantes
    const missions = await prisma.mission.findMany({ take: 4 });
    console.log(`✓ Found ${missions.length} missions`);

    // 3. Créer des factures de démonstration
    const invoiceData = [
        { clientIdx: 0, amount: 4_500_000, status: "PAID", daysAgo: 45, label: "Audit exercice 2023" },
        { clientIdx: 1, amount: 2_800_000, status: "PAID", daysAgo: 30, label: "Tenue comptable T1 2024" },
        { clientIdx: 2, amount: 1_200_000, status: "PAID", daysAgo: 15, label: "Conseil fiscal restructuration" },
        { clientIdx: 0, amount: 3_600_000, status: "PAID", daysAgo: 60, label: "Commissariat aux comptes 2023" },
        { clientIdx: 3, amount: 950_000,   status: "PAID", daysAgo: 20, label: "Déclarations TVA T4 2023" },
        { clientIdx: 1, amount: 1_800_000, status: "SENT", daysAgo: 5,  label: "Tenue comptable T2 2024" },
        { clientIdx: 2, amount: 2_200_000, status: "OVERDUE", daysAgo: -10, label: "Business plan & levée fonds" },
        { clientIdx: 4, amount: 750_000,   status: "DRAFT", daysAgo: 1,  label: "Paie sociale mai 2024" },
    ];

    let created = 0;
    for (const inv of invoiceData) {
        const client = clients[inv.clientIdx] || clients[0];
        const issueDate = new Date(Date.now() - inv.daysAgo * 24 * 60 * 60 * 1000);
        const dueDate = new Date(issueDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        const subtotal = inv.amount / 1.18;
        const taxAmount = inv.amount - subtotal;
        const invoiceNumber = `FAC-2024-${String(Date.now() + created).slice(-5)}`;

        try {
            await prisma.invoice.create({
                data: {
                    invoiceNumber,
                    clientId: client.id,
                    issueDate,
                    dueDate,
                    paidDate: inv.status === "PAID" ? new Date(issueDate.getTime() + 7 * 24 * 60 * 60 * 1000) : null,
                    status: inv.status as "PAID" | "SENT" | "OVERDUE" | "DRAFT",
                    subtotal: Math.round(subtotal),
                    taxRate: 18,
                    taxAmount: Math.round(taxAmount),
                    total: inv.amount,
                    notes: inv.label,
                },
            });
            console.log(`  ✓ Facture ${invoiceNumber} — ${inv.amount.toLocaleString("fr-FR")} FCFA [${inv.status}]`);
            created++;
        } catch (e: unknown) {
            if (e instanceof Error && e.message.includes("Unique constraint")) {
                console.log(`  ↷ Skip ${invoiceNumber} (already exists)`);
            } else {
                console.error(`  ✗ Error: ${e}`);
            }
        }
    }
    console.log(`\n✓ ${created} factures créées`);

    // 4. Créer des saisies de temps si missions disponibles
    if (missions.length > 0) {
        const timeEntryData = [
            { missionIdx: 0, hours: 8,  date: 7,  category: "Audit",      desc: "Revue grands livres N-2/N-1" },
            { missionIdx: 0, hours: 6,  date: 6,  category: "Audit",      desc: "Circularisation fournisseurs" },
            { missionIdx: 1, hours: 4,  date: 5,  category: "Production", desc: "Saisie opérations juin" },
            { missionIdx: 1, hours: 3,  date: 4,  category: "Production", desc: "Pointage relevés bancaires" },
            { missionIdx: 2, hours: 5,  date: 3,  category: "Conseil",    desc: "Rédaction rapport fiscal" },
            { missionIdx: 0, hours: 2,  date: 2,  category: "Déplacement", desc: "Visite siège client" },
        ];

        // Récupérer un user existant pour les saisies de temps
        const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } })
            || await prisma.user.findFirst();
        if (!adminUser) { console.log("  ↷ Skip saisies de temps: aucun user en base"); return; }

        let timeCreated = 0;
        for (const te of timeEntryData) {
            const mission = missions[te.missionIdx] || missions[0];
            const date = new Date(Date.now() - te.date * 24 * 60 * 60 * 1000);
            const categoryMap: Record<string, string> = {
                "Audit": "AUDIT", "Production": "PRODUCTION",
                "Conseil": "CONSEIL", "Déplacement": "DEPLACEMENT",
            };
            try {
                await prisma.timeEntry.create({
                    data: {
                        userId: adminUser.id,
                        missionId: mission.id,
                        clientId: mission.clientId || null,
                        date,
                        duration: te.hours,
                        description: te.desc,
                        category: (categoryMap[te.category] || "PRODUCTION") as "AUDIT" | "PRODUCTION" | "CONSEIL" | "DEPLACEMENT" | "REUNION" | "AUTRE",
                        status: "APPROVED" as "DRAFT" | "SUBMITTED" | "APPROVED" | "INVOICED",
                    },
                });
                timeCreated++;
            } catch {
                // ignore
            }
        }
        console.log(`✓ ${timeCreated} saisies de temps créées`);
    }

    // 5. Résumé financier
    const totalCA = await prisma.invoice.aggregate({
        _sum: { total: true },
        where: { status: "PAID" },
    });
    const totalCount = await prisma.invoice.count();

    console.log("\n📊 Résumé base de données:");
    console.log(`   Clients : ${clients.length}`);
    console.log(`   Factures : ${totalCount}`);
    console.log(`   CA encaissé : ${(totalCA._sum.total || 0).toLocaleString("fr-FR")} FCFA`);
    console.log("\n✅ Seed terminé avec succès!");
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
