"use client";

import { useState, useEffect, useRef } from "react";
import {
    Folder, FileText, UploadCloud, MoreVertical, Share2, Download,
    Eye, Lock, Search, Sparkles, Filter, ArrowRight, CheckCircle2,
    X, LayoutGrid, List, AlertTriangle, ShieldCheck, Mail, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DocFile {
    id: string;
    name: string;
    size: string;
    date: string;
    client: string;
    category: string;
    confidence: number | null;
    status: string;
    fileUrl: string;
}

const STATUS_LABELS: Record<string, string> = {
    UPLOADED: "Déposé",
    PROCESSING: "En traitement",
    PROCESSED: "Traité",
    ERROR: "Erreur OCR",
};

function formatSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SmartGEDPage() {
    const [view, setView] = useState<"list" | "grid">("list");
    const [files, setFiles] = useState<DocFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [clients, setClients] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadData = () => {
        fetch('/api/documents')
            .then(res => res.json())
            .then(data => {
                const docs: DocFile[] = (data.documents || []).map((d: any) => ({
                    id: d.id,
                    name: d.originalName,
                    size: formatSize(d.fileSize),
                    date: d.createdAt,
                    client: d.client?.companyName || `${d.client?.firstName ?? ""} ${d.client?.lastName ?? ""}`.trim() || "—",
                    category: d.type,
                    confidence: d.ocrData?.confidence ?? null,
                    status: d.status,
                    fileUrl: d.fileUrl,
                }));
                setFiles(docs);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadData();
        fetch('/api/clients').then(r => r.json()).then(d => setClients(d.clients || []));
    }, []);

    const handleUploadClick = () => fileInputRef.current?.click();

    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || clients.length === 0) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('clientId', clients[0].id);
        try {
            await fetch('/api/documents', { method: 'POST', body: formData });
            loadData();
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const filtered = files.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase()) || f.client.toLowerCase().includes(search.toLowerCase())
    );
    const processedCount = files.filter(f => f.status === "PROCESSED").length;
    const completionPct = files.length > 0 ? Math.round((processedCount / files.length) * 100) : 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Smart GED */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-4 sm:p-6 lg:p-10 rounded-[40px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 sm:p-8 lg:p-12 opacity-5 pointer-events-none">
                    <Folder className="w-48 h-48 text-indigo-400" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                            Collecte Automatique
                        </span>
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-emerald-500/20 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> OCR Actif
                        </span>
                    </div>
                    <h2 className="page-title">GED <span className="text-indigo-400">Intelligente</span></h2>
                    <p className="page-subtitle">
                        Déposez vos documents : l'OCR les lit et en extrait les données automatiquement. L'alerte de pièces manquantes n'est pas encore implémentée.
                    </p>
                </div>
                <div className="relative z-10 flex gap-4">
                    <button disabled title="Non implémenté" className="px-6 py-3 bg-slate-800/50 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 cursor-not-allowed">
                        <Share2 className="w-4 h-4" /> Partager un dossier
                    </button>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileSelected} />
                    <button
                        onClick={handleUploadClick}
                        disabled={isUploading || clients.length === 0}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 shadow-xl shadow-indigo-600/30"
                    >
                        <UploadCloud className="w-4 h-4" /> {isUploading ? "Analyse OCR…" : "Uploader"}
                    </button>
                </div>
            </div>

            {/* Statistiques réelles de la GED */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 relative overflow-hidden">
                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                        <FileText className="w-5 h-5 text-indigo-400" />
                        Répartition par catégorie
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(
                            files.reduce((acc: Record<string, number>, f) => {
                                acc[f.category] = (acc[f.category] || 0) + 1;
                                return acc;
                            }, {})
                        ).map(([category, count]) => (
                            <div key={category} className="flex items-center justify-between p-3 bg-slate-800/40 border border-white/5 rounded-xl">
                                <span className="text-sm text-slate-300">{category}</span>
                                <span className="text-sm font-black text-white">{count}</span>
                            </div>
                        ))}
                        {files.length === 0 && <p className="text-sm text-slate-500">Aucun document déposé pour l'instant.</p>}
                    </div>
                </div>

                <div className="lg:col-span-1 glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 flex flex-col justify-center text-center relative overflow-hidden group">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">{completionPct}%</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 mb-4">Documents Traités par l'OCR</p>
                    <p className="text-xs text-slate-500 font-medium">{processedCount} document{processedCount !== 1 ? "s" : ""} sur {files.length} entièrement traité{processedCount !== 1 ? "s" : ""}.</p>
                </div>
            </div>

            {/* Dropzone IA */}
            {isUploading && (
                <div className="glass-card p-4 sm:p-8 lg:p-16 rounded-[40px] border-2 border-dashed border-indigo-500/30 bg-slate-900/40 text-center animate-pulse">
                    <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="w-8 h-8 text-indigo-400 animate-spin" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">Analyse OCR en cours...</h3>
                    <p className="text-slate-400 text-sm">Classification par client et catégorie fiscale en cours.</p>
                </div>
            )}

            {/* Main File Explorer */}
            <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 bg-slate-900/40 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Rechercher un document, client..."
                                className="w-full bg-slate-800/50 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white border border-white/5 transition-colors"><Filter className="w-4 h-4" /></button>
                        <div className="flex p-1 bg-slate-800 rounded-xl border border-white/5">
                            <button onClick={() => setView("list")} className={cn("p-2 rounded-lg transition-colors", view === "list" ? "bg-slate-700 text-white" : "text-slate-500")}><List className="w-4 h-4" /></button>
                            <button onClick={() => setView("grid")} className={cn("p-2 rounded-lg transition-colors", view === "grid" ? "bg-slate-700 text-white" : "text-slate-500")}><LayoutGrid className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {view === "list" ? (
                        <div className="overflow-x-auto">
                            <table className="apix-table w-full text-left text-sm">
                                <thead className="bg-slate-900/80 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-4">Nom du Fichier</th>
                                        <th className="px-6 py-4">Client</th>
                                        <th className="px-6 py-4">Catégorie IA</th>
                                        <th className="px-6 py-4 text-center">Fiabilité OCR</th>
                                        <th className="px-6 py-4">Statut</th>
                                        <th className="px-6 py-4 text-right">Date</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filtered.map(file => (
                                        <tr key={file.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                <div className="p-2 bg-slate-800 rounded-xl">
                                                    <FileText className="w-5 h-5 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">{file.name}</p>
                                                    <p className="text-[10px] text-slate-500">{file.size}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300 font-medium">{file.client}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-slate-800 rounded text-[10px] font-black uppercase text-slate-400 border border-slate-700">{file.category}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-xs font-black text-emerald-400">{file.confidence !== null ? `${file.confidence}%` : "—"}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase border flex items-center gap-1 w-fit",
                                                    file.status === "ERROR" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                                    file.status === "PROCESSED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                    "bg-slate-800 text-slate-400 border-slate-700"
                                                )}>
                                                    {file.status === "ERROR" && <Lock className="w-3 h-3" />}
                                                    {file.status === "PROCESSED" && <CheckCircle2 className="w-3 h-3" />}
                                                    {STATUS_LABELS[file.status] || file.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-slate-500 text-xs font-medium">{new Date(file.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <a href={file.fileUrl} target="_blank" rel="noreferrer" title="Voir" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"><Eye className="w-4 h-4" /></a>
                                                    <a href={file.fileUrl} download={file.name} title="Télécharger" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"><Download className="w-4 h-4" /></a>
                                                    <button disabled title="Non implémenté" className="p-2 rounded-lg text-slate-700 cursor-not-allowed"><MoreVertical className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filtered.map(file => (
                                <div key={file.id} className="p-6 border border-white/5 bg-slate-900/40 rounded-[32px] hover:bg-slate-900/60 transition-colors group relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-slate-800 rounded-2xl">
                                            <FileText className="w-6 h-6 text-indigo-400" />
                                        </div>
                                        <button disabled title="Non implémenté" className="p-2 text-slate-700 cursor-not-allowed"><MoreVertical className="w-4 h-4" /></button>
                                    </div>
                                    <h4 className="font-bold text-white text-sm mb-1 truncate">{file.name}</h4>
                                    <p className="text-[10px] text-slate-500 mb-4">{file.size} · {new Date(file.date).toLocaleDateString()}</p>

                                    <div className="space-y-2 mt-auto">
                                        <div className="text-[9px] font-black uppercase text-slate-600 tracking-widest">{file.client}</div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-slate-800 rounded text-[9px] font-black uppercase text-slate-400 border border-slate-700 truncate">{file.category}</span>
                                            {file.status === "PROCESSED" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                                            {file.status === "ERROR" && <Lock className="w-4 h-4 text-rose-400" />}
                                        </div>
                                    </div>

                                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-[32px] flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <a href={file.fileUrl} target="_blank" rel="noreferrer" title="Voir" className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"><Eye className="w-5 h-5" /></a>
                                        <a href={file.fileUrl} download={file.name} title="Télécharger" className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"><Download className="w-5 h-5" /></a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
