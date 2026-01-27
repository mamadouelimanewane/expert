"use client";

import { useState } from "react";
import {
    FileCheck,
    Clock,
    AlertCircle,
    CheckCircle2,
    Filter,
    Download,
    ExternalLink,
    Calculator,
    History,
    Info
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TaxDeclaration {
    id: string;
    client: string;
    type: "TVA" | "AIR" | "BIC" | "CSS";
    month: string;
    country: string;
    amountToPay: string;
    status: "a_preparer" | "prete" | "teletransmise" | "payee";
    deadline: string;
}

const MOCK_DECLARATIONS: TaxDeclaration[] = [
    { id: "1", client: "Société Ivoirienne de Banque", type: "TVA", month: "Mai 2024", country: "CI", amountToPay: "2 450 000", status: "a_preparer", deadline: "15 Juin" },
    { id: "2", client: "Traoré Import-Export", type: "TVA", month: "Mai 2024", country: "SN", amountToPay: "850 000", status: "prete", deadline: "15 Juin" },
    { id: "3", client: "Tech Solutions Bénin", type: "AIR", month: "Mai 2024", country: "BJ", amountToPay: "125 000", status: "teletransmise", deadline: "10 Juin" },
    { id: "4", client: "Boulangerie du Plateau", type: "TVA", month: "Mai 2024", country: "CM", amountToPay: "310 000", status: "payee", deadline: "15 Juin" },
    { id: "5", client: "Société Ivoirienne de Banque", type: "AIR", month: "Mai 2024", country: "CI", amountToPay: "450 000", status: "a_preparer", deadline: "15 Juin" },
];

export default function DeclarationsPage() {
    const [activeStatus, setActiveStatus] = useState<string>("tous");
    const [selectedDecl, setSelectedDecl] = useState<TaxDeclaration | null>(MOCK_DECLARATIONS[0]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Calculator className="w-8 h-8 text-orange-500" />
                        Déclarations Fiscales Mensuelles
                    </h2>
                    <p className="text-slate-400 mt-1">Production et suivi des déclarations périodiques (TVA, Prélèvements, Cotisations).</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium border border-slate-700 flex items-center gap-2">
                        <History className="w-4 h-4" />
                        Historique
                    </button>
                    <button className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold shadow-lg shadow-orange-500/25 flex items-center gap-2">
                        <FileCheck className="w-5 h-5" />
                        Générer Déclaration
                    </button>
                </div>
            </div>

            {/* Stats / Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "À Préparer", count: 2, color: "text-slate-400", bg: "bg-slate-500/10" },
                    { label: "Prêtes", count: 1, color: "text-blue-400", bg: "bg-blue-500/10" },
                    { label: "Transmises", count: 1, color: "text-amber-400", bg: "bg-amber-500/10" },
                    { label: "Payées", count: 1, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                ].map((stat, i) => (
                    <div key={i} className={cn("glass-card p-4 rounded-xl border border-slate-700/50 flex flex-col items-center", stat.bg)}>
                        <span className={cn("text-2xl font-bold", stat.color)}>{stat.count}</span>
                        <span className="text-xs font-medium text-slate-500 uppercase mt-1">{stat.label}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List of Declarations */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex gap-2 bg-slate-900/50 p-1 rounded-xl w-fit border border-slate-800">
                        {["tous", "a_preparer", "prete", "payee"].map((s) => (
                            <button
                                key={s}
                                onClick={() => setActiveStatus(s)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all",
                                    activeStatus === s ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                {s.replace("_", " ")}
                            </button>
                        ))}
                    </div>

                    <div className="glass-card rounded-2xl border border-slate-700/50 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-900/50 text-slate-500 font-medium border-b border-slate-700/50">
                                <tr>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Client / Type</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Période</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Montant</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Statut</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Échéance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {MOCK_DECLARATIONS.map((decl) => (
                                    <tr
                                        key={decl.id}
                                        onClick={() => setSelectedDecl(decl)}
                                        className={cn(
                                            "cursor-pointer transition-colors group",
                                            selectedDecl?.id === decl.id ? "bg-orange-500/5" : "hover:bg-slate-800/30"
                                        )}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-400 border border-slate-700">
                                                    {decl.country}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-200 group-hover:text-white">{decl.client}</p>
                                                    <p className="text-[10px] text-orange-400 font-mono">Déclaration {decl.type}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">{decl.month}</td>
                                        <td className="px-6 py-4 font-mono font-bold text-slate-200">{decl.amountToPay} <span className="text-[10px] text-slate-500">FCFA</span></td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                                                decl.status === "payee" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                    decl.status === "teletransmise" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                        decl.status === "prete" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-slate-700/50 text-slate-400 border-slate-600/50"
                                            )}>
                                                {decl.status.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3 h-3 text-slate-500" />
                                                <span className="text-slate-300 font-medium">{decl.deadline}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Action Panel / Detail View */}
                <div className="space-y-6">
                    <div className="glass-card rounded-2xl p-6 border border-slate-700/50 bg-gradient-to-b from-slate-900/50 to-orange-900/5">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Info className="w-4 h-4 text-orange-400" />
                            Détails Déclaration
                        </h3>

                        {selectedDecl ? (
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Client</label>
                                    <p className="text-white font-bold">{selectedDecl.client}</p>
                                </div>

                                <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">TVA Collectée (200)</span>
                                        <span className="text-white font-mono">4 500 000</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">TVA Déductible (210)</span>
                                        <span className="text-rose-400 font-mono">-2 050 000</span>
                                    </div>
                                    <div className="h-px bg-slate-800" />
                                    <div className="flex justify-between">
                                        <span className="text-sm font-bold text-white uppercase">TVA Net à Payer</span>
                                        <span className="text-orange-400 font-mono font-bold">{selectedDecl.amountToPay}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                                        <ExternalLink className="w-4 h-4" />
                                        Aller sur e-Impôts {selectedDecl.country}
                                    </button>
                                    <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2">
                                        <Download className="w-4 h-4" />
                                        Télécharger Formulaire G n°50
                                    </button>
                                </div>

                                <div className="pt-4 border-t border-slate-800">
                                    <p className="text-[10px] text-slate-500 italic">
                                        L'IA a vérifié les montants par rapport au Grand Livre.
                                        <span className="text-emerald-400 ml-1">Aucune incohérence détectée.</span>
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-slate-500 text-sm italic">Sélectionnez une ligne pour gérer la déclaration.</p>
                            </div>
                        )}
                    </div>

                    <div className="glass-card rounded-2xl p-6 border border-slate-700/50">
                        <h3 className="font-bold text-white mb-4">Portails Fiscaux</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {["e-Impôts CI", "SISEN Sénégal", "e-Services Bénin", "DGI Cameroun"].map((p) => (
                                <div key={p} className="p-2 bg-slate-800/50 border border-slate-700 rounded-lg text-xs text-slate-300 flex items-center justify-between group cursor-pointer hover:border-orange-500/50 transition-colors">
                                    {p}
                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
