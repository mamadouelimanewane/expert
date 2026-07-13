import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await AuthService.getSession();
    if (!session || !/^[0-9a-fA-F]{24}$/.test(session.id)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { quizId, answers } = await req.json();
    if (!quizId || !Array.isArray(answers)) {
      return NextResponse.json({ error: "quizId et answers requis" }, { status: 400 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: { orderBy: { order: "asc" } }, course: true },
    });
    if (!quiz) {
      return NextResponse.json({ error: "Quiz introuvable" }, { status: 404 });
    }

    // Correction réelle : comparaison des réponses soumises aux bonnes réponses en base.
    let correctCount = 0;
    const results = quiz.questions.map((q, i) => {
      const isCorrect = answers[i] === q.correctIndex;
      if (isCorrect) correctCount++;
      return { questionId: q.id, correct: isCorrect, correctIndex: q.correctIndex, explanation: q.explanation };
    });

    const score = quiz.questions.length > 0 ? Math.round((correctCount / quiz.questions.length) * 100) : 0;
    const passed = score >= quiz.passingScore;

    await prisma.quizAttempt.create({
      data: { quizId, userId: session.id, score, passed, answers },
    });

    let certificate = null;
    if (passed && quiz.course.isCertifying) {
      certificate = await prisma.certificate.create({
        data: {
          userId: session.id,
          courseId: quiz.course.id,
          cpfHours: quiz.course.cpfHours,
          grade: score >= 90 ? "A" : score >= 80 ? "B" : "C",
          score,
          verificationCode: `CERT-${randomBytes(4).toString("hex").toUpperCase()}`,
          skills: quiz.course.skills,
        },
      });

      await prisma.trainingEnrollment.upsert({
        where: { userId_courseId: { userId: session.id, courseId: quiz.course.id } },
        update: { progress: 100, status: "COMPLETED" },
        create: { userId: session.id, courseId: quiz.course.id, progress: 100, status: "COMPLETED" },
      });
    }

    return NextResponse.json({ score, passed, results, certificate });
  } catch (error) {
    console.error("Erreur POST quiz submit:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
