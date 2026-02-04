"use client";

import { useState } from "react";
import {
    Folder,
    FileText,
    UploadCloud,
    MoreVertical,
    Share2,
    Download,
    Eye,
    Lock,
    Search,
    Sparkles,
    Filter,
    ArrowRight,
    CheckCircle2,
    X,
    LayoutGrid,
    List
} from "lucide-react";
import { cn } from "@/lib/utils";

type FileType = "pdf" | "excel" | "word" | "image";

interface DocFile {
    id: string;
    name: string;
    type: FileType;
    size: string;
    date: string;
    client: string;
    category: string;
    confidence: number;
    status: "Privé" | "Partagé" | "Signé" | "Verrouillé";
}

const mockFiles: DocFile[] = [
    { id: "1", name: "Liasse_Fiscale_2023.pdf", type: "pdf", size: "2.4 MB", date: "2024-05-20", client: "Société Ivoirienne de Banque", category: "Fiscalité", confidence: 98, status: "Verrouillé" },
    { id: "2", name: "Statuts_Constitutifs.pdf", type: "pdf", size: "1.1 MB", date: "2024-05-18", client: "Traoré Import-Export", category: "Juridique", confidence: 100, status: "Signé" },
    { id: "3", name: "Grand_Livre_Juin.xlsx", type: "excel", size: "450 KB", date: "2024-05-15", client: "Boulangerie du Plateau", category: "Comptabilité", confidence: 95, status: "Privé" },
    { id: "4", name: "Facture_Prestation_Tech.pdf", type: "pdf", size: "89 KB", date: "2024-05-10", client: "Tech Solutions Bénin", category: "Saisie Ventes", confidence: 92, status: "Partagé" },
];

