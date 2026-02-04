"use client";

import { useState, useEffect, useRef } from "react";
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
    Eye,
    CheckCircle2,
    AlertTriangle,
    X,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function NexusPage() {
    const [query, setQuery] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [streamData, setStreamData] = useState<string[]>([]);
    const [aiResponse, setAiResponse] = useState<any>(null); // For modals/results

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

    const handleCommand = () => {
        if (!query.trim()) return;
        setIsProcessing(true);
        setAiResponse(null);

        // Simulate AI Processing Delay
        setTimeout(() => {
            const lowerQuery = query.toLowerCase();

            if (lowerQuery.includes("fusion") || lowerQuery.includes("m&a")) {
                setAiResponse({
                    type: "fusion",
                    title: "SIMULATION DE FUSION : SCÉNARIO ALPHA",
                    data: {
                        score: "94/100",
                        synergy: "+450M FCFA",
                        risk: "MODÉRÉ (Conformité Sociale)",
                        timeline: "6 Mois",
                        details: "La fusion avec 'Groupe Atlantique' générerait des synergies opérationnelles immédiates. Attention à l'harmonisation des conventions collectives."
                    }
                });
                setStreamData(prev => ["INITIATION PROTOCOLE M&A...", "CALCUL DES SYNERGIES...", "ANALYSE DE RISQUE JURIDIQUE TERMINÉE.", ...prev].slice(0, 6));
            } else if (lowerQuery.includes("ohada") || lowerQuery.includes("loi") || lowerQuery.includes("juridique") || lowerQuery.includes("acte uniforme")) {
                setAiResponse({
                    type: "legal",
                    title: "ASSISTANT JURIDIQUE OHADA",
                    data: {
                        article: "Art. 13 AUDCIF",
                        source: "Acte Uniforme relatif au Droit Comptable et à l'Information Financière",
                        interpretation: "Conformément à l'Acte Uniforme OHADA, tout commerçant est tenu de tenir un livre-journal, un grand livre et un livre d'inventaire. Ces livres doivent être conservés pendant dix ans.",
                        links: ["Voir AUDCIF complet", "Jurisprudence liée"]
                    }
                });
                setStreamData(prev => ["INDEXATION BASE OHADA...", "RÉCUPÉRATION TEXTES LÉGAUX...", "ANALYSE DE CONFORMITÉ TERMINÉE.", ...prev].slice(0, 6));
            } else if (lowerQuery.includes("impot") || lowerQuery.includes("fiscal") || lowerQuery.includes("tva") || lowerQuery.includes("is")) {
                setAiResponse({
                    type: "tax",
                    title: "CONSEILLER FISCAL UEMOA",
                    data: {
                        country: "Sénégal / Côte d'Ivoire",
                        focus: "TVA Import & Droits de Douane",
                        details: "Taux standard TVA : 18% (Sénégal & CI). Exonérations possibles selon le Code des Investissements pour les biens d'équipement. Attention au mécanisme d'autoliquidation de la TVA pour les prestataires étrangers.",
                        caution: "Risque identifié : Nouvelles dispositions de la Loi de Finances 2024 sur les services numériques."
                    }
                });
                setStreamData(prev => ["SCANNER CODES DES IMPÔTS...", "VÉRIFICATION LOI DE FINANCES 2024...", "SYNTHÈSE FISCALE GÉNÉRÉE.", ...prev].slice(0, 6));
            } else if (lowerQuery.includes("scan") || lowerQuery.includes("audit")) {
                setAiResponse({
                    type: "audit",
                    title: "AUDIT FLASH : ANOMALIES DÉTECTÉES",
                    data: {
                        anomalies: 3,
                        severity: "CRITIQUE",
                        details: "3 écritures comptables non justifiées détectées dans le journal de trésorerie (Total: 4.5M FCFA)."
                    }
                });
                setStreamData(prev => ["SCANNING GRAND LIVRE...", "DÉTECTION ANOMALIES...", "RAPPORT GÉNÉRÉ.", ...prev].slice(0, 6));
            } else {
                setAiResponse({
                    type: "generic",
                    title: "NEXUS AI : RÉPONSE",
                    data: {
                        details: "Commande prise en compte. Analyse en cours sur les serveurs sécurisés. Veuillez consulter les logs pour plus de détails."
                    }
                });
            }
            setIsProcessing(false);
            setQuery("");
        }, 2000);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleCommand();
    };

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden relative font-mono selection:bg-cyan-500/30">
            {/* Background Grid & Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

            {/* RESPONSE MODAL OVERLAY */}
            {aiResponse && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl bg-black border border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.3)] rounded-2xl overflow-hidden">
                        <div className="bg-cyan-950/50 p-4 border-b border-cyan-500/30 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                                <h3 className="text-lg font-black text-white tracking-widest">{aiResponse.title}</h3>
                            </div>
                            <button onClick={() => setAiResponse(null)} className="text-cyan-500 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            {aiResponse.type === "fusion" && (
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-4 bg-cyan-900/10 border border-cyan-500/20 rounded-xl text-center">
                                        <p className="text-xs text-cyan-500 uppercase tracking-widest font-bold mb-1">Score de Faisabilité</p>
                                        <p className="text-4xl font-black text-white">{aiResponse.data.score}</p>
                                    </div>
                                    <div className="p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-xl text-center">
                                        <p className="text-xs text-emerald-500 uppercase tracking-widest font-bold mb-1">Synergies Est.</p>
                                        <p className="text-4xl font-black text-emerald-400">{aiResponse.data.synergy}</p>
                                    </div>
                                    <div className="col-span-2 p-4 bg-white/5 rounded-xl border border-white/5">
                                        <p className="text-sm text-cyan-100 leading-relaxed font-sans border-l-2 border-cyan-500 pl-4">
                                            {aiResponse.data.details}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {aiResponse.type === "legal" && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-950/20 border border-blue-500/30 rounded-xl">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-black text-blue-400 uppercase tracking-widest">{aiResponse.data.source}</span>
                                            <span className="px-2 py-1 bg-blue-500 text-white text-[10px] font-bold rounded">{aiResponse.data.article}</span>
                                        </div>
                                        <p className="text-sm text-blue-100 font-sans leading-relaxed italic border-l-2 border-blue-500 pl-4 py-1">
                                            {aiResponse.data.interpretation}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        {aiResponse.data.links.map((link: string, i: number) => (
                                            <button key={i} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[10px] font-bold text-blue-400 rounded-lg border border-white/5 transition-colors">
                                                {link}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {aiResponse.type === "tax" && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl">
                                            <p className="text-[10px] font-bold text-amber-500 uppercase mb-1">Zone Géographique</p>
                                            <p className="text-sm font-black text-white">{aiResponse.data.country}</p>
                                        </div>
                                        <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl">
                                            <p className="text-[10px] font-bold text-amber-500 uppercase mb-1">Focus Analyse</p>
                                            <p className="text-sm font-black text-white">{aiResponse.data.focus}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-300 font-sans leading-relaxed">
                                        {aiResponse.data.details}
                                    </p>
                                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3">
                                        <AlertTriangle className="w-5 h-5 text-rose-500" />
                                        <p className="text-xs font-bold text-rose-300">{aiResponse.data.caution}</p>
                                    </div>
                                </div>
                            )}

                            {aiResponse.type === "audit" && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-rose-950/20 border border-rose-500/30 rounded-xl">
                                        <AlertTriangle className="w-8 h-8 text-rose-500" />
                                        <div>
                                            <h4 className="text-xl font-bold text-rose-400">{aiResponse.data.anomalies} Anomalies Critiques</h4>
                                            <p className="text-xs text-rose-300 uppercase tracking-widest">Action Immédiate Requise</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-300">{aiResponse.data.details}</p>
                                    <button className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-widest text-xs rounded-lg transition-all">
                                        Voir le rapport détaillé
                                    </button>
                                </div>
                            )}

                            {aiResponse.type === "generic" && (
                                <div className="flex items-start gap-4">
                                    <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0" />
                                    <p className="text-slate-300 text-sm leading-relaxed">{aiResponse.data.details}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

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
                        <div className={cn("absolute inset-0 rounded-full border border-cyan-500/10 transition-all duration-1000", isProcessing ? "animate-[spin_2s_linear_infinite] border-cyan-500/30" : "animate-[spin_10s_linear_infinite]")} />
                        <div className={cn("absolute inset-10 rounded-full border border-cyan-500/20 transition-all duration-1000", isProcessing ? "animate-[spin_3s_linear_infinite_reverse] border-cyan-500/40" : "animate-[spin_15s_linear_infinite_reverse]")} />
                        <div className={cn("absolute inset-24 rounded-full border transition-all duration-1000", isProcessing ? "border-cyan-400/60 animate-[spin_4s_linear_infinite]" : "border-cyan-400/30 animate-[spin_20s_linear_infinite]")} />

                        {/* Central Sphere */}
                        <div className={cn(
                            "w-48 h-48 rounded-full bg-cyan-900/20 backdrop-blur-md border border-cyan-400/50 shadow-[0_0_100px_rgba(34,211,238,0.2)] flex items-center justify-center relative z-20 transition-all duration-500",
                            isProcessing ? "scale-110 shadow-[0_0_150px_rgba(34,211,238,0.6)]" : "group hover:scale-110"
                        )}>
                            <div className="absolute inset-0 rounded-full bg-cyan-400/10 animate-pulse" />
                            {isProcessing ? (
                                <Loader2 className="w-20 h-20 text-white animate-spin drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]" />
                            ) : (
                                <Cpu className="w-20 h-20 text-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                            )}
                        </div>

                        {/* Connection Lines */}
                        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent -z-10" />
                        <div className="absolute left-1/2 top-0 w-px h-full bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent -z-10" />
                    </div>

                    {/* AI Input Field */}
                    <div className="w-full max-w-2xl mt-8 relative group">
                        <div className={cn(
                            "absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl opacity-30 transition duration-1000 blur-lg",
                            isProcessing ? "opacity-80 duration-200" : "group-hover:opacity-100 group-hover:duration-200"
                        )} />
                        <div className="relative bg-black rounded-2xl border border-cyan-500/30 flex items-center p-2">
                            <div className="p-3">
                                <Sparkles className={cn("w-6 h-6 text-cyan-400", isProcessing ? "animate-spin" : "animate-pulse")} />
                            </div>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isProcessing}
                                placeholder={isProcessing ? "Traitement en cours..." : "Posez une question à Nexus ou lancez une simulation..."}
                                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-cyan-700/50 font-mono text-sm h-10 px-2 disabled:opacity-50"
                            />
                            <button
                                onClick={handleCommand}
                                disabled={isProcessing}
                                className="px-6 py-2 bg-cyan-900/30 hover:bg-cyan-600 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 hover:text-white rounded-xl font-bold uppercase text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? "..." : "Exécuter"}
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
