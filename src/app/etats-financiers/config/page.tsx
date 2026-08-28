"use client";

import React, { useState, useEffect } from 'react';
import { Save, AlertTriangle } from 'lucide-react';

export default function ConfigPage() {
    const [clients, setClients] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/clients')
            .then(res => res.json())
            .then(data => {
                setClients(data.clients || []);
                setSelectedId(data.clients?.[0]?.id || "");
            })
            .finally(() => setLoading(false));
    }, []);

    const client = clients.find(c => c.id === selectedId);
    const identifiant = client ? (client.ninea || client.ifu || client.nif || client.rccm || "—") : "—";

    if (loading) {
        return <div className="text-slate-500">Chargement…</div>;
    }

    return (
        <div className="max-w-2xl space-y-8">
            <div>
                <h2 className="page-title">Paramétrage du Dossier</h2>
                <p className="page-subtitle">
                    Informations générales de l'entité pour l'entête des états financiers, issues de la fiche client.
                </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Client / Dossier</label>
                        <select
                            value={selectedId}
                            onChange={e => setSelectedId(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                        >
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.companyName || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim()}</option>
                            ))}
                        </select>
                    </div>

                    {client ? (
                        <>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Dénomination Sociale</label>
                                    <input readOnly type="text" className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" value={client.companyName || `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim()} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pays</label>
                                    <input readOnly type="text" className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" value={client.country || "—"} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Identifiant Fiscal (NINEA/IFU/NIF)</label>
                                    <input readOnly type="text" className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" value={identifiant} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Secteur d'activité</label>
                                    <input readOnly type="text" className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" value={client.sector || "—"} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Adresse Complète</label>
                                <textarea readOnly className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" rows={2} value={`${client.address || ""} ${client.city || ""}`.trim() || "—"} />
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-500/10 dark:border-amber-500/20">
                                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-800 dark:text-amber-300">
                                    Ces champs sont en lecture seule. La modification depuis cet écran nécessite l'ajout d'un endpoint de mise à jour client — utilisez pour l'instant la fiche client dans <a href="/clients" className="underline font-semibold">Clients</a>.
                                </p>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-slate-500">Aucun client. Créez-en un depuis <a href="/clients/new" className="text-indigo-600 underline">Nouveau client</a>.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
