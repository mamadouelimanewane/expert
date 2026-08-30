"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
    ClipboardCheck,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowRight,
    Filter,
    Search,
    Download,
    FileText,
    TrendingUp,
    ShieldCheck,
    Lock,
    Eye,
    ChevronDown,
    MoreVertical,
    Check
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Section de revision, construite depuis /api/audit/dossier.
 *
 * Le dossier de travail est le meme objet metier que pour l'audit legal
 * (AuditSection + AuditChecklistItem) : seul le type de mission differe.
 */
interface ReviewSection {
    id: string;
    title: string;
    description: string;
    status: "done" | "pending" | "alert";
    tasks: { id: string; label: string; completed: boolean }[];
}



export default function RevisionPage() {
    const [sections, setSections] = useState<ReviewSection[]>([]);
    const [mission, setMission] = useState<{ name: string; client: string } | null>(null);
    const [avancement, setAvancement] = useState(0);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState<string | null>(null);

    const charger = useCallback(async () => {
        setChargement(true);
        setErreur(null);
        try {
            const res = await fetch("/api/audit/dossier?type=TENUE_COMPTABLE");
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? `Reponse ${res.status}`);

            const checklists: Record<string, { id: string; description: string; status: string }[]> =
                data.checklists ?? {};

            setSections(
                (data.sections ?? []).map((sec: Record<string, unknown>) => {
                    const items = checklists[String(sec.id)] ?? [];
                    const progress = Number(sec.progress ?? 0);
                    return {
                        id: String(sec.id),
                        title: String(sec.name),
                        description: String(sec.note ?? "Aucune note de revue enregistree."),
                        status: progress === 100 ? "done" : progress === 0 ? "alert" : "pending",
                        tasks: items.map((i) => ({
                            id: i.id,
                            label: i.description,
                            completed: i.status === "TERMINE",
                        })),
                    } as ReviewSection;
                })
            );
            setMission(data.mission ? { name: data.mission.name, client: data.mission.client } : null);
            setAvancement(Number(data.globalProgress ?? 0));
        } catch (e) {
            console.error("Chargement du dossier de revision :", e);
            setErreur(e instanceof Error ? e.message : "Impossible de charger le dossier de revision.");
            setSections([]);
            setMission(null);
            setAvancement(0);
        } finally {
            setChargement(false);
        }
    }, []);

    useEffect(() => { charger(); }, [charger]);

    const [expandedSections, setExpandedSections] = useState<string[]>(["s1", "s2"]);

    const toggleSection = (id: string) => {
        setExpandedSections(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">

            {/* Header SEPTEO Style */}
            <div className="bg-slate-900/40 p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 sm:p-8 lg:p-16 opacity-5 pointer-events-none">
                    <ClipboardCheck className="w-48 h-48 text-primary" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="page-title flex items-center gap-5">
                            <div className="p-4 bg-primary rounded-[24px] shadow-2xl shadow-primary/30">
                                <ClipboardCheck className="w-8 h-8 text-white" />
                            </div>
                            Révision & Certification
                        </h2>
                        <p className="page-subtitle">
                            Processus de vérification automatisé et manuel pour la clôture des comptes conforme aux normes OHADA.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <Link href="/comptabilite/revision/print" target="_blank" className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/5 flex items-center gap-3 transition-all">
                            <Download className="w-4 h-4" /> Rapport de Révision
                        </Link>
                        <button className="px-8 py-4 bg-primary hover:brightness-110 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-primary/30 active:scale-95">
                            <ShieldCheck className="w-5 h-5" /> Certifier les Comptes
                        </button>
                    </div>
                </div>
            </div>

            {/* Progress Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="apix-card">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">Avancement Global</p>
                    <div className="flex items-center gap-6">
                        <div className="relative w-20 h-20">
                            <svg className="w-20 h-20 -rotate-90">
                                <circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
                                <circle
                                    cx="40"
                                    cy="40"
                                    r="36"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    strokeDasharray={226}
                                    strokeDashoffset={226 * (1 - avancement / 100)}
                                    className="text-primary transition-all"
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center font-black text-white text-lg tabular-nums">
                                {avancement}%
                            </span>
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-white">
                                {avancement === 100 ? "Pret pour cloture" : "Revision en cours"}
                            </h4>
                            <p className="text-xs text-slate-500 font-medium">
                                {sections.filter(x => x.status === "done").length} section
                                {sections.filter(x => x.status === "done").length > 1 ? "s" : ""} verifiee
                                {sections.filter(x => x.status === "done").length > 1 ? "s" : ""} sur {sections.length}
                                {mission ? ` \u2014 ${mission.client}` : ""}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="apix-card">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">Anomalies Détectées</p>
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                            <AlertCircle className="w-8 h-8 text-rose-500" />
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-rose-400">{sections.filter(x => x.status === "alert").length} Alerte{sections.filter(x => x.status === "alert").length > 1 ? "s" : ""}</h4>
                            <p className="text-xs text-slate-500 font-medium">Sections marquées en alerte</p>
                        </div>
                    </div>
                </div>

                <div className="apix-card flex flex-col justify-center overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Lock className="w-16 h-16 text-slate-500" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3" /> Traçabilité
                    </p>
                    <h4 className="text-xl font-black text-white">Journal des actions</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                        Chaque contrôle validé est journalisé. Aucune certification d&apos;hébergement (SecNumCloud, ISO...) n&apos;est actuellement détenue par le cabinet.
                    </p>
                </div>
            </div>

            {/* Main Review Workflow */}
            <div className="space-y-6">
                {chargement && (
                    <p className="px-4 text-sm text-slate-500">Chargement du dossier de revision...</p>
                )}

                {!chargement && erreur && (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-200">
                        {erreur}
                    </div>
                )}

                {!chargement && !erreur && sections.length === 0 && (
                    <p className="px-4 text-sm text-slate-500">
                        Aucune section dans ce dossier.
                    </p>
                )}

                {sections.map((section) => (
                    <div key={section.id} className="glass-card rounded-[40px] border border-white/5 bg-slate-900/20 overflow-hidden transition-all">
                        <div
                            className="p-8 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]"
                            onClick={() => toggleSection(section.id)}
                        >
                            <div className="flex items-center gap-6">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center font-black",
                                    section.status === "done" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                        section.status === "alert" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                                            "bg-primary/10 text-primary border border-primary/20"
                                )}>
                                    {section.status === "done" ? <CheckCircle2 className="w-6 h-6" /> :
                                        section.status === "alert" ? <AlertCircle className="w-6 h-6" /> :
                                            <Clock className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white">{section.title}</h3>
                                    <p className="text-xs text-slate-500 font-medium">{section.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Complétion</p>
                                    <p className="font-mono font-bold text-white">
                                        {section.tasks.filter(t => t.completed).length} / {section.tasks.length}
                                    </p>
                                </div>
                                <ChevronDown className={cn("w-6 h-6 text-slate-600 transition-transform", expandedSections.includes(section.id) && "rotate-180")} />
                            </div>
                        </div>

                        {expandedSections.includes(section.id) && (
                            <div className="px-8 pb-8 pt-2 animate-in slide-in-from-top-4 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {section.tasks.map(task => (
                                        <div
                                            key={task.id}
                                            className={cn(
                                                "p-5 rounded-2xl border transition-all cursor-pointer group flex items-start gap-4",
                                                task.completed
                                                    ? "bg-emerald-500/5 border-emerald-500/10"
                                                    : "bg-slate-800/30 border-white/5 hover:border-primary/30"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                                                task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "bg-slate-900 border-white/10 text-transparent group-hover:border-primary"
                                            )}>
                                                <Check className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <p className={cn("text-xs font-bold leading-tight", task.completed ? "text-slate-300" : "text-white")}>
                                                    {task.label}
                                                </p>
                                            </div>
                                            <MoreVertical className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    ))}
                                    <button className="p-5 border-2 border-dashed border-slate-800 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:border-primary/30 hover:text-primary transition-all">
                                        + Ajouter un contrôle
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

        </div>
    );
}
