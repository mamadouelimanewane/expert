"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    Building,
    Calculator,
    Download,
    Gavel,
    Loader2,
    Mail,
    PlusCircle,
    Printer,
    ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Assistance contrôle fiscal.
//
// Trois contrôles fabriqués (client, inspecteur nommé, montant de rappel
// « 18,5 M FCFA »), un mémoire de réponse présentant trois arguments juridiques
// avec une coche verte comme s'ils étaient déjà validés, et un « journal de
// bord » citant une conversation avec le client qui n'a jamais eu lieu. La
// lettre d'accueil de l'inspecteur affirmait la mise à disposition de pièces
// non réunies.
//
// La page s'appuie désormais sur le registre réel des contentieux
// (JudicialCase, catégorie FISCAL). Le simulateur de rappel reste un
// calculateur paramétrable, légitime en tant qu'outil. Les arguments de
// défense et les pièces jointes sont saisis par le collaborateur, jamais
// pré-remplis.
// ─────────────────────────────────────────────────────────────────────────────

type Controle = {
    id: string;
    caseNumber: string;
    court: string;
    judge: string | null;
    parties: string;
    natureOfDispute: string | null;
    deadline: string | null;
    status: "EN_COURS" | "EN_ATTENTE" | "CLOTURE";
    notes: string | null;
};

