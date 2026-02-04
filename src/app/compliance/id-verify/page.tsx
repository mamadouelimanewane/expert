"use client";

import { useState } from "react";
import {
    Fingerprint,
    Search,
    ShieldCheck,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Building2,
    User,
    Globe,
    Database,
    Zap,
    Download,
    History,
    RefreshCw,
    ScanFace,
    BadgeCheck,
    ArrowRight,
    FileSearch,
    Network
} from "lucide-react";
import { cn } from "@/lib/utils";

import { NEXUS_ID_RECORDS } from "@/data/nexus-risk-data";
import { mockClients } from "@/data/mock-clients";

export default function NexusIDVerifyPage() {
    const [searchType, setSearchType] = useState<"individual" | "business">("individual");
    const [query, setQuery] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [result, setResult] = useState<any | null>(null);

    const handleVerify = () => {
        if (!query.trim()) return;
        setIsVerifying(true);
        setResult(null);

        setTimeout(() => {
            // Tentative de recherche dans les données "réelles"
            const riskRecord = NEXUS_ID_RECORDS.find(r =>
                r.entityName.toLowerCase().includes(query.toLowerCase()) ||
                (r.rccm && r.rccm.includes(query)) ||
                (r.ninea && r.ninea.includes(query))
            );

            if (riskRecord) {
                setResult(riskRecord);
            } else {
                // Recherche dans les clients existants
                const client = mockClients.find(c => c.name.toLowerCase().includes(query.toLowerCase()));
                if (client) {
                    setResult({
                        id: `VER-${client.country}-${client.id}`,
                        entityName: client.name,
                        type: client.type === "Personne Physique" ? "individual" : "business",
                        status: "verified",
                        matchScore: 95,
                        details: {
                            identity: "match",
                            compliance: "clear",
                            address: "confirmed",
                            documents: "valid"
                        },
                        source: "Nexus Database",
                        timestamp: new Date().toLocaleString()
                    });
                } else {
                    // Fallback mock
                    setResult({
                        id: "VER-TMP-999",
                        entityName: query,
                        type: searchType,
                        status: "pending",
                        matchScore: 45,
                        details: {
                            identity: "partial",
                            compliance: "warning",
                            address: "unconfirmed",
                            documents: "not_provided"
                        },
                        source: "External Search",
                        timestamp: new Date().toLocaleString()
                    });
                }
            }
            setIsVerifying(false);
        }, 2000);
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Header: Nexus ID Verify */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <Fingerprint className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                            NEXUS Premium
                        </span>
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-emerald-500/20">
                            Identity Science
                        </span>
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">
                        Nexus <span className="text-indigo-400">ID Verify</span>
                    </h2>
                    <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                        Vérification d'identité instantanée pour particuliers et entreprises. Croisement de milliards de points de données pour une certitude absolue.
                    </p>
                </div>
            </div>

            {/* Selection & Search */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-8 rounded-[40px] bg-slate-900/40 border border-white/5 shadow-xl">
                        <h3 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-indigo-400" />
                            Paramètres de Recherche
                        </h3>
                        <div className="flex p-1 bg-white/5 rounded-2xl mb-6">
                            <button
                                onClick={() => setSearchType("individual")}
                                className={cn(
                                    "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                    searchType === "individual" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                                )}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <User className="w-4 h-4" /> Particulier
                                </div>
                            </button>
                            <button
                                onClick={() => setSearchType("business")}
                                className={cn(
                                    "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                    searchType === "business" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                                )}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Building2 className="w-4 h-4" /> Entreprise
                                </div>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder={searchType === "individual" ? "Nom complet ou NNI..." : "Dénomination ou RCCM..."}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                            <button
                                onClick={handleVerify}
                                disabled={isVerifying || !query.trim()}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-600/30 disabled:opacity-50"
                            >
                                {isVerifying ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                                {isVerifying ? "Vérification..." : "Lancer ID Verify"}
                            </button>
                        </div>
                    </div>

                    <div className="glass-card p-8 rounded-[40px] bg-indigo-500/5 border border-indigo-500/20">
                        <h4 className="text-sm font-black text-white uppercase mb-4 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-indigo-400" />
                            Réseau Global Nexus
                        </h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
                                <span className="text-slate-500">Bases de données</span>
                                <span className="text-indigo-400">140+ Pays</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
                                <span className="text-slate-500">Points de données</span>
                                <span className="text-indigo-400">85 Milliards</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
                                <span className="text-slate-500">Précision Match</span>
                                <span className="text-indigo-400">99.9%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 flex flex-col gap-6">
                    {isVerifying ? (
                        <div className="flex-1 glass-card rounded-[48px] border border-white/5 bg-slate-900/40 p-20 flex flex-col items-center justify-center text-center animate-pulse">
                            <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center mb-8 border border-indigo-500/20">
                                <ScanFace className="w-12 h-12 text-indigo-400 animate-bounce" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">Analyse Nexus Link en cours</h3>
                            <p className="text-slate-500 max-w-sm">
                                Nous croisons les identités numériques, physiques et administratives pour confirmer l'authenticité...
                            </p>
                        </div>
                    ) : result ? (
                        <div className="flex-1 glass-card rounded-[48px] border border-white/5 bg-slate-900/40 p-10 shadow-2xl animate-in zoom-in-95 duration-500">
                            <div className="flex justify-between items-start mb-10">
                                <div className="flex items-center gap-6">
                                    <div className={cn(
                                        "w-20 h-20 rounded-3xl flex items-center justify-center border-2",
                                        result.status === "verified" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                    )}>
                                        <BadgeCheck className="w-10 h-10" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-white mb-1">{result.entityName}</h3>
                                        <div className="flex items-center gap-3">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase border",
                                                result.status === "verified" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                            )}>
                                                {result.status === "verified" ? "Entité Vérifiée" : "Attention Requise"}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                {result.type} • ID: {result.id}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-black text-white">{result.matchScore}%</div>
                                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Score de Confiance</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Indicateurs Nexus</h4>
                                    {[
                                        { label: "Validité Identité", value: result.details.identity, icon: User },
                                        { label: "Conformité & Listes", value: result.details.compliance, icon: ShieldCheck },
                                        { label: "Validation Adresse", value: result.details.address, icon: Globe },
                                        { label: "Vérification Dossier", value: result.details.documents, icon: FileSearch }
                                    ].map((detail, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <detail.icon className="w-4 h-4 text-indigo-400" />
                                                <span className="text-sm font-bold text-white">{detail.label}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {detail.value === "match" || detail.value === "confirmed" || detail.value === "clear" || detail.value === "valid" ? (
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                ) : detail.value === "partial" || detail.value === "warning" ? (
                                                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 text-rose-400" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Analyse de Réseau</h4>
                                    <div className="bg-white/5 rounded-[32px] border border-white/5 p-6 h-full flex flex-col items-center justify-center text-center">
                                        <Network className="w-12 h-12 text-indigo-500/30 mb-4" />
                                        <p className="text-xs text-slate-400 mb-6 px-4">
                                            Le moteur LexID a relié cette identité à **12 actifs** et **4 entités liées** historiquement.
                                        </p>
                                        <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                            Visualiser le Graphe
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-8 border-t border-white/5">
                                <button className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-indigo-600/30">
                                    Générer Certificat de Vérification
                                </button>
                                <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-white/10 flex items-center gap-2">
                                    <Download className="w-4 h-4" /> PDF
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 glass-card rounded-[48px] border border-white/5 bg-slate-900/40 p-20 flex flex-col items-center justify-center text-center">
                            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/10">
                                <Database className="w-12 h-12 text-slate-600" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-400 mb-2">Prêt pour Vérification</h3>
                            <p className="text-slate-600 max-w-sm">
                                Entrez un nom ou un identifiant pour lancer l'analyse de risque et d'identité instantanée.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
