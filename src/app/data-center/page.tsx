"use client";

import { useState } from "react";
import {
    Database,
    UploadCloud,
    DownloadCloud,
    FileSpreadsheet,
    FileCode,
    RefreshCw,
    Search,
    Filter,
    ArrowRight,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Layers,
    Activity,
    HardDrive,
    Trash2,
    Sparkles,
    ShieldCheck
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

const MOCK_DATASETS: Dataset[] = [
    { id: "1", name: "FEC_2023_SIB_SENEGAL.xml", type: "FEC", size: "14.2 MB", date: "02/02/2024", status: "Importé", rows: 124500 },
    { id: "2", name: "Balance_Générale_May24_Orange.xlsx", type: "Balance", size: "1.2 MB", date: "01/02/2024", status: "Prêt", rows: 450 },
    { id: "3", name: "Extraction_Paie_H1_2023.csv", type: "Social", size: "4.5 MB", date: "28/01/2024", status: "Importé", rows: 1200 },
];

export default function DataCenterPage() {
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = () => {
        setIsUploading(true);
        setTimeout(() => setIsUploading(false), 3000);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
            {/* Header Premium - Data Center */}
            <div className="bg-slate-900/40 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                    <Database className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                                Nexus Data Engine
                            </span>
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-emerald-500/20">
                                High Integrity Imports
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            Centre de <span className="text-indigo-400">Données & Ingestion</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Importez massivement vos écritures comptables, FEC et balances. Notre moteur d'ingestion valide automatiquement la structure OHADA.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30 active:scale-95 disabled:opacity-50"
                        >
                            {isUploading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                            Importer un fichier
                        </button>
                    </div>
                </div>
            </div>

            {/* Storage & Health Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <DataKpiCard title="Stockage Utilisé" value="4.2" unit="GB" trend="de 10GB" icon={HardDrive} color="text-indigo-400" />
                <DataKpiCard title="Lignes Traitées" value="2.8M" trend="+124k ce mois" icon={Activity} color="text-emerald-400" />
                <DataKpiCard title="Intégrité Data" value="99.9" unit="%" trend="Sans erreur FEC" icon={ShieldCheck} color="text-cyan-400" />
                <DataKpiCard title="Datasets Actifs" value="142" trend="Fichiers indexés" icon={Layers} color="text-amber-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Datasets Table */}
                <div className="lg:col-span-8 glass-card rounded-[48px] border border-white/5 bg-slate-900/40 overflow-hidden shadow-2xl flex flex-col">
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
                                {MOCK_DATASETS.map((data) => (
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
                                                    data.status === "Importé" || data.status === "Prêt" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                                )}>{data.status}</span>
                                                <button className="p-2 text-slate-700 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Automation & Connectors */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="glass-card p-10 rounded-[48px] border border-white/5 bg-slate-900/40">
                        <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tighter">
                            <RefreshCw className="w-6 h-6 text-indigo-400" />
                            Connecteurs Directs
                        </h3>
                        <div className="space-y-4">
                            <ConnectorItem name="Pennylane API" status="Connecté" color="emerald" />
                            <ConnectorItem name="DGID Téléservices" status="Actif" color="emerald" />
                            <ConnectorItem name="BCEAO Market Data" status="Connecté" color="emerald" />
                            <ConnectorItem name="Banque Atlantique" status="En attente" color="amber" />
                        </div>
                        <button className="w-full mt-10 py-5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] transition-all">
                            Ajouter une intégration
                        </button>
                    </div>

                    <div className="p-10 rounded-[48px] bg-indigo-600/10 border border-indigo-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Sparkles className="w-32 h-32 text-indigo-400" />
                        </div>
                        <h4 className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-4">Optimisation IA Nexus</h4>
                        <p className="text-xs text-indigo-100/60 leading-relaxed font-medium mb-6">
                            L'IA a identifié 15.000 écritures en doublon potentiel dans le dernier import FEC. Souhaitez-vous lancer un rapport de déduplication ?
                        </p>
                        <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">
                            Analyser les Doublons
                        </button>
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
            <h3 className="text-3xl font-black text-white mt-1 tracking-tighter">{value}{unit || ""}</h3>
        </div>
    );
}

function ConnectorItem({ name, status, color }: any) {
    return (
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-indigo-500/30 transition-all">
            <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{name}</span>
            <div className="flex items-center gap-2">
                <div className={cn("w-1.5 h-1.5 rounded-full", color === "emerald" ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-amber-500 shadow-[0_0_8px_#f59e0b]")} />
                <span className={cn("text-[9px] font-black uppercase", color === "emerald" ? "text-emerald-400" : "text-amber-400")}>{status}</span>
            </div>
        </div>
    );
}
