"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
    Rocket,
    CheckCircle2,
    UploadCloud,
    CreditCard,
    FileSignature,
    ArrowRight,
    Camera,
    Sparkles,
    Shield,
    Loader2,
    AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Onboarding digital.
//
// Les étapes 1 (identité) et 4 (paiement) utilisent désormais Stripe Identity
// et Stripe Checkout (mode setup, prélèvement SEPA) — les deux flux sont
// entièrement hébergés par Stripe : aucune pièce d'identité ni coordonnée
// bancaire ne transite ni n'est stockée par ce serveur. Sans STRIPE_SECRET_KEY
// configurée côté serveur, les boutons l'indiquent honnêtement plutôt que de
// simuler un dépôt ou un paiement. Les étapes 2 (infos société) et 3 (lettre
// de mission) restent hors périmètre de cette intégration.
// ─────────────────────────────────────────────────────────────────────────────

const ONBOARDING_STEPS = [
    { id: 1, label: "Identité Dirigeant", icon: Camera },
    { id: 2, label: "Infos Société", icon: Rocket },
    { id: 3, label: "Lettre de Mission", icon: FileSignature },
    { id: 4, label: "Paiement & SEPA", icon: CreditCard },
];

function DigitalOnboardingInner() {
    const searchParams = useSearchParams();
    const token = searchParams?.get("token") || "";
    const stepParam = searchParams?.get("step");

    const [currentStep, setCurrentStep] = useState(stepParam ? Number(stepParam) : 1);
    const [identityStatus, setIdentityStatus] = useState<string | null>(null);
    const [sepaStatus, setSepaStatus] = useState<string | null>(null);
    const [chargement, setChargement] = useState(false);
    const [erreur, setErreur] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;
        fetch(`/api/portal/onboarding/identity-status?token=${token}`).then((r) => r.json()).then((d) => setIdentityStatus(d.status ?? null)).catch(() => {});
        fetch(`/api/portal/onboarding/sepa-status?token=${token}`).then((r) => r.json()).then((d) => setSepaStatus(d.status ?? null)).catch(() => {});
    }, [token]);

    const lancerIdentite = async () => {
        setChargement(true);
        setErreur(null);
        try {
            const res = await fetch("/api/portal/onboarding/identity-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Échec.");
            window.location.href = data.url;
        } catch (e) {
            setErreur(e instanceof Error ? e.message : "Échec.");
            setChargement(false);
        }
    };

    const lancerSepa = async () => {
        setChargement(true);
        setErreur(null);
        try {
            const res = await fetch("/api/portal/onboarding/sepa-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Échec.");
            window.location.href = data.url;
        } catch (e) {
            setErreur(e instanceof Error ? e.message : "Échec.");
            setChargement(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 flex flex-col items-center justify-center p-8 animate-in fade-in duration-700 relative overflow-hidden">

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-rose-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[350px] sm:h-[450px] lg:h-[600px] bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="z-10 text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-full text-xs font-bold tracking-widest uppercase mb-6 shadow-lg shadow-rose-500/20">
                    <Sparkles className="w-3 h-3" /> Nouveau Client
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    Bienvenue chez <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">Cabinet 360</span>.
                </h1>
                <p className="text-slate-400 text-lg mt-2">
                    Votre expertise comptable 100% en ligne démarre ici.
                </p>
            </div>

            {!token ? (
                <div className="z-10 w-full max-w-md glass-card bg-slate-900/40 border border-white/5 rounded-[32px] p-10 text-center space-y-4">
                    <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                    <p className="text-slate-400 text-sm">
                        Ce parcours s&apos;ouvre uniquement via le lien personnel fourni par votre cabinet comptable.
                    </p>
                </div>
            ) : (
            <>
            <div className="z-10 w-full max-w-3xl mb-12">
                <div className="flex justify-between relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-10" />
                    <div
                        className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-rose-500 to-orange-500 -z-10 transition-all duration-500"
                        style={{ width: `${(currentStep - 1) * 33}%` }}
                    />
                    {ONBOARDING_STEPS.map((step) => (
                        <button key={step.id} onClick={() => setCurrentStep(step.id)} className="flex flex-col items-center gap-3">
                            <div
                                className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-[#0a0c10]",
                                    currentStep >= step.id
                                        ? "border-rose-500 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                                        : "border-slate-800 text-slate-600"
                                )}
                            >
                                {(step.id === 1 && identityStatus === "verified") || (step.id === 4 && sepaStatus === "active")
                                    ? <CheckCircle2 className="w-6 h-6" />
                                    : <step.icon className="w-5 h-5" />}
                            </div>
                            <span className={cn("text-xs font-bold uppercase tracking-widest transition-colors", currentStep >= step.id ? "text-white" : "text-slate-600")}>
                                {step.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="z-10 w-full max-w-2xl perspective-1000">
                <div className="glass-card bg-slate-900/40 border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden">

                    {currentStep === 1 && (
                        <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-500">
                            <div className="text-center">
                                <h2 className="text-2xl font-black text-white mb-2">Vérifions votre identité</h2>
                                <p className="text-slate-400">Pour respecter la réglementation (KYC), nous avons besoin d&apos;une pièce d&apos;identité.</p>
                            </div>

                            {identityStatus === "verified" ? (
                                <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                                    <p className="text-sm text-emerald-300">Identité vérifiée avec succès.</p>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-slate-700 rounded-3xl p-4 sm:p-6 lg:p-10 flex flex-col items-center justify-center gap-4 bg-slate-950/30">
                                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                                        <UploadCloud className="w-8 h-8 text-slate-500" />
                                    </div>
                                    <button
                                        onClick={lancerIdentite}
                                        disabled={chargement}
                                        className="px-8 py-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2"
                                    >
                                        {chargement ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                                        Vérifier mon identité (Stripe Identity)
                                    </button>
                                    {identityStatus && identityStatus !== "verified" && (
                                        <p className="text-xs text-amber-400">Statut actuel : {identityStatus}</p>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-xl border border-white/5">
                                <Shield className="w-6 h-6 text-slate-500 shrink-0" />
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Vérification hébergée par Stripe Identity : aucune pièce d&apos;identité ne transite ni n&apos;est stockée par Cabinet 360.
                                </p>
                            </div>
                        </div>
                    )}

                    {(currentStep === 2 || currentStep === 3) && (
                        <div className="text-center py-12 animate-in slide-in-from-right-8 fade-in duration-500">
                            <h2 className="text-2xl font-black text-white mb-2">Étape {currentStep} en construction</h2>
                            <p className="text-slate-400">
                                {currentStep === 2 ? "La saisie des informations société n'est pas encore implémentée." : "La génération de la lettre de mission n'est pas encore implémentée."}
                            </p>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-500">
                            <div className="text-center">
                                <h2 className="text-2xl font-black text-white mb-2">Paiement & Prélèvement SEPA</h2>
                                <p className="text-slate-400">Enregistrez votre mandat de prélèvement pour les honoraires du cabinet.</p>
                            </div>

                            {sepaStatus === "active" ? (
                                <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                                    <p className="text-sm text-emerald-300">Mandat de prélèvement SEPA actif.</p>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-slate-700 rounded-3xl p-4 sm:p-6 lg:p-10 flex flex-col items-center justify-center gap-4 bg-slate-950/30">
                                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                                        <CreditCard className="w-8 h-8 text-slate-500" />
                                    </div>
                                    <button
                                        onClick={lancerSepa}
                                        disabled={chargement}
                                        className="px-8 py-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2"
                                    >
                                        {chargement ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                                        Configurer le prélèvement SEPA (Stripe)
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {erreur && <p className="text-sm text-red-400 text-center mt-6">{erreur}</p>}

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
                            {currentStep === 4 ? "Terminer" : "Continuer"} <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
            </>
            )}
        </div>
    );
}

export default function DigitalOnboardingPage() {
    return (
        <Suspense fallback={null}>
            <DigitalOnboardingInner />
        </Suspense>
    );
}
