import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";

export async function GET() {
  try {
    const proposals = await prisma.proposal.findMany({
      include: {
        client: { select: { companyName: true, firstName: true, lastName: true } },
        expert: { select: { firstName: true, lastName: true } },
      },
      orderBy: { date: "desc" },
    });
    return NextResponse.json({ proposals });
  } catch (error) {
    console.error("Erreur GET proposals:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, type, amount, clientId } = body;

    if (!title || !clientId) {
      return NextResponse.json({ error: "Titre et client requis" }, { status: 400 });
    }

    const session = await AuthService.getSession();

    const proposal = await prisma.proposal.create({
      data: {
        title,
        type: type || "ACCOUNTING",
        amount: amount ? parseFloat(amount) : 0,
        status: "DRAFT",
        clientId,
        expertId: session?.id && /^[0-9a-fA-F]{24}$/.test(session.id) ? session.id : null,
      },
      include: { client: { select: { companyName: true } } },
    });

    return NextResponse.json({ proposal }, { status: 201 });
  } catch (error) {
    console.error("Erreur POST proposals:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "id et status requis" }, { status: 400 });
    }

    const proposal = await prisma.proposal.update({ where: { id }, data: { status } });
    return NextResponse.json({ proposal });
  } catch (error) {
    console.error("Erreur PATCH proposals:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
