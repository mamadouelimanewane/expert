"use client";

import { useState } from "react";
import {
    GitMerge,
    Workflow,
    Mail,
    FileText,
    CheckCircle,
    Clock,
    Users,
    ArrowRight,
    Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

type TriggerType = "document_upload" | "status_change" | "date_due";
type ActionType = "send_email" | "create_task" | "notify_manager";

interface AutomationRule {
    id: string;
    name: string;
    trigger: TriggerType;
    action: ActionType;
    active: boolean;
}

const MOCK_AUTOMATIONS: AutomationRule[] = [
    { id: "1", name: "Accusé de réception automatique", trigger: "document_upload", action: "send_email", active: true },
    { id: "2", name: "Alerte Échéance TVA (J-3)", trigger: "date_due", action: "notify_manager", active: true },
    { id: "3", name: "Onboarding Nouveau Client", trigger: "status_change", action: "create_task", active: false },
];

export default function AutomationPage() {
    const [automations, setAutomations] = useState(MOCK_AUTOMATIONS);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Workflow className="w-8 h-8 text-cyan-400" />
                        Workflows Automatisés
                    </h2>
                    <p className="text-slate-400 mt-1">Concepteur de scénarios pour automatiser les tâches répétitives.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Nouveau Scénario
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Flow Builder Preview */}
                <div className="lg:col-span-2 glass-card rounded-2xl border border-slate-700/50 p-8 relative overflow-hidden bg-slate-900/50">
                    {/* Grid Pattern Background */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />

                    <div className="relative z-10 flex flex-col items-center gap-8">

                        {/* Step 1: Trigger */}
                        <div className="w-64 p-4 bg-slate-800 border-2 border-slate-700 rounded-xl shadow-xl flex items-center gap-3 relative group hover:border-cyan-400 transition-colors cursor-pointer">
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Déclencheur</span>
                                <p className="font-bold text-white">Document reçu</p>
                            </div>
                            {/* Connector Line Vertical */}
                            <div className="absolute h-8 w-0.5 bg-slate-600 -bottom-10 left-1/2 -translate-x-1/2" />
                        </div>

                        {/* Step 2: Logic with Arrow */}
                        <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center z-20">
                            <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />
                        </div>

                        {/* Step 3: Action */}
                        <div className="w-64 p-4 bg-slate-800 border-2 border-slate-700 rounded-xl shadow-xl flex items-center gap-3 relative group hover:border-purple-400 transition-colors cursor-pointer">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Action</span>
                                <p className="font-bold text-white">Assigner Collab.</p>
                            </div>
                            <div className="absolute h-8 w-0.5 bg-slate-600 -bottom-10 left-1/2 -translate-x-1/2" />
                        </div>

                        <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center z-20">
                            <GitMerge className="w-4 h-4 text-slate-400 rotate-90" />
                        </div>

                        {/* Step 4: Parallel Actions */}
                        <div className="flex gap-8">
                            <div className="w-48 p-3 bg-slate-800 border-2 border-slate-700 rounded-xl shadow-xl opacity-75">
                                <div className="flex items-center gap-2 mb-1">
                                    <Mail className="w-4 h-4 text-indigo-400" />
                                    <span className="text-xs font-bold text-slate-300">Email Client</span>
                                </div>
                                <p className="text-xs text-slate-500">"Bien reçu..."</p>
                            </div>
                            <div className="w-48 p-3 bg-slate-800 border-2 border-slate-700 rounded-xl shadow-xl opacity-75">
                                <div className="flex items-center gap-2 mb-1">
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                    <span className="text-xs font-bold text-slate-300">Mettre à jour statut</span>
                                </div>
                                <p className="text-xs text-slate-500">-&gt; "En cours"</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Existing Automations List */}
                <div className="glass-card rounded-2xl border border-slate-700/50 p-6 flex flex-col">
                    <h3 className="font-bold text-white mb-4">Mes Automatisations</h3>
                    <div className="flex-1 space-y-4">
                        {automations.map(auto => (
                            <div key={auto.id} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors group">
                                <div className="flex justify-between items-center mb-2">
                                    <span className={cn(
                                        "w-2 h-2 rounded-full",
                                        auto.active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-600"
                                    )} />
                                    <div className="h-4 w-8 bg-slate-900 rounded-full border border-slate-700 relative cursor-pointer" onClick={() => {
                                        const newAutos = automations.map(a => a.id === auto.id ? { ...a, active: !a.active } : a);
                                        setAutomations(newAutos);
                                    }}>
                                        <div className={cn(
                                            "absolute top-0.5 w-3 h-3 rounded-full transition-all",
                                            auto.active ? "right-0.5 bg-emerald-500" : "left-0.5 bg-slate-500"
                                        )} />
                                    </div>
                                </div>
                                <h4 className="font-semibold text-slate-200 text-sm">{auto.name}</h4>
                                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                    <span className="px-1.5 py-0.5 bg-slate-900 rounded border border-slate-700">{auto.trigger}</span>
                                    <ArrowRight className="w-3 h-3" />
                                    <span className="px-1.5 py-0.5 bg-slate-900 rounded border border-slate-700">{auto.action}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-700 text-center">
                        <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">Voir les modèles de la communauté</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
