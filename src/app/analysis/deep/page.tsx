"use client";

import { useState, useRef, useEffect } from "react";
import {
    Network,
    Share2,
    Search,
    AlertTriangle,
    Shield,
    ZoomIn,
    ZoomOut,
    RefreshCw,
    Filter,
    ArrowUpRight,
    Users,
    Banknote,
    Building2,
    Briefcase,
    Globe,
    Lock,
    Eye,
    FileSearch,
    Link as LinkIcon,
    MapPin,
    Fingerprint,
    Scan
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types for our Graph
interface Node {
    id: string;
    type: "person" | "company" | "invoice" | "account" | "offshore";
    label: string;
    risk: "low" | "medium" | "high" | "critical";
    x: number;
    y: number;
    metadata?: string;
    hidden?: boolean; // For nodes revealed by investigation
}

interface Edge {
    source: string;
    target: string;
    type: string;
    value?: string;
    hidden?: boolean;
}

type ResultatCriblage = {
    source: "OFAC" | "OpenSanctions";
    interroge: boolean;
    erreur?: string;
    correspondances: { nom: string; detail: string }[];
};

export default function NeuralForensicsPage() {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [zoom, setZoom] = useState(1);
    const [isScanning, setIsScanning] = useState(false);

    // Sherlock Mode States
    const [isInvestigating, setIsInvestigating] = useState(false);
    const [osintLogs, setOsintLogs] = useState<string[]>([]);
    const [resultatsCriblage, setResultatsCriblage] = useState<ResultatCriblage[]>([]);

    // Document Modal
    const [showDocModal, setShowDocModal] = useState(false);

    const handleNodeClick = (node: Node) => {
        setSelectedNode(node);
        // Reset investigation view if clicking a new node
        if (selectedNode?.id !== node.id) {
            setResultatsCriblage([]);
            setOsintLogs([]);
        }
    };

    useEffect(() => {
        const fetchNetwork = async () => {
            try {
                const res = await fetch("/api/analysis/network", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ clientId: "default" })
                });
                const data = await res.json();
                if (data.success && data.network) {
                    setNodes(data.network.nodes);
                    setEdges(data.network.edges);
                }
            } catch (e) {
                console.error("Failed to fetch network", e);
            }
        };
        fetchNetwork();
    }, []);

    const runNeuralScan = async () => {
        setIsScanning(true);
        try {
            const res = await fetch("/api/analysis/network", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clientId: "default" })
            });
            const data = await res.json();
            setTimeout(() => {
                if (data.success && data.network) {
                    setNodes(data.network.nodes);
                    setEdges(data.network.edges);
                }
                setIsScanning(false);
            }, 2500);
        } catch (e) {
            setIsScanning(false);
        }
    };

    // Ce module affichait auparavant des résultats entièrement fabriqués (ex: une société
    // "SHELL HOLDING" fictive) présentés comme des preuves d'enquête réelles — ce qui pouvait
    // induire de fausses accusations de fraude. Il crible désormais réellement le nom contre la
    // liste OFAC SDN (publique, gratuite) et, si une clé est configurée, contre OpenSanctions
    // (consolide UE/ONU/PEP) — voir src/lib/sanctions-screening.ts. Les registres publics
    // (RCCM/Greffe) et les bases type ICIJ/OpenCorporates ne sont pas encore intégrés.
    const launchSherlockInvestigation = async () => {
        if (!selectedNode) return;
        setIsInvestigating(true);
        setOsintLogs([`Criblage de « ${selectedNode.label} » en cours…`]);
        setResultatsCriblage([]);
        try {
            const res = await fetch("/api/analysis/sanctions-check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nom: selectedNode.label }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `Réponse ${res.status}`);
            setResultatsCriblage(data.resultats ?? []);
            setOsintLogs([
                `Criblage terminé pour « ${selectedNode.label} ».`,
                "Registres publics (RCCM/Greffe) et bases type ICIJ/OpenCorporates : intégrations non disponibles.",
            ]);
        } catch (e) {
            setOsintLogs([`Échec du criblage : ${e instanceof Error ? e.message : "erreur inconnue"}.`]);
        } finally {
            setIsInvestigating(false);
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col bg-slate-950 overflow-hidden relative selection:bg-rose-500/30 font-sans">
            {/* Header / HUD */}
            <div className="absolute top-0 left-0 right-0 z-20 p-6 pointer-events-none flex justify-between items-start">
                <div className="pointer-events-auto">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30 backdrop-blur-sm shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                            <Network className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="page-title flex items-center gap-2">
                                SHERLOCK <span className="text-indigo-500">HOLMES</span> AI
                            </h1>
                            <p className="page-subtitle">Enquête Numérique & Intelligence Open Source (OSINT)</p>
                        </div>
                    </div>
                </div>

                <div className="pointer-events-auto flex items-center gap-3">
                    <div className="glass-card px-4 py-2 rounded-lg border border-white/5 flex items-center gap-3 bg-slate-900/50 backdrop-blur">
                        <Globe className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider">Données Cabinet (Prisma)</span>
                    </div>
                    <button
                        onClick={runNeuralScan}
                        className={cn(
                            "px-6 py-2 bg-slate-800 text-white rounded-xl font-bold text-sm border border-white/10 flex items-center gap-2 transition-all hover:bg-slate-700",
                            isScanning ? "animate-pulse cursor-wait" : ""
                        )}
                    >
                        {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        {isScanning ? "Scan en cours..." : "Scan Réseau"}
                    </button>
                </div>
            </div>

            {/* MAIN VISUALIZATION AREA */}
            <div className="relative flex-1 bg-[radial-gradient(circle_at_center,#1e293b_0%,#020617_100%)] overflow-hidden">
                {/* Grid Background */}
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />

                {/* GRAPH MODE */}
                <div className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-out" style={{ transform: `scale(${zoom})` }}>
                        <div className="relative w-[1000px] h-[800px]">
                            {/* Edges */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                                <defs>
                                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                                        <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                                    </marker>
                                    <marker id="arrowhead-danger" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                                        <polygon points="0 0, 10 3.5, 0 7" fill="#f43f5e" />
                                    </marker>
                                    <marker id="arrowhead-critical" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                                        <polygon points="0 0, 10 3.5, 0 7" fill="#a855f7" />
                                    </marker>
                                </defs>
                                {edges.filter(e => !e.hidden).map((edge, i) => {
                                    const sourceNode = nodes.find(n => n.id === edge.source);
                                    const targetNode = nodes.find(n => n.id === edge.target);
                                    if (!sourceNode || !targetNode) return null;

                                    // Le danger/la criticite d'une arete est derive du risque reel des
                                    // noeuds qu'elle relie (sourceNode.risk / targetNode.risk), pas d'ID
                                    // codes en dur : un ID "8" ou "10" pouvait auparavant correspondre a
                                    // n'importe quelle entite reelle, la marquant a tort comme frauduleuse.
                                    const isCritical = sourceNode.risk === "critical" || targetNode.risk === "critical";
                                    const isDanger = !isCritical && (sourceNode.risk === "high" || targetNode.risk === "high");

                                    return (
                                        <g key={i}>
                                            <line
                                                x1={sourceNode.x} y1={sourceNode.y}
                                                x2={targetNode.x} y2={targetNode.y}
                                                stroke={isCritical ? "#a855f7" : isDanger ? "#f43f5e" : "#475569"}
                                                strokeWidth={isCritical ? 2 : isDanger ? 3 : 1}
                                                strokeDasharray={isCritical ? "4,2" : "0"}
                                                markerEnd={isCritical ? "url(#arrowhead-critical)" : isDanger ? "url(#arrowhead-danger)" : "url(#arrowhead)"}
                                                className={cn("transition-all duration-1000", isScanning && isDanger ? "animate-pulse" : "", isCritical ? "animate-[dash_20s_linear_infinite]" : "")}
                                            />
                                            <text
                                                x={(sourceNode.x + targetNode.x) / 2}
                                                y={(sourceNode.y + targetNode.y) / 2 - 10}
                                                fill={isCritical ? "#a855f7" : isDanger ? "#f43f5e" : "#94a3b8"}
                                                fontSize="10"
                                                fontWeight="bold"
                                                textAnchor="middle"
                                                className="bg-slate-900"
                                            >
                                                {edge.value}
                                            </text>
                                        </g>
                                    );
                                })}
                            </svg>

                            {/* Nodes */}
                            {nodes.filter(n => !n.hidden).map((node) => (
                                <div
                                    key={node.id}
                                    onClick={() => handleNodeClick(node)}
                                    style={{ top: node.y, left: node.x }}
                                    className={cn(
                                        "absolute w-16 h-16 -ml-8 -mt-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 z-10 border-2 shadow-2xl group animate-in zoom-in duration-300",
                                        selectedNode?.id === node.id ? "ring-4 ring-indigo-500 ring-offset-4 ring-offset-slate-900 scale-110" : "hover:scale-110",
                                        node.risk === "critical" ? "bg-purple-950/80 border-purple-500 shadow-purple-900/50" :
                                            node.risk === "high" ? "bg-rose-950/80 border-rose-500 shadow-rose-900/50" :
                                                node.risk === "medium" ? "bg-amber-950/80 border-amber-500 shadow-amber-900/50" :
                                                    "bg-slate-900/80 border-slate-500 shadow-xl"
                                    )}
                                >
                                    <div className="text-white relative">
                                        {node.type === "company" && <Building2 className="w-6 h-6" />}
                                        {node.type === "person" && <Users className="w-6 h-6" />}
                                        {node.type === "invoice" && <Banknote className="w-6 h-6" />}
                                        {node.type === "account" && <Building2 className="w-6 h-6 opacity-50" />}
                                        {node.type === "offshore" && <Globe className="w-6 h-6 text-purple-400" />}
                                        {node.risk === "critical" && <div className="absolute -top-3 -right-3 w-4 h-4 bg-purple-500 rounded-full animate-ping" />}
                                    </div>
                                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-3 py-1 rounded text-xs text-white font-bold border border-white/10 pointer-events-none z-50">
                                        {node.label}
                                    </div>
                                    {(node.risk === "high" || node.risk === "critical") && (
                                        <div className={cn("absolute inset-0 rounded-full border-2 animate-ping opacity-50", node.risk === "critical" ? "border-purple-500" : "border-rose-500")} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                {/* Scan Overlay Effect */}
                {isScanning && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee] animate-[scan_3s_ease-in-out_infinite]" />
                )}
            </div>

            {/* Sidebar Details Panel */}
            <div className={cn(
                "absolute right-0 top-0 bottom-0 w-[420px] bg-slate-900/95 backdrop-blur-xl border-l border-white/10 flex flex-col transform transition-transform duration-500 z-30 shadow-2xl",
                selectedNode ? "translate-x-0" : "translate-x-full"
            )}>
                {selectedNode && (
                    <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-white leading-none mb-1">{selectedNode.label}</h2>
                                <p className="text-sm text-slate-400 font-mono">{selectedNode.metadata}</p>
                            </div>
                            <button onClick={() => setSelectedNode(null)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                                <ArrowUpRight className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Risk Badge */}
                        <div className={cn(
                            "p-4 rounded-xl border flex items-center gap-4 mb-6",
                            selectedNode.risk === "critical" ? "bg-purple-500/10 border-purple-500/30 text-purple-400" :
                                selectedNode.risk === "high" ? "bg-rose-500/10 border-rose-500/30 text-rose-400" :
                                    "bg-slate-800 border-white/5 text-slate-400"
                        )}>
                            <Shield className="w-8 h-8" />
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest mb-1">Status Forensique</p>
                                <p className="text-lg font-bold">
                                    {selectedNode.risk === "critical" ? "CRITIQUE (FRAUDE)" : selectedNode.risk === "high" ? "HAUT RISQUE" : "STANDARD"}
                                </p>
                            </div>
                        </div>

                        {/* Actions Specific to Node Type */}
                        {selectedNode.type === "invoice" && (
                            <div className="mb-6">
                                <button
                                    onClick={() => setShowDocModal(true)}
                                    className="w-full py-4 bg-gradient-to-r from-rose-900 to-rose-800 hover:from-rose-800 hover:to-rose-700 text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-rose-900/20 border border-rose-500/30 flex items-center justify-center gap-2"
                                >
                                    <Scan className="w-4 h-4" />
                                    Laboratoire Forensique (X-Ray)
                                </button>
                            </div>
                        )}

                        {/* SHERLOCK MODULE */}
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-indigo-400" />
                                    Investigateur Web (OSINT)
                                </h3>
                            </div>

                            {osintLogs.length === 0 && (
                                <div className="p-6 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-2">
                                        <FileSearch className="w-8 h-8" />
                                    </div>
                                    <p className="text-sm text-slate-400">
                                        Crible ce nom contre la liste OFAC SDN (publique, gratuite) et, si configuré, contre OpenSanctions (UE/ONU/PEP). Les registres publics et bases type ICIJ/OpenCorporates ne sont pas encore intégrés.
                                    </p>
                                    <button
                                        onClick={launchSherlockInvestigation}
                                        disabled={isInvestigating}
                                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-indigo-600/20"
                                    >
                                        {isInvestigating ? "Criblage en cours…" : "Cribler les listes de sanctions"}
                                    </button>
                                </div>
                            )}

                            {osintLogs.length > 0 && (
                                <div className="bg-black/40 rounded-xl p-4 border border-indigo-500/30 font-mono text-xs space-y-2">
                                    {osintLogs.map((log, i) => (
                                        <div key={i} className="flex gap-2 text-amber-300 animate-in slide-in-from-left-2 fade-in duration-300">
                                            <span className="opacity-50">{">"}</span>
                                            <span>{log}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {resultatsCriblage.length > 0 && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {resultatsCriblage.map((res) => (
                                        <div key={res.source} className="space-y-2">
                                            <div className={cn(
                                                "p-3 border rounded-lg flex items-center gap-3",
                                                !res.interroge ? "bg-slate-800/50 border-white/5" :
                                                    res.correspondances.length > 0 ? "bg-rose-500/10 border-rose-500/30" : "bg-emerald-500/10 border-emerald-500/30"
                                            )}>
                                                {!res.interroge ? <Lock className="w-4 h-4 text-slate-500" /> : res.correspondances.length > 0 ? <AlertTriangle className="w-4 h-4 text-rose-400" /> : <Shield className="w-4 h-4 text-emerald-400" />}
                                                <p className="text-xs font-bold">
                                                    {res.source} — {!res.interroge ? (res.erreur || "non interrogé") : res.correspondances.length > 0 ? `${res.correspondances.length} correspondance(s)` : "aucune correspondance"}
                                                </p>
                                            </div>
                                            {res.correspondances.map((c, i) => (
                                                <div key={i} className="p-4 bg-slate-800/50 border border-white/5 rounded-xl ml-4">
                                                    <h4 className="text-sm font-bold text-white mb-1">{c.nom}</h4>
                                                    <p className="text-xs text-slate-400">{c.detail}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* DOCUMENT X-RAY MODAL — honnête : aucun outil d'analyse forensique d'image
                (ELA, extraction EXIF) n'est connecté. Affichait auparavant une fausse facture et
                de fausses conclusions d'expertise (logiciel, dates de modification) présentées comme
                des preuves de fraude — supprimé pour éviter toute accusation infondée. */}
            {showDocModal && selectedNode && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-8 animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl bg-[#0F172A] rounded-3xl border border-white/10 p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Fingerprint className="w-6 h-6 text-rose-500" /> Laboratoire Forensique
                            </h2>
                            <button onClick={() => setShowDocModal(false)} className="text-slate-400 hover:text-white">Fermer</button>
                        </div>

                        <div className="space-y-6">
                            <div className="p-4 bg-slate-800/50 border border-white/5 rounded-xl">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Document sélectionné</p>
                                <p className="text-sm font-bold text-white">{selectedNode.label}</p>
                                <p className="text-xs text-slate-400 mt-1">{selectedNode.metadata}</p>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-300">
                                    L'analyse forensique d'image (Error Level Analysis, extraction de métadonnées EXIF) nécessite un outil dédié qui n'est pas encore intégré. Aucune conclusion d'authenticité ne peut être générée automatiquement — une expertise manuelle est nécessaire pour statuer sur ce document.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Controls */}
            <div className="absolute bottom-6 left-6 flex flex-col gap-2">
                <button onClick={() => setZoom(z => Math.min(z + 0.2, 2))} className="p-3 bg-slate-800 text-slate-300 hover:text-white rounded-xl shadow-lg border border-white/10"><ZoomIn className="w-5 h-5" /></button>
                <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="p-3 bg-slate-800 text-slate-300 hover:text-white rounded-xl shadow-lg border border-white/10"><ZoomOut className="w-5 h-5" /></button>
                <button onClick={() => { setZoom(1); setSelectedNode(null); }} className="p-3 bg-slate-800 text-slate-300 hover:text-white rounded-xl shadow-lg border border-white/10"><RefreshCw className="w-5 h-5" /></button>
            </div>

            <style jsx global>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                @keyframes dash {
                    to { stroke-dashoffset: -100; }
                }
            `}</style>
        </div>
    );
}
