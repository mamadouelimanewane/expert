"use client";

import { useEffect, useState } from "react";
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    FileQuestion,
    MessageSquare,
    Paperclip,
    Plus,
    Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Centre de requêtes client.
//
// Cette page nommait une institution réelle (« Société Ivoirienne de
// Banque ») comme ayant une demande de justificatif en attente, à côté de
// clients fictifs, avec des compteurs précis (« 12 en attente, 128 traitées,
// 3 urgentes ») sans rapport avec les quatre lignes affichées. Les boutons
// Email / WhatsApp / Nouvelle requête n'avaient aucun effet.
//
// Aucun modèle ne suit aujourd'hui les demandes de pièces adressées aux
// clients : plutôt que d'inventer des statuts, cette page devient une liste
// de suivi qui démarre vide et se remplit avec les demandes réellement
// envoyées. Les compteurs sont calculés sur cette liste, jamais fixés à
// l'avance.
// ─────────────────────────────────────────────────────────────────────────────

type TypeRequete = "Justificatif manquant" | "Signature requise" | "Information manquante";
type Priorite = "Haute" | "Moyenne" | "Basse";
type Statut = "À envoyer" | "Envoyée" | "Réponse reçue" | "Traitée";

type Requete = {
    id: string;
    clientId: string;
    client: string;
    type: TypeRequete;
    details: string;
    priorite: Priorite;
    statut: Statut;
};

const TYPES: TypeRequete[] = ["Justificatif manquant", "Signature requise", "Information manquante"];
const PRIORITES: Priorite[] = ["Haute", "Moyenne", "Basse"];
const STATUTS: Statut[] = ["À envoyer", "Envoyée", "Réponse reçue", "Traitée"];

const STATUT_VERS_CODE: Record<Statut, string> = {
    "À envoyer": "A_ENVOYER",
    "Envoyée": "ENVOYEE",
    "Réponse reçue": "REPONSE_RECUE",
    "Traitée": "TRAITEE",
};
const CODE_VERS_STATUT: Record<string, Statut> = {
    A_ENVOYER: "À envoyer",
    ENVOYEE: "Envoyée",
    REPONSE_RECUE: "Réponse reçue",
    TRAITEE: "Traitée",
};

const ICONE_TYPE: Record<TypeRequete, typeof FileQuestion> = {
    "Justificatif manquant": FileQuestion,
    "Signature requise": Paperclip,
    "Information manquante": AlertCircle,
};

const STYLE_STATUT: Record<Statut, string> = {
    "À envoyer": "bg-amber-500/5 border-amber-500/20 text-amber-400",
    "Envoyée": "bg-primary/5 border-primary/20 text-primary",
    "Réponse reçue": "bg-cyan-500/5 border-cyan-500/20 text-cyan-400",
    "Traitée": "bg-emerald-500/5 border-emerald-500/20 text-emerald-400",
};

