import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    const where = clientId ? { clientId } : {};
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
