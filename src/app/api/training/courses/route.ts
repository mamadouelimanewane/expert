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
      include: { _count: { select: { enrollments: true } } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      courses: courses.map(c => ({
        id: c.id,
        title: c.title,
        subtitle: c.subtitle,
        category: c.category,
        level: c.level,
        durationLabel: c.durationLabel,
        price: c.price,
        cpfHours: c.cpfHours,
        isCertifying: c.isCertifying,
        isPopular: c.isPopular,
        instructorName: c.instructorName,
        color: c.color,
        skills: c.skills,
        studentsCount: c._count.enrollments,
      })),
    });
  } catch (error) {
    console.error("Erreur GET training courses:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
