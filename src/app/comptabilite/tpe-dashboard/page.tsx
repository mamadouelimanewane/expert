"use client";

import React, { useState, useEffect } from 'react';
import { Users, FileDigit, CheckCircle2, Clock, AlertCircle, TrendingUp, Plus, RefreshCw, ChevronDown, ChevronRight, Building2, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';

export default function TpeDashboardPage() {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/comptabilite/tpe-stats');
            if (res.ok) setClients(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    const f = (v: number) => new Intl.NumberFormat('fr-FR').format(Math.round(v));

    const totalClients = clients.length;
    const totalEcritures = clients.reduce((a, c) => a + c.totalEcritures, 0);
    const totalPeriodes = clients.reduce((a, c) => a + c.periodes.length, 0);
    const pendingCount = clients.reduce((a, c) => a + c.periodes.filter((p: any) => p.status === 'PENDING').length, 0);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">

            {/* Header */}
            <header className="flex justify-between items-end border-b border-border/50 pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
                            <Users className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight">Gestion Abonnés TPE</h1>
                    </div>
                    <p className="text-muted-foreground">Suivi des cahiers de caisse reçus et de leur traitement comptable au cabinet.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchStats} className="flex items-center gap-2 px-4 py-2 border border-border/50 hover:bg-muted/40 rounded-xl text-sm font-bold transition-colors">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualiser
                    </button>
                    <Link href="/comptabilite/informel" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all">
                        <Plus className="w-4 h-4" /> Importer un Cahier
                    </Link>
                </div>
            </header>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Abonnés TPE actifs', value: totalClients, icon: <Building2 className="w-5 h-5" />, color: 'text-indigo-500', border: 'border-indigo-500/20', bg: 'bg-indigo-500/5' },
                    { label: 'Périodes importées', value: totalPeriodes, icon: <FileSpreadsheet className="w-5 h-5" />, color: 'text-blue-500', border: 'border-blue-500/20', bg: 'bg-blue-500/5' },
                    { label: 'Écritures générées', value: totalEcritures, icon: <FileDigit className="w-5 h-5" />, color: 'text-purple-500', border: 'border-purple-500/20', bg: 'bg-purple-500/5' },
                    { label: 'En attente de déversement', value: pendingCount, icon: <Clock className="w-5 h-5" />, color: pendingCount > 0 ? 'text-orange-500' : 'text-emerald-500', border: pendingCount > 0 ? 'border-orange-500/20' : 'border-emerald-500/20', bg: pendingCount > 0 ? 'bg-orange-500/5' : 'bg-emerald-500/5' },
                ].map((kpi, i) => (
                    <div key={i} className={`glass-card p-5 rounded-2xl border ${kpi.border} ${kpi.bg}`}>
                        <div className={`${kpi.color} mb-3`}>{kpi.icon}</div>
                        <p className="text-xs font-bold text-muted-foreground mb-1">{kpi.label}</p>
                        <p className={`text-3xl font-black ${kpi.color}`}>{kpi.value}</p>
                    </div>
                ))}
            </div>

            {/* Liste des clients */}
            <div className="glass-card rounded-3xl border border-border/50 overflow-hidden">
                <div className="p-6 border-b border-border/50 bg-muted/10 flex items-center justify-between">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-500" /> Tableau de Suivi par Client
                    </h2>
                    <span className="text-xs text-muted-foreground">{totalClients} client{totalClients !== 1 ? 's' : ''}</span>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-muted-foreground animate-pulse">Chargement des données…</div>
                ) : clients.length === 0 ? (
                    <div className="p-12 text-center space-y-4">
                        <div className="text-5xl">📂</div>
                        <p className="font-bold text-lg">Aucun cahier importé pour l'instant</p>
                        <p className="text-muted-foreground text-sm">Importez le premier cahier de caisse d'un client TPE pour commencer.</p>
                        <Link href="/comptabilite/informel" className="inline-flex items-center gap-2 mt-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg transition-all">
                            <Plus className="w-4 h-4" /> Importer maintenant
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-border/30">
                        {clients.map((client, i) => {
                            const isOpen = expanded === client.businessName;
                            const allDone = client.periodes.every((p: any) => p.status === 'EXPORTED');
                            const hasPending = client.periodes.some((p: any) => p.status === 'PENDING');

                            return (
                                <div key={i}>
                                    {/* Row principale */}
                                    <button
                                        onClick={() => setExpanded(isOpen ? null : client.businessName)}
                                        className="w-full flex items-center gap-4 px-6 py-5 hover:bg-muted/20 transition-colors text-left"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black text-sm shrink-0">
                                            {client.businessName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold truncate">{client.businessName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {client.totalEcritures} écritures · {client.periodes.length} période{client.periodes.length > 1 ? 's' : ''} · Dernier import : {new Date(client.lastImport).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${allDone ? 'bg-emerald-500/10 text-emerald-500' : hasPending ? 'bg-orange-500/10 text-orange-500' : 'bg-muted text-muted-foreground'}`}>
                                                {allDone ? <CheckCircle2 className="w-3 h-3" /> : hasPending ? <Clock className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                                {allDone ? 'Tout traité' : hasPending ? 'En attente' : 'Partiel'}
                                            </span>
                                            {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                                        </div>
                                    </button>

                                    {/* Détail périodes */}
                                    {isOpen && (
                                        <div className="px-6 pb-4 bg-muted/10">
                                            <table className="w-full text-sm">
                                                <thead className="text-xs text-muted-foreground uppercase border-b border-border/30 mb-2">
                                                    <tr>
                                                        <th className="py-2 text-left">Période</th>
                                                        <th className="py-2 text-right">Écritures</th>
                                                        <th className="py-2 text-right">Entrées</th>
                                                        <th className="py-2 text-right">Sorties</th>
                                                        <th className="py-2 text-center">Statut</th>
                                                        <th className="py-2 text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border/20">
                                                    {client.periodes.map((p: any, j: number) => (
                                                        <tr key={j} className="hover:bg-muted/20">
                                                            <td className="py-3 font-mono font-bold text-xs">{p.periode}</td>
                                                            <td className="py-3 text-right">{p.count}</td>
                                                            <td className="py-3 text-right text-emerald-500 font-bold">+{f(p.totalEntrees)}</td>
                                                            <td className="py-3 text-right text-rose-500 font-bold">-{f(p.totalSorties)}</td>
                                                            <td className="py-3 text-center">
                                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${p.status === 'EXPORTED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                                                    {p.status === 'EXPORTED' ? '✓ Déversé' : '⏳ En attente'}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 text-right">
                                                                {p.status === 'PENDING' && (
                                                                    <Link href="/comptabilite/informel" className="text-xs px-3 py-1 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 rounded-lg font-bold transition-colors">
                                                                        Ouvrir
                                                                    </Link>
                                                                )}
                                                                {p.status === 'EXPORTED' && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {p.exportedAt ? new Date(p.exportedAt).toLocaleDateString('fr-FR') : '-'}
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Rappel modèle à distribuer */}
            <div className="glass-card rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500 shrink-0">
                        <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-bold">Modèle Excel à distribuer aux clients</p>
                        <p className="text-sm text-muted-foreground">Remettez ce fichier à vos abonnés TPE. Ils n'ont qu'à remplir 4 colonnes : Date, Libellé, Entrées, Sorties.</p>
                    </div>
                </div>
                <a href="/api/comptabilite/tpe-template" download className="shrink-0 flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all whitespace-nowrap">
                    <FileSpreadsheet className="w-4 h-4" /> Télécharger le Modèle
                </a>
            </div>
        </div>
    );
}
