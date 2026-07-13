import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";
import { ensureTrainingSeed } from "@/lib/training-seed";

export async function GET() {
  try {
    await ensureTrainingSeed();
    const session = await AuthService.getSession();

    if (!session || !/^[0-9a-fA-F]{24}$/.test(session.id)) {
      return NextResponse.json({
        user: { name: "Invité", role: "—", completedHours: 0, requiredHours: 0, period: new Date().getFullYear().toString() },
        courses: [],
        stats: { totalCourses: 0, completedCourses: 0, certificates: 0 },
      });
    }

    const [enrollments, certificatesCount] = await Promise.all([
      prisma.trainingEnrollment.findMany({
        where: { userId: session.id },
        include: { course: { select: { id: true, title: true, category: true, cpfHours: true } } },
      }),
      prisma.certificate.count({ where: { userId: session.id } }),
    ]);

    const completedHours = enrollments
      .filter(e => e.status === "COMPLETED")
      .reduce((s, e) => s + (e.course.cpfHours || 0), 0);

    return NextResponse.json({
      user: {
        name: session.name,
        role: session.role,
        completedHours,
        requiredHours: 40, // Obligation de formation continue standard (ordre des experts-comptables) — à rendre configurable
        period: new Date().getFullYear().toString(),
      },
      courses: enrollments.map(e => ({
        id: e.course.id,
        title: e.course.title,
        category: e.course.category,
        duration: e.course.cpfHours,
        progress: e.progress,
        status: e.status.toLowerCase(),
      })),
      stats: {
        totalCourses: enrollments.length,
        completedCourses: enrollments.filter(e => e.status === "COMPLETED").length,
        certificates: certificatesCount,
      },
    });
  } catch (error) {
    console.error("Erreur GET academy/progress:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
