"use client";

import { useState } from "react";
import {
    ClipboardList,
    FileText,
    Users,
    Wallet,
    Package,
    ShieldCheck,
    ArrowRight,
    Plus,
    Download,
    Link as LinkIcon,
    CheckCircle2,
    AlertCircle,
    HelpCircle,
    Zap,
    Briefcase,
    Target,
    BarChart3,
    Scale,
    Activity,
    AlertTriangle,
    Layers,
    FileCheck,
    PenTool
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
type AuditPhase = "planning" | "risk" | "execution" | "reporting";

interface RiskItem {
    id: string;
    cycle: string;
    description: string;
    inherentRisk: "High" | "Medium" | "Low";
    controlRisk: "High" | "Medium" | "Low";
    detectionRisk: string; // Calculated
}

interface WorkProgramItem {
    id: string;
    cycle: string;
    assertion: string; // Exhaustivité, Réalité, etc.
    procedure: string;
    status: "To Do" | "In Progress" | "Done" | "N/A";
    refDoc?: string;
}

// Mock Data
const INITIAL_RISKS: RiskItem[] = [
    { id: "R1", cycle: "Ventes/Clients", description: "Reconnaissance des revenus sur périodes cut-off", inherentRisk: "High", controlRisk: "Medium", detectionRisk: "Low" },
    { id: "R2", cycle: "Achats/Frs", description: "Sous-évaluation des charges passives", inherentRisk: "Medium", controlRisk: "Low", detectionRisk: "High" },
    { id: "R3", cycle: "Trésorerie", description: "Détournement d'actifs / Paiements non autorisés", inherentRisk: "High", controlRisk: "High", detectionRisk: "Low" },
];

const INITIAL_PROGRAM: WorkProgramItem[] = [
    { id: "WP1", cycle: "Trésorerie", assertion: "Réalité", procedure: "Circularisation bancaire de tous les comptes ouverts", status: "In Progress", refDoc: "B-100" },
    { id: "WP2", cycle: "Ventes", assertion: "Coupure", procedure: "Test de cut-off sur les 10 dernières factures N et 10 premières N+1", status: "To Do" },
    { id: "WP3", cycle: "Immobilisations", assertion: "Existence", procedure: "Inventaire physique des actifs fixes principaux", status: "Done", refDoc: "D-210" },
];

export default function CompleteAuditKitPage() {
    const [currentPhase, setCurrentPhase] = useState<AuditPhase>("planning");
    const [materiality, setMateriality] = useState<number>(0);
    const [risks, setRisks] = useState<RiskItem[]>(INITIAL_RISKS);
    const [program, setProgram] = useState<WorkProgramItem[]>(INITIAL_PROGRAM);

    // Materiality Calculator State
    const [ca, setCa] = useState(1500000000); // 1.5B default
    const [result, setResult] = useState(120000000); // 120M default

    const calculateMateriality = () => {
        // Simplified heuristic: 0.5% - 1% of CA or 5% of Result
        const mat = Math.round(ca * 0.0075); // 0.75% of CA
        setMateriality(mat);
    };

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
            {/* Mission Header */}
            <div className="relative p-10 rounded-[40px] bg-slate-900 border border-white/5 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-900/20 to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
                    <div>
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30">
                                <Briefcase className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-4xl font-black text-white tracking-tighter">Pilotage Mission 360°</h2>
                        </div>
                        <p className="text-slate-400 font-medium text-lg">Kit complet : De la planification au rapport final.</p>
                    </div>

                    <div className="flex gap-2 p-1 bg-slate-800/50 rounded-2xl border border-white/10">
                        <PhaseTab phase="planning" label="1. Planification" current={currentPhase} set={setCurrentPhase} icon={Target} />
                        <PhaseTab phase="risk" label="2. Risques" current={currentPhase} set={setCurrentPhase} icon={AlertTriangle} />
                        <PhaseTab phase="execution" label="3. Exécution" current={currentPhase} set={setCurrentPhase} icon={FileCheck} />
                        <PhaseTab phase="reporting" label="4. Rapport" current={currentPhase} set={setCurrentPhase} icon={PenTool} />
                    </div>
                </div>
            </div>

            {/* Dynamic Content based on Phase */}
            <div className="min-h-[500px]">
                {/* ---------------- PHASE 1: PLANNING ---------------- */}
                {currentPhase === "planning" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Seuil de Signification Calculator */}
                        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40">
                            <div className="flex items-center gap-3 mb-6">
                                <Scale className="w-6 h-6 text-indigo-400" />
                                <h3 className="text-xl font-bold text-white">Calculateur Seuil de Signification</h3>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Chiffre d'Affaires (FCFA)</label>
                                    <input
                                        type="number"
                                        value={ca}
                                        onChange={(e) => setCa(Number(e.target.value))}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Résultat Net (FCFA)</label>
                                    <input
                                        type="number"
                                        value={result}
                                        onChange={(e) => setResult(Number(e.target.value))}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <button
                                    onClick={calculateMateriality}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg transition-all"
                                >
                                    Calculer Seuil
                                </button>
                            </div>

                            {materiality > 0 && (
                                <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center animate-in zoom-in">
                                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Seuil de Signification (PM)</p>
                                    <p className="text-3xl font-black text-white mt-2">{materiality.toLocaleString()} FCFA</p>
                                    <p className="text-[10px] text-slate-400 mt-2">Seuil de remonter (5% PM) : {(materiality * 0.05).toLocaleString()} FCFA</p>
                                </div>
                            )}
                        </div>

                        {/* Chronogramme / Timeline */}
                        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 flex flex-col">
                            <div className="flex items-center gap-3 mb-6">
                                <Activity className="w-6 h-6 text-amber-400" />
                                <h3 className="text-xl font-bold text-white">Chronogramme Mission</h3>
                            </div>
                            <div className="space-y-6 flex-1">
                                <TimelineItem step={1} title="Prise de connaissance" date="J-15" status="Done" />
                                <TimelineItem step={2} title="Acceptation Mission & NEP" date="J-10" status="Done" />
                                <TimelineItem step={3} title="Interim (Contrôle Interne)" date="J-5" status="In Progress" active />
                                <TimelineItem step={4} title="Inventaire Physique" date="J-0" status="Scheduled" />
                                <TimelineItem step={5} title="Contrôle des Comptes" date="J+20" status="Scheduled" />
                            </div>
                        </div>
                    </div>
                )}

                {/* ---------------- PHASE 2: RISKS ---------------- */}
                {currentPhase === "risk" && (
                    <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-white/5 bg-slate-900/40 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <AlertTriangle className="w-6 h-6 text-rose-400" />
                                Matrice des Risques (Approche par les Risques)
                            </h3>
                            <button className="px-4 py-2 bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-600/50 rounded-xl text-xs font-black uppercase transition-all">
                                + Ajouter Risque
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-900/80 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-8 py-6">Cycle / Description</th>
                                        <th className="px-6 py-6 text-center">Risque Inhérent</th>
                                        <th className="px-6 py-6 text-center">Risque Contrôle</th>
                                        <th className="px-6 py-6 text-center">Risque Détection</th>
                                        <th className="px-6 py-6 text-right">Impact Audit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {risks.map((risk) => (
                                        <tr key={risk.id} className="hover:bg-white/[0.02]">
                                            <td className="px-8 py-6">
                                                <span className="block text-xs font-bold text-indigo-400 uppercase mb-1">{risk.cycle}</span>
                                                <span className="text-sm font-medium text-white">{risk.description}</span>
                                            </td>
                                            <td className="px-6 py-6 text-center"><RiskBadge level={risk.inherentRisk} /></td>
                                            <td className="px-6 py-6 text-center"><RiskBadge level={risk.controlRisk} /></td>
                                            <td className="px-6 py-6 text-center text-xs font-bold text-slate-500">
                                                {(risk.inherentRisk === "High" || risk.controlRisk === "High") ? "Faible (Tests Étendus)" : "Élevé (Tests Allégés)"}
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <button className="text-xs font-bold text-white hover:underline">Voir Programme →</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ---------------- PHASE 3: EXECUTION ---------------- */}
                {currentPhase === "execution" && (
                    <div className="space-y-6">
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {["Tous", "Ventes", "Achats", "Trésorerie", "Immos", "Paie", "Stocks"].map(cycle => (
                                <button key={cycle} className="px-6 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider hover:bg-slate-800 transition-all focus:bg-indigo-600 focus:text-white focus:border-indigo-500">
                                    {cycle}
                                </button>
                            ))}
                        </div>

                        <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl">
                            <div className="p-8 border-b border-white/5 bg-slate-900/40 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                    <FileCheck className="w-6 h-6 text-emerald-400" />
                                    Programme de Travail (Work Program)
                                </h3>
                                <div className="text-xs font-black text-slate-500 uppercase tracking-widest bg-slate-950 px-3 py-1 rounded-lg">
                                    Progression: 35%
                                </div>
                            </div>

                            <div className="divide-y divide-white/5">
                                {program.map((item) => (
                                    <div key={item.id} className="p-6 hover:bg-white/[0.02] flex items-center gap-6 group">
                                        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center shrink-0">
                                            {item.status === "Done" ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <div className="w-3 h-3 rounded-full bg-slate-700" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 uppercase">{item.cycle}</span>
                                                <span className="text-[10px] font-black text-slate-600 uppercase border border-slate-700 px-2 py-0.5 rounded">{item.assertion}</span>
                                            </div>
                                            <p className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors">{item.procedure}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {item.refDoc ? (
                                                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10 flex items-center gap-2">
                                                    <LinkIcon className="w-3 h-3" /> {item.refDoc}
                                                </span>
                                            ) : (
                                                <button className="text-xs font-bold text-slate-500 hover:text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Download className="w-3 h-3" /> Lier Feuille
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ---------------- PHASE 4: REPORTING ---------------- */}
                {currentPhase === "reporting" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="glass-card p-10 rounded-[40px] border border-white/5 bg-slate-900/40 flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
                                <FileText className="w-10 h-10 text-indigo-400" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">Rapport Général</h3>
                            <p className="text-slate-400 text-sm mb-8 max-w-xs">Générer le rapport d'audit complet incluant l'opinion, les états financiers certifiés et les notes annexes.</p>
                            <button className="px-8 py-4 bg-white text-indigo-900 font-black uppercase tracking-widest text-xs rounded-2xl hover:scale-105 transition-all shadow-xl">
                                Générer Rapport (Word)
                            </button>
                        </div>

                        <div className="glass-card p-10 rounded-[40px] border border-white/5 bg-slate-900/40 flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                                <ShieldCheck className="w-10 h-10 text-emerald-400" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">Lettre de Contrôle Interne</h3>
                            <p className="text-slate-400 text-sm mb-8 max-w-xs">Générer la lettre de recommandations avec les faiblesses détectées et les suggestions d'amélioration.</p>
                            <button className="px-8 py-4 bg-emerald-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20">
                                Générer LCI (PDF)
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function PhaseTab({ phase, label, current, set, icon: Icon }: any) {
    const isActive = current === phase;
    return (
        <button
            onClick={() => set(phase)}
            className={cn(
                "px-6 py-4 rounded-xl flex items-center gap-3 transition-all relative overflow-hidden",
                isActive ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
        >
            <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-500")} />
            <span className="text-xs font-black uppercase tracking-widest">{label}</span>
            {isActive && <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20" />}
        </button>
    );
}

function TimelineItem({ step, title, date, status, active }: any) {
    return (
        <div className="flex items-center gap-4 relative">
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 z-10",
                status === "Done" ? "bg-emerald-500 text-white border-emerald-500" :
                    active ? "bg-amber-500 text-slate-900 border-amber-500 animate-pulse" :
                        "bg-slate-800 text-slate-500 border-slate-700"
            )}>
                {status === "Done" ? <CheckCircle2 className="w-4 h-4" /> : step}
            </div>
            {step < 5 && <div className="absolute top-8 left-4 w-px h-8 bg-white/10 -z-0" />}

            <div className="flex-1 p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                <span className={cn("text-sm font-bold", active ? "text-white" : "text-slate-400")}>{title}</span>
                <span className="text-xs font-mono text-slate-500">{date}</span>
            </div>
        </div>
    );
}

function RiskBadge({ level }: { level: string }) {
    return (
        <span className={cn(
            "px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider border",
            level === "High" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                level === "Medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        )}>
            {level === "High" ? "Élevé" : level === "Medium" ? "Moyen" : "Faible"}
        </span>
    );
}
