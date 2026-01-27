"use client";

import { useState } from "react";
import {
    Scale,
    ShieldCheck,
    FileSearch,
    Book,
    Search,
    CheckCircle2,
    AlertTriangle,
    Zap,
    ArrowRight,
    Download,
    Gavel,
    Info,
    ExternalLink,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LegalStatute {
    id: string;
    source: "OHADA" | "CGI" | "UEMOA" | "Social";
    title: string;
    article: string;
    complianceStatus: "Conforme" | "Alerte" | "Risque";
    desc: string;
}

const COMPLIANCE_ITEMS: LegalStatute[] = [
    { id: "1", source: "OHADA", title: "Dépôt des comptes annuels", article: "Art. 269 AUDSCGIE", complianceStatus: "Alerte", desc: "Le dépôt des comptes doit se faire dans le mois suivant l'AG." },
    { id: "2", source: "CGI", title: "Retenue à la source (BNC)", article: "Art. 92 CGI CI", complianceStatus: "Conforme", desc: "Reversement effectué avant le 15 du mois suivant." },
    { id: "3", source: "OHADA", title: "Tenue des livres obligatoires", article: "Art. 13 AUDCIF", complianceStatus: "Risque", desc: "Livre d'inventaire non coté et non paraphé détecté." },
    { id: "4", source: "UEMOA", title: "Réglementation des changes", article: "Directrice 02/2004", complianceStatus: "Conforme", desc: "Déclaration des transferts hors zone UEMOA validée." },
];

export default function ComplianceAuditPage() {
    const [activeTab, setActiveTab] = useState<"referentiel" | "checkup">("checkup");
    const [askingIA, setAskingIA] = useState(false);
    const [aiResponse, setAiResponse] = useState("");

    const handleAskAI = (e: React.FormEvent) => {
        e.preventDefault();
        setAskingIA(true);
        setTimeout(() => {
            setAskingIA(false);
            setAiResponse("Conformément à l'Article 13 de l'Acte Uniforme OHADA relatif au Droit Comptable (AUDCIF), tout commerçant doit tenir un livre-journal, un grand livre et un livre d'inventaire. Le défaut de cotation et de paraphe de ces documents par le président du tribunal de commerce peut entraîner la nullité de la force probante de la comptabilité en cas de litige ou de contrôle fiscal.");
        }, 2000);
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Scale className="w-8 h-8 text-indigo-400" />
                        Auditeur de Conformité Juridique
                    </h2>
                    <p className="text-slate-400 mt-1">Audit multi-textes : OHADA, CGI, UEMOA & Réglementations sectorielles.</p>
                </div>

                <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-xl border border-slate-700">
                    {["checkup", "referentiel"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all",
                                activeTab === tab ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                            )}
                        >
                            {tab === "checkup" ? "Diagnostic Direct" : "Documents de Référence"}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: AI Legal Assistant */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-6 rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-slate-900 to-indigo-900/20">
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-indigo-400" />
                            Assistant Juridique IA
                        </h3>
                        <form onSubmit={handleAskAI} className="space-y-4 text-white">
                            <div className="relative">
                                <textarea
                                    placeholder="Posez une question (ex: Quelles sont les obligations de cotation des livres en droit OHADA ?)"
                                    className="w-full h-32 bg-slate-950/50 border border-slate-700 rounded-2xl p-4 text-sm text-slate-300 placeholder:text-slate-600 focus:border-indigo-500 focus:ring-0 outline-none resize-none transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={askingIA}
                                    className="absolute bottom-3 right-3 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {askingIA ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                                </button>
                            </div>
                        </form>

                        {aiResponse && (
                            <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl animate-in fade-in slide-in-from-top-4">
                                <p className="text-xs text-indigo-200 leading-relaxed font-medium">
                                    {aiResponse}
                                </p>
                                <div className="mt-4 flex gap-2">
                                    <button className="text-[10px] font-bold text-indigo-400 hover:underline flex items-center gap-1">
                                        <Download className="w-3 h-3" /> Citer dans le rapport
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="glass-card p-6 rounded-3xl border border-slate-700/50 bg-slate-900/50">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Score de Conformité Global
                        </h4>
                        <div className="flex items-end gap-3 mb-4">
                            <span className="text-4xl font-bold text-white">74%</span>
                            <span className="text-xs text-rose-500 font-bold mb-1">-5% ce mois</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[74%]" />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-4 leading-relaxed">
                            Ce score prend en compte les textes OHADA, le CGI local et les textes UEMOA applicables à l'entité.
                        </p>
                    </div>
                </div>

                {/* Right: Detailed Checklist */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === "checkup" && (
                        <div className="glass-card rounded-3xl border border-slate-700/50 overflow-hidden bg-slate-900/30">
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <FileSearch className="w-5 h-5 text-indigo-400" />
                                    Revue de Conformité (Points de contrôle)
                                </h3>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold rounded-lg border border-slate-700">TOUT SCANNER</button>
                                    <button className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg"><Download className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <div className="divide-y divide-slate-800">
                                {COMPLIANCE_ITEMS.map((item) => (
                                    <div key={item.id} className="p-6 flex gap-6 hover:bg-white/[0.02] transition-colors group">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border",
                                            item.complianceStatus === "Conforme" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                item.complianceStatus === "Alerte" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                    "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                        )}>
                                            {item.complianceStatus === "Conforme" ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.source} • {item.article}</span>
                                                    <h4 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors">{item.title}</h4>
                                                </div>
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                                                    item.complianceStatus === "Conforme" ? "text-emerald-400 border-emerald-500/20" :
                                                        item.complianceStatus === "Alerte" ? "text-amber-400 border-amber-500/20" : "text-rose-400 border-rose-500/20"
                                                )}>{item.complianceStatus}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed font-medium italic">"{item.desc}"</p>
                                        </div>
                                        <button className="self-center p-2 text-slate-700 group-hover:text-white transition-colors">
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "referentiel" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ReferenceCard
                                title="Code Général des Impôts (CGI)"
                                location="Côte d'Ivoire (v2024)"
                                icon={Book}
                                color="text-rose-400"
                            />
                            <ReferenceCard
                                title="Acte Uniforme OHADA"
                                location="Soc. Commerciales & GIE"
                                icon={Gavel}
                                color="text-indigo-400"
                            />
                            <ReferenceCard
                                title="Convention Fiscale"
                                location="CI - France (Non-double imp.)"
                                icon={GlobeIcon}
                                color="text-cyan-400"
                            />
                            <ReferenceCard
                                title="Réglementation Bancaire"
                                location="UEMOA / BCEAO"
                                icon={Info}
                                color="text-amber-400"
                            />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

function ReferenceCard({ title, location, icon: Icon, color }: any) {
    return (
        <div className="glass-card p-6 rounded-3xl border border-slate-700/50 bg-slate-900/30 hover:bg-slate-900/50 transition-all group flex flex-col justify-between min-h-[160px]">
            <div className="flex justify-between items-start">
                <div className={cn("p-3 rounded-2xl bg-slate-800 border border-slate-700", color)}>
                    <Icon className="w-6 h-6" />
                </div>
                <ExternalLink className="w-4 h-4 text-slate-700 group-hover:text-white transition-colors cursor-pointer" />
            </div>
            <div>
                <h4 className="font-bold text-white text-sm mb-1">{title}</h4>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{location}</p>
            </div>
        </div>
    );
}

function GlobeIcon({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    );
}
