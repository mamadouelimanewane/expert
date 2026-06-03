import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
    try {
        // ── 0. USER ADMIN (required for missions) ──────────────────
        const adminUser = await prisma.user.upsert({
            where: { email: "admin@cabinet360.ci" },
            update: {},
            create: {
                email: "admin@cabinet360.ci",
                password: "$2b$10$placeholder_hash",
                firstName: "Expert",
                lastName: "Principal",
                role: "ADMIN",
                phone: "+225 07 00 00 00 01"
            }
        });

        // ── 1. CLIENTS ──────────────────────────────────────────────
        const clients = await Promise.all([
            prisma.client.upsert({
                where: { email: "contact@groupetraore.ci" },
                update: {},
                create: {
                    companyName: "Groupe Traoré & Associés",
                    email: "contact@groupetraore.ci",
                    phone: "+225 27 20 31 44 00",
                    address: "Plateau, Abidjan, Côte d'Ivoire",
                    country: "CI",
                    sector: "BTP & Immobilier",
                    healthScore: 85,
                    rating: "AA"
                }
            }),
            prisma.client.upsert({
                where: { email: "dg@sib-negoce.sn" },
                update: {},
                create: {
                    companyName: "SIB Négoce International",
                    email: "dg@sib-negoce.sn",
                    phone: "+221 33 842 55 00",
                    address: "Plateau, Dakar, Sénégal",
                    country: "SN",
                    sector: "Commerce & Import-Export",
                    healthScore: 72,
                    rating: "A"
                }
            }),
            prisma.client.upsert({
                where: { email: "info@agrokouyate.cm" },
                update: {},
                create: {
                    companyName: "Agro-Kouyaté SARL",
                    email: "info@agrokouyate.cm",
                    phone: "+237 222 23 45 67",
                    address: "Bonanjo, Douala, Cameroun",
                    country: "CM",
                    sector: "Agriculture & Agroalimentaire",
                    healthScore: 55,
                    rating: "B"
                }
            }),
            prisma.client.upsert({
                where: { email: "pdg@financeplus.bf" },
                update: {},
                create: {
                    companyName: "FinancePlus Burkina",
                    email: "pdg@financeplus.bf",
                    phone: "+226 25 30 42 00",
                    address: "Ouaga 2000, Ouagadougou, Burkina Faso",
                    country: "BF",
                    sector: "Services Financiers",
                    healthScore: 91,
                    rating: "AAA"
                }
            }),
            prisma.client.upsert({
                where: { email: "contact@techafrik.ml" },
                update: {},
                create: {
                    companyName: "TechAfrik Solutions",
                    email: "contact@techafrik.ml",
                    phone: "+223 20 22 88 44",
                    address: "ACI 2000, Bamako, Mali",
                    country: "ML",
                    sector: "Technologie & Digital",
                    healthScore: 78,
                    rating: "A"
                }
            })
        ]);

        // ── 2. FACTURES ──────────────────────────────────────────────
        const invoices = await Promise.all([
            prisma.invoice.upsert({
                where: { invoiceNumber: "FAC-2026-001" },
                update: {},
                create: {
                    invoiceNumber: "FAC-2026-001",
                    issueDate: new Date("2026-01-15"),
                    dueDate: new Date("2026-02-15"),
                    paidDate: new Date("2026-02-10"),
                    status: "PAID",
                    subtotal: 2500000,
                    taxRate: 18,
                    taxAmount: 450000,
                    total: 2950000,
                    notes: "Mission révision comptable T4 2025",
                    clientId: clients[0].id
                }
            }),
            prisma.invoice.upsert({
                where: { invoiceNumber: "FAC-2026-002" },
                update: {},
                create: {
                    invoiceNumber: "FAC-2026-002",
                    issueDate: new Date("2026-02-20"),
                    dueDate: new Date("2026-03-20"),
                    status: "OVERDUE",
                    subtotal: 1800000,
                    taxRate: 18,
                    taxAmount: 324000,
                    total: 2124000,
                    notes: "Établissement liasse fiscale 2025",
                    clientId: clients[1].id
                }
            }),
            prisma.invoice.upsert({
                where: { invoiceNumber: "FAC-2026-003" },
                update: {},
                create: {
                    invoiceNumber: "FAC-2026-003",
                    issueDate: new Date("2026-04-01"),
                    dueDate: new Date("2026-05-01"),
                    status: "SENT",
                    subtotal: 950000,
                    taxRate: 18,
                    taxAmount: 171000,
                    total: 1121000,
                    notes: "Tenue comptabilité mensuelle - Avril 2026",
                    clientId: clients[2].id
                }
            }),
            prisma.invoice.upsert({
                where: { invoiceNumber: "FAC-2026-004" },
                update: {},
                create: {
                    invoiceNumber: "FAC-2026-004",
                    issueDate: new Date("2026-05-15"),
                    dueDate: new Date("2026-06-15"),
                    status: "DRAFT",
                    subtotal: 3500000,
                    taxRate: 18,
                    taxAmount: 630000,
                    total: 4130000,
                    notes: "Mission d'audit légal exercice 2025",
                    clientId: clients[3].id
                }
            }),
            prisma.invoice.upsert({
                where: { invoiceNumber: "FAC-2026-005" },
                update: {},
                create: {
                    invoiceNumber: "FAC-2026-005",
                    issueDate: new Date("2026-06-01"),
                    dueDate: new Date("2026-07-01"),
                    status: "SENT",
                    subtotal: 750000,
                    taxRate: 18,
                    taxAmount: 135000,
                    total: 885000,
                    notes: "Conseil fiscal et optimisation IS",
                    clientId: clients[4].id
                }
            })
        ]);

        // ── 3. BANK TRANSACTIONS ──────────────────────────────────
        await prisma.bankTransaction.createMany({
            skipDuplicates: true,
            data: [
                { date: new Date("2026-06-01"), description: "Virement Groupe Traoré - FAC-001", amount: 2950000, type: "CREDIT", status: "RECONCILED", invoiceId: invoices[0].id },
                { date: new Date("2026-06-02"), description: "ENEO - Facture électricité", amount: 125000, type: "DEBIT", status: "PENDING" },
                { date: new Date("2026-06-02"), description: "Loyer locaux - Plateau", amount: 850000, type: "DEBIT", status: "PENDING" },
                { date: new Date("2026-06-03"), description: "Virement SIB Négoce", amount: 2124000, type: "CREDIT", status: "PENDING" },
                { date: new Date("2026-06-04"), description: "Achat matériel CFAO Tech", amount: 345000, type: "DEBIT", status: "PENDING" },
                { date: new Date("2026-06-05"), description: "Cotisations CNPS Mai 2026", amount: 280000, type: "DEBIT", status: "RECONCILED" },
                { date: new Date("2026-06-06"), description: "Règlement TechAfrik Solutions", amount: 885000, type: "CREDIT", status: "PENDING" },
            ]
        });

        // ── 4. MOBILE MONEY ──────────────────────────────────────
        await prisma.mobileMoneyTransaction.createMany({
            skipDuplicates: true,
            data: [
                { operator: "Wave", reference: "WAVE-SEED-001", senderName: "Mamadou Coulibaly", senderPhone: "+221771234567", amount: 150000, type: "IN", status: "RECONCILED", transactionDate: new Date("2026-06-01"), reconciledAt: new Date("2026-06-01"), clientId: clients[1].id },
                { operator: "Orange Money", reference: "OM-SEED-002", senderName: "Fatoumata Diallo", senderPhone: "+22507654321", amount: 75000, type: "IN", status: "PENDING", transactionDate: new Date("2026-06-02"), clientId: clients[0].id },
                { operator: "MTN MoMo", reference: "MTN-SEED-003", senderName: "Cabinet Intermédiaire", senderPhone: "+237650123456", amount: 320000, type: "IN", status: "PENDING", transactionDate: new Date("2026-06-03"), clientId: clients[2].id },
                { operator: "Wave", reference: "WAVE-SEED-004", senderName: "Paiement Loyer", senderPhone: "+221709876543", amount: 250000, type: "OUT", status: "RECONCILED", transactionDate: new Date("2026-06-01"), reconciledAt: new Date("2026-06-02"), clientId: clients[1].id },
                { operator: "Orange Money", reference: "OM-SEED-005", senderName: "Remboursement frais", senderPhone: "+226763322111", amount: 45000, type: "OUT", status: "PENDING", transactionDate: new Date("2026-06-04"), clientId: clients[3].id },
                { operator: "MTN MoMo", reference: "MTN-SEED-006", senderName: "Alpha Keita SARL", senderPhone: "+223764567890", amount: 500000, type: "IN", status: "PENDING", transactionDate: new Date("2026-06-05"), clientId: clients[4].id },
            ]
        });

        // ── 5. MISSIONS ──────────────────────────────────────────
        const missions = await Promise.all([
            prisma.mission.create({
                data: {
                    title: "Révision Comptable 2025 - Groupe Traoré",
                    description: "Révision des comptes annuels et préparation de la liasse fiscale SYSCOHADA",
                    type: "AUDIT",
                    status: "COMPLETED",
                    startDate: new Date("2026-01-15"),
                    endDate: new Date("2026-03-28"),
                    deadline: new Date("2026-03-31"),
                    estimatedHours: 120,
                    clientId: clients[0].id,
                    createdById: adminUser.id
                }
            }),
            prisma.mission.create({
                data: {
                    title: "Audit Légal 2025 - FinancePlus Burkina",
                    description: "Mission d'audit des comptes conformément aux NEP et SYSCOHADA révisé",
                    type: "AUDIT",
                    status: "IN_PROGRESS",
                    startDate: new Date("2026-04-01"),
                    deadline: new Date("2026-07-15"),
                    estimatedHours: 200,
                    clientId: clients[3].id,
                    createdById: adminUser.id
                }
            }),
            prisma.mission.create({
                data: {
                    title: "Tenue Comptabilité - Agro-Kouyaté",
                    description: "Saisie mensuelle, lettrage et états financiers",
                    type: "TENUE_COMPTABLE",
                    status: "IN_PROGRESS",
                    startDate: new Date("2026-01-01"),
                    deadline: new Date("2026-12-31"),
                    estimatedHours: 24,
                    clientId: clients[2].id,
                    createdById: adminUser.id
                }
            }),
            prisma.mission.create({
                data: {
                    title: "Conseil Fiscal & IS - TechAfrik",
                    description: "Analyse fiscale et recommandations d'optimisation",
                    type: "CONSEIL",
                    status: "DRAFT",
                    startDate: new Date("2026-06-15"),
                    deadline: new Date("2026-07-31"),
                    estimatedHours: 40,
                    clientId: clients[4].id,
                    createdById: adminUser.id
                }
            })
        ]);

        return NextResponse.json({
            success: true,
            message: "✅ Base de données peuplée avec succès !",
            stats: {
                clients: clients.length,
                factures: invoices.length,
                bankTransactions: 7,
                mobileMoneyTx: 6,
                missions: missions.length
            }
        });

    } catch (error: any) {
        console.error("Seed error:", error);
        return NextResponse.json({ 
            error: "Erreur seed: " + error.message,
            detail: error.code
        }, { status: 500 });
    }
}
