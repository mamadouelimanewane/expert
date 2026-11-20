"use client";

import { useState, useEffect } from "react";
import {
    ShieldCheck,
    Zap,
    Target,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    ArrowRight,
    Download,
    Calculator,
    FileText,
    BarChart3,
    Lightbulb,
    Wand2,
    Loader2,
    Lock,
    Scale,
    Globe,
    FileSearch,
    BrainCircuit,
    Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FiscalRisk {
    id: string;
    title: string;
    description: string;
    level: "FAIBLE" | "MOYEN" | "ELEVE";
    status: "IDENTIFIE" | "EN_TRAITEMENT" | "RESOLU";
    potentialImpact: number | null;
    createdAt: string;
}

interface TaxRegimeRow {
    regime: string;
    label: string;
    baseImposable: number;
    baseLabel: string;
    estimatedTax: number;
}

interface Declaration {
    id: string;
    type: string;
    status: string;
    period: string;
    dueDate: string;
}

const LEVEL_LABEL: Record<string, string> = { FAIBLE: "faible", MOYEN: "moyen", ELEVE: "élevé" };
const STATUS_LABEL: Record<string, string> = { IDENTIFIE: "Identifié", EN_TRAITEMENT: "En traitement", RESOLU: "Résolu" };

export default function NexusTaxIntelligencePage() {
    const [activeTab, setActiveTab] = useState<"audit" | "optimisation" | "integrity">("audit");
    const [clients, setClients] = useState<any[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>("");
    const [client, setClient] = useState<any>(null);
    const [risks, setRisks] = useState<FiscalRisk[]>([]);
    const [declarations, setDeclarations] = useState<Declaration[]>([]);
    const [taxRegimeComparison, setTaxRegimeComparison] = useState<TaxRegimeRow[] | null>(null);
    const [comparatifIndisponible, setComparatifIndisponible] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isScanning, setIsScanning] = useState(false);
    const [scanMessage, setScanMessage] = useState<string | null>(null);

    const loadData = (clientId?: string) => {
        setLoading(true);
        const url = clientId ? `/api/fiscalite/risks?clientId=${clientId}` : "/api/fiscalite/risks";
        fetch(url)
            .then(r => r.json())
            .then(d => {
                setClients(d.clients || []);
                setSelectedClientId(d.selectedClientId || "");
                setClient(d.client || null);
                setRisks(d.risks || []);
                setDeclarations(d.declarations || []);
                setTaxRegimeComparison(d.taxRegimeComparison || null);
                setComparatifIndisponible(d.taxRegimeComparisonUnavailable || null);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const runAnalysis = async () => {
        if (!selectedClientId) return;
        setIsScanning(true);
        setScanMessage(null);
        try {
            const res = await fetch("/api/fiscalite/risks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "scan", clientId: selectedClientId }),
            });
            const data = await res.json();
            if (data.error) {
                setScanMessage(data.error);
            } else if (data.created === 0) {
                setScanMessage(`Analyse terminée : ${data.declarationsChecked} déclaration(s) vérifiée(s), aucun nouveau risque identifié.`);
            } else {
                setScanMessage(`Analyse terminée : ${data.created} nouveau(x) risque(s) fiscal(aux) identifié(s).`);
            }
            loadData(selectedClientId);
        } finally {
            setIsScanning(false);
        }
    };

    const updateRiskStatus = async (id: string, status: string) => {
        await fetch("/api/fiscalite/risks", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status }),
        });
        loadData(selectedClientId);
    };

    const upcomingDeclarations = declarations
        .filter(d => d.status === "PENDING" || d.status === "DRAFT")
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5);

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Elite Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/20 p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <Scale className="w-64 h-64 text-rose-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-rose-500/20">
                                NEXUS Premium
                            </span>
                            <span className="px-3 py-1 bg-slate-500/10 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-slate-500/20">
                                Global Tax & Integrity
                            </span>
                        </div>
                        <h2 className="page-title leading-tight">
                            Nexus <span className="text-rose-400">Tax Intelligence</span>
                        </h2>
                        <p className="page-subtitle">
                            Suivi des risques fiscaux et cadrage des régimes d'imposition OHADA à partir des données réelles du client.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <select
                            value={selectedClientId}
                            onChange={(e) => loadData(e.target.value)}
                            className="bg-white/5 border border-white/10 text-white rounded-2xl px-6 py-4 text-xs font-bold focus:ring-rose-500 focus:border-rose-500 outline-none transition-all hover:bg-white/10"
                        >
                            {clients.length === 0 && <option>Aucun client</option>}
                            {clients.map(c => (
                                <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={runAnalysis}
                            disabled={isScanning || !selectedClientId}
                            className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-rose-600/30 active:scale-95 disabled:opacity-50">
                            {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                            {isScanning ? "Analyse en cours..." : "Analyser les Risques"}
                        </button>
                    </div>
                </div>
                {scanMessage && (
                    <div className="relative z-10 mt-6 p-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-slate-300">
                        {scanMessage}
                    </div>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="tabs-scroll flex gap-2 p-1.5 bg-slate-900/50 border border-white/5 rounded-[24px] w-fit">
                {[
                    { id: "audit", label: "Intégrité & Risques", icon: ShieldCheck },
                    { id: "optimisation", label: "Cadrage des Régimes", icon: Target },
                    { id: "integrity", label: "Cadrage Global", icon: Layers },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3",
                            activeTab === tab.id ? "bg-rose-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                        )}
                    >
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="h-[400px] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-rose-500" /></div>
            ) : activeTab === "audit" ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Risk Grid */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <div className="flex justify-between items-center px-4">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Tableau des Risques : {client?.name || "—"}</h3>
                            <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest bg-rose-500/5 px-4 py-2 rounded-full border border-rose-500/10">
                                {risks.length} Risque(s) Identifié(s)
                            </div>
                        </div>

                        <div className="space-y-4">
                            {risks.map((risk) => (
                                <div key={risk.id} className="apix-card group hover:border-rose-500/20 transition-all">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 transition-all",
                                                risk.level === "ELEVE" ? "bg-rose-500/10 border-rose-500/20" : "bg-slate-800"
                                            )}>
                                                <AlertTriangle className={cn("w-6 h-6", risk.level === "ELEVE" ? "text-rose-400" : "text-slate-400")} />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-white">{risk.title}</h4>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{STATUS_LABEL[risk.status]} • {new Date(risk.createdAt).toLocaleDateString("fr-FR")}</p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase border",
                                            risk.level === "ELEVE" ? "bg-rose-500/20 border-rose-500/30 text-rose-400" :
                                                risk.level === "MOYEN" ? "bg-amber-500/20 border-amber-500/30 text-amber-400" :
                                                    "bg-slate-800 border-white/5 text-slate-400"
                                        )}>
                                            Impact {LEVEL_LABEL[risk.level]}
                                        </div>
                                    </div>

                                    {risk.potentialImpact != null && (
                                        <div className="mb-6 p-4 bg-black/20 rounded-2xl border border-white/5 w-fit">
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Impact Financier Estimé</p>
                                            <p className="text-sm font-black text-rose-400">{risk.potentialImpact.toLocaleString("fr-FR")} FCFA</p>
                                        </div>
                                    )}

                                    <p className="text-xs text-slate-400 leading-relaxed mb-6 italic">
                                        "{risk.description}"
                                    </p>

                                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                        <span className="text-[9px] font-black uppercase text-slate-500">Statut : {STATUS_LABEL[risk.status]}</span>
                                        <div className="flex gap-2">
                                            {risk.status === "IDENTIFIE" && (
                                                <button onClick={() => updateRiskStatus(risk.id, "EN_TRAITEMENT")} className="px-6 py-2 bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 text-[9px] font-black uppercase rounded-xl border border-amber-500/20 transition-all">
                                                    Mettre en traitement
                                                </button>
                                            )}
                                            {risk.status === "EN_TRAITEMENT" && (
                                                <button onClick={() => updateRiskStatus(risk.id, "RESOLU")} className="px-6 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 text-[9px] font-black uppercase rounded-xl border border-emerald-500/20 transition-all">
                                                    Marquer résolu
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {risks.length === 0 && (
                                <div className="apix-card text-center">
                                    <ShieldCheck className="w-14 h-14 text-slate-700 mx-auto mb-4" />
                                    <p className="text-white font-bold">Aucun risque fiscal identifié</p>
                                    <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">Lancez « Analyser les Risques » pour vérifier les déclarations et le CA de ce client.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="apix-card">
                            <h4 className="text-sm font-black text-white mb-6 uppercase tracking-widest">Calendrier des Obligations</h4>
                            <div className="space-y-4">
                                {upcomingDeclarations.length === 0 && (
                                    <p className="text-xs text-slate-500">Aucune déclaration en attente enregistrée pour ce client.</p>
                                )}
                                {upcomingDeclarations.map((item) => {
                                    const late = new Date(item.dueDate) < new Date();
                                    return (
                                        <div key={item.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                            <div>
                                                <p className="text-[10px] text-white font-bold">Déclaration {item.type} — {item.period}</p>
                                                <p className="text-[9px] text-slate-500">{new Date(item.dueDate).toLocaleDateString("fr-FR")}</p>
                                            </div>
                                            <div className={cn("w-2 h-2 rounded-full", late ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" : "bg-slate-600")} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            ) : activeTab === "optimisation" ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-4 space-y-6">
                        <div className="apix-card">
                            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Comparatif des Régimes Fiscaux</h3>
                            <p className="text-xs text-slate-500 mb-8">
                                Le comparatif ne s’affiche qu’avec des barèmes et critères d’éligibilité vérifiés pour le pays et l’exercice de {client?.name || "ce client"} ({client?.country || "—"}).
                            </p>
                            {!taxRegimeComparison ? (
                                <div className="p-8 text-center">
                                    <FileSearch className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                    <p className="text-sm text-slate-500">{comparatifIndisponible || "Aucune donnée ou règle fiscale vérifiée n’est disponible pour ce client."}</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="apix-table w-full text-left">
                                        <thead className="border-b border-white/5">
                                            <tr>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Régime</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Base Imposable</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Charge d'Impôt Estimée</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Régime Actuel du Client</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {taxRegimeComparison.map((row) => (
                                                <tr key={row.regime} className={cn("hover:bg-white/5 transition-all", row.regime === client?.fiscalRegime && "bg-emerald-500/5")}>
                                                    <td className="px-6 py-5 text-sm font-bold text-white">{row.label}</td>
                                                    <td className="px-6 py-5 text-sm font-mono text-slate-400 text-right">{row.baseImposable.toLocaleString("fr-FR")} <span className="text-[9px] uppercase">({row.baseLabel})</span></td>
                                                    <td className="px-6 py-5 text-sm font-black text-white text-right">{row.estimatedTax.toLocaleString("fr-FR")} FCFA</td>
                                                    <td className="px-6 py-5 text-center">
                                                        {row.regime === client?.fiscalRegime && <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg font-black text-[10px]">Régime actuel</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="apix-card">
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Toute analyse d’optimisation fiscale doit être étayée par le texte national applicable, les données du client et une revue de l’expert-comptable. Les estimations génériques sont désactivées.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 glass-card rounded-[40px] p-4 sm:p-6 lg:p-10 border border-white/5 bg-slate-900/40 min-h-[280px] sm:h-[350px] lg:h-[400px] flex items-center justify-center border-dashed">
                        <div className="text-center">
                            <Globe className="w-16 h-16 text-slate-700 mx-auto mb-6" />
                            <h3 className="text-xl font-black text-slate-500 uppercase">Cadrage Fiscal Multi-Zones</h3>
                            <p className="text-sm text-slate-600 max-w-sm mt-2">La consolidation fiscale multi-filiales UEMOA/CEMAC n'est pas encore disponible dans ce module.</p>
                        </div>
                    </div>
                    <div className="apix-card self-start">
                        <div className="flex items-center gap-3 mb-4">
                            <Lock className="w-5 h-5 text-slate-500" />
                            <h4 className="text-sm font-black text-white uppercase tracking-widest">Intégrité des Données</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                            Les risques et déclarations affichés proviennent directement des enregistrements réels de la base de données du cabinet.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
