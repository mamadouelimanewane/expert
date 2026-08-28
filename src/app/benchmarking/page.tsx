"use client";

import { useState, useEffect } from "react";
import {
    Globe,
    Compass,
    Target,
    AlertTriangle,
    Loader2,
    Building2
} from "lucide-react";

interface ClientOption {
    id: string;
    companyName: string | null;
    firstName: string | null;
    lastName: string | null;
    sector: string | null;
    country: string;
}

interface Ratios {
    ca: number;
    ebitdaMargin: number | null;
    netMargin: number | null;
    debtRatio: number | null;
    roe: number | null;
}

const INDICATORS: { key: keyof Ratios; label: string; category: string; format: (v: number) => string }[] = [
    { key: "ebitdaMargin", label: "Marge EBITDA", category: "Rentabilité", format: (v) => `${v.toFixed(1)}%` },
    { key: "netMargin", label: "Marge Nette", category: "Rentabilité", format: (v) => `${v.toFixed(1)}%` },
    { key: "debtRatio", label: "Taux d'Endettement (Dette/Actif)", category: "Structure", format: (v) => `${v.toFixed(1)}%` },
    { key: "roe", label: "Rentabilité des Capitaux Propres (ROE)", category: "Rentabilité", format: (v) => `${v.toFixed(1)}%` },
];

function clientName(c: ClientOption) {
    return c.companyName || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "Client sans nom";
}

export default function NexusMarketIntelligencePage() {
    const [clients, setClients] = useState<ClientOption[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>("");
    const [ratios, setRatios] = useState<Ratios | null>(null);
    const [ratiosYear, setRatiosYear] = useState<number | null>(null);
    const [hasData, setHasData] = useState<boolean | null>(null);
    const [loadingClients, setLoadingClients] = useState(true);
    const [loadingRatios, setLoadingRatios] = useState(false);

    useEffect(() => {
        fetch("/api/clients")
            .then((r) => r.json())
            .then((data) => {
                const list: ClientOption[] = data.clients || [];
                setClients(list);
                if (list.length > 0) setSelectedClientId(list[0].id);
            })
            .finally(() => setLoadingClients(false));
    }, []);

    useEffect(() => {
        if (!selectedClientId) return;
        setLoadingRatios(true);
        fetch(`/api/benchmarking?clientId=${selectedClientId}`)
            .then((r) => r.json())
            .then((data) => {
                setHasData(!!data.hasData);
                setRatios(data.ratios || null);
                setRatiosYear(data.year || null);
            })
            .finally(() => setLoadingRatios(false));
    }, [selectedClientId]);

    const selectedClient = clients.find((c) => c.id === selectedClientId) || null;

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/20 p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <Globe className="w-64 h-64 text-cyan-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-slate-500/10 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-slate-500/20">
                                Benchmarking Financier
                            </span>
                        </div>
                        <h2 className="page-title leading-tight uppercase">
                            Nexus <span className="text-cyan-400">Market Intelligence</span>
                        </h2>
                        <p className="page-subtitle max-w-2xl">
                            Ratios financiers réels de vos clients, calculés à partir des données comptables enregistrées.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        {loadingClients ? (
                            <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                        ) : clients.length === 0 ? (
                            <span className="text-xs text-slate-500">Aucun client disponible</span>
                        ) : (
                            <select
                                value={selectedClientId}
                                onChange={(e) => setSelectedClientId(e.target.value)}
                                className="bg-white/5 border border-white/10 text-white rounded-2xl px-6 py-4 text-xs font-bold focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all hover:bg-white/10 shadow-xl"
                            >
                                {clients.map(c => (
                                    <option key={c.id} value={c.id} className="bg-slate-900">{clientName(c)}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
            </div>

            {/* Sector data honest-state banner */}
            <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-400 leading-relaxed">
                    Données sectorielles de comparaison non configurées — aucun flux de données de marché externe n'est connecté. Les valeurs ci-dessous sont exclusivement calculées à partir de la comptabilité réelle du client sélectionné, sans comparaison au secteur.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Ratios Table */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="glass-card rounded-[40px] p-4 sm:p-6 lg:p-10 border border-white/5 bg-slate-900/40 shadow-2xl">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Ratios Financiers Réels</h3>
                                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-black">
                                    {selectedClient ? clientName(selectedClient) : "—"}{ratiosYear ? ` · Exercice ${ratiosYear}` : ""}
                                </p>
                            </div>
                        </div>

                        {loadingRatios ? (
                            <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-400" /></div>
                        ) : !hasData ? (
                            <div className="py-16 flex flex-col items-center text-center gap-4">
                                <Building2 className="w-10 h-10 text-slate-600" />
                                <p className="text-slate-400 text-sm max-w-sm">
                                    Aucune donnée financière (FinancialData) enregistrée pour ce client. Importez un exercice comptable pour afficher ses ratios réels.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-12">
                                {INDICATORS.map((ind, i) => {
                                    const value = ratios ? ratios[ind.key] : null;
                                    return (
                                        <div key={i} className="group relative">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{ind.category}</p>
                                                    </div>
                                                    <h4 className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{ind.label}</h4>
                                                </div>
                                                <div className="flex items-end gap-8">
                                                    <div className="text-right">
                                                        <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Moyenne Secteur</p>
                                                        <p className="text-lg font-black text-slate-600 italic">Non configuré</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[9px] font-black text-cyan-500 uppercase mb-1">Valeur Réelle</p>
                                                        <p className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
                                                            {value !== null ? ind.format(value) : "—"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div className="pt-6 border-t border-white/5">
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Chiffre d'Affaires (référence)</p>
                                    <p className="text-lg font-black text-white">{ratios?.ca.toLocaleString("fr-FR")} FCFA</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40">
                        <div className="flex items-center gap-3 mb-6">
                            <Compass className="w-5 h-5 text-cyan-400" />
                            <h3 className="text-sm font-black text-white uppercase tracking-tight">Profil Client</h3>
                        </div>
                        {selectedClient ? (
                            <div className="space-y-4 text-xs">
                                <div className="flex justify-between border-b border-white/5 pb-3">
                                    <span className="text-slate-500">Secteur</span>
                                    <span className="text-white font-bold">{selectedClient.sector || "Non renseigné"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Pays</span>
                                    <span className="text-white font-bold">{selectedClient.country}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500">Aucun client sélectionné.</p>
                        )}
                    </div>

                    <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/40 p-8 flex items-start gap-4">
                        <Target className="w-6 h-6 text-slate-600 shrink-0" />
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Le score radar global et les recommandations stratégiques par IA nécessitent des données sectorielles de comparaison — non disponibles pour le moment (voir bandeau ci-dessus).
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
