"use client";

import { useCallback, useEffect, useState } from "react";
import {
    Factory,
    Boxes,
    PackagePlus,
    TrendingUp,
    AlertTriangle,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    PackageCheck,
    Truck,
    Settings,
    BarChart4,
    Thermometer,
    Cog,
    Calculator
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Mock Data for Industrial Clients
/** Client industriel, tel que renvoye par /api/industries/portfolio. */
type ClientIndustriel = {
    id: string;
    nom: string;
    secteur: string | null;
    pays: string;
    nbProduits: number;
    chiffreAffaires: number;
    margeTotale: number;
    tauxMarge: number | null;
    nbImmobilisations: number;
    valeurNetteComptable: number;
    dotationExercice: number;
    alertes: string[];
};

type SynthesePortefeuille = {
    nbClients: number;
    chiffreAffaires: number;
    margeTotale: number;
    valeurNetteComptable: number;
    totalAlertes: number;
};

const fcfa = (n: number) => Math.round(n).toLocaleString("fr-FR");

export default function ManufacturingPortfolioPage() {
    const [portefeuille, setPortefeuille] = useState<ClientIndustriel[]>([]);
    const [synthese, setSynthese] = useState<SynthesePortefeuille | null>(null);
    const [aucuneDonnee, setAucuneDonnee] = useState(false);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState<string | null>(null);

    const charger = useCallback(async () => {
        setChargement(true);
        setErreur(null);
        try {
            const res = await fetch("/api/industries/portfolio");
            if (!res.ok) throw new Error(`Reponse ${res.status}`);
            const data = await res.json();
            setPortefeuille(data.portefeuille ?? []);
            setSynthese(data.synthese ?? null);
            setAucuneDonnee(Boolean(data.aucuneDonnee));
        } catch (e) {
            console.error("Chargement du portefeuille industriel :", e);
            setErreur("Impossible de charger le portefeuille industriel.");
            setPortefeuille([]);
            setSynthese(null);
        } finally {
            setChargement(false);
        }
    }, []);

    useEffect(() => { charger(); }, [charger]);

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8 animate-in fade-in duration-500">

            {/* Industrial Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-8 border-b border-white/5 relative overflow-hidden">
                <div className="z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 text-orange-400 rounded-full text-xs font-bold tracking-widest uppercase mb-4 border border-orange-500/20">
                        <Factory className="w-3 h-3" /> Pôle Industrie
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        Gestion Portefeuille Industriel
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl text-lg">
                        Pilotage des coûts de production, valorisation des stocks et analyse de marge industrielle.
                        Vue consolidée de <span className="text-orange-400 font-bold">{synthese?.nbClients ?? 0} client{(synthese?.nbClients ?? 0) > 1 ? "s" : ""} industriel{(synthese?.nbClients ?? 0) > 1 ? "s" : ""}</span>.
                    </p>
                </div>

                {/* Background Decoration */}
                <Factory className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 text-orange-500/5 -z-0" />

                <div className="flex gap-3 z-10">
                    <Link href="/industries/manufacturing/machinery" className="px-6 py-3 bg-white/5 hover:bg-slate-800 text-white rounded-xl font-bold transition-all border border-white/10 flex items-center gap-2">
                        <Cog className="w-4 h-4" /> Parc Machines
                    </Link>
                    <button disabled title="Non implémenté" className="px-6 py-3 bg-slate-800/50 text-slate-500 rounded-xl font-bold cursor-not-allowed flex items-center gap-2">
                        <BarChart4 className="w-4 h-4" /> Rapport de Gestion
                    </button>
                </div>
            </div>

            {erreur && (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
                    {erreur}
                </div>
            )}

            {!chargement && !erreur && aucuneDonnee && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
                    <span className="font-bold">Aucun client industriel.</span> Le portefeuille se
                    construit sur les clients ayant des produits ou des immobilisations enregistres :
                    rien n&apos;a encore ete saisi.
                </div>
            )}

            {/* KPI calcules sur le portefeuille reel. Les stocks, les en-cours de
                production et la rotation ne sont suivis par aucun modele : ils ne
                sont pas affiches plutot que d'etre estimes. */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KpiCard
                    label="Clients industriels"
                    value={String(synthese?.nbClients ?? 0)}
                    icon={Factory}
                    color="text-orange-400"
                />
                <KpiCard
                    label="Chiffre d'affaires analytique"
                    value={`${fcfa(synthese?.chiffreAffaires ?? 0)} F`}
                    icon={TrendingUp}
                    color="text-sky-400"
                />
                <KpiCard
                    label="Marge degagee"
                    value={`${fcfa(synthese?.margeTotale ?? 0)} F`}
                    icon={TrendingUp}
                    color="text-emerald-400"
                />
                <KpiCard
                    label="Valeur nette du parc"
                    value={`${fcfa(synthese?.valeurNetteComptable ?? 0)} F`}
                    icon={PackagePlus}
                    color="text-violet-400"
                />
            </div>

            {/* Main Portfolio Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Left: Client List & Status */}
                <div className="xl:col-span-2 glass-card rounded-[40px] border border-white/5 bg-slate-900/40 overflow-hidden">
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/60">
                        <div className="flex items-center gap-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <Search className="w-5 h-5 text-slate-500" />
                                Clients Industriels
                            </h3>
                            <Link href="/industries/manufacturing/costing" className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 border border-violet-500/20 px-3 py-1.5 rounded-lg bg-violet-500/10 transition-colors">
                                <Calculator className="w-3 h-3" /> Analytique Produit
                            </Link>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-bold text-slate-400 hover:text-white cursor-pointer transition-colors">Agro</span>
                                <span className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-bold text-slate-400 hover:text-white cursor-pointer transition-colors">Manufacture</span>
                                <span className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-bold text-slate-400 hover:text-white cursor-pointer transition-colors">Mines</span>
                            </div>
                        </div>
                        <Filter className="w-5 h-5 text-slate-500 cursor-pointer" />
                    </div>

                    <div className="p-6 grid gap-4">
                        {chargement ? (
                            <p className="text-sm text-slate-500">Chargement du portefeuille...</p>
                        ) : portefeuille.length === 0 ? (
                            <p className="text-sm text-slate-500">Aucun client industriel a afficher.</p>
                        ) : portefeuille.map((client) => (
                            <div key={client.id} className="group p-6 rounded-3xl bg-slate-950/50 border border-white/5 hover:border-orange-500/30 transition-all hover:bg-slate-900/60">
                                <div className="flex justify-between items-start gap-4 mb-6">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-orange-500/10 border-orange-500/20 text-orange-400 shrink-0">
                                            <Factory className="w-6 h-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-lg font-bold text-white truncate">{client.nom}</h4>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider truncate">
                                                {client.secteur ?? "Secteur non renseigne"} &bull; {client.pays}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-2xl font-black text-white tabular-nums">
                                            {client.chiffreAffaires > 0 ? `${fcfa(client.chiffreAffaires)} F` : "\u2014"}
                                        </div>
                                        <div className="text-xs text-slate-500 font-bold">
                                            {client.chiffreAffaires > 0 ? "CA analytique" : "Volumes non saisis"}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-4 border-t border-b border-white/5 bg-black/20 rounded-xl px-4">
                                    <MetricItem
                                        label="Taux de marge"
                                        value={client.tauxMarge != null ? `${client.tauxMarge}%` : "\u2014"}
                                        up={client.tauxMarge != null && client.tauxMarge > 15}
                                    />
                                    <MetricItem label="Produits suivis" value={String(client.nbProduits)} />
                                    <MetricItem label="Immobilisations" value={String(client.nbImmobilisations)} />
                                    <MetricItem
                                        label="Valeur nette du parc"
                                        value={client.valeurNetteComptable > 0 ? `${fcfa(client.valeurNetteComptable)} F` : "\u2014"}
                                        icon={Settings}
                                    />
                                </div>

                                <div className="mt-4 flex flex-wrap justify-between items-center gap-3">
                                    <div className="flex flex-wrap gap-2">
                                        {client.alertes.length === 0 ? (
                                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                                <PackageCheck className="w-3 h-3" /> Dossier complet
                                            </span>
                                        ) : (
                                            client.alertes.map((a, i) => (
                                                <span key={i} className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-xs font-bold flex items-center gap-2">
                                                    <AlertTriangle className="w-3 h-3 shrink-0" /> {a}
                                                </span>
                                            ))
                                        )}
                                    </div>
                                    <Link
                                        href="/industries/manufacturing/costing"
                                        className="text-xs font-bold text-slate-500 hover:text-white flex items-center gap-1 transition-colors"
                                    >
                                        Voir analytique <ArrowUpRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Analytical Focus & Alerts */}
                <div className="space-y-6">

                    {/* Industrial Cost Structure */}
                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                            <BarChart4 className="w-5 h-5 text-orange-400" />
                            Répartition des Coûts
                            <span className="text-xs text-slate-500 font-normal ml-auto">Moyenne Portefeuille</span>
                        </h3>

                        {/* La repartition moyenne exige les ventilations de cout de chaque
                            produit : elle est disponible sur l'ecran analytique, ou chaque
                            produit porte la sienne. On renvoie vers lui plutot que d'afficher
                            une moyenne inventee. */}
                        <p className="text-sm text-slate-400 leading-relaxed">
                            La ventilation des couts est etablie produit par produit, a partir des
                            composantes saisies.
                        </p>
                        <Link
                            href="/industries/manufacturing/costing"
                            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-xs font-bold text-violet-300 transition-colors hover:bg-violet-500/20"
                        >
                            <Calculator className="w-3 h-3" /> Ouvrir l&apos;analytique produit
                        </Link>

                    </div>

                    {/* Stock Health */}
                    {/* La rotation, les ruptures et la valorisation des stocks exigent un
                        suivi de mouvements de stock qu'aucun module n'alimente actuellement :
                        rien n'est affiche plutot que d'etre invente (cf. note KPI ci-dessus). */}
                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-950/40 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Boxes className="w-32 h-32 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                            <Thermometer className="w-5 h-5 text-rose-400" />
                            Santé des Stocks
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Aucun mouvement de stock n&apos;est enregistré dans l&apos;application : la rotation, les ruptures et l&apos;état des stocks ne peuvent pas être calculés.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}

function KpiCard({ label, value, trend, trendColor = "text-emerald-400", icon: Icon, color }: any) {
    return (
        <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-xl bg-white/5 group-hover:scale-110 transition-transform", color.replace("text-", "bg-").replace("400", "500/20"))}>
                    <Icon className={cn("w-6 h-6", color)} />
                </div>
                <div className={cn("text-[10px] font-black px-2 py-1 rounded-full bg-slate-800 border border-white/5", trendColor)}>
                    {trend}
                </div>
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">{value}</h3>
            </div>
        </div>
    );
}

function MetricItem({ label, value, up, color, icon: Icon }: any) {
    return (
        <div className="space-y-1">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider flex items-center gap-1">
                {Icon && <Icon className="w-3 h-3" />} {label}
            </p>
            <p className={cn("font-bold text-sm", color ? color : "text-white")}>
                {value}
                {up !== undefined && (
                    <span className={cn("ml-1", up ? "text-emerald-400" : "text-rose-400")}>
                        {up ? "↑" : "↓"}
                    </span>
                )}
            </p>
        </div>
    );
}
