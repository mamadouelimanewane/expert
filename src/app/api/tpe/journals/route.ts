import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { requireStaff } from "@/lib/api-auth";
export async function GET(req: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    const where = clientId
      ? { clientId, source: { not: "WHATSAPP_TEST" } }
      : { source: { not: "WHATSAPP_TEST" } };
    const journals = await prisma.tpeJournal.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ journals });
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

  try {
    const { id, status } = await req.json();
    const updated = await prisma.tpeJournal.update({
      where: { id },
      data: {
        status,
        exportedAt: status === "APPROVED" ? new Date() : undefined
      }
    });
    return NextResponse.json({ success: true, entry: updated });
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
