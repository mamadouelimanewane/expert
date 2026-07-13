import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await AuthService.getSession();

    const course = await prisma.trainingCourse.findUnique({
      where: { id },
      include: {
        modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } },
        quiz: true,
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
    }

    const enrollment = session?.id && /^[0-9a-fA-F]{24}$/.test(session.id)
      ? await prisma.trainingEnrollment.findUnique({ where: { userId_courseId: { userId: session.id, courseId: id } } })
      : null;

    return NextResponse.json({
      course: {
        id: course.id,
        title: course.title,
        subtitle: course.subtitle,
        instructorName: course.instructorName,
        durationLabel: course.durationLabel,
        cpfHours: course.cpfHours,
        level: course.level,
        isCertifying: course.isCertifying,
        skills: course.skills,
        modules: course.modules.map(m => ({
          id: m.id, title: m.title, duration: m.duration,
          lessons: m.lessons.map(l => ({ id: l.id, title: l.title, duration: l.duration, type: l.type })),
        })),
        quiz: course.quiz ? { id: course.quiz.id, title: course.quiz.title } : null,
        studentsCount: course._count.enrollments,
      },
      enrollment: enrollment ? { progress: enrollment.progress, status: enrollment.status } : null,
    });
  } catch (error) {
    console.error("Erreur GET training course:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
