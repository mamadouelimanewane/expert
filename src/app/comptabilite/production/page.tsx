"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    LayoutDashboard,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Table as TableIcon,
    BarChart3,
    History,
    Zap,
    RefreshCw,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowRight,
    Calendar,
    Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Flux tel que renvoye par /api/comptabilite/production. */
type Flux = {
    id: string;
    date: string;
    libelle: string;
    montant: number;
    sens: "RECETTE" | "DEPENSE";
    imputation: { debit: string; debitIntitule: string; credit: string; creditIntitule: string };
    statut: "A_QUALIFIER" | "A_VALIDER" | "VALIDEE";
    confiance: number | null;
    origine: string;
    client: { id: string | null; nom: string };
};

type SyntheseProduction = {
    total: number;
    aQualifier: number;
    aValider: number;
    validees: number;
};

const LIBELLE_STATUT: Record<Flux["statut"], string> = {
    A_QUALIFIER: "A qualifier",
    A_VALIDER: "A valider",
    VALIDEE: "Validee",
};

const TAGS = ["Tous", "Ventes", "Achats"] as const;
type Tag = typeof TAGS[number];

export default function CollaborativeProductionPage() {
    const [activeView, setActiveView] = useState<"production" | "pilotage">("production");
    const [activeTag, setActiveTag] = useState<Tag>("Tous");
    const [searchTerm, setSearchTerm] = useState("");

    // Ecritures reelles en attente de revision, issues du journal.
    const [flux, setFlux] = useState<Flux[]>([]);
    const [synthese, setSynthese] = useState<SyntheseProduction | null>(null);
    const [aucuneDonnee, setAucuneDonnee] = useState(false);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState<string | null>(null);

    const charger = useCallback(async () => {
        setChargement(true);
        setErreur(null);
        try {
            const res = await fetch("/api/comptabilite/production?limit=50");
            if (!res.ok) throw new Error(`Reponse ${res.status}`);
            const data = await res.json();
            setFlux(data.flux ?? []);
            setSynthese(data.synthese ?? null);
            setAucuneDonnee(Boolean(data.aucuneDonnee));
        } catch (e) {
            console.error("Chargement de la production comptable :", e);
            setErreur("Impossible de charger les ecritures en attente.");
            setFlux([]);
            setSynthese(null);
        } finally {
            setChargement(false);
        }
    }, []);

    useEffect(() => { charger(); }, [charger]);

    // Le « Pilotage par Portefeuille » affichait trois clients fixes
    // (Telecom Afrique, SIB, Orange Sénégal) avec une progression inventée.
    // Il est recalculé ici à partir des écritures réellement chargées
    // ci-dessus : progression = part des écritures validées par client.
    const parPortefeuille = useMemo(() => {
        const parClient = new Map<string, { nom: string; total: number; validees: number; aQualifier: number }>();
        for (const f of flux) {
            const cle = f.client.id ?? f.client.nom;
            const entree = parClient.get(cle) ?? { nom: f.client.nom, total: 0, validees: 0, aQualifier: 0 };
            entree.total += 1;
            if (f.statut === "VALIDEE") entree.validees += 1;
            if (f.statut === "A_QUALIFIER") entree.aQualifier += 1;
            parClient.set(cle, entree);
        }
        return Array.from(parClient.values())
            .map((c) => ({ ...c, progress: c.total > 0 ? Math.round((c.validees / c.total) * 100) : 0 }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);
    }, [flux]);

    const fluxFiltre = useMemo(() => {
        const terme = searchTerm.trim().toLowerCase();
        return flux.filter((f) => {
            if (activeTag === "Ventes" && f.sens !== "RECETTE") return false;
            if (activeTag === "Achats" && f.sens !== "DEPENSE") return false;
            if (!terme) return true;
            return (
                f.client.nom.toLowerCase().includes(terme) ||
                f.libelle.toLowerCase().includes(terme) ||
                String(f.montant).includes(terme)
            );
        });
    }, [flux, activeTag, searchTerm]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">

            {/* En-tête façon apix-pap : titre + sous-titre directement sur la page,
                sans carte décorative surdimensionnée (l'ancien bandeau bg-slate-950
                pleine opacité n'était en outre jamais éclairci par le thème clair —
                seules les variantes bg-slate-900/bg-slate-950\/20 le sont — d'où le
                fond noir signalé). */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                            All-in-One Production
                        </span>
                    </div>
                    <h2 className="page-title leading-tight">
                        Production Comptable <span className="text-indigo-400">Collaborative</span>
                    </h2>
                    <p className="page-subtitle">
                        Accédez aux flux financiers de vos clients en temps réel. Pennylane synchronise la gestion client et la production cabinet dans un outil unique.
                    </p>
                </div>

                <div className="bg-muted p-1.5 rounded-2xl border border-border flex">
                    <button
                        onClick={() => setActiveView("production")}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            activeView === "production" ? "bg-indigo-600 text-white shadow-xl" : "text-slate-500 hover:text-foreground"
                        )}
                    >
                        Production
                    </button>
                    <button
                        onClick={() => setActiveView("pilotage")}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            activeView === "pilotage" ? "bg-indigo-600 text-white shadow-xl" : "text-slate-500 hover:text-foreground"
                        )}
                    >
                        Pilotage
                    </button>
                </div>
            </div>

            {/* Real-time KPI Stream */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KpiCard title="Écritures au journal" value={String(synthese?.total ?? 0)} icon={RefreshCw} color="text-indigo-400" />
                <KpiCard title="Imputées par règle" value={String((synthese?.total ?? 0) - (synthese?.aQualifier ?? 0))} subtext="Compte déterminé" icon={Zap} color="text-amber-400" />
                <KpiCard title="À qualifier" value={String(synthese?.aQualifier ?? 0)} subtext="En compte d'attente 471" icon={AlertCircle} color="text-rose-400" />
                <KpiCard title="Validées" value={String(synthese?.validees ?? 0)} subtext="Exportées" icon={Clock} color="text-emerald-400" />
            </div>

            {/* Main Production Table (PENNYLANE STYLE) */}
            <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/40 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 flex flex-wrap justify-between items-center gap-6 bg-slate-900/60">
                    <div className="flex items-center gap-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <TableIcon className="w-5 h-5 text-indigo-400" />
                            Flux Financiers Multi-Dossiers
                        </h3>
                        <div className="flex gap-2">
                            {TAGS.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setActiveTag(tag)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        activeTag === tag ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                                    )}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Rechercher un client, un montant..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500/50 outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="apix-table w-full text-left">
                        <thead className="bg-muted text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                            <tr>
                                <th className="px-8 py-6">Date</th>
                                <th className="px-6 py-6">Client / Dossier</th>
                                <th className="px-6 py-6 font-black text-right">Montant (FCFA)</th>
                                <th className="px-6 py-6">Nature</th>
                                <th className="px-6 py-6">Matching & Status</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {chargement ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-10 text-center text-sm text-slate-500">
                                        Chargement des écritures…
                                    </td>
                                </tr>
                            ) : flux.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-10 text-center text-sm text-slate-500">
                                        {erreur ?? (aucuneDonnee
                                            ? "Aucune écriture dans le journal : la file est vide parce que rien n'a été collecté."
                                            : "Aucune écriture à afficher.")}
                                    </td>
                                </tr>
                            ) : fluxFiltre.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-10 text-center text-sm text-slate-500">
                                        Aucune écriture ne correspond à ce filtre.
                                    </td>
                                </tr>
                            ) : fluxFiltre.map((flow) => (
                                <tr key={flow.id} className="hover:bg-indigo-600/5 transition-colors group cursor-pointer">
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-mono font-bold text-slate-500">{flow.date}</span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div>
                                            <span className="font-bold text-white block group-hover:text-indigo-400 transition-colors">{flow.client.nom}</span>
                                            <p className="text-[10px] text-slate-500 mt-1 truncate max-w-xs">{flow.libelle}</p>
                                            <div className="flex gap-1 mt-1">
                                                <span className="text-[8px] px-1.5 py-0.5 bg-white/5 rounded text-slate-500 uppercase font-black font-mono">
                                                    {flow.imputation.debit} / {flow.imputation.credit}
                                                </span>
                                                <span className="text-[8px] px-1.5 py-0.5 bg-white/5 rounded text-slate-500 uppercase font-black">{flow.origine}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <span className="font-bold text-white font-mono">{flow.montant.toLocaleString("fr-FR")}</span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className={cn(
                                            "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                            flow.sens === "RECETTE" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                        )}>
                                            {flow.sens === "RECETTE" ? "Vente" : "Achat"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                flow.statut === "VALIDEE" ? "bg-emerald-500" :
                                                flow.statut === "A_QUALIFIER" ? "bg-rose-500" : "bg-amber-500"
                                            )} />
                                            <span className="text-xs font-bold text-slate-400">
                                                {LIBELLE_STATUT[flow.statut]}
                                                {flow.confiance !== null && ` (${Math.round(flow.confiance * 100)}%)`}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all">
                                            Saisir <ArrowRight className="w-3 h-3 inline ml-2" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 360 Client View Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="apix-card relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 sm:p-6 lg:p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                        <PieChart className="w-32 h-32 text-indigo-400" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                        <BarChart3 className="w-6 h-6 text-indigo-400" />
                        Pilotage par Portefeuille
                    </h3>
                    <div className="space-y-6">
                        {parPortefeuille.length === 0 ? (
                            <p className="text-sm text-slate-500">Aucune écriture chargée pour calculer une progression par client.</p>
                        ) : (
                            parPortefeuille.map((c) => (
                                <PortfolioProgress
                                    key={c.nom}
                                    client={c.nom}
                                    progress={c.progress}
                                    status={c.progress === 100 ? "Toutes écritures validées" : `${c.aQualifier} à qualifier`}
                                    color={c.progress === 100 ? "bg-emerald-500" : c.aQualifier > 0 ? "bg-rose-500" : "bg-amber-500"}
                                />
                            ))
                        )}
                    </div>
                </div>

                <div className="apix-card">
                    <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                        <Zap className="w-6 h-6 text-amber-400" />
                        Écritures à qualifier
                    </h3>
                    {synthese && synthese.aQualifier > 0 ? (
                        <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-3xl space-y-2">
                            <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                {synthese.aQualifier} écriture{synthese.aQualifier > 1 ? "s" : ""} sans règle d&apos;imputation trouvée{synthese.aQualifier > 1 ? "s" : ""},
                                actuellement en compte d&apos;attente 471. Ouvrez-les depuis le tableau ci-dessus pour les qualifier manuellement.
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            Aucune écriture en attente de qualification.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function KpiCard({ title, value, trend, subtext, icon: Icon, color }: any) {
    return (
        <div className="apix-card group transition-all">
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform shadow-xl", color)}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <span className={cn(
                        "text-[10px] font-black px-2 py-1 rounded-full",
                        trend.startsWith("+") ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    )}>
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{title}</p>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mt-1">{value}</h3>
            {subtext && <p className="text-[10px] text-slate-600 font-bold mt-1">{subtext}</p>}
        </div>
    );
}

function PortfolioProgress({ client, progress, status, color = "bg-indigo-500" }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
                <span className="text-white">{client}</span>
                <span className="text-slate-500 uppercase tracking-widest text-[9px]">{status}</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden border border-border">
                <div className={cn("h-full transition-all duration-1000", color)} style={{ width: `${progress}%` }} />
            </div>
        </div>
    );
}
