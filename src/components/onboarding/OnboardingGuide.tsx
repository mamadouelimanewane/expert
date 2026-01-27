"use client";

import { useState, useEffect } from "react";
import {
    X,
    ChevronRight,
    Sparkles,
    BarChart3,
    Gavel,
    Calculator,
    CheckCircle2,
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
    title: string;
    desc: string;
    icon: any;
    color: string;
    image?: string; // Placeholder for future screenshots through simple colored areas
}

const STEPS: Step[] = [
    {
        title: "Bienvenue sur Cabinet 360",
        desc: "Votre nouvelle plateforme de pilotage. Une interface repensée pour l'Excellence.",
        icon: Sparkles,
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
    },
    {
        title: "Intelligence & Stratégie",
        desc: "Nouveau module BI et M&A : visualisez vos KPIs financiers et simulez des valorisations en temps réel.",
        icon: BarChart3,
        color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
    },
    {
        title: "Gouvernance & Juridique",
        desc: "Gérez mandats et AG (OHADA). Signez électroniquement vos actes avec une valeur probante certifiée.",
        icon: Gavel,
        color: "text-rose-400 bg-rose-500/10 border-rose-500/20"
    },
    {
        title: "Production Sociale",
        desc: "Paie multi-juridiction et audit social. Détectez automatiquement les risques de conformité.",
        icon: Calculator,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    }
];

export function OnboardingGuide() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem("cabinet360_onboarding_seen");
        if (!hasSeenOnboarding) {
            // Small delay for dramatic effect on load
            setTimeout(() => setIsOpen(true), 1500);
        }
    }, []);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem("cabinet360_onboarding_seen", "true");
    };

    if (!isOpen) return null;

    const step = STEPS[currentStep];
    const Icon = step.icon;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden relative group">
                {/* Background FX */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-colors z-20"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col h-full relative z-10">
                    {/* Visual Area */}
                    <div className="h-64 flex items-center justify-center bg-gradient-to-b from-slate-800/50 to-transparent p-10">
                        <div className={cn(
                            "w-24 h-24 rounded-[32px] flex items-center justify-center shadow-2xl transition-all duration-500 transform scale-110",
                            step.color
                        )}>
                            <Icon className="w-10 h-10" />
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-10 pt-2 flex-1 flex flex-col justify-between">
                        <div className="text-center space-y-4">
                            <h2 className="text-3xl font-black text-white tracking-tight animate-in slide-in-from-bottom-2 duration-500 key={step.title}">
                                {step.title}
                            </h2>
                            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-lg mx-auto animate-in slide-in-from-bottom-3 duration-700 key={step.desc}">
                                {step.desc}
                            </p>
                        </div>

                        {/* Pagination & Controls */}
                        <div className="flex items-center justify-between mt-12">
                            <div className="flex gap-2">
                                {STEPS.map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "w-2.5 h-2.5 rounded-full transition-all duration-300",
                                            i === currentStep ? "bg-indigo-500 w-8" : "bg-slate-700"
                                        )}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handleNext}
                                className="group px-8 py-3 bg-white text-slate-950 font-black uppercase tracking-widest text-xs rounded-2xl flex items-center gap-2 hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-white/10"
                            >
                                {currentStep === STEPS.length - 1 ? (
                                    <>Commencer <CheckCircle2 className="w-4 h-4 text-emerald-600" /></>
                                ) : (
                                    <>Suivant <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
