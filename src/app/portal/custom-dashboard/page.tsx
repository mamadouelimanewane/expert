"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
    LayoutDashboard,
    PieChart,
    BarChart3,
    TrendingUp,
    Settings2,
    CheckCircle2,
    Eye,
    Save,
    Move,
    Plus,
    X,
    Wallet,
    FileText,
    Users,
    Loader2,
    XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Personnalisation du tableau de bord client.
//
// Cette page n'identifiait aucun client (aucune lecture de token) et son
// bouton « Enregistrer » n'écrivait nulle part — la sélection de widgets se
// perdait à chaque rechargement. Les vignettes elles-mêmes n'affichaient
// jamais de chiffre fabriqué (juste un espace réservé « Visualisation X »),
// donc l'essentiel du correctif porte sur l'identification du client (même
// schéma ?token= que /portal/dashboard) et une sauvegarde réelle : aucun
// modèle Prisma ne stocke de préférences d'affichage, la sélection est donc
// persistée dans le navigateur du client, par token, ce qui est honnête
// (pas de fausse promesse de synchronisation multi-appareil).
// ─────────────────────────────────────────────────────────────────────────────

interface Widget {
    id: string;
    title: string;
    icon: any;
    color: string;
    size: "small" | "medium" | "large";
    active: boolean;
}

const DEFAULT_WIDGETS: Widget[] = [
    { id: "w1", title: "Trésorerie Actuelle", icon: Wallet, color: "text-emerald-400", size: "small", active: true },
    { id: "w2", title: "Évolution CA", icon: TrendingUp, color: "text-indigo-400", size: "medium", active: true },
    { id: "w3", title: "Délai Paiement (DSO)", icon: BarChart3, color: "text-amber-400", size: "small", active: true },
    { id: "w4", title: "Top 5 Clients", icon: Users, color: "text-purple-400", size: "medium", active: false },
    { id: "w5", title: "Répartition Dépenses", icon: PieChart, color: "text-rose-400", size: "medium", active: false },
    { id: "w6", title: "Documents à Signer", icon: FileText, color: "text-blue-400", size: "small", active: true },
];

function storageKey(token: string) {
    return `portal-dashboard-widgets:${token}`;
}

