"use client";

import { useEffect, useState } from "react";
import {
    AlertCircle,
    BarChart,
    MailCheck,
    Microscope,
    Plus,
    Save,
    Scale,
    ShieldCheck,
    Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Suite Commissariat aux Comptes.
//
// Cette page nommait des entreprises réelles — SGB Côte d'Ivoire, Orange CI,
// Total Energy — comme tiers ayant répondu à des demandes de confirmation
// externe, avec un statut et un écart inventés (« Orange CI +2,4 % »). Elle
// annonçait aussi un échantillon statistique calculé (« 142 lignes »), une
// équipe d'audit assignée et un bouton « Signer le rapport », sans qu'aucun
// calcul, aucune assignation ni aucune signature n'ait eu lieu.
//
// Aucun modèle ne suit aujourd'hui les circularisations ni les sondages
// statistiques : plutôt que d'inventer des résultats, cette page devient des
// calculateurs à paramètres saisis par le collaborateur, et une liste de
// circularisations qui démarre vide et se remplit avec les tiers réels du
// dossier.
// ─────────────────────────────────────────────────────────────────────────────

type SeuilBase = {
    label: string;
    valeur: number;
    taux: number;
};

const SEUILS_PAR_DEFAUT: SeuilBase[] = [
    { label: "Produits d'exploitation", valeur: 0, taux: 1.5 },
    { label: "Résultat courant", valeur: 0, taux: 10 },
    { label: "Capitaux propres", valeur: 0, taux: 3 },
];

type Circularisation = {
    id: string;
    type: string;
    tiers: string;
    statut: "En attente" | "Reçue" | "Relancée";
};

const TYPES_TIERS = ["Banque", "Avocat", "Client", "Fournisseur"];

type ContenuCAC = {
    seuils: SeuilBase[];
    seuilRetenu: number;
    circularisations: Circularisation[];
    population: number;
    tauxSondage: number;
};

export default function CACSuitePage() {
    const [clients, setClients] = useState<{ id: string; nom: string }[]>([]);
    const [clientId, setClientId] = useState("");
    const [chargement, setChargement] = useState(false);
    const [sauvegarde, setSauvegarde] = useState(false);

    const [seuils, setSeuils] = useState<SeuilBase[]>(SEUILS_PAR_DEFAUT);
    const [seuilRetenu, setSeuilRetenu] = useState(0);

    const [circularisations, setCircularisations] = useState<Circularisation[]>([]);
    const [nouveauTiers, setNouveauTiers] = useState({ type: TYPES_TIERS[0], tiers: "" });

    const [population, setPopulation] = useState(0);
    const [tauxSondage, setTauxSondage] = useState(10);

    useEffect(() => {
        fetch("/api/clients?limit=200&isActive=true")
            .then((r) => r.json())
            .then((d) =>
                setClients(
                    (d.clients ?? []).map((c: Record<string, unknown>) => ({
                        id: String(c.id),
                        nom: (c.companyName as string) || [c.firstName, c.lastName].filter(Boolean).join(" ") || "Client sans nom",
                    }))
                )
            )
            .catch((e) => console.error("Chargement du portefeuille :", e));
    }, []);

    useEffect(() => {
        if (!clientId) return;
        setChargement(true);
        fetch(`/api/audit/work-papers?clientId=${clientId}&type=CAC_SUITE`)
            .then((r) => r.json())
            .then((d) => {
                const c: ContenuCAC | null = d.data;
                setSeuils(c?.seuils ?? SEUILS_PAR_DEFAUT);
                setSeuilRetenu(c?.seuilRetenu ?? 0);
                setCircularisations(c?.circularisations ?? []);
                setPopulation(c?.population ?? 0);
                setTauxSondage(c?.tauxSondage ?? 10);
            })
            .finally(() => setChargement(false));
    }, [clientId]);

    const enregistrer = async () => {
        if (!clientId) return;
        setSauvegarde(true);
        try {
            const data: ContenuCAC = { seuils, seuilRetenu, circularisations, population, tauxSondage };
            await fetch("/api/audit/work-papers", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clientId, type: "CAC_SUITE", data }),
            });
        } finally {
            setSauvegarde(false);
        }
    };

    const ajouterCircularisation = () => {
        if (!nouveauTiers.tiers.trim()) return;
        setCircularisations((prev) => [
            ...prev,
            { id: crypto.randomUUID(), type: nouveauTiers.type, tiers: nouveauTiers.tiers.trim(), statut: "En attente" },
        ]);
        setNouveauTiers({ type: TYPES_TIERS[0], tiers: "" });
    };

    const changerStatut = (id: string, statut: Circularisation["statut"]) => {
        setCircularisations((prev) => prev.map((c) => (c.id === id ? { ...c, statut } : c)));
    };

    const supprimerCircularisation = (id: string) => {
        setCircularisations((prev) => prev.filter((c) => c.id !== id));
    };

    const echantillon = population > 0 ? Math.ceil(population * (tauxSondage / 100)) : 0;

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-8 border-b border-white/5 bg-slate-900/40 rounded-[32px] px-10 border-t border-t-primary/20 shadow-2xl">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-primary/20">
                        <Microscope className="w-3 h-3" /> Suite Commissariat aux Comptes (CAC)
                    </div>
                    <h1 className="page-title-dark">
                        CAC Workbench
                    </h1>
                    <p className="page-subtitle-dark">
                        Seuils de signification, circularisations et sondage statistique — calculés à
                        partir des paramètres que vous saisissez.
                    </p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                    >
                        <option value="">Sélectionner un dossier client…</option>
                        {clients.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                    </select>
                    <button
                        onClick={enregistrer}
                        disabled={!clientId || sauvegarde}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" /> {sauvegarde ? "…" : "Enregistrer"}
                    </button>
                </div>
            </div>

            {!clientId ? (
                <div className="glass-card p-10 rounded-[32px] border border-white/5 bg-slate-900/40 text-center text-sm text-slate-500">
                    Sélectionnez un dossier client pour ouvrir (ou créer) son cahier de travail CAC.
                </div>
            ) : chargement ? (
                <div className="glass-card p-10 rounded-[32px] border border-white/5 bg-slate-900/40 text-center text-sm text-slate-500">
                    Chargement du cahier de travail…
                </div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Planning & Risk */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-6 rounded-[32px] border border-white/5 bg-slate-950/40">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                            <Scale className="w-5 h-5 text-primary" /> Seuils de signification
                        </h3>
                        <div className="space-y-3">
                            {seuils.map((base, i) => {
                                const resultat = Math.round(base.valeur * (base.taux / 100));
                                return (
                                    <div
                                        key={base.label}
                                        onClick={() => setSeuilRetenu(i)}
                                        className={cn(
                                            "p-4 rounded-2xl border transition-all cursor-pointer",
                                            seuilRetenu === i
                                                ? "bg-primary/10 border-primary/40"
                                                : "bg-slate-900/20 border-white/5 hover:bg-slate-900/40"
                                        )}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs text-slate-500 font-bold uppercase">{base.label}</span>
                                            <span className="text-[10px] font-mono text-primary">{base.taux}%</span>
                                        </div>
                                        <div className="flex justify-between items-end gap-2">
                                            <input
                                                type="number"
                                                value={base.valeur || ""}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) =>
                                                    setSeuils((prev) =>
                                                        prev.map((s, j) =>
                                                            j === i ? { ...s, valeur: Number(e.target.value) } : s
                                                        )
                                                    )
                                                }
                                                placeholder="Montant FCFA"
                                                className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-sm text-slate-300 font-mono"
                                            />
                                            <span className="text-lg font-black text-white whitespace-nowrap">
                                                {resultat.toLocaleString("fr-FR")} <span className="text-[10px] text-slate-500">F</span>
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 p-4 bg-primary rounded-2xl text-center shadow-lg shadow-primary/20">
                            <p className="text-[10px] text-primary-foreground/70 font-black uppercase tracking-widest mb-1">Seuil retenu</p>
                            <div className="text-2xl font-black text-white">
                                {Math.round(seuils[seuilRetenu].valeur * (seuils[seuilRetenu].taux / 100)).toLocaleString("fr-FR")} FCFA
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-[32px] border border-white/5 bg-slate-950/40">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-rose-500" /> Grille impact/probabilité
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">
                            Repère de référence — à positionner manuellement selon les risques identifiés
                            sur ce dossier.
                        </p>
                        <div className="grid grid-cols-3 grid-keep gap-2 h-24 sm:h-32">
                            {[...Array(9)].map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "rounded-lg border border-white/5",
                                        i < 3 ? "bg-rose-500/10" : i < 6 ? "bg-amber-500/10" : "bg-emerald-500/10"
                                    )}
                                />
                            ))}
                        </div>
                        <div className="mt-4 flex justify-between text-[10px] font-black text-slate-500 uppercase">
                            <span>Impact faible</span>
                            <span>Impact critique</span>
                        </div>
                    </div>
                </div>

                {/* Right: Execution area */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                    <MailCheck className="w-6 h-6 text-sky-400" /> Circularisations
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Suivi manuel des demandes de confirmation externe de ce dossier.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                            <select
                                value={nouveauTiers.type}
                                onChange={(e) => setNouveauTiers((f) => ({ ...f, type: e.target.value }))}
                                className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                            >
                                {TYPES_TIERS.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                            <input
                                value={nouveauTiers.tiers}
                                onChange={(e) => setNouveauTiers((f) => ({ ...f, tiers: e.target.value }))}
                                onKeyDown={(e) => e.key === "Enter" && ajouterCircularisation()}
                                placeholder="Nom du tiers"
                                className="flex-1 min-w-[200px] bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                            />
                            <button
                                onClick={ajouterCircularisation}
                                className="px-4 py-2 bg-primary hover:brightness-110 text-white rounded-xl text-xs font-bold flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Ajouter
                            </button>
                        </div>

                        {circularisations.length === 0 ? (
                            <p className="text-sm text-slate-500">Aucune circularisation ajoutée pour ce dossier.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="apix-table-dark text-left">
                                    <thead className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                        <tr>
                                            <th className="pb-4 px-4">Type</th>
                                            <th className="pb-4 px-4">Tiers</th>
                                            <th className="pb-4 px-4">Statut</th>
                                            <th className="pb-4 px-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {circularisations.map((c) => (
                                            <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                                <td className="py-4 px-4 font-bold text-slate-400">{c.type}</td>
                                                <td className="py-4 px-4 text-white font-bold">{c.tiers}</td>
                                                <td className="py-4 px-4">
                                                    <select
                                                        value={c.statut}
                                                        onChange={(e) =>
                                                            changerStatut(c.id, e.target.value as Circularisation["statut"])
                                                        }
                                                        className={cn(
                                                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-transparent",
                                                            c.statut === "Reçue"
                                                                ? "text-emerald-400 border-emerald-500/20"
                                                                : c.statut === "Relancée"
                                                                  ? "text-amber-400 border-amber-500/20"
                                                                  : "text-slate-400 border-white/10"
                                                        )}
                                                    >
                                                        <option value="En attente">En attente</option>
                                                        <option value="Relancée">Relancée</option>
                                                        <option value="Reçue">Reçue</option>
                                                    </select>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <button
                                                        onClick={() => supprimerCircularisation(c.id)}
                                                        className="p-2 text-slate-500 hover:text-rose-400"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="p-8 bg-slate-950/60 border border-white/5 rounded-[32px]">
                        <h4 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                            <BarChart className="w-5 h-5 text-primary" />
                            Sondage statistique
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">
                            Taille d&apos;échantillon = population × taux de sondage retenu par le
                            collaborateur.
                        </p>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <label className="text-xs text-slate-500">
                                Population (nombre de lignes)
                                <input
                                    type="number"
                                    value={population || ""}
                                    onChange={(e) => setPopulation(Number(e.target.value))}
                                    className="w-full mt-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white"
                                />
                            </label>
                            <label className="text-xs text-slate-500">
                                Taux de sondage (%)
                                <input
                                    type="number"
                                    value={tauxSondage}
                                    onChange={(e) => setTauxSondage(Number(e.target.value))}
                                    className="w-full mt-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white"
                                />
                            </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl">
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold">Échantillon</p>
                                <p className="text-2xl font-black text-white">
                                    {echantillon} <span className="text-xs text-slate-500">lignes</span>
                                </p>
                            </div>
                            {population === 0 && (
                                <span className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold uppercase">
                                    <AlertCircle className="w-3 h-3" /> Renseignez la population
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
}