const STATUT_STYLE: Record<Controle["status"], string> = {
    EN_COURS: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    EN_ATTENTE: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    CLOTURE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const LIBELLE_STATUT: Record<Controle["status"], string> = {
    EN_COURS: "En cours",
    EN_ATTENTE: "En attente",
    CLOTURE: "Clôturé",
};

function joursRestants(deadline: string | null): number | null {
    if (!deadline) return null;
    return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
}

export default function TaxAuditAssistancePage() {
    const [controles, setControles] = useState<Controle[]>([]);
    const [controleId, setControleId] = useState<string | null>(null);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "simulator" | "notes" | "letter">("overview");

    const [formOuvert, setFormOuvert] = useState(false);
    const [nouveauForm, setNouveauForm] = useState({ parties: "", caseNumber: "", natureOfDispute: "", deadline: "" });
    const [envoi, setEnvoi] = useState(false);

    const [notes, setNotes] = useState("");
    const [notesEnvoi, setNotesEnvoi] = useState(false);

    const charger = useCallback(async () => {
        setChargement(true);
        setErreur(null);
        try {
            const res = await fetch("/api/judicial-cases?category=FISCAL");
            if (!res.ok) throw new Error(`Réponse ${res.status}`);
            const data = await res.json();
            const liste: Controle[] = data.cases ?? [];
            setControles(liste);
            setControleId((prev) => (liste.some((c) => c.id === prev) ? prev : (liste[0]?.id ?? null)));
        } catch (e) {
            console.error("Chargement des contrôles fiscaux :", e);
            setErreur("Impossible de charger les contrôles fiscaux.");
            setControles([]);
        } finally {
            setChargement(false);
        }
    }, []);

    useEffect(() => {
        charger();
    }, [charger]);

    const selected = controles.find((c) => c.id === controleId) ?? null;

    useEffect(() => {
        setNotes(selected?.notes ?? "");
    }, [selected?.id, selected?.notes]);

    const creerControle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nouveauForm.parties.trim() || !nouveauForm.caseNumber.trim()) return;

        setEnvoi(true);
        try {
            const res = await fetch("/api/judicial-cases", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    caseNumber: nouveauForm.caseNumber,
                    court: "DGID — Centre des services fiscaux",
                    parties: nouveauForm.parties,
                    natureOfDispute: nouveauForm.natureOfDispute || null,
                    deadline: nouveauForm.deadline || null,
                    category: "FISCAL",
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? `Réponse ${res.status}`);

            setFormOuvert(false);
            setNouveauForm({ parties: "", caseNumber: "", natureOfDispute: "", deadline: "" });
            await charger();
            setControleId(data.case.id);
        } catch (e) {
            console.error("Création du contrôle :", e);
            setErreur(e instanceof Error ? e.message : "Échec de la création.");
        } finally {
            setEnvoi(false);
        }
    };

    const enregistrerNotes = async () => {
        if (!selected) return;
        setNotesEnvoi(true);
        try {
            const res = await fetch("/api/judicial-cases", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: selected.id, notes }),
            });
            if (!res.ok) throw new Error(`Réponse ${res.status}`);
            await charger();
        } catch (e) {
            console.error("Enregistrement des notes :", e);
        } finally {
            setNotesEnvoi(false);
        }
    };

    const lettreAccueil = useMemo(() => {
        if (!selected) return "";
        const date = new Date().toLocaleDateString("fr-FR");

        return `À l'attention de ${selected.judge ?? "[Nom de l'inspecteur à compléter]"}
${selected.court}

Objet : Accueil relatif au contrôle fiscal de la société ${selected.parties}

Monsieur l'Inspecteur,

Faisant suite à votre avis de vérification n°${selected.caseNumber}, nous vous confirmons par la présente que la société ${selected.parties}, assistée par notre cabinet, se tient à votre disposition pour le bon déroulement de vos opérations de contrôle${selected.natureOfDispute ? ` (${selected.natureOfDispute})` : ""}.

[À compléter : liste des documents et pièces effectivement réunis et mis à disposition.]

Dans l'attente de vous recevoir, nous vous prions d'agréer, Monsieur l'Inspecteur, l'expression de notre considération distinguée.

Fait le ${date}`;
    }, [selected]);

    // ── Simulateur de rappel : calculateur paramétrable, aucune donnée de
    //    dossier n'y est injectée. ───────────────────────────────────────────
    const [simEntries, setSimEntries] = useState([
        { id: 1, base: 0, rate: 18, penaltyRate: 25, label: "TVA sur ventes non déclarées" },
        { id: 2, base: 0, rate: 30, penaltyRate: 40, label: "Réintégration IS — charges non justifiées" },
    ]);

    const calculerRappel = (base: number, rate: number, pRate: number) => {
        const principal = (base * rate) / 100;
        const penalty = (principal * pRate) / 100;
        return { principal, penalty, total: principal + penalty };
    };

    const totalSim = simEntries.reduce(
        (acc, entry) => {
            const r = calculerRappel(entry.base, entry.rate, entry.penaltyRate);
            return { principal: acc.principal + r.principal, penalty: acc.penalty + r.penalty, total: acc.total + r.total };
        },
        { principal: 0, penalty: 0, total: 0 }
    );

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-8 border-b border-white/5 relative overflow-hidden bg-gradient-to-r from-rose-500/5 via-transparent to-transparent rounded-3xl sm:rounded-[32px] px-6 sm:px-10 border-l-4 border-l-rose-500/50">
                <div className="z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 text-rose-400 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-rose-500/20">
                        <ShieldAlert className="w-3 h-3" /> Assistance Contrôle Fiscal
                    </div>
                    <h1 className="page-title-dark">
                        Registre des contrôles fiscaux
                    </h1>
                    <p className="page-subtitle-dark">
                        Dossiers réellement enregistrés, simulateur de rappel, et modèles de courriers
                        à compléter avant envoi.
                    </p>
                </div>

                <button
                    onClick={() => setFormOuvert((v) => !v)}
                    className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 z-10"
                >
                    <PlusCircle className="w-4 h-4" /> Nouveau Contrôle
                </button>
            </div>

            {/* Barre d'outils fiscaux pour le contrôle */}
            <div className="p-4 bg-slate-900/40 border border-white/10 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    Outils de Justification & Audit Fiscal :
                </span>
                <div className="flex flex-wrap items-center gap-2">
                    <a
                        href="/fiscalite/fec"
                        className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-white/5 transition flex items-center gap-1.5"
                    >
                        <Download className="w-3.5 h-3.5 text-primary" />
                        Générer FEC d'audit
                    </a>
                    <a
                        href="/fiscalite/cadrage-tva"
                        className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-white/5 transition flex items-center gap-1.5"
                    >
                        <Calculator className="w-3.5 h-3.5 text-amber-400" />
                        Cadrage & Rapprochement TVA
                    </a>
                    <a
                        href="/fiscalite/resultat-fiscal"
                        className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-white/5 transition flex items-center gap-1.5"
                    >
                        <Gavel className="w-3.5 h-3.5 text-emerald-400" />
                        Tableau 7 DSF (IS)
                    </a>
                    <a
                        href="/fiscalite/attestation-brs"
                        className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-white/5 transition flex items-center gap-1.5"
                    >
                        <Mail className="w-3.5 h-3.5 text-blue-400" />
                        Attestations BRS
                    </a>
                    <a
                        href="/fiscalite/conventions"
                        className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-white/5 transition flex items-center gap-1.5"
                    >
                        <Building className="w-3.5 h-3.5 text-purple-400" />
                        Conventions Fiscales
                    </a>
                </div>
            </div>

            {formOuvert && (
                <form
                    onSubmit={creerControle}
                    className="bg-slate-900/60 border border-rose-500/20 rounded-3xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                    <input
                        required
                        value={nouveauForm.parties}
                        onChange={(e) => setNouveauForm((f) => ({ ...f, parties: e.target.value }))}
                        placeholder="Client concerné *"
                        className="bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                    />
                    <input
                        required
                        value={nouveauForm.caseNumber}
                        onChange={(e) => setNouveauForm((f) => ({ ...f, caseNumber: e.target.value }))}
                        placeholder="Référence de l'avis de vérification *"
                        className="bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                    />
                    <input
                        value={nouveauForm.natureOfDispute}
                        onChange={(e) => setNouveauForm((f) => ({ ...f, natureOfDispute: e.target.value }))}
                        placeholder="Nature du contrôle (TVA, IS, CNPS…)"
                        className="bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                    />
                    <input
                        type="date"
                        value={nouveauForm.deadline}
                        onChange={(e) => setNouveauForm((f) => ({ ...f, deadline: e.target.value }))}
                        className="bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                    />
                    <div className="sm:col-span-2 flex justify-end gap-3">
                        <button type="button" onClick={() => setFormOuvert(false)} className="px-4 py-2 text-xs font-bold text-slate-400">
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={envoi}
                            className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black uppercase disabled:opacity-50"
                        >
                            {envoi ? "Enregistrement…" : "Créer le dossier"}
                        </button>
                    </div>
                </form>
            )}

            {erreur && <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-sm text-rose-300">{erreur}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Liste des contrôles */}
                <div className="lg:col-span-4 space-y-4">
                    <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                        <Gavel className="w-5 h-5 text-rose-400" /> Dossiers Actifs
                    </h3>

                    <div className="space-y-3">
                        {chargement ? (
                            <p className="text-sm text-slate-500">Chargement…</p>
                        ) : controles.length === 0 ? (
                            <p className="text-sm text-slate-500">Aucun contrôle fiscal enregistré.</p>
                        ) : (
                            controles.map((c) => {
                                const jours = joursRestants(c.deadline);
                                return (
                                    <div
                                        key={c.id}
                                        onClick={() => setControleId(c.id)}
                                        className={cn(
                                            "p-5 rounded-2xl border cursor-pointer transition-all group",
                                            controleId === c.id
                                                ? "bg-slate-800/80 border-rose-500/40 shadow-lg"
                                                : "bg-slate-900/30 border-white/5 hover:border-white/10"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-white text-sm truncate">{c.parties}</h4>
                                                <p className="text-[10px] text-slate-500 font-mono mt-1">{c.caseNumber}</p>
                                            </div>
                                            <span className={cn("shrink-0 px-2 py-1 rounded-lg text-[10px] font-black uppercase border", STATUT_STYLE[c.status])}>
                                                {LIBELLE_STATUT[c.status]}
                                            </span>
                                        </div>

                                        {c.natureOfDispute && (
                                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                                                <Building className="w-3 h-3" /> {c.natureOfDispute}
                                            </div>
                                        )}

                                        {jours !== null && (
                                            <div className="flex items-center justify-between mt-3 p-2 bg-slate-950/50 rounded-lg">
                                                <span className="text-[10px] text-slate-500 uppercase font-bold">Échéance</span>
                                                <span className={cn("text-sm font-black", jours < 0 ? "text-rose-500" : jours < 15 ? "text-rose-400" : jours < 30 ? "text-amber-400" : "text-slate-300")}>
                                                    {jours < 0 ? "Dépassée" : `J-${jours}`}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Détail */}
                <div className="lg:col-span-8 space-y-6">
                    {!selected ? (
                        <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-10 text-center text-slate-500">
                            {chargement ? "Chargement…" : "Sélectionnez ou créez un contrôle."}
                        </div>
                    ) : (
                        <>
                            <div className="flex gap-4 border-b border-white/5 mx-4 overflow-x-auto">
                                {[
                                    { id: "overview", label: "Vue d'Ensemble", icon: Building },
                                    { id: "simulator", label: "Simulateur Rappel", icon: Calculator },
                                    { id: "notes", label: "Notes du dossier", icon: Gavel },
                                    { id: "letter", label: "Courrier Accueil", icon: Mail },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                        className={cn(
                                            "pb-4 px-2 flex items-center gap-2 font-bold text-sm transition-all relative whitespace-nowrap",
                                            activeTab === tab.id ? "text-rose-400" : "text-slate-500 hover:text-white"
                                        )}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        {tab.label}
                                        {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500" />}
                                    </button>
                                ))}
                            </div>

                            {activeTab === "overview" && (
                                <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 bg-slate-900/40 space-y-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-black text-white">{selected.parties}</h2>
                                            <p className="text-slate-500 text-xs sm:text-sm mt-1">
                                                {selected.natureOfDispute ?? "Nature du contrôle non renseignée"}
                                            </p>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className="text-[10px] text-slate-500 uppercase mb-1">Statut</p>
                                            <span className={cn("inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase border", STATUT_STYLE[selected.status])}>
                                                {LIBELLE_STATUT[selected.status]}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                        <div className="p-4 bg-slate-950/40 rounded-xl">
                                            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Administration</p>
                                            <p className="text-white font-bold">{selected.court}</p>
                                        </div>
                                        <div className="p-4 bg-slate-950/40 rounded-xl">
                                            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Interlocuteur</p>
                                            <p className="text-white font-bold">{selected.judge ?? "Non renseigné"}</p>
                                        </div>
                                        <div className="p-4 bg-slate-950/40 rounded-xl">
                                            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Échéance</p>
                                            <p className="text-white font-bold">
                                                {selected.deadline ? new Date(selected.deadline).toLocaleDateString("fr-FR") : "Non renseignée"}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setActiveTab("notes")}
                                        className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                                    >
                                        Ouvrir les notes du dossier
                                    </button>
                                </div>
                            )}

                            {activeTab === "simulator" && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl">
                                            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Principal (Impôts)</p>
                                            <p className="text-2xl font-black text-white">{totalSim.principal.toLocaleString("fr-FR")} FCFA</p>
                                        </div>
                                        <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl">
                                            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Pénalités & Intérêts</p>
                                            <p className="text-2xl font-black text-rose-400">{totalSim.penalty.toLocaleString("fr-FR")} FCFA</p>
                                        </div>
                                        <div className="p-6 bg-rose-600 rounded-3xl shadow-xl shadow-rose-600/20">
                                            <p className="text-[10px] text-white/70 uppercase font-black mb-1">Estimation Totale</p>
                                            <p className="text-2xl font-black text-white">{totalSim.total.toLocaleString("fr-FR")} FCFA</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8">
                                        <h3 className="font-bold text-white mb-6">Détails des rappels estimés</h3>

                                        <div className="space-y-3">
                                            {simEntries.map((entry) => {
                                                const r = calculerRappel(entry.base, entry.rate, entry.penaltyRate);
                                                return (
                                                    <div key={entry.id} className="p-4 bg-slate-950/40 border border-white/5 rounded-2xl flex flex-col md:flex-row justify-between gap-4">
                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-bold text-white mb-2">{entry.label}</h4>
                                                            <label className="text-[10px] text-slate-500 font-medium">
                                                                Base
                                                                <input
                                                                    type="number"
                                                                    value={entry.base}
                                                                    onChange={(e) =>
                                                                        setSimEntries((prev) =>
                                                                            prev.map((x) => (x.id === entry.id ? { ...x, base: Number(e.target.value) } : x))
                                                                        )
                                                                    }
                                                                    className="ml-2 w-40 bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-white"
                                                                />
                                                            </label>
                                                        </div>
                                                        <div className="flex items-center gap-8">
                                                            <div className="text-right">
                                                                <p className="text-[10px] text-slate-500 uppercase">Impôt dû ({entry.rate}%)</p>
                                                                <p className="text-sm font-bold text-white">{r.principal.toLocaleString("fr-FR")}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[10px] text-rose-500 uppercase font-bold">Pénalité ({entry.penaltyRate}%)</p>
                                                                <p className="text-sm font-bold text-rose-400">{r.penalty.toLocaleString("fr-FR")}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "notes" && (
                                <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 space-y-4">
                                    <h3 className="text-xl font-bold text-white">Notes du dossier</h3>
                                    <p className="text-xs text-slate-500">
                                        Argumentaire, pièces réunies, échanges avec l&apos;inspecteur : à
                                        consigner ici, rien n&apos;est pré-rempli.
                                    </p>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={10}
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-sm text-slate-200"
                                    />
                                    <button
                                        onClick={enregistrerNotes}
                                        disabled={notesEnvoi}
                                        className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black uppercase disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {notesEnvoi && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Enregistrer
                                    </button>
                                </div>
                            )}

                            {activeTab === "letter" && (
                                <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-white">Lettre d&apos;accueil de l&apos;inspecteur</h3>
                                        <div className="flex gap-2">
                                            <button className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-700">
                                                <Printer className="w-4 h-4" /> Imprimer
                                            </button>
                                            <button className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-rose-500">
                                                <Download className="w-4 h-4" /> Télécharger
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-200">
                                        Modèle à compléter avant envoi : les passages entre crochets ne sont
                                        pas rédigés automatiquement.
                                    </div>

                                    <div className="p-4 sm:p-6 lg:p-10 bg-white text-slate-900 rounded-2xl shadow-2xl font-serif text-sm leading-relaxed min-h-[300px] border-t-[12px] border-rose-600">
                                        <div className="whitespace-pre-wrap">{lettreAccueil}</div>
                                    </div>

                                    <div className="p-6 bg-slate-950/60 border border-white/5 rounded-2xl flex items-start gap-4">
                                        <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
                                            <ShieldAlert className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            Cette lettre formalise la coopération du contribuable avec
                                            l&apos;administration ; elle ne se substitue pas à la préparation
                                            effective du dossier et des pièces.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
