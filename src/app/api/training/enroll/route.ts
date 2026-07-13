import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await AuthService.getSession();
    if (!session || !/^[0-9a-fA-F]{24}$/.test(session.id)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { courseId, progress } = await req.json();
    if (!courseId) {
      return NextResponse.json({ error: "courseId requis" }, { status: 400 });
    }

    const clampedProgress = Math.max(0, Math.min(100, progress ?? 0));
    const status = clampedProgress >= 100 ? "COMPLETED" : clampedProgress > 0 ? "IN_PROGRESS" : "NOT_STARTED";

    const enrollment = await prisma.trainingEnrollment.upsert({
      where: { userId_courseId: { userId: session.id, courseId } },
      update: { progress: clampedProgress, status },
      create: { userId: session.id, courseId, progress: clampedProgress, status },
    });

    return NextResponse.json({ enrollment });
  } catch (error) {
    console.error("Erreur POST enroll:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
