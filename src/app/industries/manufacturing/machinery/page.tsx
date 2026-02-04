"use client";

import { useState } from "react";
import {
    Cog,
    Wrench,
    AlertTriangle,
    CheckCircle2,
    Search,
    Filter,
    ArrowLeft,
    BarChart3,
    Calendar,
    Thermometer,
    Zap,
    History,
    FileText,
    QrCode
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const MACHINERY_PARK = [
    {
        id: "M001",
        name: "Extrudeuse Plastique #A1",
        model: "KraussMaffei 3000",
        zone: "Zone Production A",
        status: "Running",
        health: 98,
        maintenanceDate: "15/01/2026",
        nextMaintenance: "15/07/2026",
        vnc: "45M FCFA",
        utilization: "85%"
    },
    {
        id: "M002",
        name: "Broyeur Industriel XR",
        model: "Vecoplan VAZ 1600",
        zone: "Zone Recyclage",
        status: "Warning",
        health: 65,
        maintenanceDate: "12/11/2025",
        nextMaintenance: "28/02/2026",
        vnc: "12M FCFA",
        utilization: "92%"
    },
    {
        id: "M003",
        name: "Ligne d'Embouteillage",
        model: "Krones VarioPac",
        zone: "Zone Conditionnement",
        status: "Stopped",
        health: 20,
        maintenanceDate: "01/02/2026",
        nextMaintenance: "Urgent",
        vnc: "120M FCFA",
        utilization: "0%"
    },
    {
        id: "M004",
        name: "Groupe Froid Industriel",
        model: "Trane RTAF",
        zone: "Local Technique",
        status: "Running",
        health: 95,
        maintenanceDate: "20/12/2025",
        nextMaintenance: "20/06/2026",
        vnc: "18M FCFA",
        utilization: "60%"
    }
];

export default function MachineryInventoryPage() {
    const [selectedMachine, setSelectedMachine] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-6 border-b border-white/5">
                <div>
                    <Link href="/industries/manufacturing" className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-xs font-bold tracking-widest uppercase mb-4 hover:bg-slate-700 transition-colors">
                        <ArrowLeft className="w-3 h-3" /> Retour Industrie
                    </Link>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        <Cog className="w-10 h-10 text-amber-500" />
                        Inventaire Parc Machines
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl text-lg">
                        Suivi technique et comptable des outils de production. Maintenance, VNC et taux d'utilisation.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10 flex items-center gap-2">
                        <QrCode className="w-4 h-4" /> Scan QR
                    </button>
                    <button className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-600/25 flex items-center gap-2">
                        <Wrench className="w-4 h-4" /> Planifier Maintenance
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard title="Valeur Parc (VNC)" value="845M FCFA" icon={BarChart3} color="text-emerald-400" />
                <MetricCard title="Taux Disponibilité" value="94.2%" icon={CheckCircle2} color="text-sky-400" />
                <MetricCard title="Alertes Maintenance" value="3 Machines" icon={Wrench} color="text-amber-400" />
                <MetricCard title="Conso. Énergie" value="12.5 GWh" icon={Zap} color="text-rose-400" />
            </div>

            {/* Main Content: Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Machine List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-xl border border-white/5 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input type="text" placeholder="Rechercher machine (Nom, Série, Zone)..." className="w-full bg-transparent border-none text-sm text-white pl-10 focus:ring-0" />
                        </div>
                        <button className="p-2 text-slate-400 hover:text-white"><Filter className="w-4 h-4" /></button>
                    </div>

                    <div className="space-y-4">
                        {MACHINERY_PARK.map((machine) => (
                            <div
                                key={machine.id}
                                onClick={() => setSelectedMachine(machine.id)}
                                className={cn(
                                    "glass-card p-6 rounded-2xl border transition-all cursor-pointer hover:bg-slate-900/60 flex flex-col md:flex-row gap-6 items-start md:items-center",
                                    selectedMachine === machine.id ? "bg-slate-800/60 border-amber-500/50" : "bg-slate-900/20 border-white/5"
                                )}
                            >
                                <div className={cn(
                                    "w-16 h-16 rounded-xl flex items-center justify-center shrink-0 border",
                                    machine.status === "Running" ? "bg-emerald-500/10 border-emerald-500/20" :
                                        machine.status === "Warning" ? "bg-amber-500/10 border-amber-500/20" :
                                            "bg-rose-500/10 border-rose-500/20"
                                )}>
                                    <Cog className={cn("w-8 h-8 animate-spin-slow",
                                        machine.status === "Running" ? "text-emerald-500" :
                                            machine.status === "Warning" ? "text-amber-500" : "text-rose-500"
                                    )} style={{ animationDuration: machine.status === "Stopped" ? "0s" : "3s" }} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-bold text-white truncate">{machine.name}</h3>
                                        <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-white/5">{machine.id}</span>
                                    </div>
                                    <p className="text-sm text-slate-400 mb-2">{machine.model} • {machine.zone}</p>
                                    <div className="flex gap-4 text-xs font-mono text-slate-500">
                                        <span>VNC: <span className="text-white">{machine.vnc}</span></span>
                                        <span>Utilisation: <span className={cn(
                                            parseInt(machine.utilization) > 80 ? "text-emerald-400" : "text-amber-400"
                                        )}>{machine.utilization}</span></span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <StatusBadge status={machine.status} />
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                                        <Calendar className="w-3 h-3" /> Maint.: {machine.maintenanceDate}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Machine Detail Panel */}
                <div className="glass-card rounded-[32px] border border-white/5 bg-slate-950/40 p-8 h-fit sticky top-8">
                    {selectedMachine ? (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Détails Machine</p>
                                <h2 className="text-2xl font-black text-white leading-tight mb-1">
                                    {MACHINERY_PARK.find(m => m.id === selectedMachine)?.name}
                                </h2>
                                <p className="text-sm text-amber-500 font-mono">
                                    Série #KW-998-2024-X
                                </p>
                            </div>

                            <div className="p-4 bg-slate-900 rounded-2xl border border-white/5 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-400">État de Santé</span>
                                    <span className="text-lg font-bold text-white">{MACHINERY_PARK.find(m => m.id === selectedMachine)?.health}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full transition-all duration-1000",
                                            (MACHINERY_PARK.find(m => m.id === selectedMachine)?.health || 0) > 80 ? "bg-emerald-500" : "bg-rose-500"
                                        )}
                                        style={{ width: `${MACHINERY_PARK.find(m => m.id === selectedMachine)?.health}%` }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-bold text-white flex items-center gap-2">
                                    <History className="w-4 h-4 text-slate-500" /> Historique
                                </h4>
                                {[
                                    { date: "15/01/2026", type: "Maintenance Préventive", user: "Tech. A" },
                                    { date: "10/12/2025", type: "Remplacement Filtres", user: "Tech. B" },
                                    { date: "05/08/2025", type: "Calibrage Annuel", user: "Ext. Service" },
                                ].map((log, i) => (
                                    <div key={i} className="flex gap-4 relative">
                                        <div className="absolute top-0 bottom-0 left-[5px] w-[2px] bg-slate-800 -z-10" />
                                        <div className="w-3 h-3 rounded-full bg-slate-700 mt-1.5 border border-slate-900 shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-white">{log.type}</p>
                                            <p className="text-[10px] text-slate-500">{log.date} • {log.user}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                <FileText className="w-4 h-4" /> Voir Fiche Technique
                            </button>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                            <Cog className="w-24 h-24 text-slate-700 mb-4 animate-spin-slow" style={{ animationDuration: "10s" }} />
                            <p className="text-slate-500 font-bold">Sélectionnez une machine pour voir les détails techniques et l'historique.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon: Icon, color }: any) {
    return (
        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-slate-900/40">
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-2 rounded-lg bg-white/5", color)}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">{title}</p>
            <h3 className="text-2xl font-black text-white">{value}</h3>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === "Running") {
        return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> En Production</span>;
    }
    if (status === "Warning") {
        return <span className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-500/20 flex items-center gap-2"><AlertTriangle className="w-3 h-3" /> Maintenance Req.</span>;
    }
    return <span className="px-3 py-1 bg-rose-500/10 text-rose-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-rose-500/20 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500" /> Arrêt Technique</span>;
}
