import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";

export async function GET() {
  try {
    const session = await AuthService.getSession();
    if (!session || !/^[0-9a-fA-F]{24}$/.test(session.id)) {
      return NextResponse.json({ certificates: [], pending: [], userName: null });
    }

    const [certificates, enrollments] = await Promise.all([
      prisma.certificate.findMany({
        where: { userId: session.id },
        include: { course: { select: { title: true, instructorName: true } } },
        orderBy: { issueDate: "desc" },
      }),
      prisma.trainingEnrollment.findMany({
        where: { userId: session.id, status: "IN_PROGRESS" },
        include: { course: { select: { title: true, modules: { include: { lessons: true } } } } },
      }),
    ]);

    return NextResponse.json({
      userName: session.name,
      certificates: certificates.map(c => ({
        id: c.id,
        title: c.course.title,
        instructor: c.course.instructorName,
        issueDate: c.issueDate,
        expiryDate: c.expiryDate,
        cpfHours: c.cpfHours,
        grade: c.grade,
        score: c.score,
        verificationCode: c.verificationCode,
        skills: c.skills,
      })),
      pending: enrollments.map(e => {
        const totalLessons = e.course.modules.reduce((s, m) => s + m.lessons.length, 0);
        return {
          id: e.id,
          title: e.course.title,
          progress: e.progress,
          remainingLessons: Math.max(0, Math.round(totalLessons * (1 - e.progress / 100))),
        };
      }),
    });
  } catch (error) {
    console.error("Erreur GET certificates:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
