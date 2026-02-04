"use client";

import { useState } from "react";
import {
    Building2,
    Users,
    Wallet,
    ScrollText,
    CheckCircle2,
    ArrowRight,
    ChevronRight,
    Sparkles,
    Landmark,
    Fingerprint,
    Stamp,
    Download,
    Eye,
    Upload
} from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "project" | "partners" | "capital" | "documents" | "finalization";

const COMPANY_FORMS = [
    { id: "sarl", label: "SARL", desc: "Société à Responsabilité Limitée", minCapital: "1 000 000" },
    { id: "sas", label: "SAS", desc: "Société par Actions Simplifiée", minCapital: "10 000 000" },
    { id: "sa", label: "SA", desc: "Société Anonyme", minCapital: "10 000 000" },
    { id: "suarl", label: "SUARL", desc: "SARL Unipersonnelle", minCapital: "1 000 000" },
];

export default function CreationMissionPage() {
    const [step, setStep] = useState<Step>("project");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        form: "sarl",
        country: "CI",
        activity: "",
        partners: [] as any[],
        capital: 1000000
    });

    const handleNext = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            if (step === "project") setStep("partners");
            if (step === "partners") setStep("capital");
            if (step === "capital") setStep("documents");
            if (step === "documents") setStep("finalization");
        }, 800);
    };

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-8 border-b border-white/5">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
                        Mission Juridique
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        <Building2 className="w-10 h-10 text-indigo-500" />
                        Guichet de Création
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl">
                        Assistant intelligent pour la constitution de sociétés en zone OHADA.
                        Génération automatique des statuts, du DSV et suivi des formalités.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-sm transition-all border border-white/10">
                        Sauvegarder Brouillon
                    </button>
                </div>
            </div>

            {/* Stepper */}
            <div className="w-full bg-[#13161c] border border-white/5 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden">
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-slate-800 -z-0" />
                {["Identité", "Associés", "Apports", "Génération", "Dépôt"].map((label, idx) => {
                    const currentStepIdx = ["project", "partners", "capital", "documents", "finalization"].indexOf(step);
                    const isCompleted = idx < currentStepIdx;
                    const isCurrent = idx === currentStepIdx;

                    return (
                        <div key={idx} className="relative z-10 flex flex-col items-center gap-2 bg-[#13161c] px-4">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all border-2",
                                isCompleted ? "bg-emerald-500 border-emerald-500 text-white" :
                                    isCurrent ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]" :
                                        "bg-slate-900 border-slate-700 text-slate-500"
                            )}>
                                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                            </div>
                            <span className={cn(
                                "text-xs font-bold uppercase tracking-wider",
                                isCurrent ? "text-white" : isCompleted ? "text-emerald-400" : "text-slate-600"
                            )}>{label}</span>
                        </div>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Form */}
                <div className="lg:col-span-2 space-y-6">

                    {step === "project" && (
                        <div className="glass-card p-8 rounded-3xl border border-white/5 bg-slate-900/40 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <Fingerprint className="w-6 h-6 text-indigo-400" />
                                    Identité de la Société
                                </h2>
                                <p className="text-slate-400">Définissez la forme juridique et les caractéristiques principales.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {COMPANY_FORMS.map((form) => (
                                    <div
                                        key={form.id}
                                        onClick={() => setFormData({ ...formData, form: form.id })}
                                        className={cn(
                                            "cursor-pointer p-4 rounded-xl border transition-all hover:scale-[1.02]",
                                            formData.form === form.id
                                                ? "bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500"
                                                : "bg-slate-800/30 border-white/5 hover:bg-slate-800/50"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-black text-lg text-white">{form.label}</span>
                                            {formData.form === form.id && <CheckCircle2 className="w-5 h-5 text-indigo-400" />}
                                        </div>
                                        <p className="text-xs text-slate-400 mb-2">{form.desc}</p>
                                        <div className="inline-block px-2 py-1 bg-slate-950 rounded text-[10px] text-slate-500 font-mono">
                                            Min: {form.minCapital} XOF
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-300">Dénomination Sociale</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: GLOBAL TECH SOLUTIONS"
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-300">Objet Social (Résumé)</label>
                                    <textarea
                                        placeholder="Ex: Conseil en informatique, développement de logiciels..."
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors h-32 resize-none"
                                        value={formData.activity}
                                        onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                                    />
                                    <div className="flex justify-end">
                                        <button className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" /> Améliorer avec l'IA
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === "partners" && (
                        <div className="glass-card p-8 rounded-3xl border border-white/5 bg-slate-900/40 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <Users className="w-6 h-6 text-indigo-400" />
                                    Associés & Dirigeants
                                </h2>
                                <p className="text-slate-400">Ajoutez les personnes physiques ou morales participant au capital.</p>
                            </div>

                            <div className="p-12 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-800/20 hover:bg-slate-800/40 group">
                                <div className="w-16 h-16 bg-slate-800 group-hover:bg-indigo-600 rounded-full flex items-center justify-center mb-4 transition-colors">
                                    <Users className="w-8 h-8 text-slate-400 group-hover:text-white" />
                                </div>
                                <span className="font-bold text-white group-hover:text-indigo-300">Ajouter un associé</span>
                                <span className="text-sm text-slate-500 mt-1">Personne Physique ou Morale</span>
                            </div>

                            <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                                        MO
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">Mamadou Ouattara</p>
                                        <p className="text-xs text-slate-500">Gérant • 100% des parts (Associé Unique)</p>
                                    </div>
                                    <div className="ml-auto">
                                        <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500"><Eye className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === "capital" && (
                        <div className="glass-card p-8 rounded-3xl border border-white/5 bg-slate-900/40 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <Landmark className="w-6 h-6 text-indigo-400" />
                                    Capital & Dépôt
                                </h2>
                                <p className="text-slate-400">Configuration du capital social et attestation de dépôt.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4 p-6 bg-slate-950 rounded-2xl border border-white/5">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Montant du Capital</label>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-white">1 000 000</span>
                                        <span className="text-xl font-bold text-slate-500">FCFA</span>
                                    </div>
                                    <input type="range" className="w-full accent-indigo-500" min="1000000" max="100000000" step="100000" defaultValue="1000000" />
                                    <p className="text-xs text-emerald-400 flex items-center gap-2">
                                        <CheckCircle2 className="w-3 h-3" /> Minimum légal respecté (SARL)
                                    </p>
                                </div>

                                <div className="space-y-4 p-6 bg-slate-950 rounded-2xl border border-white/5">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Valeur Nominale</label>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-white">10 000</span>
                                        <span className="text-xl font-bold text-slate-500">FCFA / part</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-400 pt-4 border-t border-white/5">
                                        <span>Nombre de parts :</span>
                                        <span className="font-bold text-white">100</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-4">
                                <div className="p-3 bg-indigo-500/20 rounded-lg">
                                    <Wallet className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">Attestation de Dépôt de Capital</h4>
                                    <p className="text-sm text-slate-400">Le dépôt doit être effectué auprès d'un notaire (Recommandé) ou d'une banque.</p>
                                </div>
                                <button className="ml-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-colors">
                                    Initier le Dépôt
                                </button>
                            </div>
                        </div>
                    )}

                    {step === "documents" && (
                        <div className="glass-card p-8 rounded-3xl border border-white/5 bg-slate-900/40 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <ScrollText className="w-6 h-6 text-indigo-400" />
                                    Génération des Actes
                                </h2>
                                <p className="text-slate-400">L'IA rédige automatiquement vos statuts et formulaires officiels.</p>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { title: "Statuts de la SARL", pages: 12, status: "Ready" },
                                    { title: "Déclaration de Souscription (DSV)", pages: 2, status: "Ready" },
                                    { title: "Acte de Nomination du Gérant", pages: 3, status: "Draft" },
                                    { title: "Liste des Bénéficiaires Effectifs", pages: 1, status: "Pending" }
                                ].map((doc, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-white/5 group hover:border-indigo-500/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                                                <ScrollText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white group-hover:text-indigo-300 transition-colors">{doc.title}</h4>
                                                <p className="text-xs text-slate-500">{doc.pages} pages • Généré par IA</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded",
                                                doc.status === "Ready" ? "bg-emerald-500/10 text-emerald-400" :
                                                    doc.status === "Draft" ? "bg-amber-500/10 text-amber-400" : "bg-slate-800 text-slate-500"
                                            )}>{doc.status}</span>
                                            <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between pt-6">
                        {step !== "project" && (
                            <button
                                onClick={() => {
                                    if (step === "partners") setStep("project");
                                    if (step === "capital") setStep("partners");
                                    if (step === "documents") setStep("capital");
                                }}
                                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
                            >
                                Retour
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            disabled={loading}
                            className="ml-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                    Traitement...
                                </>
                            ) : (
                                <>
                                    {step === "documents" ? "Finaliser le Dossier" : "Étape Suivante"}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>

                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-3xl border border-white/10 sticky top-8">
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            Récapitulatif
                        </h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Forme</span>
                                <span className="font-bold text-white uppercase">{formData.form}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Pays</span>
                                <span className="font-bold text-white flex items-center gap-2">
                                    <img src="https://flagcdn.com/ci.svg" className="w-4 h-3 rounded-sm" alt="CI" /> Côte d'Ivoire
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Capital</span>
                                <span className="font-bold text-emerald-400">1 000 000 XOF</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Associés</span>
                                <span className="font-bold text-white">1</span>
                            </div>
                        </div>

                        <div className="p-4 bg-white/5 rounded-xl border border-white/5 mb-6">
                            <div className="flex items-start gap-3">
                                <Stamp className="w-5 h-5 text-indigo-400 mt-1" />
                                <div>
                                    <p className="text-xs font-bold text-white mb-1">Certification Notaire</p>
                                    <p className="text-[10px] text-slate-400 leading-relaxed">
                                        Les statuts générés seront automatiquement pré-validés par nos notaires partenaires.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-bold text-slate-300 transition-all flex items-center justify-center gap-2">
                            <Download className="w-4 h-4" />
                            Télécharger le Récapitulatif
                        </button>
                    </div>

                    <div className="p-6 rounded-3xl border border-dashed border-slate-700 bg-slate-900/20 text-center space-y-4">
                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
                            <Upload className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm">Pièces justificatives</h4>
                            <p className="text-xs text-slate-500 mt-1">Glissez ici les CNI/Passeports des associés pour extraction automatique.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

