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
    Link as LinkIcon
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

const INITIAL_NODES: Node[] = [
    { id: "1", type: "company", label: "SOGECOM SA", risk: "low", x: 400, y: 300, metadata: "Client Audité" },
    { id: "2", type: "person", label: "M. Kouassi Jean", risk: "high", x: 250, y: 150, metadata: "Directeur Financier" },
    { id: "3", type: "company", label: "IVOIRE PRESTA", risk: "high", x: 550, y: 150, metadata: "Fournisseur (Batiment)" },
    { id: "4", type: "person", label: "Kouassi Michel", risk: "medium", x: 700, y: 150, metadata: "Gérant Supplier" },
    { id: "5", type: "invoice", label: "FAC-2023-999", risk: "high", x: 550, y: 50, metadata: "12.5M FCFA (Non lettrée)" },
    { id: "6", type: "account", label: "BK-CI-22291", risk: "low", x: 400, y: 500, metadata: "Compte Bancaire" },
    { id: "7", type: "person", label: "Mme. Diallo A.", risk: "low", x: 150, y: 300, metadata: "Actionnaire" },
    // Hidden Nodes (Revealed by Sherlock)
    { id: "8", type: "offshore", label: "SHELL HOLDING LTD", risk: "critical", x: 750, y: 300, metadata: "Juridiction: Dubaï", hidden: true },
    { id: "9", type: "account", label: "CPT-DUBAI-99", risk: "critical", x: 750, y: 400, metadata: "Compte Non Déclaré", hidden: true },
    { id: "10", type: "person", label: "M. Kouassi Jean (Alias)", risk: "critical", x: 800, y: 200, metadata: "Identité Numérique", hidden: true },
];

const INITIAL_EDGES: Edge[] = [
    { source: "2", target: "1", type: "EMPLOYED_BY", value: "Salarié" },
    { source: "3", target: "1", type: "SUPPLIES", value: "Prestataire" },
    { source: "4", target: "3", type: "OWNS", value: "Gérant 100%" },
    { source: "2", target: "4", type: "RELATED", value: "Frère" },
    { source: "3", target: "5", type: "ISSUED", value: "Facture" },
    { source: "1", target: "6", type: "HAS_ACCOUNT", value: "Propriétaire" },
    { source: "5", target: "6", type: "PAID_FROM", value: "Virement" },
    // Hidden Edges
    { source: "3", target: "8", type: "OWNED_BY", value: "100% Shares", hidden: true },
    { source: "8", target: "9", type: "HAS_ACCOUNT", value: "Bénéficiaire", hidden: true },
    { source: "4", target: "10", type: "SAME_PERSON", value: "Alias Web", hidden: true },
    { source: "10", target: "8", type: "DIRECTOR", value: "Admin", hidden: true },
];

