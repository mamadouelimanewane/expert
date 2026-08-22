import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureTrainingSeed } from "@/lib/training-seed";

import { requireStaff } from "@/lib/api-auth";
export async function GET() {
    const { denied } = await requireStaff();
    if (denied) return denied;

  try {
    await ensureTrainingSeed();

    const courses = await prisma.trainingCourse.findMany({
      where: { instructorName: { not: null } },
      include: { _count: { select: { enrollments: true } } },
    });

    const byInstructor = new Map<string, { name: string; color: string | null; courses: typeof courses; students: number }>();
    for (const c of courses) {
      const name = c.instructorName as string;
      if (!byInstructor.has(name)) {
        byInstructor.set(name, { name, color: c.color, courses: [], students: 0 });
      }
      const entry = byInstructor.get(name)!;
      entry.courses.push(c);
      entry.students += c._count.enrollments;
    }

    const instructors = Array.from(byInstructor.values()).map((i) => ({
      name: i.name,
      color: i.color,
      coursesCount: i.courses.length,
      studentsCount: i.students,
      courses: i.courses.map((c) => ({ id: c.id, title: c.title, durationLabel: c.durationLabel, studentsCount: c._count.enrollments })),
      specialties: Array.from(new Set(i.courses.flatMap((c) => c.skills))).slice(0, 6),
    })).sort((a, b) => b.studentsCount - a.studentsCount);

    return NextResponse.json({ instructors });
  } catch (error) {
    console.error("Erreur GET training/instructors:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
