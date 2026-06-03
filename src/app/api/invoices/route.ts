import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    try {
        const where: any = {};
        if (status && status !== "tous") {
            const statusMap: Record<string, string> = {
                payee: "PAID",
                retard: "OVERDUE",
                brouillon: "DRAFT",
                envoyee: "SENT"
            };
            where.status = statusMap[status] || status.toUpperCase();
        }

        const invoices = await prisma.invoice.findMany({
            where,
            include: { client: true },
            orderBy: { issueDate: "desc" }
        });

        // KPIs
        const paidTotal = await prisma.invoice.aggregate({
            _sum: { total: true },
            where: { status: "PAID" }
        });
        const pendingTotal = await prisma.invoice.aggregate({
            _sum: { total: true },
            where: { status: { in: ["SENT", "OVERDUE"] } }
        });
        const overdueCount = await prisma.invoice.count({ where: { status: "OVERDUE" } });

        return NextResponse.json({
            invoices,
            kpis: {
                paid: paidTotal._sum.total || 0,
                pending: pendingTotal._sum.total || 0,
                overdueCount
            }
        });
    } catch (error: any) {
        console.error("Invoices GET error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        const subtotal = body.lines?.reduce((acc: number, l: any) => acc + l.quantity * l.unitPrice, 0) || 0;
        const taxAmount = subtotal * (body.taxRate || 18) / 100;
        const total = subtotal + taxAmount;

        // Generate invoice number
        const count = await prisma.invoice.count();
        const invoiceNumber = `FAC-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;

        const invoice = await prisma.invoice.create({
            data: {
                invoiceNumber,
                issueDate: new Date(),
                dueDate: new Date(body.dueDate),
                status: "DRAFT",
                subtotal,
                taxRate: body.taxRate || 18,
                taxAmount,
                total,
                notes: body.notes || "",
                clientId: body.clientId
            },
            include: { client: true }
        });

        return NextResponse.json({ invoice });
    } catch (error: any) {
        console.error("Invoice POST error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, status, paidDate } = body;

        const invoice = await prisma.invoice.update({
            where: { id },
            data: {
                status,
                ...(status === "PAID" && { paidDate: paidDate ? new Date(paidDate) : new Date() })
            }
        });

        return NextResponse.json({ invoice });
    } catch (error: any) {
        console.error("Invoice PATCH error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