function CustomDashboardInner() {
    const searchParams = useSearchParams();
    const token = searchParams?.get("token") || "";

    const [clientNom, setClientNom] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [widgets, setWidgets] = useState<Widget[]>(DEFAULT_WIDGETS);
    const [isPreview, setIsPreview] = useState(false);
    const [enregistre, setEnregistre] = useState(false);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }
        fetch(`/api/portal/${token}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.error) {
                    setError(data.error);
                    return;
                }
                setClientNom(data.client?.companyName || [data.client?.firstName, data.client?.lastName].filter(Boolean).join(" ") || null);
                const saved = window.localStorage.getItem(storageKey(token));
                if (saved) {
                    try {
                        setWidgets(JSON.parse(saved));
                    } catch {
                        // Préférence corrompue : on garde les valeurs par défaut.
                    }
                }
            })
            .catch(() => setError("Impossible de charger votre espace."))
            .finally(() => setLoading(false));
    }, [token]);

    const toggleWidget = (id: string) => {
        setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, active: !w.active } : w)));
        setEnregistre(false);
    };

    const enregistrer = () => {
        window.localStorage.setItem(storageKey(token), JSON.stringify(widgets));
        setEnregistre(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0c10]">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0c10] p-8">
                <div className="max-w-md w-full bg-slate-900/60 border border-white/5 rounded-[28px] p-10 text-center space-y-4">
                    <LayoutDashboard className="w-14 h-14 text-slate-600 mx-auto" />
                    <h2 className="text-xl font-black text-white">Accès requis</h2>
                    <p className="text-slate-400 text-sm">
                        Cet espace s&apos;ouvre uniquement via le lien personnel fourni par votre cabinet comptable.
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0c10] p-8">
                <div className="max-w-md w-full bg-slate-900/60 border border-rose-500/20 rounded-[28px] p-10 text-center space-y-4">
                    <XCircle className="w-14 h-14 text-rose-500 mx-auto" />
                    <h2 className="text-xl font-black text-white">Espace inaccessible</h2>
                    <p className="text-slate-400 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20 p-8">
            {/* Header */}
            <div className="p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border border-white/5 bg-slate-900/40 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 sm:p-8 lg:p-12 opacity-5 pointer-events-none">
                    <LayoutDashboard className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                                {clientNom || "Votre espace"}
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                            Personnalisez votre <span className="text-indigo-400">Espace Pilotage</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Sélectionnez les indicateurs clés les plus pertinents pour votre activité.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsPreview(!isPreview)}
                            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/5 flex items-center gap-3 transition-all"
                        >
                            {isPreview ? <Settings2 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {isPreview ? "Modifier" : "Aperçu"}
                        </button>
                        <button
                            onClick={enregistrer}
                            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30"
                        >
                            <Save className="w-4 h-4" /> {enregistre ? "Enregistré" : "Enregistrer"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {!isPreview && (
                    <div className="lg:col-span-1 space-y-6 animate-in slide-in-from-left duration-500">
                        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40">
                            <h3 className="text-white font-black text-xs uppercase tracking-widest mb-8 flex items-center gap-3">
                                <Plus className="w-5 h-5 text-indigo-400" />
                                Widgets Disponibles
                            </h3>
                            <div className="space-y-3">
                                {widgets.map((widget) => (
                                    <div
                                        key={widget.id}
                                        className={cn(
                                            "p-4 rounded-2xl border transition-all cursor-pointer group flex items-center justify-between",
                                            widget.active ? "bg-indigo-600/10 border-indigo-500/30" : "bg-white/5 border-white/5 hover:border-white/10"
                                        )}
                                        onClick={() => toggleWidget(widget.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <widget.icon className={cn("w-4 h-4", widget.active ? widget.color : "text-slate-600")} />
                                            <span className={cn("text-xs font-bold", widget.active ? "text-white" : "text-slate-500")}>{widget.title}</span>
                                        </div>
                                        <div
                                            className={cn(
                                                "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                                                widget.active ? "bg-indigo-600 border-indigo-500 text-white" : "border-slate-700 text-transparent"
                                            )}
                                        >
                                            <CheckCircle2 className="w-3 h-3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className={cn("transition-all duration-500", isPreview ? "lg:col-span-4" : "lg:col-span-3")}>
                    <div className={cn("grid gap-6", isPreview ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-2")}>
                        {widgets
                            .filter((w) => w.active)
                            .map((widget) => (
                                <div
                                    key={widget.id}
                                    className={cn(
                                        "glass-card p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border border-white/5 bg-slate-900/40 relative overflow-hidden group transition-all hover:scale-[1.02]",
                                        widget.size === "large" ? "md:col-span-2" : ""
                                    )}
                                >
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <widget.icon className={cn("w-24 h-24", widget.color)} />
                                    </div>
                                    <div className="flex justify-between items-start mb-10">
                                        <div className={cn("p-4 rounded-2xl bg-white/5 shadow-xl transition-transform group-hover:scale-110", widget.color)}>
                                            <widget.icon className="w-6 h-6" />
                                        </div>
                                        {!isPreview && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleWidget(widget.id);
                                                }}
                                                className="p-2 hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 rounded-xl transition-all"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">{widget.title}</p>
                                    <div className="h-40 flex items-center justify-center border-2 border-dashed border-white/5 rounded-3xl group-hover:border-indigo-500/20 transition-colors">
                                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">
                                            Visualisation {widget.title}
                                        </span>
                                    </div>
                                    {!isPreview && (
                                        <div className="absolute bottom-6 right-8 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
                                            <Move className="w-4 h-4 text-slate-700" />
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CustomDashboardPage() {
    return (
        <Suspense fallback={null}>
            <CustomDashboardInner />
        </Suspense>
    );
}
