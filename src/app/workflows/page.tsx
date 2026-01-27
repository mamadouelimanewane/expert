"use client";

import { useState } from "react";
import {
    GitMerge,
    Workflow as WorkflowIcon,
    Mail,
    FileText,
    CheckCircle2,
    Clock,
    Users,
    ArrowRight,
    Plus,
    UserCheck,
    AlertCircle,
    ChevronDown,
    Filter,
    Layers,
    Activity,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MissionWorkflow {
    id: string;
    client: string;
    mission: string;
    step: "Saisie" | "Révision" | "Supervision" | "Signature";
    collaborator: string;
    daysActive: number;
    status: "Normal" | "Urgent" | "En retard" | "Terminé";
    progress: number;
}

const MOCK_PIPELINE: MissionWorkflow[] = [
    { id: "1", client: "SIB CI", mission: "Bilan Annuel 2023", step: "Supervision", collaborator: "K. Touré", daysActive: 12, status: "Normal", progress: 75 },
    { id: "2", client: "Traoré Exp", mission: " Audit Social", step: "Révision", collaborator: "A. Koné", daysActive: 5, status: "Urgent", progress: 45 },
    { id: "3", client: "GDS Gabon", mission: "TVA Trimestrielle", step: "Saisie", collaborator: "M. Ndiaye", daysActive: 20, status: "En retard", progress: 95 },
    { id: "4", client: "Boulangerie Plateau", mission: "Conseil Fiscal", step: "Signature", collaborator: "E. Diop", daysActive: 2, status: "Terminé", progress: 100 },
];

export default function AutomationPage() {
    const [pipeline, setPipeline] = useState(MOCK_PIPELINE);
    const [view, setView] = useState<"pipeline" | "automations">("pipeline");

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-slate-900/40 p-8 rounded-3xl border border-white/5">
                <div>
                    <h2 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-4">
                        <Layers className="w-10 h-10 text-cyan-400" />
                        Pipeline de Mission
                    </h2>
                    <p className="text-slate-400 mt-2 max-w-2xl">
                        Suivi en temps réel de la production comptable. Gérez les cycles de validation
                        du collaborateur à l'expert-comptable signataire.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setView("pipeline")}
                        className={cn("px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all", view === "pipeline" ? "bg-cyan-600 text-white shadow-xl shadow-cyan-600/20" : "bg-slate-800 text-slate-500")}
                    >
                        Vue Pipeline
                    </button>
                    <button
                        onClick={() => setView("automations")}
                        className={cn("px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all", view === "automations" ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" : "bg-slate-800 text-slate-500")}
                    >
                        Automatisations
                    </button>
                </div>
            </div>

            {view === "pipeline" ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Columns */}
                    <PipelineColumn title="Saisie / Scan" count={1} icon={FileText} className="border-slate-800 bg-slate-900/10">
                        {pipeline.filter(m => m.step === "Saisie").map(m => <MissionCard key={m.id} mission={m} />)}
                    </PipelineColumn>

                    <PipelineColumn title="Révision" count={1} icon={Activity} className="border-indigo-500/10 bg-indigo-500/[0.02]">
                        {pipeline.filter(m => m.step === "Révision").map(m => <MissionCard key={m.id} mission={m} />)}
                    </PipelineColumn>

                    <PipelineColumn title="Supervision" count={1} icon={UserCheck} className="border-amber-500/10 bg-amber-500/[0.02]">
                        {pipeline.filter(m => m.step === "Supervision").map(m => <MissionCard key={m.id} mission={m} />)}
                    </PipelineColumn>

                    <PipelineColumn title="Clôture / Sign" count={1} icon={CheckCircle2} className="border-emerald-500/10 bg-emerald-500/[0.02]">
                        {pipeline.filter(m => m.step === "Signature").map(m => <MissionCard key={m.id} mission={m} />)}
                    </PipelineColumn>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-card rounded-3xl p-8 border border-white/5 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <WorkflowIcon className="w-32 h-32" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                                <WorkflowIcon className="w-6 h-6 text-indigo-400" />
                                Automatisations de Bureau
                            </h3>

                            <div className="space-y-4 relative z-10">
                                <AutomationRow name="Onboarding Automatique" desc="Création GED + Mail Bienvenue + Teams Team" active={true} />
                                <AutomationRow name="Alerte Retard Révision" desc="Notification Manager si dossier > 15 jours" active={true} />
                                <AutomationRow name="Rappel TVA Automatisé" desc="SMS client J-3 avant échéance pays" active={false} />
                                <AutomationRow name="Indexation IA documents" desc="Déclenchement moteur OCR à l'upload" active={true} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="glass-card rounded-3xl p-6 border border-white/5 bg-indigo-600/5">
                            <h3 className="text-white font-bold mb-4">KPI Productivité</h3>
                            <div className="space-y-6">
                                <KpiMini label="Temps moyen révision" value="4.2 Jours" progress={65} />
                                <KpiMini label="Dossiers clôturés / mois" value="28" progress={85} />
                                <KpiMini label="Efficacité Saisie IA" value="x5.2" progress={95} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function PipelineColumn({ title, count, icon: Icon, children, className }: any) {
    return (
        <div className={cn("flex flex-col min-h-[600px] rounded-3xl border border-white/5 p-4", className)}>
            <div className="flex justify-between items-center mb-6 px-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                        <Icon className="w-4 h-4 text-slate-400" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">{title}</h3>
                </div>
                <span className="text-[10px] font-bold bg-white/5 px-2 py-0.5 rounded-full text-slate-500">{count}</span>
            </div>
            <div className="space-y-4 flex-1">
                {children}
            </div>
            <button className="mt-4 w-full py-3 border border-white/5 border-dashed rounded-2xl text-[10px] font-bold text-slate-600 uppercase hover:border-slate-700 hover:text-slate-400 transition-all">
                + Ajouter une mission
            </button>
        </div>
    );
}

function MissionCard({ mission }: { mission: MissionWorkflow }) {
    return (
        <div className="glass-card p-5 rounded-2xl border border-white/5 bg-slate-900/40 hover:scale-[1.02] transition-all cursor-grab active:cursor-grabbing group shadow-xl">
            <div className="flex justify-between items-start mb-3">
                <span className={cn(
                    "text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter",
                    mission.status === "Urgent" ? "bg-rose-500 text-white" :
                        mission.status === "En retard" ? "bg-amber-500 text-slate-900" :
                            mission.status === "Terminé" ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-400"
                )}>
                    {mission.status}
                </span >
                <MoreHorizontal className="w-4 h-4 text-slate-700 group-hover:text-white transition-colors" />
            </div>
            <h4 className="font-extrabold text-white text-sm line-clamp-1">{mission.client}</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{mission.mission}</p>

            <div className="mt-4 flex items-center justify-between">
                <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 border border-slate-900 flex items-center justify-center text-[8px] font-black text-white">{mission.collaborator[0]}</div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-600">
                    <Clock className="w-3 h-3" />
                    <span>{mission.daysActive}j</span>
                </div>
            </div>

            <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                    <span className="text-slate-600">Avancement</span>
                    <span className="text-white">{mission.progress}%</span>
                </div>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        mission.status === "Urgent" ? "bg-rose-500" : "bg-cyan-500"
                    )} style={{ width: `${mission.progress}%` }} />
                </div>
            </div>
        </div>
    );
}

function AutomationRow({ name, desc, active }: any) {
    return (
        <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-all group">
            <div className="flex items-center gap-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", active ? "bg-indigo-600/10 border-indigo-600/20 text-indigo-400" : "bg-slate-800 border-slate-700 text-slate-600")}>
                    <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-white tracking-wide">{name}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">{desc}</p>
                </div>
            </div>
            <div className={cn("w-10 h-5 rounded-full relative cursor-pointer p-1 transition-all", active ? "bg-indigo-600" : "bg-slate-700")}>
                <div className={cn("w-3 h-3 bg-white rounded-full transition-all", active ? "translate-x-5" : "translate-x-0")} />
            </div>
        </div>
    );
}

function KpiMini({ label, value, progress }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
                <p className="text-sm font-black text-white">{value}</p>
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }} />
            </div>
        </div>
    );
}

function MoreHorizontal({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
        </svg>
    )
}
