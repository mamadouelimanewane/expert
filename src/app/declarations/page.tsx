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
    Info,
    Calendar,
    ChevronRight,
    ArrowRight,
    Search,
    RefreshCw,
    Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TaxDeclaration {
    id: string;
    client: string;
    type: "TVA" | "AIR" | "BIC" | "CSS" | "PATENTE" | "IMF";
    month: string;
    country: string;
    amountToPay: string;
    status: "a_preparer" | "validation" | "prete" | "teletransmise" | "payee";
    deadline: string;
    risk: "faible" | "moyen" | "élevé";
}

const MOCK_DECLARATIONS: TaxDeclaration[] = [
    { id: "1", client: "Société Ivoirienne de Banque", type: "TVA", month: "Mai 2024", country: "CI", amountToPay: "24 500 000", status: "a_preparer", deadline: "15 Juin", risk: "faible" },
    { id: "2", client: "Traoré Import-Export", type: "TVA", month: "Mai 2024", country: "SN", amountToPay: "8 500 000", status: "validation", deadline: "15 Juin", risk: "moyen" },
    { id: "3", client: "Tech Solutions Bénin", type: "AIR", month: "Mai 2024", country: "BJ", amountToPay: "1 250 000", status: "teletransmise", deadline: "10 Juin", risk: "faible" },
    { id: "4", client: "Boulangerie du Plateau", type: "PATENTE", month: "Exercice 2024", country: "CM", amountToPay: "350 000", status: "payee", deadline: "31 Mars", risk: "faible" },
    { id: "5", client: "Société Ivoirienne de Banque", type: "AIR", month: "Mai 2024", country: "CI", amountToPay: "4 500 000", status: "a_preparer", deadline: "15 Juin", risk: "faible" },
];