export default function NeuralForensicsPage() {
    const [nodes, setNodes] = useState(INITIAL_NODES);
    const [edges, setEdges] = useState(INITIAL_EDGES);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [zoom, setZoom] = useState(1);
    const [isScanning, setIsScanning] = useState(false);

    // Sherlock Mode States
    const [isInvestigating, setIsInvestigating] = useState(false);
    const [osintLogs, setOsintLogs] = useState<string[]>([]);
    const [webResults, setWebResults] = useState<any[]>([]);

    const handleNodeClick = (node: Node) => {
        setSelectedNode(node);
        // Reset investigation view if clicking a new node
        if (selectedNode?.id !== node.id) {
            setWebResults([]);
            setOsintLogs([]);
        }
    };

    const runNeuralScan = () => {
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 3000);
    };

    const launchSherlockInvestigation = () => {
        if (!selectedNode) return;
        setIsInvestigating(true);
        setOsintLogs(["Initialisation du Crawler OSINT...", `Cible: ${selectedNode.label}`]);

        const steps = [
            "Scan des registres publics (RCCM, Greffe)...",
            "Recherche d'affiliations corporatives...",
            "Analyse des Réseaux Sociaux (Graph API)...",
            "Vérification des listes de sanctions (UN, OFAC)...",
            "⚠️ ALERTE: Connexion Offshore détectée (Dubaï)...",
            "⚠️ ALERTE: Lien caché identifié avec 'SHELL HOLDING'..."
        ];

        let i = 0;
        const interval = setInterval(() => {
            if (i >= steps.length) {
                clearInterval(interval);
                setIsInvestigating(false);
                revealHiddenNetwork();
                setWebResults([
                    { source: "LinkedIn", title: "Profil Associé trouvé", desc: "Mentionne 'Consultant indépendant à Dubaï' depuis 2022." },
                    { source: "ICIJ (Panama Papers)", title: "Aucune correspondance directe", desc: "Base de données clean." },
                    { source: "OpenCorporates", title: "Société Liée Trouvée", desc: "SHELL HOLDING LTD enregistrée à Jebel Ali Free Zone." }
                ]);
                return;
            }
            setOsintLogs(prev => [...prev, steps[i]]);
            i++;
        }, 1200);
    };

    const revealHiddenNetwork = () => {
        setNodes(prev => prev.map(n => ({ ...n, hidden: false })));
        setEdges(prev => prev.map(e => ({ ...e, hidden: false })));
        setZoom(0.8); // Zoom out to see new nodes
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
                            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                                SHERLOCK <span className="text-indigo-500">HOLMES</span> AI
                            </h1>
                            <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">Enquête Numérique & Intelligence Open Source (OSINT)</p>
                        </div>
                    </div>
                </div>

                <div className="pointer-events-auto flex items-center gap-3">
                    <div className="glass-card px-4 py-2 rounded-lg border border-white/5 flex items-center gap-3 bg-slate-900/50 backdrop-blur">
                        <Globe className="w-4 h-4 text-emerald-500 animate-pulse" />
                        <span className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Connecté au Web Mondial</span>
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

                {/* The Graph Layer */}
                <div className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-out" style={{ transform: `scale(${zoom})` }}>
                    <div className="relative w-[1000px] h-[800px]">

                        {/* Edges (SVG Lines) */}
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

                                const isDanger = edge.type === "RELATED" || (edge.source === "5" && edge.target === "6" && isScanning);
                                const isCritical = edge.target === "8" || edge.source === "8" || edge.source === "10";

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

                        {/* Node Render */}
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

                                    {/* Notification badge for newly found nodes */}
                                    {node.id === "8" && (
                                        <div className="absolute -top-3 -right-3 w-4 h-4 bg-purple-500 rounded-full animate-ping" />
                                    )}
                                </div>

                                {/* Hover Label */}
                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-3 py-1 rounded text-xs text-white font-bold border border-white/10 pointer-events-none z-50">
                                    {node.label}
                                </div>

                                {/* Pulse Effect for High/Critical Risk */}
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

                        {/* SHERLOCK MODULE */}
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-indigo-400" />
                                    Investigateur Web (OSINT)
                                </h3>
                                {isInvestigating && <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />}
                            </div>

                            {!isInvestigating && webResults.length === 0 && (
                                <div className="p-6 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-2">
                                        <FileSearch className="w-8 h-8" />
                                    </div>
                                    <p className="text-sm text-slate-400">
                                        Lancer une recherche profonde sur le web pour identifier des connexions cachées (Réseaux Sociaux, Registres, Offshore Leaks).
                                    </p>
                                    <button
                                        onClick={launchSherlockInvestigation}
                                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-indigo-600/20"
                                    >
                                        Lancer l'enquête Web
                                    </button>
                                </div>
                            )}

                            {isInvestigating && (
                                <div className="bg-black/40 rounded-xl p-4 border border-indigo-500/30 font-mono text-xs space-y-2 h-[200px] overflow-y-auto">
                                    {osintLogs.map((log, i) => (
                                        <div key={i} className="flex gap-2 text-indigo-300 animate-in slide-in-from-left-2 fade-in duration-300">
                                            <span className="opacity-50">{">"}</span>
                                            <span>{log}</span>
                                        </div>
                                    ))}
                                    <div className="w-2 h-4 bg-indigo-500 animate-pulse inline-block" />
                                </div>
                            )}

                            {webResults.length > 0 && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg flex items-center gap-3">
                                        <AlertTriangle className="w-5 h-5 text-purple-400" />
                                        <p className="text-xs text-purple-300 font-bold">NOUVELLES ENTITÉS DÉCOUVERTES DANS LE GRAPHE</p>
                                    </div>
                                    {webResults.map((res, i) => (
                                        <div key={i} className="p-4 bg-slate-800/50 hover:bg-slate-800 border border-white/5 rounded-xl group transition-colors cursor-pointer">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{res.source}</span>
                                                <LinkIcon className="w-3 h-3 text-slate-600 group-hover:text-indigo-400" />
                                            </div>
                                            <h4 className="text-sm font-bold text-white mb-1">{res.title}</h4>
                                            <p className="text-xs text-slate-400">{res.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

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

function DetailItem({ label, value, fullWidth }: any) {
    return (
        <div className={cn("bg-white/5 p-3 rounded-lg border border-white/5", fullWidth ? "col-span-2" : "")}>
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">{label}</p>
            <p className="text-sm font-bold text-white capitalize">{value}</p>
        </div>
    );
}
