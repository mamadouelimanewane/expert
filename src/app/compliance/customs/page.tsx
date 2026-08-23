"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Anchor,
    Calculator,
    Download,
    Gavel,
    Globe,
    Loader2,
    Mail,
    PlusCircle,
    Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Contentieux douanier.
//
// Cette page présentait trois litiges fabriqués — noms de clients, noms
// d'inspecteurs, articles de code cités, montants de redressement — avec un
// générateur qui produisait un RECOURS GRACIEUX ADRESSÉ AU DIRECTEUR GÉNÉRAL
// DES DOUANES affirmant que des pièces (factures pro-forma, virements Swift)
// étaient jointes, sans qu'aucune ne le soit. Un onglet « Mémoire de défense »
// affichait trois arguments juridiques avec un statut « Prêt » alors qu'aucune
// analyse n'avait eu lieu.
//
// Produire un document destiné à une administration en affirmant des faits non
// vérifiés est une faute professionnelle, pas une fonctionnalité de démo.
//
// La page s'appuie désormais sur le registre réel des contentieux
// (JudicialCase, catégorie DOUANE). Le simulateur de droits compromis reste un
// calculateur paramétrable — il ne prétend décrire aucun dossier réel, c'est
// un outil légitime. La lettre de recours ne cite que les faits enregistrés et
// marque explicitement tout élément à compléter par le collaborateur.
// ─────────────────────────────────────────────────────────────────────────────

const COUNTRIES = [
    { id: "SN", name: "Sénégal", agent: "Direction Générale des Douanes du Sénégal", city: "Dakar" },
    { id: "CI", name: "Côte d'Ivoire", agent: "Direction Générale des Douanes de Côte d'Ivoire", city: "Abidjan" },
];