export default function DocumentsPage() {
    const [activeTab, setActiveTab] = useState<"tous" | "partages" | "signes" | "hub">("tous");
    const [isUploading, setIsUploading] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [previewFile, setPreviewFile] = useState<DocFile | null>(null);

    const handleUpload = () => {
        setIsUploading(true);
        setTimeout(() => setIsUploading(false), 3000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-6 rounded-3xl border border-white/5">
                <div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        GED Intelligente
                        <span className="text-[10px] bg-indigo-600 px-2 py-0.5 rounded-full uppercase font-black">Powered by AI</span>
                    </h2>
                    <p className="text-slate-400 mt-1">Classification automatique et indexation sémantique (Norme ISO 27001).</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-white/5 flex items-center gap-2">
                        <Folder className="w-4 h-4" />
                        Structuration Dossier
                    </button>
                    <button
                        onClick={handleUpload}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2 active:scale-95"
                    >
                        <UploadCloud className="w-5 h-5" />
                        Scanner / Upload
                    </button>
                </div>
            </div>

            {/* AI Insight Bar */}
            <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/20">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">Indexation IA en temps réel</p>
                        <p className="text-xs text-indigo-300 opacity-80">4 nouveaux documents classés automatiquement ce matin.</p>
                    </div>
                </div>
                <button className="text-xs font-bold text-indigo-400 hover:text-indigo-200 uppercase tracking-widest flex items-center gap-2">
                    Voir le journal d'indexation <ArrowRight className="w-3 h-3" />
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap justify-between items-center gap-6">
                <div className="flex gap-2 p-1 bg-slate-900 border border-white/5 rounded-xl">
                    {[
                        { id: "tous", label: "Bibliothèque" },
                        { id: "hub", label: "Intelligence Hub" },
                        { id: "partages", label: "Flux Clients" },
                        { id: "signes", label: "Archives Signées" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wide",
                                activeTab === tab.id
                                    ? "bg-slate-800 text-white shadow-xl"
                                    : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4 flex-1 max-w-xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Recherche sémantique (ex: 'Bail commercial 2023 Plateau')..."
                            className="w-full bg-slate-900/50 border border-white/5 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500/50 outline-none"
                        />
                    </div>
                    <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => setViewMode("list")}
                            className={cn("p-2 rounded-lg transition-all", viewMode === "list" ? "bg-slate-800 text-indigo-400 shadow-inner" : "text-slate-600")}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("grid")}
                            className={cn("p-2 rounded-lg transition-all", viewMode === "grid" ? "bg-slate-800 text-indigo-400 shadow-inner" : "text-slate-600")}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                    <button className="p-2.5 bg-slate-900 text-slate-400 rounded-xl border border-white/5 hover:text-white transition-all shadow-xl">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Files List / Grid / Hub */}
            {isUploading ? (
                <div className="bg-slate-900/50 border-2 border-dashed border-indigo-500/30 rounded-3xl p-20 flex flex-col items-center justify-center text-center animate-pulse">
                    <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-6">
                        <UploadCloud className="w-8 h-8 text-indigo-400 animate-bounce" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Nexus IA : Classification en cours...</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">Analyse structurelle et extraction sémantique des documents selon les normes UEMOA/OHADA.</p>
                </div>
            ) : activeTab === "hub" ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-card p-10 rounded-[40px] border border-white/5 bg-indigo-600/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                                <Sparkles className="w-40 h-40 text-indigo-400" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter">Journal de Classification IA</h3>
                            <div className="space-y-4">
                                <ClassificationLogItem icon={CheckCircle2} title="F-2024-092.pdf" type="Facture Fournisseur" client="Dakar Digital" detail="Extrait : 1.2M FCFA - TVA 18% détectée." color="text-emerald-400" />
                                <ClassificationLogItem icon={CheckCircle2} title="PV_AG_2023.pdf" type="Juridique" client="SOGECOM" detail="Détection : Assemblée Générale Ordinaire." color="text-blue-400" />
                                <ClassificationLogItem icon={CheckCircle2} title="Bulletin_Paie_05.pdf" type="Social" client="Telecom Afrique" detail="Extraction : 45 employés traités." color="text-purple-400" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <HubStat label="Documents Classés /30j" value="1,245" trend="+12%" />
                            <HubStat label="Précision Moyenne" value="99.2%" trend="Stable" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/60">
                            <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-6">Moteur de Tri Intelligent</h4>
                            <div className="space-y-3">
                                <HubAction label="Réorganiser Dossiers Clients" icon={Folder} />
                                <HubAction label="Vérifier Indexation Sémantique" icon={Search} />
                                <HubAction label="Purger Doublons IA" icon={X} />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="glass-card rounded-3xl overflow-hidden border border-white/5 bg-slate-900/20">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900/80 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
                            <tr>
                                <th className="px-8 py-5">Document & Classification</th>
                                <th className="px-6 py-5">Client</th>
                                <th className="px-6 py-5">Date</th>
                                <th className="px-6 py-5 text-center">Score IA</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {mockFiles.map((file) => (
                                <tr key={file.id} className="hover:bg-white/[0.03] transition-colors group cursor-pointer" onClick={() => setPreviewFile(file)}>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xl transition-transform group-hover:scale-110",
                                                file.type === "pdf" ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                                                    file.type === "excel" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                                        "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                            )}>
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-slate-200 block text-base">{file.name}</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] px-2 py-0.5 bg-slate-800 rounded-full border border-white/5 text-slate-400 font-bold uppercase">{file.category}</span>
                                                    <span className="text-[10px] text-slate-600 font-bold uppercase">{file.size}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-slate-400 font-medium">{file.client}</td>
                                    <td className="px-6 py-5 text-slate-600 font-mono text-xs">{file.date}</td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: `${file.confidence}%` }} />
                                            </div>
                                            <span className="text-[10px] font-bold text-emerald-500">{file.confidence}%</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all shadow-lg">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all shadow-lg">
                                                <Download className="w-4 h-4" />
                                            </button>
                                            <button className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-500 transition-all">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Sidebar Preview Overlay */}
            {previewFile && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPreviewFile(null)} />
                    <div className="relative w-full max-w-2xl bg-slate-900 h-full border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-950">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-rose-500/20 rounded-2xl">
                                    <FileText className="w-6 h-6 text-rose-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{previewFile.name}</h3>
                                    <p className="text-xs text-slate-500 uppercase font-black tracking-widest">Prévisualisation Documentaire</p>
                                </div>
                            </div>
                            <button onClick={() => setPreviewFile(null)} className="p-2 hover:bg-white/5 rounded-xl text-slate-500 transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-12 bg-white/[0.01]">
                            {/* Mock Document Content */}
                            <div className="w-full aspect-[1/1.4] bg-white rounded-lg shadow-2xl p-12 text-slate-950 space-y-6">
                                <div className="h-8 w-40 bg-slate-200 rounded animate-pulse" />
                                <div className="space-y-3">
                                    <div className="h-4 w-full bg-slate-100 rounded" />
                                    <div className="h-4 w-full bg-slate-100 rounded" />
                                    <div className="h-4 w-3/4 bg-slate-100 rounded" />
                                </div>
                                <div className="h-40 w-full bg-slate-50 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-200">
                                    <FileText className="w-12 h-12 text-slate-200" />
                                </div>
                                <div className="space-y-4 pt-8">
                                    <div className="h-4 w-full bg-slate-100 rounded" />
                                    <div className="h-4 w-1/2 bg-slate-100 rounded" />
                                </div>
                                <div className="mt-20 pt-8 border-t border-slate-100 flex justify-between">
                                    <div className="h-12 w-32 bg-slate-200 rounded" />
                                    <div className="h-12 w-32 bg-slate-200 rounded" />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-950 border-t border-white/10 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Dernière signature</p>
                                    <p className="text-sm font-bold text-white">Aucune signature détectée</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Indexation</p>
                                    <p className="text-sm font-bold text-emerald-400">Terminée (ISO Tag: 9928)</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
                                    Signer ce document
                                </button>
                                <button className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-white/5">
                                    Partager
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ClassificationLogItem({ icon: Icon, title, type, client, detail, color }: any) {
    return (
        <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
            <div className={cn("p-3 rounded-xl bg-white/5", color)}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-white">{title}</h4>
                    <span className="text-[10px] font-black text-slate-500 uppercase">{client}</span>
                </div>
                <div className="flex gap-2 mb-2">
                    <span className="text-[10px] px-2 py-0.5 bg-slate-800 rounded-full text-slate-400 font-bold">{type}</span>
                </div>
                <p className="text-xs text-slate-500 italic">{detail}</p>
            </div>
        </div>
    );
}

function HubStat({ label, value, trend }: { label: string, value: string, trend: string }) {
    return (
        <div className="p-6 bg-slate-900 border border-white/5 rounded-[32px]">
            <p className="text-[10px] text-slate-500 font-black uppercase mb-1 tracking-widest">{label}</p>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{value}</span>
                <span className="text-[10px] font-black text-emerald-400 underline">{trend}</span>
            </div>
        </div>
    );
}

function HubAction({ label, icon: Icon }: any) {
    return (
        <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all">
            <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-200">{label}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600" />
        </button>
    );
}
