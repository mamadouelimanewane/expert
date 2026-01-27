"use client";

import { useState, useEffect } from "react";
import {
    Sparkles,
    BrainCircuit,
    Globe2,
    Zap,
    MessageSquare,
    Search,
    Fingerprint,
    Activity,
    Users,
    TrendingUp,
    ShieldCheck,
    Cpu,
    Network,
    Lock,
    Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function NexusPage() {
    const [query, setQuery] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [streamData, setStreamData] = useState<string[]>([]);

    // Simulate live data stream
    useEffect(() => {
        const events = [
            "Analyse prédictive: Risque client 'SOGECOM' en baisse...",
            "Audit IA: Anomalie détectée facture F-992...",
            "Mise à jour OHADA: Nouvel acte uniforme publié...",
            "Performance: Équipe Audit à 92% de vélocité...",
            "Sécurité: Tentative d'accès bloquée IP 192.168.x.x...",
            "Trésorerie: Encaissement 12M FCFA confirmé..."
        ];

        let i = 0;
        const interval = setInterval(() => {
            setStreamData(prev => [events[i % events.length], ...prev].slice(0, 5));
            i++;
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden relative font-mono selection:bg-cyan-500/30">
            {/* Background Grid & Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

            {/* HEADER */}
            <div className="relative z-10 p-8 flex justify-between items-center border-b border-cyan-900/30 bg-black/50 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 border border-cyan-500/50 rounded-lg bg-cyan-950/30 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                        <BrainCircuit className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                            NEXUS <span className="text-white">CORE</span>
                        </h1>
                        <p className="text-xs text-cyan-600 uppercase tracking-[0.2em] font-bold">Système Central d'Intelligence Cabinet</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                        <span className="text-xs font-bold text-green-500 uppercase">Système En Ligne</span>
                    </div>
                    <div className="px-4 py-2 border border-cyan-900/50 rounded bg-cyan-950/20 text-xs font-mono text-cyan-400">
                        CPU: 12% | MEM: 4.2GB | LATENCY: 12ms
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="relative z-10 p-8 grid grid-cols-12 gap-8 h-[calc(100vh-140px)]">

                {/* LEFT CONSOLE - DATA STREAMS */}
                <div className="col-span-3 flex flex-col gap-6">
                    <div className="flex-1 p-1 border border-cyan-500/20 rounded-xl bg-black/40 backdrop-blur relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
                        <div className="p-4 border-b border-cyan-900/30 flex justify-between items-center">
                            <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Live Stream
                            </h3>
                            <span className="text-[10px] text-cyan-700 animate-pulse">RECORDING</span>
                        </div>
                        <div className="p-4 space-y-4 font-mono text-xs">
                            {streamData.map((log, i) => (
                                <div key={i} className="flex gap-3 animate-in slide-in-from-left-4 fade-in duration-300">
                                    <span className="text-cyan-700 font-bold">[{new Date().toLocaleTimeString()}]</span>
                                    <span className="text-cyan-100/80">{log}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="h-1/3 p-6 border border-cyan-500/20 rounded-xl bg-black/40 backdrop-blur flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 to-transparent opacity-50 animate-pulse" />
                        <ShieldCheck className="w-12 h-12 text-cyan-400 mb-4" />
                        <h3 className="text-2xl font-black text-white tracking-widest">SÉCURISÉ</h3>
                        <p className="text-xs text-cyan-500 mt-2 uppercase tracking-widest">Chiffrement Militaire Actif</p>
                    </div>
                </div>

                {/* CENTER - THE CORE */}
                <div className="col-span-6 flex flex-col items-center justify-center relative">
                    {/* The Brain Visual */}
                    <div className="relative w-[500px] h-[500px] flex items-center justify-center">
                        {/* Orbitals */}
                        <div className="absolute inset-0 rounded-full border border-cyan-500/10 animate-[spin_10s_linear_infinite]" />
                        <div className="absolute inset-10 rounded-full border border-cyan-500/20 animate-[spin_15s_linear_infinite_reverse]" />
                        <div className="absolute inset-24 rounded-full border border-cyan-400/30 animate-[spin_20s_linear_infinite]" />

                        {/* Central Sphere */}
                        <div className="w-48 h-48 rounded-full bg-cyan-900/20 backdrop-blur-md border border-cyan-400/50 shadow-[0_0_100px_rgba(34,211,238,0.2)] flex items-center justify-center relative z-20 group cursor-pointer hover:scale-110 transition-transform duration-500">
                            <div className="absolute inset-0 rounded-full bg-cyan-400/10 animate-pulse" />
                            <Cpu className="w-20 h-20 text-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                        </div>

                        {/* Connection Lines */}
                        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent -z-10" />
                        <div className="absolute left-1/2 top-0 w-px h-full bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent -z-10" />
                    </div>

                    {/* AI Input Field */}
                    <div className="w-full max-w-2xl mt-8 relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 blur-lg" />
                        <div className="relative bg-black rounded-2xl border border-cyan-500/30 flex items-center p-2">
                            <div className="p-3">
                                <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
                            </div>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Posez une question complexe à Nexus ou lancez une simulation..."
                                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-cyan-700/50 font-mono text-sm h-10 px-2"
                            />
                            <button className="px-6 py-2 bg-cyan-900/30 hover:bg-cyan-600 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 hover:text-white rounded-xl font-bold uppercase text-xs transition-all">
                                Exécuter
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT CONSOLE - KPIs */}
                <div className="col-span-3 space-y-6">
                    <NexusMetric label="Chiffre d'Affaires Global" value="1.2 Md" unit="FCFA" trend="+14.2%" icon={Globe2} />
                    <NexusMetric label="Taux de Rétention" value="98.5" unit="%" trend="+2.1%" icon={Users} />
                    <NexusMetric label="Marge Opérationnelle" value="32.8" unit="%" trend="-0.5%" trendDown icon={TrendingUp} />

                    <div className="flex-1 p-6 border border-cyan-500/20 rounded-xl bg-black/40 backdrop-blur relative overflow-hidden">
                        <h3 className="text-sm font-bold text-cyan-400 mb-4 flex items-center gap-2">
                            <Eye className="w-4 h-4" /> Radar Stratégique
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-cyan-200">Expansion Afrique de l'Ouest</span>
                                <span className="text-cyan-500 font-bold">85%</span>
                            </div>
                            <div className="h-1 w-full bg-cyan-950 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500 w-[85%] shadow-[0_0_10px_#06b6d4]" />
                            </div>

                            <div className="flex justify-between items-center text-xs">
                                <span className="text-cyan-200">Digitalisation Clients</span>
                                <span className="text-cyan-500 font-bold">62%</span>
                            </div>
                            <div className="h-1 w-full bg-cyan-950 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500 w-[62%] shadow-[0_0_10px_#06b6d4]" />
                            </div>

                            <div className="flex justify-between items-center text-xs">
                                <span className="text-cyan-200">Formation IA Équipe</span>
                                <span className="text-cyan-500 font-bold">40%</span>
                            </div>
                            <div className="h-1 w-full bg-cyan-950 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500 w-[40%] shadow-[0_0_10px_#06b6d4]" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* FOOTER STATUS */}
            <div className="absolute bottom-0 left-0 w-full p-2 bg-black border-t border-cyan-900/30 flex justify-between items-center text-[10px] text-cyan-800 font-mono uppercase tracking-widest">
                <span>Nexus OS v4.2.0 [STABLE]</span>
                <span>Connecté à : Server Cluster Dakar-01</span>
                <span>Encrypted Connection // 256-bit AES</span>
            </div>
        </div>
    );
}

function NexusMetric({ label, value, unit, trend, trendDown, icon: Icon }: any) {
    return (
        <div className="p-6 border border-cyan-500/20 rounded-xl bg-black/40 backdrop-blur hover:bg-cyan-950/20 transition-all group">
            <div className="flex justify-between items-start mb-2">
                <Icon className="w-5 h-5 text-cyan-600 group-hover:text-cyan-400 transition-colors" />
                <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded border",
                    trendDown ? "text-red-400 border-red-500/30 bg-red-900/20" : "text-cyan-400 border-cyan-500/30 bg-cyan-900/20"
                )}>
                    {trend}
                </span>
            </div>
            <p className="text-[10px] text-cyan-700 uppercase tracking-widest font-bold mb-1">{label}</p>
            <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white group-hover:text-cyan-200 transition-colors">{value}</span>
                <span className="text-xs font-bold text-cyan-600">{unit}</span>
            </div>
        </div>
    );
}
