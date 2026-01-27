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
    Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types for our Graph
interface Node {
    id: string;
    type: "person" | "company" | "invoice" | "account";
    label: string;
    risk: "low" | "medium" | "high";
    x: number;
    y: number;
    metadata?: string;
}

interface Edge {
    source: string;
    target: string;
    type: string;
    value?: string;
}

const INITIAL_NODES: Node[] = [
    { id: "1", type: "company", label: "SOGECOM SA", risk: "low", x: 400, y: 300, metadata: "Client Audité" },
    { id: "2", type: "person", label: "M. Kouassi Jean", risk: "high", x: 250, y: 150, metadata: "Directeur Financier" },
    { id: "3", type: "company", label: "IVOIRE PRESTA", risk: "high", x: 550, y: 150, metadata: "Fournisseur (Batiment)" },
    { id: "4", type: "person", label: "Kouassi Michel", risk: "medium", x: 700, y: 150, metadata: "Gérant Supplier" },
    { id: "5", type: "invoice", label: "FAC-2023-999", risk: "high", x: 550, y: 50, metadata: "12.5M FCFA (Non lettrée)" },
    { id: "6", type: "account", label: "BK-CI-22291", risk: "low", x: 400, y: 500, metadata: "Compte Bancaire" },
    { id: "7", type: "person", label: "Mme. Diallo A.", risk: "low", x: 150, y: 300, metadata: "Actionnaire" }
];

const INITIAL_EDGES: Edge[] = [
    { source: "2", target: "1", type: "EMPLOYED_BY", value: "Salarié" },
    { source: "3", target: "1", type: "SUPPLIES", value: "Prestataire" },
    { source: "4", target: "3", type: "OWNS", value: "Gérant 100%" },
    { source: "2", target: "4", type: "RELATED", value: "Frère" }, // The Conflict of Interest!
    { source: "3", target: "5", type: "ISSUED", value: "Facture" },
    { source: "1", target: "6", type: "HAS_ACCOUNT", value: "Propriétaire" },
    { source: "5", target: "6", type: "PAID_FROM", value: "Virement" }, // Circular flow
];

