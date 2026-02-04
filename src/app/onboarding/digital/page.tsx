"use client";

import { useState } from "react";
import {
    Rocket,
    CheckCircle2,
    UploadCloud,
    CreditCard,
    FileSignature,
    PenTool,
    Smile,
    ArrowRight,
    Camera,
    Sparkles,
    Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

const ONBOARDING_STEPS = [
    { id: 1, label: "Identité Dirigeant", icon: Camera },
    { id: 2, label: "Infos Société", icon: Rocket },
    { id: 3, label: "Lettre de Mission", icon: FileSignature },
    { id: 4, label: "Paiement & SEPA", icon: CreditCard },
];

export default function DigitalOnboardingPage() {
    const [currentStep, setCurrentStep] = useState(1);

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 flex flex-col items-center justify-center p-8 animate-in fade-in duration-700 relative overflow-hidden">

            {/* Background Ambience */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-rose-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Clementine/Online Brand Header */}
            <div className="z-10 text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-full text-xs font-bold tracking-widest uppercase mb-6 shadow-lg shadow-rose-500/20">
                    <Sparkles className="w-3 h-3" /> Nouveau Client
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-4">
                    Bienvenue chez <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">Cabinet 360</span>.
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    Votre expertise comptable 100% en ligne démarre ici.
                    Simple, Rapide et Transparent.
                </p>
            </div>

            {/* Stepper */}
            <div className="z-10 w-full max-w-3xl mb-12">
                <div className="flex justify-between relative">
                    {/* Progress Bar Background */}
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-10" />
                    {/* Active Progress */}
                    <div
                        className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-rose-500 to-orange-500 -z-10 transition-all duration-500"
                        style={{ width: `${(currentStep - 1) * 33}%` }}
                    />

                    {ONBOARDING_STEPS.map((step) => (
                        <div key={step.id} className="flex flex-col items-center gap-3">
                            <div
                                className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-[#0a0c10]",
                                    currentStep >= step.id
                                        ? "border-rose-500 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                                        : "border-slate-800 text-slate-600"
                                )}
                            >
                                {currentStep > step.id ? <CheckCircle2 className="w-6 h-6" /> : <step.icon className="w-5 h-5" />}
                            </div>
                            <span className={cn(
                                "text-xs font-bold uppercase tracking-widest transition-colors",
                                currentStep >= step.id ? "text-white" : "text-slate-600"
                            )}>
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Active Step Card */}
            <div className="z-10 w-full max-w-2xl perspective-1000">
                <div className="glass-card bg-slate-900/40 border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden transition-all duration-500 transform hover:scale-[1.01]">

                    {/* Step 1: Identity */}
                    {currentStep === 1 && (
                        <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-500">
                            <div className="text-center">
                                <h2 className="text-2xl font-black text-white mb-2">Vérifions votre identité</h2>
                                <p className="text-slate-400">Pour respecter la réglementation (KYC), nous avons besoin d'une pièce d'identité.</p>
                            </div>

                            <div className="border-2 border-dashed border-slate-700 hover:border-rose-500/50 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all bg-slate-950/30 group">
                                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-rose-500/20 transition-colors">
                                    <UploadCloud className="w-8 h-8 text-slate-500 group-hover:text-rose-400" />
                                </div>
                                <div className="text-center">
                                    <p className="text-white font-bold">Glissez votre CNI ou Passeport ici</p>
                                    <p className="text-xs text-slate-500 mt-1">Formats supportés: PDF, JPG, PNG</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                                <Shield className="w-6 h-6 text-emerald-400 shrink-0" />
                                <p className="text-xs text-emerald-300 leading-relaxed">
                                    Vos données sont chiffrées et stockées sur des serveurs sécurisés certifiés ISO 27001.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 2-4 Placeholders for brevity of implementation demo */}
                    {currentStep > 1 && (
                        <div className="text-center py-12 animate-in slide-in-from-right-8 fade-in duration-500">
                            <h2 className="text-2xl font-black text-white mb-2">Étape {currentStep} en construction</h2>
                            <p className="text-slate-400">L'implémentation complète suivra la logique UX de Clementine.fr</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/5">
                        <button
                            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                            disabled={currentStep === 1}
                            className="text-slate-500 font-bold hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            Retour
                        </button>
                        <button
                            onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                            className="px-8 py-4 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-rose-600/20 flex items-center gap-3 transition-all active:scale-95"
                        >
                            {currentStep === 4 ? "Finaliser" : "Continuer"} <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Trust Badges */}
            <div className="z-10 mt-12 flex gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                {/* Placeholders for logos: Visa, Mastercard, OEC, etc. */}
                <div className="h-8 w-24 bg-white/10 rounded" />
                <div className="h-8 w-24 bg-white/10 rounded" />
                <div className="h-8 w-24 bg-white/10 rounded" />
            </div>

        </div>
    );
}

