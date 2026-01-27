"use client";

import { useState } from "react";
import {
    FileCog,
    CheckSquare,
    FileSignature,
    Printer,
    Save,
    ChevronRight,
    AlertCircle,
    FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PrepDocument {
    id: string;
    title: string;
    type: "contract" | "checklist" | "memo";
    status: "pending" | "draft" | "validated";
    mandatory: boolean;
    lastModified?: string;
}

const MISSION_TEMPLATES: PrepDocument[] = [
    { id: "1", title: "Acceptation de Mandat & Risques (NEO)", type: "checklist", status: "validated", mandatory: true, lastModified: "20/05/2024" },
    { id: "2", title: "Lettre de Mission (Modèle ONECCA)", type: "contract", status: "draft", mandatory: true, lastModified: "18:30" },
    { id: "3", title: "Déclaration d'Indépendance", type: "checklist", status: "pending", mandatory: true },
    { id: "4", title: "Plan de Mission & Budget", type: "memo", status: "pending", mandatory: false },
];

export default function MissionPrepPage() {
    const [selectedClient, setSelectedClient] = useState("Société Ivoirienne de Banque");
    const [selectedDoc, setSelectedDoc] = useState<PrepDocument | null>(MISSION_TEMPLATES[1]);
    const [docContent, setDocContent] = useState(`LETTRE DE MISSION

ENTRE LES SOUSSIGNÉS :

Le Cabinet [NOM_CABINET], Société d'Expertise Comptable inscrite au Tableau de l'Ordre sous le n°..., 
Représenté par [NOM_EXPERT], Expert-Comptable Diplômé.
Ci-après désigné "Le Cabinet"

ET

${selectedClient}
[ADRESSE_CLIENT]
Représentée par [NOM_DIRIGEANT]
Ci-après désignée "Le Client"

1. OBJET DE LA MISSION
La présente mission a pour objet : Tenue de comptabilité et Établissement des comptes annuels (Système Normal OHADA).

2. OBLIGATIONS DU CABINET
Le Cabinet s'engage à respecter les normes professionnelles de l'Ordre...`);

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-6">
            {/* Sidebar: Context & Checklist */}
            <div className="w-96 flex flex-col gap-6">
                {/* Client Selector (Context) */}
                <div className="glass-card rounded-2xl p-4 border border-slate-700/50">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Dossier Client</label>
                    <select
                        value={selectedClient}
                        onChange={(e) => setSelectedClient(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 font-medium"
                    >
                        <option>Société Ivoirienne de Banque</option>
                        <option>Traoré Import-Export</option>
                        <option>Boulangerie du Plateau</option>
                    </select>
                    <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                        <CheckSquare className="w-4 h-4" />
                        <span>Exercice 2024 ouvert</span>
                    </div>
                </div>

                {/* Documents List */}
                <div className="flex-1 glass-card rounded-2xl border border-slate-700/50 overflow-hidden flex flex-col">
                    <div className="p-4 bg-slate-900/50 border-b border-slate-700/50 flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <FileCog className="w-4 h-4 text-cyan-400" />
                            Documents Requis
                        </h3>
                        <span className="text-xs bg-slate-800 px-2 py-1 rounded-full text-slate-400">1/4</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {MISSION_TEMPLATES.map(doc => (
                            <div
                                key={doc.id}
                                onClick={() => setSelectedDoc(doc)}
                                className={cn(
                                    "p-3 rounded-xl border cursor-pointer transition-all group relative",
                                    selectedDoc?.id === doc.id
                                        ? "bg-slate-800 border-indigo-500"
                                        : "bg-transparent border-transparent hover:bg-slate-800/50"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={cn(
                                        "font-medium text-sm pr-6",
                                        selectedDoc?.id === doc.id ? "text-white" : "text-slate-300"
                                    )}>{doc.title}</span>
                                    {doc.mandatory && (
                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                    )}
                                </div>

                                <div className="flex items-center gap-2 mt-2">
                                    <span className={cn(
                                        "text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold",
                                        doc.status === "validated" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                            doc.status === "draft" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                "bg-slate-700 text-slate-500 border-slate-600"
                                    )}>
                                        {doc.status === "pending" ? "À faire" : doc.status === "draft" ? "Brouillon" : "Validé"}
                                    </span>
                                    {doc.lastModified && <span className="text-[10px] text-slate-600">Modifié: {doc.lastModified}</span>}
                                </div>

                                {selectedDoc?.id === doc.id && (
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-xl" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Editor / Preview Area */}
            <div className="flex-1 glass-card rounded-2xl border border-slate-700/50 flex flex-col overflow-hidden">
                {selectedDoc ? (
                    <>
                        <div className="p-4 border-b border-slate-700/50 bg-slate-900/50 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold text-white">{selectedDoc.title}</h2>
                                <p className="text-xs text-slate-500">Modèle standard mis à jour le 01/01/2024 • ONECCA</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-2">
                                    <Printer className="w-4 h-4" />
                                    Imprimer
                                </button>
                                <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                                    <Save className="w-4 h-4" />
                                    Enregistrer
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 bg-slate-100 text-slate-900 p-8 overflow-y-auto">
                            <div className="max-w-3xl mx-auto bg-white shadow-xl min-h-[800px] p-12">
                                {/* Document Mock */}
                                <div className="flex justify-between items-start mb-12 border-b-2 border-slate-900 pb-4">
                                    <div>
                                        <h1 className="text-2xl font-bold uppercase tracking-widest">Cabinet 360</h1>
                                        <p className="text-xs text-slate-500">Abidjan, Plateau, Immeuble Trade Center</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">Réf: {selectedDoc.id}-2024</p>
                                        <p className="text-sm">Date: 25/05/2024</p>
                                    </div>
                                </div>

                                <textarea
                                    className="w-full h-[600px] resize-none focus:outline-none text-sm font-serif leading-relaxed"
                                    value={docContent}
                                    onChange={(e) => setDocContent(e.target.value)}
                                />

                                <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between">
                                    <div className="text-center">
                                        <p className="text-sm font-bold mb-16">Le Cabinet</p>
                                        <p className="text-xs italic text-slate-400">(Signature Expert)</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold mb-16">Le Client</p>
                                        <p className="text-xs italic text-slate-400">Lu et approuvé</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                        <FileText className="w-16 h-16 mb-4 opacity-20" />
                        <p>Sélectionnez un document pour l'éditer</p>
                    </div>
                )}
            </div>
        </div>
    );
}
