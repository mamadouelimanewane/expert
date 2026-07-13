import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";
import { ensureTrainingSeed } from "@/lib/training-seed";

const ROADMAP_DEFS = [
  {
    id: "RM-001",
    title: "Expertise SYSCOHADA",
    description: "Devenez une référence sur le plan comptable OHADA révisé.",
    level: "Débutant à Expert",
    color: "from-teal-500 to-emerald-600",
    courseTitles: ["Expert SYSCOHADA Révisé", "Maîtriser la Consolidation"],
  },
  {
    id: "RM-002",
    title: "Directeur de Consolidation",
    description: "Maîtrisez les groupes complexes et les normes internationales.",
    level: "Confirmé",
    color: "from-violet-500 to-purple-600",
    courseTitles: ["Maîtriser la Consolidation", "Consolidation OHADA - Niveau Avancé"],
  },
  {
    id: "RM-003",
    title: "Spécialiste Audit & Contrôle",
    description: "Audit interne, externe et gestion des risques.",
    level: "Intermédiaire",
    color: "from-amber-500 to-orange-600",
    courseTitles: ["Audit & CAC Niveau 1", "Fiscalité Entreprise UEMOA"],
  },
];

export async function GET() {
  try {
    await ensureTrainingSeed();
    const session = await AuthService.getSession();

    const allCourses = await prisma.trainingCourse.findMany({
      where: { title: { in: ROADMAP_DEFS.flatMap((r) => r.courseTitles) } },
      select: { id: true, title: true, cpfHours: true, durationLabel: true },
    });
    const courseByTitle = new Map(allCourses.map((c) => [c.title, c]));

    const enrollments = session?.id && /^[0-9a-fA-F]{24}$/.test(session.id)
      ? await prisma.trainingEnrollment.findMany({
          where: { userId: session.id, courseId: { in: allCourses.map((c) => c.id) } },
        })
      : [];
    const enrollmentByCourseId = new Map(enrollments.map((e) => [e.courseId, e]));

    const roadmaps = await Promise.all(
      ROADMAP_DEFS.map(async (def) => {
        const steps = def.courseTitles
          .map((title) => courseByTitle.get(title))
          .filter((c): c is NonNullable<typeof c> => !!c)
          .map((course, idx, arr) => {
            const enrollment = enrollmentByCourseId.get(course.id);
            const prevCompleted = idx === 0 || (() => {
              const prevCourse = arr[idx - 1];
              const prevEnrollment = enrollmentByCourseId.get(prevCourse.id);
              return prevEnrollment?.status === "COMPLETED";
            })();
            const status = enrollment?.status === "COMPLETED" ? "completed"
              : enrollment && prevCompleted ? "current"
              : prevCompleted ? "current"
              : "locked";
            return { id: course.id, title: course.title, status, type: "course" as const };
          });

        const courseIds = def.courseTitles.map((t) => courseByTitle.get(t)?.id).filter(Boolean) as string[];
        const enrolledCount = courseIds.length > 0
          ? await prisma.trainingEnrollment.groupBy({ by: ["userId"], where: { courseId: { in: courseIds } } }).then((r) => r.length)
          : 0;

        const completedSteps = steps.filter((s) => s.status === "completed").length;
        const totalHours = def.courseTitles.reduce((s, t) => s + (courseByTitle.get(t)?.cpfHours ?? 0), 0);
        const completedHours = steps.reduce((s, step, idx) => {
          if (step.status !== "completed") return s;
          const course = courseByTitle.get(def.courseTitles[idx]);
          return s + (course?.cpfHours ?? 0);
        }, 0);

        return {
          id: def.id,
          title: def.title,
          description: def.description,
          level: def.level,
          color: def.color,
          duration: `${totalHours}h`,
          students: enrolledCount,
          steps,
          progressPct: steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0,
          completedHours,
        };
      })
    );

    return NextResponse.json({ roadmaps });
  } catch (error) {
    console.error("Erreur GET training/roadmaps:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
