"use client";

import { useState } from "react";
import {
    Network,
    Search,
    Share2,
    Cpu,
    AlertTriangle,
    Zap,
} from "lucide-react";

export default function DataLinkPage() {
    const [query, setQuery] = useState("");

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/20 p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <Network className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-amber-500/20">
                                Intégration non configurée
                            </span>
                        </div>
                        <h2 className="page-title leading-tight uppercase">
                            Nexus <span className="text-indigo-400">Data Link</span>
                        </h2>
                        <p className="page-subtitle max-w-2xl">
                            Ce module est conçu pour relier des données disparates (registres, cadastre, télécoms) via un fournisseur tiers de linking de données (type LinkID) afin d'identifier bénéficiaires effectifs et réseaux cachés.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-3 p-6 bg-amber-500/5 border border-amber-500/20 rounded-[28px]">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-bold text-amber-400 mb-1">Intégration LinkID non configurée</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Aucun fournisseur de linking de données (registres commerciaux, cadastre, télécoms, présence digitale) n'est connecté à Cabinet 360. Les recherches, scores de confiance et graphes de relations affichés par ce module nécessitent un contrat avec un fournisseur externe de ce type de données — aucune donnée réelle ne peut être générée tant que cette intégration n'est pas mise en place.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Engine Controls (chrome only — non fonctionnel) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-8 rounded-[40px] bg-slate-900/40 border border-white/5">
                        <h3 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                            <Cpu className="w-5 h-5 text-indigo-400" /> Configuration du Moteur
                        </h3>
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <label className="text-[10px] text-slate-500 font-black uppercase ml-1">Entité à Analyser</label>
                                <div className="relative">
                                    <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Nom, Adresse, Email, Tel..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        disabled
                                        className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs text-slate-500 outline-none cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] text-slate-500 font-black uppercase ml-1">Sources de Données</label>
                                {[
                                    "Registres Commerciaux (RCCM)",
                                    "Cadastre & Propriétés",
                                    "Bases Télécom & Services",
                                    "Présence Digitale & Sociale",
                                ].map(source => (
                                    <div key={source} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 opacity-50">
                                        <span className="text-xs text-slate-400 font-bold">{source}</span>
                                        <span className="text-[9px] text-slate-600 font-black uppercase">Non connecté</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                disabled
                                title="Intégration LinkID non configurée"
                                className="w-full py-4 bg-indigo-600/30 text-white/50 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 cursor-not-allowed"
                            >
                                <Zap className="w-5 h-5" />
                                Lancer Data Link (non disponible)
                            </button>
                        </div>
                    </div>
                </div>

                {/* Empty state area */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="h-[350px] sm:h-[450px] lg:h-[600px] glass-card rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border border-white/5 bg-slate-900/40 p-20 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/10">
                            <Share2 className="w-12 h-12 text-slate-600" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-400 mb-2">Nexus Data Link Engine</h3>
                        <p className="text-slate-600 max-w-sm">
                            Ce module nécessite une intégration avec un fournisseur externe de linking de données. Aucune recherche ne peut être exécutée pour le moment.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
