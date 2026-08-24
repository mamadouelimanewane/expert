"use client";

import { useState, useEffect } from "react";
import {
    Database,
    UploadCloud,
    FileSpreadsheet,
    FileCode,
    RefreshCw,
    Search,
    Layers,
    Activity,
    HardDrive,
    Trash2,
    Sparkles,
    ShieldCheck,
    AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Dataset {
    id: string;
    name: string;
    type: "FEC" | "Grand Livre" | "Balance" | "Social";
    size: string;
    date: string;
    status: "Importé" | "Traitement..." | "Erreur" | "Prêt";
    rows: number;
}

interface Kpis {
    totalDatasets: number;
    totalStorageBytes: number;
    totalRows: number;
    successRatePct: number | null;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
}

export default function DataCenterPage() {
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [kpis, setKpis] = useState<Kpis | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDatasets = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/data/datasets");
                const data = await res.json();
                if (!res.ok || data.error) {
                    setError(data.error || "Erreur lors du chargement des datasets.");
                    return;
                }
                setDatasets(data.datasets || []);
                setKpis(data.kpis || null);
            } catch (e) {
                console.error("Failed to fetch datasets", e);
                setError("Erreur de connexion au serveur.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchDatasets();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
            {/* Header Premium - Data Center */}
            <div className="bg-slate-900/40 p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 sm:p-8 lg:p-16 opacity-5 pointer-events-none">
                    <Database className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                                Nexus Data Engine
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            Centre de <span className="text-indigo-400">Données & Ingestion</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Importez vos écritures comptables, FEC et balances. Historique et statistiques basés sur les documents réellement enregistrés au cabinet.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button disabled title="Non implémenté : utilisez le module Scan OCR pour importer une pièce" className="px-8 py-4 bg-white/5 text-white/40 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 cursor-not-allowed">
                            <UploadCloud className="w-5 h-5" />
                            Importer un fichier
                        </button>
                    </div>
                </div>
            </div>

            {/* Storage & Health Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <DataKpiCard title="Stockage Utilisé" value={kpis ? formatBytes(kpis.totalStorageBytes) : "—"} trend="Documents indexés" icon={HardDrive} color="text-indigo-400" />
                <DataKpiCard title="Lignes Traitées (OCR)" value={kpis ? kpis.totalRows.toLocaleString("fr-FR") : "—"} trend="Cumul détecté" icon={Activity} color="text-emerald-400" />
                <DataKpiCard title="Taux de Traitement Réussi" value={kpis && kpis.successRatePct !== null ? `${kpis.successRatePct}%` : "—"} trend="Hors erreurs OCR" icon={ShieldCheck} color="text-cyan-400" />
                <DataKpiCard title="Datasets Actifs" value={kpis ? kpis.totalDatasets : "—"} trend="Documents indexés" icon={Layers} color="text-amber-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Datasets Table */}
                <div className="lg:col-span-8 glass-card rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border border-white/5 bg-slate-900/40 overflow-hidden shadow-2xl flex flex-col">
                    <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900/60">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                            <FileSpreadsheet className="w-6 h-6 text-indigo-400" />
                            Historique des Ingestions
                        </h3>
                        <div className="flex gap-2 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input placeholder="Filtrer..." className="bg-slate-950/50 border border-white/5 rounded-2xl pl-12 pr-6 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500/50 outline-none w-64" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/80 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-6">Fichier</th>
                                    <th className="px-6 py-6 text-center">Type</th>
                                    <th className="px-6 py-6 text-center">Volume</th>
                                    <th className="px-6 py-6">Date</th>
                                    <th className="px-8 py-6 text-right">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-4" />
                                            <p className="text-slate-400 font-bold">Chargement des documents...</p>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-4" />
                                            <p className="text-slate-300 text-sm max-w-md mx-auto">{error}</p>
                                        </td>
                                    </tr>
                                ) : datasets.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                                            Aucun dataset identifié.
                                        </td>
                                    </tr>
                                ) : (
                                    datasets.map((data) => (
                                        <tr key={data.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2.5 bg-slate-800 rounded-xl border border-white/5 text-slate-400 group-hover:text-indigo-400 transition-colors">
                                                        <FileCode className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-slate-200 block group-hover:text-white transition-colors">{data.name}</span>
                                                        <span className="text-[10px] text-slate-500 font-bold uppercase">{data.size}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center text-xs font-black text-slate-400">{data.type}</td>
                                            <td className="px-6 py-6 text-center">
                                                <span className="text-indigo-400 font-mono text-xs font-black">{data.rows.toLocaleString()}</span>
                                                <p className="text-[8px] text-slate-600 font-black uppercase">Lignes</p>
                                            </td>
                                            <td className="px-6 py-6 text-xs text-slate-500 font-bold">{data.date}</td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-4">
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase px-2 py-0.5 rounded border",
                                                        data.status === "Importé" || data.status === "Prêt" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                            data.status === "Erreur" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                                                "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                                    )}>{data.status}</span>
                                                    <button className="p-2 text-slate-700 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table></div>
                    </div>
                </div>

                {/* Automation & Connectors */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="glass-card p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border border-white/5 bg-slate-900/40">
                        <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tighter">
                            <RefreshCw className="w-6 h-6 text-indigo-400" />
                            Connecteurs Directs
                        </h3>
                        <div className="space-y-4">
                            <ConnectorItem name="Pennylane API" />
                            <ConnectorItem name="DGID Téléservices" />
                            <ConnectorItem name="BCEAO Market Data" />
                            <ConnectorItem name="Banque Atlantique" />
                        </div>
                        <button disabled title="Aucun connecteur tiers n'est encore implémenté" className="w-full mt-10 py-5 bg-white/5 border border-white/10 text-white/50 rounded-3xl font-black uppercase tracking-widest text-[10px] cursor-not-allowed transition-all">
                            Ajouter une intégration (bientôt disponible)
                        </button>
                    </div>

                    <div className="p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] bg-amber-500/5 border border-amber-500/20 relative overflow-hidden">
                        <h4 className="text-amber-400 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Détection de Doublons IA
                        </h4>
                        <p className="text-xs text-amber-400/70 leading-relaxed font-medium">
                            Le moteur de détection de doublons par IA n'est pas encore configuré — aucune analyse automatique des écritures dupliquées n'est disponible pour l'instant.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DataKpiCard({ title, value, unit, trend, icon: Icon, color }: any) {
    return (
        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 group hover:bg-slate-900/60 transition-all">
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-3xl bg-white/5 transition-transform group-hover:scale-110", color)}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-black px-3 py-1 bg-white/5 rounded-full text-slate-500 uppercase">
                    {trend}
                </div>
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{title}</p>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mt-1 tracking-tighter">{value}{unit || ""}</h3>
        </div>
    );
}

function ConnectorItem({ name }: { name: string }) {
    return (
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group opacity-70">
            <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{name}</span>
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                <span className="text-[9px] font-black uppercase text-slate-500">Non connecté</span>
            </div>
        </div>
    );
}