export default function CollaborationRequestsPage() {
    const [clients, setClients] = useState<{ id: string; nom: string }[]>([]);
    const [requetes, setRequetes] = useState<Requete[]>([]);
    const [chargement, setChargement] = useState(true);
    const [filtre, setFiltre] = useState<Statut | "all">("all");
    const [formOuvert, setFormOuvert] = useState(false);
    const [nouvelle, setNouvelle] = useState({ clientId: "", type: TYPES[0], details: "", priorite: "Moyenne" as Priorite });

    const chargerRequetes = () => {
        fetch("/api/collaboration/requests")
            .then((r) => r.json())
            .then((d) =>
                setRequetes(
                    (d.requetes ?? []).map((r: Record<string, unknown>) => ({
                        id: r.id,
                        clientId: r.clientId,
                        client: r.client,
                        type: r.type,
                        details: r.details,
                        priorite: r.priorite,
                        statut: CODE_VERS_STATUT[r.statut as string] ?? "À envoyer",
                    }))
                )
            )
            .finally(() => setChargement(false));
    };

    useEffect(() => {
        chargerRequetes();
        (async () => {
            try {
                const res = await fetch("/api/clients?limit=200&isActive=true");
                if (!res.ok) return;
                const data = await res.json();
                setClients(
                    (data.clients ?? []).map((c: Record<string, unknown>) => ({
                        id: String(c.id),
                        nom: (c.companyName as string) || [c.firstName, c.lastName].filter(Boolean).join(" ") || "Client sans nom",
                    }))
                );
            } catch (e) {
                console.error("Chargement du portefeuille :", e);
            }
        })();
    }, []);

    const ajouter = async () => {
        if (!nouvelle.clientId || !nouvelle.details.trim()) return;
        await fetch("/api/collaboration/requests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nouvelle),
        });
        setNouvelle({ clientId: "", type: TYPES[0], details: "", priorite: "Moyenne" });
        setFormOuvert(false);
        chargerRequetes();
    };

    const changerStatut = async (id: string, statut: Statut) => {
        setRequetes((prev) => prev.map((r) => (r.id === id ? { ...r, statut } : r)));
        await fetch("/api/collaboration/requests", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, statut: STATUT_VERS_CODE[statut] }),
        });
    };

    const supprimer = async (id: string) => {
        setRequetes((prev) => prev.filter((r) => r.id !== id));
        await fetch(`/api/collaboration/requests?id=${id}`, { method: "DELETE" });
    };

    const visibles = filtre === "all" ? requetes : requetes.filter((r) => r.statut === filtre);

    const metrics = [
        { label: "À envoyer", value: requetes.filter((r) => r.statut === "À envoyer").length, color: "text-amber-400", bg: "bg-amber-500/10", icon: Clock },
        { label: "Réponse reçue", value: requetes.filter((r) => r.statut === "Réponse reçue").length, color: "text-primary", bg: "bg-primary/10", icon: MessageSquare },
        { label: "Traitées", value: requetes.filter((r) => r.statut === "Traitée").length, color: "text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle2 },
        { label: "Priorité haute", value: requetes.filter((r) => r.priorite === "Haute").length, color: "text-rose-400", bg: "bg-rose-500/10", icon: AlertCircle },
    ];

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-8 border-b border-white/5">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
                        Collaboration Client
                    </div>
                    <h1 className="page-title-dark flex items-center gap-4">
                        <MessageSquare className="w-10 h-10 text-emerald-500" />
                        Centre de Requêtes
                    </h1>
                    <p className="page-subtitle-dark max-w-2xl">
                        Suivi manuel des demandes de justificatifs, signatures et informations
                        manquantes.
                    </p>
                </div>
                <button
                    onClick={() => setFormOuvert((v) => !v)}
                    className="px-6 py-3 bg-primary hover:brightness-110 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/25 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Nouvelle Requête
                </button>
            </div>

            {formOuvert && (
                <div className="bg-slate-900/60 border border-primary/20 rounded-3xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <select value={nouvelle.clientId} onChange={(e) => setNouvelle((f) => ({ ...f, clientId: e.target.value }))} className="bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white">
                        <option value="">Sélectionner un client *</option>
                        {clients.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                    </select>
                    <select value={nouvelle.type} onChange={(e) => setNouvelle((f) => ({ ...f, type: e.target.value as TypeRequete }))} className="bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white">
                        {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input
                        value={nouvelle.details}
                        onChange={(e) => setNouvelle((f) => ({ ...f, details: e.target.value }))}
                        placeholder="Détail de la demande *"
                        className="sm:col-span-2 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                    />
                    <select value={nouvelle.priorite} onChange={(e) => setNouvelle((f) => ({ ...f, priorite: e.target.value as Priorite }))} className="bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white">
                        {PRIORITES.map((p) => <option key={p} value={p}>Priorité : {p}</option>)}
                    </select>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setFormOuvert(false)} className="px-4 py-2 text-xs font-bold text-slate-400">Annuler</button>
                        <button onClick={ajouter} className="px-6 py-2 bg-primary hover:brightness-110 text-white rounded-xl text-xs font-black uppercase">Créer</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {metrics.map((m) => (
                    <div key={m.label} className="glass-card p-6 rounded-2xl border border-white/5 bg-slate-900/40 flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", m.bg)}>
                            <m.icon className={cn("w-6 h-6", m.color)} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-white">{m.value}</p>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{m.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="tabs-scroll flex gap-2 bg-slate-900/30 p-2 rounded-xl border border-white/5 w-fit">
                {(["all", ...STATUTS] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFiltre(f)}
                        className={cn(
                            "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                            filtre === f ? "bg-slate-800 text-white shadow-md" : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        {f === "all" ? "Toutes" : f}
                    </button>
                ))}
            </div>

            <div className="glass-card rounded-3xl border border-white/5 bg-slate-900/40 overflow-hidden">
                {chargement ? (
                    <p className="p-8 text-sm text-slate-500">Chargement des requêtes…</p>
                ) : visibles.length === 0 ? (
                    <p className="p-8 text-sm text-slate-500">Aucune requête enregistrée.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="apix-table-dark text-left">
                            <thead className="bg-slate-950/50 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
                                <tr>
                                    <th className="p-6">Client</th>
                                    <th className="p-6">Type</th>
                                    <th className="p-6">Priorité</th>
                                    <th className="p-6">Statut</th>
                                    <th className="p-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {visibles.map((req) => {
                                    const Icone = ICONE_TYPE[req.type];
                                    return (
                                        <tr key={req.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 text-xs">
                                                        {req.client.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <p className="font-bold text-white">{req.client}</p>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-start gap-3">
                                                    <Icone className="w-4 h-4 text-amber-500 mt-1" />
                                                    <div>
                                                        <p className="font-bold text-slate-200">{req.type}</p>
                                                        <p className="text-xs text-slate-500 mt-1">{req.details}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className={cn(
                                                    "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest",
                                                    req.priorite === "Haute" ? "bg-rose-500/10 text-rose-400" : req.priorite === "Moyenne" ? "bg-amber-500/10 text-amber-400" : "bg-slate-500/10 text-slate-400"
                                                )}>
                                                    {req.priorite}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <select
                                                    value={req.statut}
                                                    onChange={(e) => changerStatut(req.id, e.target.value as Statut)}
                                                    className={cn("px-3 py-1.5 rounded-full text-xs font-bold border bg-transparent", STYLE_STATUT[req.statut])}
                                                >
                                                    {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </td>
                                            <td className="p-6 text-right">
                                                <button onClick={() => supprimer(req.id)} className="p-2 text-slate-500 hover:text-rose-400">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
