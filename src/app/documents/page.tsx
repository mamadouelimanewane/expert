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
    Lock
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
    status: "Privé" | "Partagé" | "Signé" | "Verrouillé";
}

const mockFiles: DocFile[] = [
    { id: "1", name: "Liasse_Fiscale_2023.pdf", type: "pdf", size: "2.4 MB", date: "2024-05-20", client: "Société Ivoirienne de Banque", status: "Verrouillé" },
    { id: "2", name: "Statuts_Constitutifs.pdf", type: "pdf", size: "1.1 MB", date: "2024-05-18", client: "Traoré Import-Export", status: "Signé" },
    { id: "3", name: "Grand_Livre_Juin.xlsx", type: "excel", size: "450 KB", date: "2024-05-15", client: "Boulangerie du Plateau", status: "Privé" },
    { id: "4", name: "Contrat_Prestation.docx", type: "word", size: "89 KB", date: "2024-05-10", client: "Tech Solutions Bénin", status: "Partagé" },
];

export default function DocumentsPage() {
    const [activeTab, setActiveTab] = useState<"tous" | "partages" | "signes">("tous");

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">GED & Documents</h2>
                    <p className="text-slate-400 mt-1">Gestion Électronique des Documents centralisée.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors border border-slate-700 flex items-center gap-2">
                        <Folder className="w-4 h-4" />
                        Nouveau Dossier
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2">
                        <UploadCloud className="w-5 h-5" />
                        Uploader
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl w-fit border border-slate-800">
                {[
                    { id: "tous", label: "Tous les fichiers" },
                    { id: "partages", label: "Partagés clients" },
                    { id: "signes", label: "Signés (eIDAS)" },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                            activeTab === tab.id
                                ? "bg-slate-800 text-white shadow-sm"
                                : "text-slate-400 hover:text-slate-200"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Upload Zone (Drag & Drop placeholder) */}
            <div className="border-2 border-dashed border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-800/30 hover:border-indigo-500/50 transition-all cursor-pointer group">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">Déposez vos fichiers ici</h3>
                <p className="text-slate-500 text-sm">ou cliquez pour parcourir (PDF, Excel, Images)</p>
            </div>

            {/* Files List */}
            <div className="glass-card rounded-2xl overflow-hidden border border-slate-700/50">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900/50 text-slate-400 font-medium border-b border-slate-700/50">
                        <tr>
                            <th className="px-6 py-4">Nom du fichier</th>
                            <th className="px-6 py-4">Client</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Taille</th>
                            <th className="px-6 py-4">Statut</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {mockFiles.map((file) => (
                            <tr key={file.id} className="hover:bg-slate-800/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <FileText className={cn(
                                            "w-5 h-5",
                                            file.type === "pdf" ? "text-rose-400" :
                                                file.type === "excel" ? "text-emerald-400" :
                                                    file.type === "word" ? "text-blue-400" : "text-slate-400"
                                        )} />
                                        <span className="font-medium text-slate-200">{file.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-400">{file.client}</td>
                                <td className="px-6 py-4 text-slate-500">{file.date}</td>
                                <td className="px-6 py-4 text-slate-500">{file.size}</td>
                                <td className="px-6 py-4">
                                    <span className={cn(
                                        "px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit",
                                        file.status === "Verrouillé" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                                            file.status === "Signé" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                                file.status === "Partagé" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                                    "bg-slate-700/50 text-slate-400"
                                    )}>
                                        {file.status === "Verrouillé" && <Lock className="w-3 h-3" />}
                                        {file.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white" title="Voir">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white" title="Télécharger">
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white" title="Partager">
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
