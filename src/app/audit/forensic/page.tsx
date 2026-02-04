"use client";

import { useState } from "react";
import {
    ShieldAlert,
    Share2,
    Search,
    Fingerprint,
    Eye,
    FileSearch,
    AlertTriangle,
    ArrowRight,
    Ban,
    Network,
    Lock,
    Radar
} from "lucide-react";
import { cn } from "@/lib/utils";

const SUSPICIOUS_TRANSACTIONS = [
    {
        id: "TRX-9982",
        entity: "Fournisseur A (BTP)",
        amount: "14 900 000",
        date: "24/12/2025",
        risk: "Critical",
        reason: "Paiement rond, Veille de jour férié, Nouveau RIB",
        score: 98
    },
    {
        id: "TRX-3321",
        entity: "Consulting Services SARL",
        amount: "4 500 000",
        date: "15/01/2026",
        risk: "High",
        reason: "Même adresse que l'employé 'Jean K.' (Comptable)",
        score: 85
    },
    {
        id: "TRX-7762",
        entity: "Global Import Export",
        amount: "22 000 000",
        date: "10/01/2026",
        risk: "Medium",
        reason: "Écart Loi de Benford (Chiffre 9 en tête anormalement fréquent)",
        score: 65
    }
];

export default function ForensicAuditPage() {
    const [scanActive, setScanActive] = useState(false);

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8 animate-in fade-in duration-500">

            {/* Header Cyberpunk Style */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-6 border-b border-white/5 relative overflow-hidden">
                <div className="z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 text-rose-400 rounded-full text-xs font-bold tracking-widest uppercase mb-4 border border-rose-500/20">
                        <Fingerprint className="w-3 h-3" /> Audit Forensique & Fraude
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        NEXUS DETECT
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl text-lg">
                        Algorithmes de détection d'anomalies financières, double paiements et conflits d'intérêts.
                        <span className="text-rose-400 font-bold ml-2">Sécurité maximale pour vos clients.</span>
                    </p>
                </div>

                {/* Background Radar Effect */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 border border-rose-500/20 rounded-full flex items-center justify-center -z-0">
                    <div className="w-64 h-64 border border-rose-500/10 rounded-full flex items-center justify-center">
                        <div className="w-32 h-32 border border-rose-500/5 rounded-full animate-ping" />
                    </div>
                </div>

                <div className="flex gap-3 z-10">
                    <button
                        onClick={() => setScanActive(!scanActive)}
                        className={cn(
                            "px-6 py-3 text-white rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 relative overflow-hidden group",
                            scanActive ? "bg-slate-800 cursor-wait" : "bg-rose-600 hover:bg-rose-500 shadow-rose-600/25"
                        )}
                    >
                        {scanActive && (
                            <div className="absolute inset-0 bg-white/10 animate-progress-bar" style={{ width: '100%' }} />
                        )}
                        <Radar className={cn("w-4 h-4", scanActive && "animate-spin")} />
                        {scanActive ? "Analyse en cours..." : "Lancer Scan Complet (FEC)"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Anomaly Feed */}
                <div className="space-y-6">
                    <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-rose-400" />
                            Anomalies Détectées
                            <span className="ml-auto px-2 py-0.5 bg-rose-500 text-white text-[10px] rounded-full font-black">3</span>
                        </h3>

                        <div className="space-y-3">
                            {SUSPICIOUS_TRANSACTIONS.map((trx) => (
                                <div key={trx.id} className="p-4 bg-slate-950/50 rounded-xl border border-rose-500/20 hover:border-rose-500/50 transition-colors cursor-pointer group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 font-bold text-xs">
                                                {trx.score}
                                            </div>
                                            <div>
                                                <div className="text-white font-bold text-sm">{trx.entity}</div>
                                                <div className="text-[10px] text-slate-500 font-mono">{trx.date}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-rose-400 font-bold font-mono text-sm">{trx.amount}</div>
                                            <div className="text-[10px] text-slate-500 uppercase">FCFA</div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 pl-10 border-l-2 border-rose-500/20 group-hover:border-rose-500 transition-colors">
                                        {trx.reason}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <FileSearch className="w-5 h-5 text-indigo-400" />
                            Loi de Benford
                        </h3>
                        <div className="h-32 flex items-end gap-1 px-2">
                            {[30.1, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6].map((freq, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                                    <div className="w-full bg-slate-800 rounded-t relative h-full group-hover:bg-slate-700 transition-colors">
                                        {/* Theoretical */}
                                        <div className="absolute bottom-0 w-full bg-indigo-500/30 border-t border-indigo-500" style={{ height: `${freq * 3}%` }} />
                                        {/* Actual (Simulated anomaly on 9) */}
                                        <div
                                            className={cn("absolute bottom-0 w-full", i === 8 ? "bg-rose-500" : "bg-emerald-500")}
                                            style={{ height: `${i === 8 ? freq * 5 : freq * 3}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-bold">{i + 1}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-slate-400 mt-4 text-center">
                            Alerte: Le chiffre <span className="text-rose-400 font-bold">9</span> apparaît 2x plus que la normale statistique.
                        </p>
                    </div>
                </div>

                {/* Right: Network Graph Visualization */}
                <div className="lg:col-span-2 glass-card rounded-[40px] border border-white/5 bg-slate-950/80 relative overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center z-10 bg-slate-900/50">
                        <div className="flex items-center gap-3">
                            <Network className="w-5 h-5 text-sky-400" />
                            <h3 className="font-bold text-white">Cartographie des Relations (Nexus)</h3>
                        </div>
                        <div className="flex gap-2 text-xs">
                            <span className="flex items-center gap-1 text-slate-400"><div className="w-2 h-2 rounded-full bg-blue-500" /> Employé</span>
                            <span className="flex items-center gap-1 text-slate-400"><div className="w-2 h-2 rounded-full bg-rose-500" /> Fournisseur</span>
                            <span className="flex items-center gap-1 text-slate-400"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Compte Bancaire</span>
                        </div>
                    </div>

                    <div className="flex-1 relative p-8">
                        {/* CSS Graph Representation Idea */}
                        <div className="absolute inset-0 flex items-center justify-center">

                            {/* Central Node: The Company */}
                            <div className="absolute bg-white text-black font-bold text-xs p-3 rounded-full z-20 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                                CABINET 360
                            </div>

                            {/* Suspicious Cluster */}
                            <div className="absolute top-1/4 right-1/3 w-64 h-64 border border-rose-500/30 rounded-full animate-pulse flex items-center justify-center">
                                {/* Supplier Node */}
                                <div className="absolute top-10 right-10 bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg z-20 shadow-lg shadow-rose-600/20 group cursor-pointer hover:scale-110 transition-transform">
                                    Consulting S.
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-2 rounded border border-rose-500/50 hidden group-hover:block w-32 text-center z-50">
                                        Adresse: 12 Rue des Lilas
                                    </div>
                                </div>

                                {/* Employee Node */}
                                <div className="absolute bottom-10 left-10 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg z-20 shadow-lg shadow-blue-600/20 group cursor-pointer hover:scale-110 transition-transform">
                                    Jean K. (Compta)
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-2 rounded border border-blue-500/50 hidden group-hover:block w-32 text-center z-50">
                                        Adresse: 12 Rue des Lilas
                                    </div>
                                </div>

                                {/* Connection Line */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                                    <line x1="180" y1="60" x2="80" y2="180" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 4" className="animate-dash" />
                                </svg>

                                {/* Shared Attribute Node */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 border border-slate-600 text-slate-400 text-[9px] px-1.5 py-0.5 rounded z-10">
                                    Même Adresse
                                </div>
                            </div>

                            {/* Other Nodes scattered */}
                            <div className="absolute bottom-1/4 left-1/4 bg-rose-600/50 text-white/50 text-[10px] font-bold px-2 py-1 rounded-lg">Fournisseur B</div>
                            <div className="absolute top-1/3 left-1/4 bg-blue-600/50 text-white/50 text-[10px] font-bold px-2 py-1 rounded-lg">Pierre D.</div>

                            {/* Decorative Lines */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                                <line x1="50%" y1="50%" x2="25%" y2="75%" stroke="white" strokeWidth="1" />
                                <line x1="50%" y1="50%" x2="25%" y2="33%" stroke="white" strokeWidth="1" />
                                <line x1="50%" y1="50%" x2="70%" y2="25%" stroke="white" strokeWidth="1" />
                            </svg>

                        </div>

                        <div className="absolute bottom-6 right-6 p-4 bg-slate-900/80 backdrop-blur border border-rose-500/30 rounded-xl max-w-xs">
                            <h4 className="text-rose-400 font-bold text-sm flex items-center gap-2">
                                <Lock className="w-3 h-3" /> Conflit d'Intérêt Détecté
                            </h4>
                            <p className="text-xs text-slate-300 mt-1">
                                Le fournisseur "Consulting Services" partage la même adresse postale (12 Rue des Lilas) que votre collaborateur "Jean K.".
                            </p>
                            <button className="mt-3 w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors">
                                Ouvrir Enquête & Bloquer Paiements
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
