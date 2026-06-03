"use client";

import { useState } from "react";
import {
    Folder, FileText, UploadCloud, MoreVertical, Share2, Download,
    Eye, Lock, Search, Sparkles, Filter, ArrowRight, CheckCircle2,
    X, LayoutGrid, List, AlertTriangle, ShieldCheck, Mail, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DocFile {
    id: string;
    name: string;
    type: "pdf" | "excel" | "word" | "image";
    size: string;
    date: string;
    client: string;
    category: string;
    confidence: number;
    status: "Privé" | "Partagé" | "Signé" | "Verrouillé";
    missing?: boolean;
}

const mockFiles: DocFile[] = [
    { id: "1", name: "Facture_SONELEC_Avril.pdf", type: "pdf", size: "1.2 MB", date: "2024-05-18", client: "Société Ivoirienne de Banque", category: "Factures Fournisseurs", confidence: 99, status: "Privé" },
    { id: "2", name: "Relevé_Bancaire_SGCI_Mai.pdf", type: "pdf", size: "3.4 MB", date: "2024-05-20", client: "Société Ivoirienne de Banque", category: "Banque", confidence: 100, status: "Privé" },
    { id: "3", name: "Contrat_Prestation_Ndiaye.pdf", type: "pdf", size: "850 KB", date: "2024-05-15", client: "Pharmacie Dior", category: "Juridique", confidence: 85, status: "Signé" },
    { id: "4", name: "Liasse_Fiscale_2023.pdf", type: "pdf", size: "5.1 MB", date: "2024-04-30", client: "Groupe SONELEC", category: "Fiscalité", confidence: 100, status: "Verrouillé" }
];

export default function SmartGEDPage() {
    const [view, setView] = useState<"list" | "grid">("list");
    const [files, setFiles] = useState(mockFiles);
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = () => {
        setIsUploading(true);
        setTimeout(() => setIsUploading(false), 2500);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Smart GED */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[40px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
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
                    <h2 className="text-4xl font-black text-white tracking-tight">GED <span className="text-indigo-400">Intelligente</span></h2>
                    <p className="text-slate-400 mt-2 max-w-xl font-medium">
                        Déposez vos documents. Notre IA les lit, les classe et alerte vos clients automatiquement s'il manque des pièces comptables.
                    </p>
                </div>
                <div className="relative z-10 flex gap-4">
                    <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 border border-white/5 shadow-xl">
                        <Share2 className="w-4 h-4" /> Partager un dossier
                    </button>
                    <button 
                        onClick={handleUpload}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 shadow-xl shadow-indigo-600/30"
                    >
                        <UploadCloud className="w-4 h-4" /> Uploader
                    </button>
                </div>
            </div>

            {/* AI Missing Documents Tracker */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 relative overflow-hidden">
                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        Suivi de Complétude (Requis pour la clôture)
                    </h3>
                    <div className="space-y-4">
                        {[
                            { client: "Société Ivoirienne de Banque", doc: "Relevé Bancaire BICI - Mai 2026", status: "Manquant", urgent: true },
                            { client: "Pharmacie Dior", doc: "Factures d'Achats (Importations)", status: "Manquant", urgent: false },
                        ].map((alert, i) => (
                            <div key={i} className="p-4 bg-slate-800/40 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-slate-800/60 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-2 h-2 rounded-full", alert.urgent ? "bg-rose-500 animate-pulse" : "bg-amber-500")} />
                                    <div>
                                        <p className="font-bold text-white text-sm">{alert.doc}</p>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{alert.client}</p>
                                    </div>
                                </div>
                                <button className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                                    <Mail className="w-3 h-3" /> Relance Auto
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-1 glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 flex flex-col justify-center text-center relative overflow-hidden group">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h3 className="text-4xl font-black text-white">92%</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 mb-4">Taux de Complétude Global</p>
                    <p className="text-xs text-slate-500 font-medium">L'automatisation des relances a réduit de 15 jours le délai de récupération des pièces.</p>
                </div>
            </div>

            {/* Dropzone IA */}
            {isUploading && (
                <div className="glass-card p-16 rounded-[40px] border-2 border-dashed border-indigo-500/30 bg-slate-900/40 text-center animate-pulse">
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
                                placeholder="Rechercher un document, client, montant..." 
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
                            <table className="w-full text-left text-sm">
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
                                    {files.map(file => (
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
                                                <span className="text-xs font-black text-emerald-400">{file.confidence}%</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase border flex items-center gap-1 w-fit",
                                                    file.status === "Verrouillé" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                                    file.status === "Signé" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                    "bg-slate-800 text-slate-400 border-slate-700"
                                                )}>
                                                    {file.status === "Verrouillé" && <Lock className="w-3 h-3" />}
                                                    {file.status === "Signé" && <CheckCircle2 className="w-3 h-3" />}
                                                    {file.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-slate-500 text-xs font-medium">{new Date(file.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"><Eye className="w-4 h-4" /></button>
                                                    <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"><Download className="w-4 h-4" /></button>
                                                    <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"><MoreVertical className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {files.map(file => (
                                <div key={file.id} className="p-6 border border-white/5 bg-slate-900/40 rounded-[32px] hover:bg-slate-900/60 transition-colors group relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-slate-800 rounded-2xl">
                                            <FileText className="w-6 h-6 text-indigo-400" />
                                        </div>
                                        <button className="p-2 text-slate-500 hover:text-white transition-colors"><MoreVertical className="w-4 h-4" /></button>
                                    </div>
                                    <h4 className="font-bold text-white text-sm mb-1 truncate">{file.name}</h4>
                                    <p className="text-[10px] text-slate-500 mb-4">{file.size} · {new Date(file.date).toLocaleDateString()}</p>
                                    
                                    <div className="space-y-2 mt-auto">
                                        <div className="text-[9px] font-black uppercase text-slate-600 tracking-widest">{file.client}</div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-slate-800 rounded text-[9px] font-black uppercase text-slate-400 border border-slate-700 truncate">{file.category}</span>
                                            {file.status === "Signé" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                                            {file.status === "Verrouillé" && <Lock className="w-4 h-4 text-rose-400" />}
                                        </div>
                                    </div>

                                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-[32px] flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"><Eye className="w-5 h-5" /></button>
                                        <button className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"><Download className="w-5 h-5" /></button>
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
