"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
    ChevronLeft,
    ChevronRight,
    Timer,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Award,
    RefreshCcw,
    LayoutDashboard,
    Trophy,
    BookOpen,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Question { id: string; question: string; options: string[]; }
interface QuizData { id: string; title: string; course: string; timeLimit: number; passingScore: number; questions: Question[]; }
interface ResultItem { questionId: string; correct: boolean; correctIndex: number; explanation: string | null; }

function QuizInner() {
    const searchParams = useSearchParams();
    const quizId = searchParams.get("quizId");

    const [quiz, setQuiz] = useState<QuizData | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [score, setScore] = useState(0);
    const [passed, setPassed] = useState(false);
    const [results, setResults] = useState<ResultItem[]>([]);

    useEffect(() => {
        if (!quizId) { setLoading(false); return; }
        fetch(`/api/training/quiz/${quizId}`)
            .then(res => res.json())
            .then(data => {
                if (data.quiz) {
                    setQuiz(data.quiz);
                    setTimeLeft(data.quiz.timeLimit);
                }
            })
            .finally(() => setLoading(false));
    }, [quizId]);

    const handleSubmit = async () => {
        if (!quiz || submitting) return;
        setSubmitting(true);
        try {
            const answers = quiz.questions.map((_, i) => selectedAnswers[i] ?? -1);
            const res = await fetch("/api/training/quiz/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quizId: quiz.id, answers }),
            });
            const data = await res.json();
            if (res.ok) {
                setScore(data.score);
                setPassed(data.passed);
                setResults(data.results ?? []);
                setIsSubmitted(true);
            }
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (!quiz || isSubmitted) return;
        if (timeLeft <= 0) { handleSubmit(); return; }
        const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, isSubmitted, quiz]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSelect = (index: number) => {
        if (isSubmitted) return;
        setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: index });
    };

    if (loading) {
        return <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>;
    }

    if (!quiz) {
        return (
            <div className="min-h-screen bg-[#0a0c10] text-slate-200 flex items-center justify-center">
                <p className="text-slate-500">Aucun quiz disponible.</p>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 flex items-center justify-center animate-in zoom-in duration-500">
                <div className="max-w-2xl w-full">
                    <div className={cn(
                        "p-4 sm:p-6 lg:p-10 rounded-[40px] border-2 text-center relative overflow-hidden",
                        passed ? "bg-emerald-500/5 border-emerald-500/20" : "bg-rose-500/5 border-rose-500/20"
                    )}>
                        <div className="absolute -top-10 -right-10 opacity-5">
                            {passed ? <Trophy className="w-64 h-64 text-emerald-500" /> : <AlertCircle className="w-64 h-64 text-rose-500" />}
                        </div>

                        <div className={cn(
                            "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl",
                            passed ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                        )}>
                            {passed ? <Trophy className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                        </div>

                        <h1 className="page-title-dark mb-2">
                            {passed ? "Félicitations !" : "Encore un effort !"}
                        </h1>
                        <p className="page-subtitle-dark mb-8">
                            {passed ? "Vous avez validé ce module avec succès." : `Vous n'avez pas atteint le score minimum de passage (${quiz.passingScore}%).`}
                        </p>

                        <div className="flex justify-center gap-8 sm:gap-12 mb-10">
                            <div className="text-center">
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Votre Score</p>
                                <p className={cn("text-2xl sm:text-3xl lg:text-5xl font-black", passed ? "text-emerald-400" : "text-rose-400")}>{score}%</p>
                            </div>
                            <div className="w-px bg-white/10" />
                            <div className="text-center">
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Objectif</p>
                                <p className="text-2xl sm:text-3xl lg:text-5xl font-black text-white">{quiz.passingScore}%</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => {
                                    setIsSubmitted(false);
                                    setSelectedAnswers({});
                                    setCurrentQuestionIndex(0);
                                    setTimeLeft(quiz.timeLimit);
                                }}
                                className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCcw className="w-5 h-5" /> Réessayer
                            </button>
                            <Link href="/training/academy" className="px-6 py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20">
                                <LayoutDashboard className="w-5 h-5" /> Dashboard
                            </Link>
                        </div>

                        {passed && (
                            <Link href="/training/certificates" className="mt-4 w-full px-6 py-4 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl font-bold transition-all flex items-center justify-center gap-2">
                                <Award className="w-5 h-5" /> Voir mon Certificat
                            </Link>
                        )}
                    </div>

                    <div className="mt-12 space-y-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2 px-4">
                            <BookOpen className="w-6 h-6 text-teal-400" /> Correction détaillée
                        </h3>
                        {quiz.questions.map((q, i) => {
                            const r = results[i];
                            return (
                                <div key={q.id} className={cn(
                                    "p-6 rounded-3xl border",
                                    r?.correct ? "bg-emerald-500/5 border-emerald-500/10" : "bg-rose-500/5 border-rose-500/10"
                                )}>
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="font-bold text-white text-lg pr-8">{i + 1}. {q.question}</h4>
                                        {r?.correct ? <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" /> : <XCircle className="w-6 h-6 text-rose-500 shrink-0" />}
                                    </div>
                                    <div className="space-y-2 mb-4">
                                        {q.options.map((opt, optIdx) => (
                                            <div key={optIdx} className={cn(
                                                "p-3 rounded-xl text-sm flex items-center gap-3",
                                                optIdx === r?.correctIndex ? "bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/20" :
                                                    optIdx === selectedAnswers[i] ? "bg-rose-500/20 text-rose-400 border border-rose-500/20" :
                                                        "bg-slate-900/50 text-slate-500"
                                            )}>
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    optIdx === r?.correctIndex ? "bg-emerald-500" : optIdx === selectedAnswers[i] ? "bg-rose-500" : "bg-slate-700"
                                                )} />
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                    {r?.explanation && (
                                        <div className="p-4 bg-slate-900 rounded-2xl border border-white/5">
                                            <p className="text-xs font-bold text-teal-400 uppercase mb-1">Explication</p>
                                            <p className="text-sm text-slate-400">{r.explanation}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 flex flex-col">
            <div className="max-w-4xl w-full mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <Link href="/training/courses" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-4 group">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Retour au cours
                    </Link>
                    <h2 className="text-[10px] font-black text-teal-500 uppercase tracking-widest mb-1">{quiz.course}</h2>
                    <h1 className="page-title-dark">{quiz.title}</h1>
                </div>

                <div className="flex items-center gap-6 p-4 bg-slate-900 border border-white/5 rounded-3xl shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center",
                            timeLeft < 60 ? "bg-rose-500/10 text-rose-500 animate-pulse" : "bg-teal-500/10 text-teal-400"
                        )}>
                            <Timer className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-black">Temps Restant</p>
                            <p className={cn("text-xl font-mono font-black", timeLeft < 60 ? "text-rose-500" : "text-white")}>
                                {formatTime(timeLeft)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl w-full mx-auto flex-1">
                <div className="mb-12">
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-xs font-black text-slate-500 uppercase">Question {currentQuestionIndex + 1} sur {quiz.questions.length}</span>
                        <span className="text-2xl font-black text-white">
                            {Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)}%
                        </span>
                    </div>
                    <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                        <div
                            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 ease-out shadow-[0_0_20px_rgba(20,184,166,0.3)]"
                            style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="group">
                    <div className="p-4 sm:p-6 lg:p-10 rounded-[40px] bg-slate-900/50 border border-white/5 group-hover:border-teal-500/20 transition-all duration-500 mb-8">
                        <h3 className="text-2xl font-bold text-white mb-10 leading-relaxed italic">
                            "{currentQuestion.question}"
                        </h3>

                        <div className="grid grid-cols-1 gap-4">
                            {currentQuestion.options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSelect(index)}
                                    className={cn(
                                        "p-6 rounded-[24px] text-left transition-all duration-300 border flex items-center gap-6 group/option",
                                        selectedAnswers[currentQuestionIndex] === index
                                            ? "bg-teal-600 border-teal-400 text-white shadow-lg shadow-teal-600/30 -translate-y-1"
                                            : "bg-slate-900 border-white/5 text-slate-400 hover:border-teal-500/30 hover:bg-slate-800/80"
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors",
                                        selectedAnswers[currentQuestionIndex] === index ? "bg-white text-teal-600" : "bg-slate-800 text-slate-500 group-hover/option:bg-teal-500/20 group-hover/option:text-teal-400"
                                    )}>
                                        {String.fromCharCode(65 + index)}
                                    </div>
                                    <span className="text-lg font-medium">{option}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-12 mb-20">
                    <button
                        onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                        disabled={currentQuestionIndex === 0}
                        className="px-8 py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-0 disabled:pointer-events-none text-white rounded-2xl font-bold transition-all border border-white/5 flex items-center gap-2"
                    >
                        <ChevronLeft className="w-5 h-5" /> Précédent
                    </button>

                    {currentQuestionIndex === quiz.questions.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || Object.keys(selectedAnswers).length < quiz.questions.length}
                            className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:opacity-50 text-white rounded-2xl font-black transition-all shadow-xl shadow-emerald-600/25 flex items-center gap-3 transform hover:scale-105 active:scale-95"
                        >
                            {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Terminer le Quiz <CheckCircle2 className="w-6 h-6" /></>}
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                            className="px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-teal-600/20 flex items-center gap-2 group"
                        >
                            Suivant <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-3xl w-full mx-auto">
                <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-[32px] flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-amber-500 text-sm italic">Validation de module</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Ce quiz est requis pour obtenir votre attestation. Assurez-vous d'avoir bien compris les concepts avant de soumettre.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function QuizPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0a0c10] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>}>
            <QuizInner />
        </Suspense>
    );
}
