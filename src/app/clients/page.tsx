"use client";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
// Build: 2026-01-28 22:15

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Building2, Search, MoreHorizontal, MapPin, Phone, FileText, LayoutGrid, List, Activity, Globe, Briefcase, MessageSquare, ArrowUpRight, Copy, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Client } from "@/types/prisma";
import { ResponsiveDataList } from "@/components/layout/ResponsiveComponents";

interface ClientWithCount extends Client {
    portalToken?: string;
    portalEnabled?: boolean;
    _count?: {
        missions: number;
        invoices: number;
        declarations: number;
    };
}

export default function ClientsPage() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchTerm, setSearchTerm] = useState("");
    const [clients, setClients] = useState<ClientWithCount[]>([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/clients");
            const data = await res.json();
            if (data.clients) {
                setClients(data.clients);
            }
        } catch (error) {
            console.error("Failed to fetch clients:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter(client => {
        const name = (client.companyName || `${client.firstName} ${client.lastName}` || "").toLowerCase();
        const search = searchTerm.toLowerCase();
        return name.includes(search) ||
            (client.sector && client.sector.toLowerCase().includes(search)) ||
            (client.city && client.city.toLowerCase().includes(search));
    });

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
            {/* Actions & Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
                <div className="flex gap-2 p-1 bg-card border border-border rounded-2xl self-start sm:self-auto shadow-sm">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={cn("p-2 sm:p-3 rounded-xl transition-all", viewMode === "grid" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground")}
                    >
                        <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={cn("p-2 sm:p-3 rounded-xl transition-all", viewMode === "list" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground")}
                    >
                        <List className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>

                <div className="flex-1 w-full max-w-2xl relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, RCCM, ville..."
                        className="w-full pl-14 pr-6 py-3 sm:py-3.5 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 outline-none transition-all shadow-sm text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <Link href="/clients/new" className="w-full sm:w-auto px-6 py-3 sm:py-3.5 bg-primary hover:brightness-110 text-white rounded-2xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-3 transition-all shadow-md shadow-primary/20 active:scale-95">
                    <Briefcase className="w-4 h-4" /> Nouveau Dossier
                </Link>
            </div>

            {/* Main Content */}
            {loading ? (
                <LoadingState label="Chargement de votre portefeuille…" skeleton="cards" count={6} />
            ) : filteredClients.length === 0 ? (
                <div className="apix-card">
                    <EmptyState
                        icon={Users}
                        title={searchTerm ? "Aucun client ne correspond" : "Aucun client pour l'instant"}
                        description={searchTerm
                            ? `Aucun dossier ne contient « ${searchTerm} ». Vérifiez l'orthographe ou élargissez la recherche.`
                            : "Commencez par ajouter votre premier client pour gérer ses missions et sa fiscalité."}
                        action={searchTerm
                            ? { label: "Effacer la recherche", onClick: () => setSearchTerm("") }
                            : { label: "Ajouter un client", href: "/clients/new", icon: Briefcase }}
                    />
                </div>
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {filteredClients.map((client) => {
                        const name = client.companyName || `${client.firstName} ${client.lastName}`;
                        const healthScore = (client as any).healthScore as number | null | undefined;

                        return (
                            <div key={client.id} className="apix-card group hover:scale-[1.01] transition-all relative overflow-hidden flex flex-col justify-between h-full min-h-[250px] p-5">
                                <div className={cn(
                                    "absolute top-0 right-0 w-24 h-24 blur-[40px] opacity-15 rounded-full pointer-events-none transition-all",
                                    healthScore == null ? "bg-slate-400 group-hover:bg-slate-300" : healthScore > 80 ? "bg-emerald-500 group-hover:bg-emerald-400" : "bg-rose-500 group-hover:bg-rose-400"
                                )} />

                                <div className="relative z-10 mb-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className={cn(
                                            "w-11 h-11 rounded-xl flex items-center justify-center border shadow-sm",
                                            client.type === "ENTREPRISE"
                                                ? "bg-primary/10 text-primary border-primary/20"
                                                : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20"
                                        )}>
                                            {client.type === "ENTREPRISE" ? <Building2 className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                                        </div>
                                        <Link href={`/clients/${client.id}`} title="Ouvrir la fiche client" className="text-muted-foreground hover:text-primary p-1.5 rounded-lg hover:bg-primary/10">
                                            <ArrowUpRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                    <h3 className="font-bold text-foreground text-base leading-tight mb-1 line-clamp-2">
                                        <Link href={`/clients/${client.id}`} className="hover:text-primary">{name}</Link>
                                    </h3>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{client.sector || "SECTEUR NON DÉFINI"}</p>
                                </div>

                                <div className="space-y-3 mb-4 relative z-10">
                                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                                        <span className="truncate">{client.city ? `${client.city}, ` : ""}{client.country}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-white/5">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase">Santé Client</span>
                                        {healthScore == null ? (
                                            <span className="text-[10px] font-black text-slate-500">Non évalué</span>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-12 bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn("h-full rounded-full", healthScore > 80 ? "bg-emerald-500" : "bg-rose-500")}
                                                        style={{ width: `${healthScore}%` }}
                                                    />
                                                </div>
                                                <span className={cn(
                                                    "text-[10px] font-black",
                                                    healthScore > 80 ? "text-emerald-400" : "text-rose-400"
                                                )}>{healthScore}%</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Lien Portail PMI */}
                                {(client as any).portalEnabled && (
                                    <div className="flex items-center gap-2 p-2.5 bg-primary/5 border border-primary/15 rounded-xl relative z-10">
                                        <ExternalLink className="w-3 h-3 text-primary flex-shrink-0" />
                                        <span className="text-[10px] text-primary font-bold flex-1 truncate">Portail actif</span>
                                        <Link
                                            href={`/clients/${client.id}#portail`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-1 px-2 py-1 bg-primary/20 hover:brightness-110/30 rounded-lg text-primary text-[9px] font-black transition-colors"
                                        >
                                            <Copy className="w-3 h-3" /> Lien d&apos;accès
                                        </Link>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-2 relative z-10">
                                    <div className="flex gap-1">
                                        <ActionButton icon={Phone} title={client.phone ? `Appeler ${client.phone}` : "Aucun téléphone renseigné"} href={client.phone ? `tel:${client.phone}` : undefined} />
                                        <ActionButton icon={MessageSquare} title={client.phone ? "Ouvrir WhatsApp" : "Aucun téléphone renseigné"} href={client.phone ? `https://wa.me/${client.phone.replace(/\D/g, "")}` : undefined} />
                                        <Link href={`/clients/${client.id}`} title="Fiche client" className="p-2.5 rounded-xl bg-slate-800/50 text-slate-400 hover:brightness-110 hover:text-white transition-all hover:scale-110 hover:shadow-lg border border-white/5"><FileText className="w-3.5 h-3.5" /></Link>
                                    </div>
                                    <span className={cn(
                                        "px-2.5 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider border",
                                        client.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-700/30 text-slate-400 border-slate-600/30"
                                    )}>
                                        {client.isActive ? "Actif" : "Inactif"}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Add Client Card */}
                    <Link href="/clients/new" className="glass-card p-6 rounded-[32px] border-2 border-dashed border-slate-700/50 hover:border-primary/50 bg-slate-900/10 flex flex-col items-center justify-center gap-4 group cursor-pointer transition-all min-h-[250px]">
                        <div className="w-16 h-16 rounded-full bg-slate-800 group-hover:brightness-110 transition-colors flex items-center justify-center shadow-2xl">
                            <Briefcase className="w-6 h-6 text-slate-400 group-hover:text-white" />
                        </div>
                        <p className="text-[10px] font-black text-slate-500 group-hover:text-primary uppercase tracking-widest">Nouveau Dossier</p>
                    </Link>
                </div>
            ) : (
                <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl">
                    <ResponsiveDataList
                        data={filteredClients}
                        renderCard={(client) => {
                            const name = client.companyName || `${client.firstName} ${client.lastName}`;
                            return (
                                <div key={client.id} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-transform">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center font-black text-white text-xs">
                                            {name[0]}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-white text-sm truncate">{name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[9px] px-2 py-0.5 bg-slate-800 rounded-full text-slate-500 font-bold uppercase">{client.sector || "SECTEUR NON DÉFINI"}</span>
                                                <span className="text-[10px] text-emerald-400 font-black uppercase text-xs">ACTIF</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="p-2.5 bg-white/5 rounded-xl text-white">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        }}
                        renderTable={() => (
                            <div className="overflow-x-auto">
                                <table className="apix-table text-left">
                                    <thead className="bg-slate-900/80 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                        <tr>
                                            <th className="px-8 py-6">Client / Secteur</th>
                                            <th className="px-6 py-6 font-black text-center">Pays</th>
                                            <th className="px-6 py-6 font-black text-center">Santé</th>
                                            <th className="px-6 py-6 font-black text-right whitespace-nowrap">Missions</th>
                                            <th className="px-6 py-6 font-black text-center">Statut</th>
                                            <th className="px-8 py-6 font-black text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredClients.map((client) => {
                                            const name = client.companyName || `${client.firstName} ${client.lastName}`;
                                            const healthScore = (client as any).healthScore as number | null | undefined;

                                            return (
                                                <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-xs font-black text-slate-400">
                                                                {name[0]}
                                                            </div>
                                                            <div>
                                                                <span className="font-bold text-white block truncate max-w-[200px]">{name}</span>
                                                                <span className="text-[10px] text-slate-500 font-bold uppercase">{client.sector || "NON DEFINI"}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6 text-center">
                                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-full border border-white/5">
                                                            <Globe className="w-3 h-3 text-primary" />
                                                            <span className="text-[10px] font-bold text-slate-300">{client.country}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6 text-center">
                                                        {healthScore == null ? (
                                                            <span className="font-black text-sm text-slate-500">—</span>
                                                        ) : (
                                                            <span className={cn(
                                                                "font-black text-sm",
                                                                healthScore > 80 ? "text-emerald-400" : "text-rose-400"
                                                            )}>{healthScore}/100</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-6 text-right">
                                                        <span className="font-mono text-white font-bold">{client._count?.missions || 0}</span>
                                                    </td>
                                                    <td className="px-6 py-6 text-center">
                                                        <span className={cn(
                                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border",
                                                            client.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-700/30 text-slate-400 border-slate-600/30"
                                                        )}>
                                                            {client.isActive ? "Actif" : "Inactif"}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <button disabled title="Non implémenté" onClick={(e) => e.preventDefault()} className="p-2 rounded-xl text-slate-700 cursor-not-allowed">
                                                            <MoreHorizontal className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    />
                </div>
            )}

            {/* Bandeau de synthèse bas de page */}
            <div className="relative p-8 sm:p-12 rounded-[40px] bg-gradient-to-br from-slate-900 to-primary/30 border border-white/5 overflow-hidden shadow-2xl mt-12 animate-in slide-in-from-bottom-10 duration-1000">
                <div className="absolute -bottom-10 -left-10 p-20 opacity-10 bg-primary rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
                    <div className="text-center lg:text-left flex-1">
                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter mb-2 italic">⭐ Portefeuille Clients 360°</h2>
                        <p className="text-slate-400 text-sm sm:text-base max-w-xl font-medium mx-auto lg:mx-0">
                            Gestion centralisée des tiers, scoring de risque KYC et opportunités de cross-selling.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center lg:justify-end gap-4 w-full lg:w-auto">
                        <KPICard label="Clients Actifs" value={String(clients.filter((c) => c.isActive).length)} icon={Activity} color="text-primary" />
                        <KPICard label="Portefeuille Total" value={String(clients.length)} icon={Users} color="text-emerald-400" />
                    </div>
                </div>
            </div>
        </div>
    );
}

interface KPICardProps {
    label: string;
    value: string;
    trend?: string;
    icon: any; // Type generic for Lucide icons
    color: string;
}

function KPICard({ label, value, trend, icon: Icon, color }: KPICardProps) {
    return (
        <div className="glass-card px-4 sm:px-6 py-4 rounded-2xl sm:rounded-[28px] border border-white/5 bg-slate-900/50 flex items-center gap-4 flex-1">
            <div className={cn("p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/5", color)}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
                <p className="text-[8px] sm:text-[9px] text-slate-500 font-black uppercase tracking-widest mb-0.5">{label}</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-lg sm:text-xl font-black text-white tracking-tight">{value}</span>
                    {trend && (
                        <span className={cn("text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white/5", color)}>
                            {trend}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

function ActionButton({ icon: Icon, href, title }: { icon: any; href?: string; title?: string }) {
    const className = "p-2.5 rounded-xl bg-slate-800/50 text-slate-400 hover:brightness-110 hover:text-white transition-all hover:scale-110 hover:shadow-lg border border-white/5";
    if (!href) {
        return (
            <button disabled title={title || "Non disponible"} onClick={(e) => e.preventDefault()} className={cn(className, "opacity-40 cursor-not-allowed hover:bg-slate-800/50 hover:text-slate-400 hover:scale-100")}>
                <Icon className="w-3.5 h-3.5" />
            </button>
        );
    }
    return (
        <a href={href} target="_blank" rel="noreferrer" title={title} onClick={(e) => e.stopPropagation()} className={className}>
            <Icon className="w-3.5 h-3.5" />
        </a>
    );
}