export default function DeclarationsPage() {
    const [activeStatus, setActiveStatus] = useState<string>("tous");
    const [selectedDecl, setSelectedDecl] = useState<TaxDeclaration | null>(MOCK_DECLARATIONS[0]);

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
            {/* Header with Fiscal Calendar Context */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
                <div>
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg shadow-orange-500/20">
                            <Calculator className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tighter">Fiscalité & Déclarations</h2>
                    </div>
                    <p className="text-slate-400 font-medium text-lg max-w-2xl">
                        Pilotage des échéances fiscales (TVA, IS, IRVM) synchronisé avec la comptabilité.
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-white/5">
                    <div className="px-6 py-3 bg-slate-800 rounded-xl text-center min-w-[100px]">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">PROCHAINE ÉCHÉANCE</p>
                        <p className="text-xl font-black text-white">15 JUIN</p>
                    </div>
                    <div className="h-10 w-px bg-slate-700" />
                    <div className="px-6 py-3 rounded-xl text-center min-w-[100px]">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">TOTAL À RÉGLER</p>
                        <p className="text-xl font-black text-orange-400">38.7M <span className="text-[10px]">FCFA</span></p>
                    </div>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List of Declarations */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Filters */}
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 w-fit">
                            {["tous", "a_preparer", "validation", "teletransmise"].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setActiveStatus(s)}
                                    className={cn(
                                        "px-5 py-2.5 rounded-xl text-xs font-black uppercase transition-all",
                                        activeStatus === s ? "bg-white text-slate-950 shadow-lg" : "text-slate-500 hover:text-white"
                                    )}
                                >
                                    {s.replace("_", " ")}
                                </button>
                            ))}
                        </div>
                        <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors">
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Table Card */}
                    <div className="glass-card rounded-[32px] border border-white/5 overflow-hidden bg-slate-900/20">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/80 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-6">Impôt / Client</th>
                                    <th className="px-6 py-6 text-center">Période</th>
                                    <th className="px-6 py-6 text-right">Montant</th>
                                    <th className="px-6 py-6 text-center">Risque IA</th>
                                    <th className="px-6 py-6 text-center">Statut</th>
                                    <th className="px-6 py-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {MOCK_DECLARATIONS.map((decl) => (
                                    <tr
                                        key={decl.id}
                                        onClick={() => setSelectedDecl(decl)}
                                        className={cn(
                                            "cursor-pointer transition-all group hover:bg-white/[0.02]",
                                            selectedDecl?.id === decl.id && "bg-white/[0.04]"
                                        )}
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center font-black text-xs text-slate-400">
                                                    {decl.type}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white group-hover:text-orange-400 transition-colors">{decl.client}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <img
                                                            src={`https://flagcdn.com/w20/${decl.country.toLowerCase()}.png`}
                                                            alt={decl.country}
                                                            className="w-4 h-auto rounded-[2px] opacity-70"
                                                        />
                                                        <span className="text-[10px] text-slate-500 font-bold uppercase">{decl.country}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-medium text-slate-300 border border-white/5">{decl.month}</span>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <span className="font-mono font-bold text-white">{decl.amountToPay}</span>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className={cn(
                                                "w-2.5 h-2.5 rounded-full inline-block shadow-[0_0_10px]",
                                                decl.risk === "faible" ? "bg-emerald-500 shadow-emerald-500/50" :
                                                    decl.risk === "moyen" ? "bg-amber-500 shadow-amber-500/50" : "bg-rose-500 shadow-rose-500/50"
                                            )} />
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border",
                                                decl.status === "payee" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                    decl.status === "teletransmise" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                                                        decl.status === "validation" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                            "bg-slate-700/30 text-slate-400 border-slate-600/30"
                                            )}>
                                                {decl.status.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <ChevronRight className="w-5 h-5 text-slate-600 ml-auto group-hover:text-white transition-colors" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Automation & Detail Panel */}
                <div className="space-y-6">
                    {/* Selected Declaration Card */}
                    {selectedDecl ? (
                        <div className="glass-card rounded-[32px] p-8 border border-white/5 bg-gradient-to-b from-slate-900 to-orange-950/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[60px] rounded-full pointer-events-none" />

                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div>
                                    <p className="text-xs font-black text-orange-500 uppercase tracking-widest mb-2">Détails Fiscaux</p>
                                    <h3 className="text-2xl font-black text-white">{selectedDecl.type} • {selectedDecl.month}</h3>
                                </div>
                                <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                                    <img
                                        src={`https://flagcdn.com/w40/${selectedDecl.country.toLowerCase()}.png`}
                                        alt={selectedDecl.country}
                                        className="w-8 h-auto rounded shadow-lg"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6 relative z-10 mb-8">
                                <div className="p-5 bg-black/20 rounded-2xl border border-white/5 space-y-3 backdrop-blur-sm">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400 font-medium">Base Imposable</span>
                                        <span className="text-white font-mono font-bold">136 111 200</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400 font-medium">Taux</span>
                                        <span className="text-slate-300 font-mono">18%</span>
                                    </div>
                                    <div className="h-px bg-white/10 my-2" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-black text-white uppercase tracking-wider">Net à Payer</span>
                                        <span className="text-xl font-black text-orange-400 font-mono">{selectedDecl.amountToPay}</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                                    <p className="text-xs text-indigo-300 leading-relaxed">
                                        <span className="font-bold">Analyse IA :</span> Cohérence confirmée avec le CA mensuel déclaré en comptabilité. Variation de +2% vs M-1.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 relative z-10">
                                <button className="w-full py-4 bg-white text-orange-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-50 transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/5">
                                    <CheckCircle2 className="w-4 h-4" /> Valider & Télétransmettre
                                </button>
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs border border-white/5 transition-all">
                                        Aperçu PDF
                                    </button>
                                    <button className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs border border-white/5 transition-all">
                                        Justificatifs
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-500 text-sm">Sélectionner une déclaration</div>
                    )}

                    {/* Quick Access Portals */}
                    <div className="glass-card rounded-[32px] p-6 border border-white/5 bg-slate-900/40">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Portails DGI Directs</h4>
                        <div className="space-y-2">
                            <PortalLink name="e-Impôts Côte d'Ivoire" status="online" />
                            <PortalLink name="e-Tax Sénégal (SISEN)" status="online" />
                            <PortalLink name="e-Services Bénin" status="maintenance" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PortalLink({ name, status }: { name: string, status: "online" | "maintenance" }) {
    return (
        <a href="#" className="flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-white/5 transition-all group">
            <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{name}</span>
            <div className="flex items-center gap-2">
                <span className={cn("w-1.5 h-1.5 rounded-full", status === "online" ? "bg-emerald-500" : "bg-amber-500 animate-pulse")} />
                <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-white transition-colors" />
            </div>
        </a>
    );
}