export default function NeuralForensicsPage() {
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [zoom, setZoom] = useState(1);
    const canvasRef = useRef<HTMLDivElement>(null);

    // Simple manual interaction state
    const [isScanning, setIsScanning] = useState(false);

    const handleNodeClick = (node: Node) => {
        setSelectedNode(node);
    };

    const runNeuralScan = () => {
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 3000);
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col bg-slate-950 overflow-hidden relative selection:bg-rose-500/30">
            {/* Header / HUD */}
            <div className="absolute top-0 left-0 right-0 z-20 p-6 pointer-events-none flex justify-between items-start">
                <div className="pointer-events-auto">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30 backdrop-blur-sm shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                            <Network className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight">NEURAL FORENSICS™</h1>
                            <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">Analyse de Réseau & Détection de Fraude</p>
                        </div>
                    </div>
                </div>

                <div className="pointer-events-auto flex items-center gap-3">
                    <div className="glass-card px-4 py-2 rounded-lg border border-white/5 flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {["S", "I", "P"].map((l, i) => (
                                <div key={i} className="w-6 h-6 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-[10px] text-white font-bold">{l}</div>
                            ))}
                        </div>
                        <span className="text-xs text-slate-400 font-bold">7 Entités chargées</span>
                    </div>
                    <button
                        onClick={runNeuralScan}
                        className={cn(
                            "px-6 py-2 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-900/40 border border-indigo-400/30 flex items-center gap-2 transition-all hover:scale-105",
                            isScanning ? "animate-pulse cursor-wait" : ""
                        )}
                    >
                        {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        {isScanning ? "Analyse en cours..." : "Scanner le Réseau"}
                    </button>
                </div>
            </div>

            {/* MAIN VISUALIZATION AREA */}
            <div className="relative flex-1 bg-[radial-gradient(circle_at_center,#1e293b_0%,#020617_100%)] overflow-hidden" ref={canvasRef}>
                {/* Grid Background */}
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />

                {/* The Graph Layer */}
                <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500" style={{ transform: `scale(${zoom})` }}>
                    <div className="relative w-[800px] h-[600px]">

                        {/* Edges (SVG Lines) */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                            <defs>
                                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                                    <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                                </marker>
                                <marker id="arrowhead-danger" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                                    <polygon points="0 0, 10 3.5, 0 7" fill="#f43f5e" />
                                </marker>
                            </defs>
                            {INITIAL_EDGES.map((edge, i) => {
                                const sourceNode = INITIAL_NODES.find(n => n.id === edge.source);
                                const targetNode = INITIAL_NODES.find(n => n.id === edge.target);
                                if (!sourceNode || !targetNode) return null;

                                const isDanger = edge.type === "RELATED" || (edge.source === "5" && edge.target === "6" && isScanning);

                                return (
                                    <g key={i}>
                                        <line
                                            x1={sourceNode.x} y1={sourceNode.y}
                                            x2={targetNode.x} y2={targetNode.y}
                                            stroke={isDanger ? "#f43f5e" : "#475569"}
                                            strokeWidth={isDanger ? 3 : 1}
                                            strokeDasharray={edge.type === "PAID_FROM" ? "5,5" : "0"}
                                            markerEnd={isDanger ? "url(#arrowhead-danger)" : "url(#arrowhead)"}
                                            className={cn("transition-all duration-1000", isScanning && isDanger ? "animate-pulse" : "")}
                                        />
                                        {/* Edge Label */}
                                        <text
                                            x={(sourceNode.x + targetNode.x) / 2}
                                            y={(sourceNode.y + targetNode.y) / 2 - 10}
                                            fill={isDanger ? "#f43f5e" : "#94a3b8"}
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
                        {INITIAL_NODES.map((node) => (
                            <div
                                key={node.id}
                                onClick={() => handleNodeClick(node)}
                                style={{ top: node.y, left: node.x }} // NOTE: In a real app we'd adhere to Top-Left properly or center it. Here assuming coords are center.
                                className={cn(
                                    "absolute w-16 h-16 -ml-8 -mt-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 hover:scale-110 z-10 border-2 shadow-2xl group",
                                    selectedNode?.id === node.id ? "ring-4 ring-indigo-500 ring-offset-4 ring-offset-slate-900 scale-110" : "",
                                    node.risk === "high" ? "bg-rose-950/80 border-rose-500 shadow-rose-900/50" :
                                        node.risk === "medium" ? "bg-amber-950/80 border-amber-500 shadow-amber-900/50" :
                                            "bg-slate-900/80 border-slate-500 shadow-xl"
                                )}
                            >
                                <div className="text-white">
                                    {node.type === "company" && <Building2 className="w-6 h-6" />}
                                    {node.type === "person" && <Users className="w-6 h-6" />}
                                    {node.type === "invoice" && <Banknote className="w-6 h-6" />}
                                    {node.type === "account" && <Building2 className="w-6 h-6 opacity-50" />}
                                </div>

                                {/* Hover Label */}
                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-3 py-1 rounded text-xs text-white font-bold border border-white/10 pointer-events-none">
                                    {node.label}
                                </div>

                                {/* Pulse Effect for High Risk */}
                                {node.risk === "high" && (
                                    <div className="absolute inset-0 rounded-full border-2 border-rose-500 animate-ping opacity-50" />
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
                "absolute right-0 top-0 bottom-0 w-96 bg-slate-900/95 backdrop-blur-xl border-l border-white/10 p-6 transform transition-transform duration-500 z-30 shadow-2xl",
                selectedNode ? "translate-x-0" : "translate-x-full"
            )}>
                {selectedNode ? (
                    <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
                        <div className="flex justify-between items-start">
                            <h2 className="text-2xl font-black text-white">{selectedNode.label}</h2>
                            <button onClick={() => setSelectedNode(null)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                                <ArrowUpRight className="w-5 h-5" />
                            </button>
                        </div>

                        <div className={cn(
                            "p-4 rounded-xl border flex items-center gap-4",
                            selectedNode.risk === "high" ? "bg-rose-500/10 border-rose-500/30 text-rose-400" :
                                selectedNode.risk === "medium" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                                    "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        )}>
                            <Shield className="w-8 h-8" />
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest mb-1">Score de Risque</p>
                                <p className="text-lg font-bold">
                                    {selectedNode.risk === "high" ? "CRITIQUE (98/100)" : selectedNode.risk === "medium" ? "MODÉRÉ (45/100)" : "FAIBLE (12/100)"}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Métadonnées</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <DetailItem label="Type Entité" value={selectedNode.type} />
                                <DetailItem label="ID Système" value={`NOD-${selectedNode.id}-X`} />
                                <DetailItem label="Rôle/Fonction" value={selectedNode.metadata || "N/A"} fullWidth />
                            </div>
                        </div>

                        {selectedNode.id === "2" && selectedNode.risk === "high" && (
                            <div className="space-y-4 animate-in fade-in duration-700 delay-300">
                                <h3 className="text-sm font-bold text-rose-500 uppercase tracking-widest border-b border-rose-500/20 pb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" /> Analyse IA
                                </h3>
                                <div className="p-4 bg-slate-950 rounded-xl border border-white/5 text-sm text-slate-300 leading-relaxed shadow-inner">
                                    <p>
                                        <span className="text-rose-400 font-bold">ALERTE CONFLIT D'INTÉRÊT :</span> <br />
                                        Ce "Directeur Financier" partage le même nom de famille et la même adresse domiciliaire que le gérant du fournisseur "IVOIRE PRESTA".
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-white/5 flex gap-3">
                                        <button className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg uppercase">Enquêter</button>
                                        <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg uppercase">Marquer Faux Positif</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-600">
                        <p className="text-sm italic">Sélectionnez un nœud pour voir les détails forensiques.</p>
                    </div>
                )}
            </div>

            {/* View Controls */}
            <div className="absolute bottom-6 left-6 flex flex-col gap-2">
                <button onClick={() => setZoom(z => Math.min(z + 0.2, 2))} className="p-3 bg-slate-800 text-slate-300 hover:text-white rounded-xl shadow-lg border border-white/10"><ZoomIn className="w-5 h-5" /></button>
                <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="p-3 bg-slate-800 text-slate-300 hover:text-white rounded-xl shadow-lg border border-white/10"><ZoomOut className="w-5 h-5" /></button>
                <button onClick={() => { setZoom(1); setSelectedNode(null); }} className="p-3 bg-slate-800 text-slate-300 hover:text-white rounded-xl shadow-lg border border-white/10"><Scan className="w-5 h-5" /></button>
            </div>

            <style jsx global>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
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

// Helper specific for the view
function Scan(props: any) { return <ZoomOut {...props} /> } // Quick mock replacement
