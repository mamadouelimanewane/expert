import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { requireStaff } from "@/lib/api-auth";
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { denied } = await requireStaff();
    if (denied) return denied;

  try {
    const { id } = await context.params;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        course: { select: { title: true } },
        questions: { orderBy: { order: "asc" } },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz introuvable" }, { status: 404 });
    }

    return NextResponse.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        course: quiz.course.title,
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore,
        questions: quiz.questions.map(q => ({ id: q.id, question: q.question, options: q.options })),
      },
    });
  } catch (error) {
    console.error("Erreur GET quiz:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