type Dossier = {
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

const STATUT_STYLE: Record<Dossier["status"], string> = {
    EN_COURS: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    EN_ATTENTE: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    CLOTURE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const LIBELLE_STATUT: Record<Dossier["status"], string> = {
    EN_COURS: "En cours",
    EN_ATTENTE: "En attente",
    CLOTURE: "Clôturé",
};

function joursRestants(deadline: string | null): number | null {
    if (!deadline) return null;
    return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
}

export default function CustomsLitigationPage() {
    const [pays, setPays] = useState(COUNTRIES[0]);
    const [dossiers, setDossiers] = useState<Dossier[]>([]);
    const [dossierId, setDossierId] = useState<string | null>(null);
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
            const res = await fetch("/api/judicial-cases?category=DOUANE");
            if (!res.ok) throw new Error(`Réponse ${res.status}`);
            const data = await res.json();
            const liste: Dossier[] = data.cases ?? [];
            setDossiers(liste);
            setDossierId((prev) => (liste.some((d) => d.id === prev) ? prev : (liste[0]?.id ?? null)));
        } catch (e) {
            console.error("Chargement des contentieux douaniers :", e);
            setErreur("Impossible de charger les contentieux douaniers.");
            setDossiers([]);
        } finally {
            setChargement(false);
        }
    }, []);

    useEffect(() => {
        charger();
    }, [charger]);

    const selected = dossiers.find((d) => d.id === dossierId) ?? null;

    useEffect(() => {
        setNotes(selected?.notes ?? "");
    }, [selected?.id, selected?.notes]);

    const creerDossier = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nouveauForm.parties.trim() || !nouveauForm.caseNumber.trim()) return;

        setEnvoi(true);
        try {
            const res = await fetch("/api/judicial-cases", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    caseNumber: nouveauForm.caseNumber,
                    court: pays.agent,
                    parties: nouveauForm.parties,
                    natureOfDispute: nouveauForm.natureOfDispute || null,
                    deadline: nouveauForm.deadline || null,
                    category: "DOUANE",
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? `Réponse ${res.status}`);

            setFormOuvert(false);
            setNouveauForm({ parties: "", caseNumber: "", natureOfDispute: "", deadline: "" });
            await charger();
            setDossierId(data.case.id);
        } catch (e) {
            console.error("Création du contentieux :", e);
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

    const lettreRecours = useMemo(() => {
        if (!selected) return "";
        const date = new Date().toLocaleDateString("fr-FR");

        return `À l'attention de Monsieur le Directeur Général des Douanes
${pays.agent}

Objet : Recours gracieux relatif au contentieux n°${selected.caseNumber}
Client : ${selected.parties}

Monsieur le Directeur Général,

Nous intervenons en qualité de conseil pour la société ${selected.parties}, concernée par le dossier référencé ci-dessus${selected.natureOfDispute ? ` relatif à : ${selected.natureOfDispute}` : ""}.

[À compléter par le collaborateur : exposé des faits et de l'argumentation juridique, sur la base des pièces effectivement réunies dans le dossier.]

[À compléter : liste des pièces réellement jointes à ce recours.]

Dans l'attente d'une suite favorable, nous restons à votre disposition pour toute information complémentaire ou réunion technique de mise au point.

Veuillez agréer, Monsieur le Directeur Général, l'expression de notre haute considération.

Fait à ${pays.city}, le ${date}`;
    }, [selected, pays]);

    // ── Simulateur de droits compromis : calculateur paramétrable, aucune
    //    donnée de dossier n'y est injectée. ─────────────────────────────────
    const [simEntries, setSimEntries] = useState([
        { id: 1, label: "Droits de Douane (DD)", base: 0, rate: 20, penaltyRate: 100 },
        { id: 2, label: "Redevance Statistique (RS)", base: 0, rate: 1, penaltyRate: 0 },
        { id: 3, label: "TVA Importation", base: 0, rate: 18, penaltyRate: 0 },
    ]);

    const calculerDroits = (base: number, rate: number, pRate: number) => {
        const principal = (base * rate) / 100;
        const penalty = (principal * pRate) / 100;
        return { principal, penalty, total: principal + penalty };
    };

    const totalSim = simEntries.reduce(
        (acc, entry) => {
            const r = calculerDroits(entry.base, entry.rate, entry.penaltyRate);
            return { principal: acc.principal + r.principal, penalty: acc.penalty + r.penalty, total: acc.total + r.total };
        },
        { principal: 0, penalty: 0, total: 0 }
    );

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-8 border-b border-white/5 relative overflow-hidden bg-gradient-to-r from-blue-500/5 via-transparent to-transparent rounded-3xl sm:rounded-[32px] px-6 sm:px-10 border-l-4 border-l-blue-500/50">
                <div className="z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-blue-500/20">
                        <Anchor className="w-3 h-3" /> Contentieux Douanier (UEMOA)
                    </div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                        Registre des contentieux douaniers
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl text-sm sm:text-lg">
                        Dossiers réellement enregistrés, simulateur de droits compromis, et modèle de
                        recours à compléter avant envoi.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 z-10 w-full sm:w-auto">
                    <button
                        onClick={() => setFormOuvert((v) => !v)}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
                    >
                        <PlusCircle className="w-4 h-4" /> Nouveau Contentieux
                    </button>
                    <div className="flex bg-slate-900/80 p-1 rounded-xl border border-white/5 w-fit">
                        {COUNTRIES.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setPays(c)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                    pays.id === c.id ? "bg-blue-600 text-white" : "text-slate-500 hover:text-white"
                                )}
                            >
                                {c.id}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {formOuvert && (
                <form
                    onSubmit={creerDossier}
                    className="bg-slate-900/60 border border-blue-500/20 rounded-3xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
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
                        placeholder="Référence du dossier *"
                        className="bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                    />
                    <input
                        value={nouveauForm.natureOfDispute}
                        onChange={(e) => setNouveauForm((f) => ({ ...f, natureOfDispute: e.target.value }))}
                        placeholder="Nature du litige"
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
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase disabled:opacity-50"
                        >
                            {envoi ? "Enregistrement…" : "Créer le dossier"}
                        </button>
                    </div>
                </form>
            )}

            {erreur && <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-sm text-rose-300">{erreur}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Liste des dossiers */}
                <div className="lg:col-span-4 space-y-4">
                    <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                        <Gavel className="w-5 h-5 text-blue-400" /> Dossiers de Contentieux
                    </h3>

                    <div className="space-y-3">
                        {chargement ? (
                            <p className="text-sm text-slate-500">Chargement…</p>
                        ) : dossiers.length === 0 ? (
                            <p className="text-sm text-slate-500">Aucun contentieux douanier enregistré.</p>
                        ) : (
                            dossiers.map((d) => {
                                const jours = joursRestants(d.deadline);
                                return (
                                    <div
                                        key={d.id}
                                        onClick={() => setDossierId(d.id)}
                                        className={cn(
                                            "p-5 rounded-2xl border cursor-pointer transition-all group",
                                            dossierId === d.id
                                                ? "bg-slate-800/80 border-blue-500/40 shadow-lg"
                                                : "bg-slate-900/30 border-white/5 hover:border-white/10"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-white text-sm truncate max-w-[150px]">{d.parties}</h4>
                                                <p className="text-[10px] text-slate-500 font-mono mt-1">{d.caseNumber}</p>
                                            </div>
                                            <span className={cn("shrink-0 px-2 py-1 rounded-lg text-[10px] font-black uppercase border", STATUT_STYLE[d.status])}>
                                                {LIBELLE_STATUT[d.status]}
                                            </span>
                                        </div>

                                        {d.natureOfDispute && (
                                            <div className="text-[10px] text-slate-400 mb-3 bg-slate-950/50 p-2 rounded-lg">{d.natureOfDispute}</div>
                                        )}

                                        {jours !== null && (
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="text-slate-600 font-bold uppercase">Échéance</span>
                                                <span className={cn("font-black", jours < 0 ? "text-rose-500" : jours <= 7 ? "text-amber-500" : "text-slate-400")}>
                                                    {jours < 0 ? "Dépassée" : `${jours} j`}
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
                            {chargement ? "Chargement…" : "Sélectionnez ou créez un contentieux."}
                        </div>
                    ) : (
                        <>
                            <div className="flex gap-2 sm:gap-4 border-b border-white/5 mx-2 overflow-x-auto">
                                {[
                                    { id: "overview", label: "Synthèse Dossier", icon: Globe },
                                    { id: "simulator", label: "Droits Compromis", icon: Calculator },
                                    { id: "notes", label: "Notes du dossier", icon: Gavel },
                                    { id: "letter", label: "Recours DGD", icon: Mail },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                        className={cn(
                                            "pb-4 px-2 flex items-center gap-2 font-bold text-xs sm:text-sm transition-all relative whitespace-nowrap",
                                            activeTab === tab.id ? "text-blue-400" : "text-slate-500 hover:text-white"
                                        )}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        {tab.label}
                                        {activeTab === tab.id && (
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {activeTab === "overview" && (
                                <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 bg-slate-900/40 space-y-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-black text-white">{selected.parties}</h2>
                                            <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                                                {selected.natureOfDispute ?? "Nature du litige non renseignée"}
                                            </p>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Interlocuteur</p>
                                            <p className="text-base sm:text-lg font-bold text-blue-400">{selected.judge ?? "Non renseigné"}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                        <div className="p-4 bg-slate-950/40 rounded-xl">
                                            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Juridiction</p>
                                            <p className="text-white font-bold">{selected.court}</p>
                                        </div>
                                        <div className="p-4 bg-slate-950/40 rounded-xl">
                                            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Échéance</p>
                                            <p className="text-white font-bold">
                                                {selected.deadline
                                                    ? new Date(selected.deadline).toLocaleDateString("fr-FR")
                                                    : "Non renseignée"}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-slate-950/40 rounded-xl">
                                            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Statut</p>
                                            <span className={cn("inline-block px-2 py-0.5 rounded text-xs font-black border", STATUT_STYLE[selected.status])}>
                                                {LIBELLE_STATUT[selected.status]}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "simulator" && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-black">
                                        <div className="p-6 bg-slate-900 border border-white/5 rounded-[32px]">
                                            <p className="text-[10px] text-slate-500 uppercase mb-1">Droits éludés</p>
                                            <p className="text-2xl text-white">{totalSim.principal.toLocaleString("fr-FR")} FCFA</p>
                                        </div>
                                        <div className="p-6 bg-slate-900 border border-white/5 rounded-[32px]">
                                            <p className="text-[10px] text-red-400 uppercase mb-1">Pénalités</p>
                                            <p className="text-2xl text-red-500">{totalSim.penalty.toLocaleString("fr-FR")} FCFA</p>
                                        </div>
                                        <div className="p-6 bg-blue-600 rounded-[32px] shadow-xl shadow-blue-600/20">
                                            <p className="text-[10px] text-blue-100 uppercase mb-1">Total simulé</p>
                                            <p className="text-2xl text-white">{totalSim.total.toLocaleString("fr-FR")} FCFA</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900/40 border border-white/5 rounded-[40px] p-8">
                                        <h3 className="font-bold text-white mb-6">Simulation des droits et taxes compromis</h3>

                                        <div className="space-y-4">
                                            {simEntries.map((entry) => {
                                                const r = calculerDroits(entry.base, entry.rate, entry.penaltyRate);
                                                return (
                                                    <div key={entry.id} className="p-4 bg-slate-950/40 border border-white/5 rounded-2xl grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                                                        <p className="font-bold text-white text-sm">{entry.label}</p>
                                                        <label className="text-xs text-slate-500">
                                                            Assiette
                                                            <input
                                                                type="number"
                                                                value={entry.base}
                                                                onChange={(e) =>
                                                                    setSimEntries((prev) =>
                                                                        prev.map((x) => (x.id === entry.id ? { ...x, base: Number(e.target.value) } : x))
                                                                    )
                                                                }
                                                                className="w-full mt-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-white"
                                                            />
                                                        </label>
                                                        <div className="text-right">
                                                            <p className="text-[9px] text-slate-600 uppercase font-black">Droit ({entry.rate}%)</p>
                                                            <p className="text-sm font-bold text-white">{r.principal.toLocaleString("fr-FR")}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[9px] text-red-500/60 uppercase font-black">Pénalité ({entry.penaltyRate}%)</p>
                                                            <p className="text-sm font-bold text-red-400">{r.penalty.toLocaleString("fr-FR")}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "notes" && (
                                <div className="bg-slate-900/40 border border-white/5 rounded-[40px] p-8 space-y-4">
                                    <h3 className="text-xl font-black text-white">Notes du dossier</h3>
                                    <p className="text-xs text-slate-500">
                                        Argumentation, pièces réunies, échanges avec l&apos;administration : à
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
                                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {notesEnvoi && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Enregistrer
                                    </button>
                                </div>
                            )}

                            {activeTab === "letter" && (
                                <div className="bg-slate-900/40 border border-white/5 rounded-[40px] p-8 space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-black text-white">Modèle de recours</h3>
                                        <div className="flex gap-2">
                                            <button className="p-3 bg-slate-800 text-slate-400 rounded-xl hover:text-white">
                                                <Printer className="w-4 h-4" />
                                            </button>
                                            <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase flex items-center gap-2 hover:bg-blue-500">
                                                <Download className="w-4 h-4" /> Télécharger
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-200">
                                        Modèle à compléter avant envoi : les passages entre crochets ne sont
                                        pas rédigés automatiquement.
                                    </div>

                                    <div className="p-4 sm:p-6 lg:p-10 bg-[#fdfdfd] text-slate-800 rounded-2xl shadow-2xl font-serif text-sm leading-relaxed border-t-[16px] border-blue-900 min-h-[350px]">
                                        <div className="whitespace-pre-wrap">{lettreRecours}</div>
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
