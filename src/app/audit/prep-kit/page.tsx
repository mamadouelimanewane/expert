"use client";

import { useEffect, useState } from "react";
import {
    Activity,
    AlertTriangle,
    Briefcase,
    CheckCircle2,
    FileCheck,
    Plus,
    Save,
    Scale,
    Target,
    Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Kit de préparation d'audit.
//
// Cette page affichait une matrice des risques et un programme de travail
// pré-remplis avec des lignes fabriquées, un chronogramme aux dates fictives
// (« J-15 : Prise de connaissance — Terminé »), une progression affichée à
// 35 % sans lien avec le contenu réel, et des boutons « Générer Rapport »,
// « Générer LCI », « + Ajouter Risque » qui n'avaient aucun effet.
//
// Aucun modèle ne suit aujourd'hui la matrice des risques ni le programme de
// travail détaillé par assertion : plutôt que d'inventer des résultats, cette
// page devient un cahier de travail qui démarre vide et se remplit avec les
// risques et procédures réellement identifiés pour la mission.
// ─────────────────────────────────────────────────────────────────────────────

type NiveauRisque = "Élevé" | "Moyen" | "Faible";

type Risque = {
    id: string;
    cycle: string;
    description: string;
    risqueInherent: NiveauRisque;
    risqueControle: NiveauRisque;
};

type ProcedureTravail = {
    id: string;
    cycle: string;
    assertion: string;
    procedure: string;
    fait: boolean;
};

const CYCLES = ["Ventes/Clients", "Achats/Fournisseurs", "Trésorerie", "Immobilisations", "Paie", "Stocks"];
const ASSERTIONS = ["Exhaustivité", "Réalité", "Coupure", "Existence", "Évaluation", "Présentation"];
const NIVEAUX: NiveauRisque[] = ["Élevé", "Moyen", "Faible"];

function RiskBadge({ level }: { level: NiveauRisque }) {
    return (
        <span
            className={cn(
                "px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider border",
                level === "Élevé"
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    : level === "Moyen"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            )}
        >
            {level}
        </span>
    );
}

type ContenuCahier = {
    ca: number;
    resultatNet: number;
    materiality: number | null;
    risques: Risque[];
    procedures: ProcedureTravail[];
};

export default function CompleteAuditKitPage() {
    const [currentPhase, setCurrentPhase] = useState<"planning" | "risk" | "execution">("planning");

    const [clients, setClients] = useState<{ id: string; nom: string }[]>([]);
    const [clientId, setClientId] = useState("");
    const [chargement, setChargement] = useState(false);
    const [sauvegarde, setSauvegarde] = useState(false);

    const [ca, setCa] = useState(0);
    const [resultatNet, setResultatNet] = useState(0);
    const [materiality, setMateriality] = useState<number | null>(null);

    const [risques, setRisques] = useState<Risque[]>([]);
    const [nouveauRisque, setNouveauRisque] = useState({ cycle: CYCLES[0], description: "", risqueInherent: "Moyen" as NiveauRisque, risqueControle: "Moyen" as NiveauRisque });

    const [procedures, setProcedures] = useState<ProcedureTravail[]>([]);
    const [nouvelleProcedure, setNouvelleProcedure] = useState({ cycle: CYCLES[0], assertion: ASSERTIONS[0], procedure: "" });

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
        fetch(`/api/audit/work-papers?clientId=${clientId}&type=PREP_KIT`)
            .then((r) => r.json())
            .then((d) => {
                const c: ContenuCahier | null = d.data;
                setCa(c?.ca ?? 0);
                setResultatNet(c?.resultatNet ?? 0);
                setMateriality(c?.materiality ?? null);
                setRisques(c?.risques ?? []);
                setProcedures(c?.procedures ?? []);
            })
            .finally(() => setChargement(false));
    }, [clientId]);

    const enregistrer = async () => {
        if (!clientId) return;
        setSauvegarde(true);
        try {
            const data: ContenuCahier = { ca, resultatNet, materiality, risques, procedures };
            await fetch("/api/audit/work-papers", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clientId, type: "PREP_KIT", data }),
            });
        } finally {
            setSauvegarde(false);
        }
    };

    const calculateMateriality = () => {
        // Heuristique usuelle : 0,75 % du chiffre d'affaires.
        setMateriality(Math.round(ca * 0.0075));
    };

    const ajouterRisque = () => {
        if (!nouveauRisque.description.trim()) return;
        setRisques((prev) => [...prev, { id: crypto.randomUUID(), ...nouveauRisque }]);
        setNouveauRisque({ cycle: CYCLES[0], description: "", risqueInherent: "Moyen", risqueControle: "Moyen" });
    };

    const ajouterProcedure = () => {
        if (!nouvelleProcedure.procedure.trim()) return;
        setProcedures((prev) => [...prev, { id: crypto.randomUUID(), ...nouvelleProcedure, fait: false }]);
        setNouvelleProcedure({ cycle: CYCLES[0], assertion: ASSERTIONS[0], procedure: "" });
    };

    const progression = procedures.length > 0 ? Math.round((procedures.filter((p) => p.fait).length / procedures.length) * 100) : 0;

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
            <div className="relative p-4 sm:p-6 lg:p-10 rounded-[40px] bg-slate-900 border border-white/5 overflow-hidden shadow-2xl">
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
                    <div>
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/30">
                                <Briefcase className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="page-title">Kit de préparation d&apos;audit</h2>
                        </div>
                        <p className="page-subtitle">Cahier de travail : seuil de signification, risques et programme.</p>
                    </div>

                    <div className="flex flex-col items-stretch sm:items-end gap-3 min-w-0 max-w-full">
                        <div className="flex flex-wrap gap-2">
                            <select
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white"
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
                        <div className="tabs-scroll flex gap-2 p-1 bg-slate-800/50 rounded-2xl border border-white/10">
                            {[
                                { phase: "planning" as const, label: "1. Planification", icon: Target },
                                { phase: "risk" as const, label: "2. Risques", icon: AlertTriangle },
                                { phase: "execution" as const, label: "3. Programme", icon: FileCheck },
                            ].map((tab) => (
                                <button
                                    key={tab.phase}
                                    onClick={() => setCurrentPhase(tab.phase)}
                                    className={cn(
                                        "px-6 py-4 rounded-xl flex items-center gap-3 transition-all",
                                        currentPhase === tab.phase ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <tab.icon className={cn("w-4 h-4", currentPhase === tab.phase ? "text-white" : "text-slate-500")} />
                                    <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {!clientId ? (
                <div className="apix-card text-center text-sm text-slate-500">
                    Sélectionnez un dossier client pour ouvrir (ou créer) son cahier de travail.
                </div>
            ) : chargement ? (
                <div className="apix-card text-center text-sm text-slate-500">
                    Chargement du cahier de travail…
                </div>
            ) : (
            <>
            {currentPhase === "planning" && (
                <div className="apix-card max-w-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <Scale className="w-6 h-6 text-primary" />
                        <h3 className="text-xl font-bold text-white">Calculateur de seuil de signification</h3>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Chiffre d&apos;affaires (FCFA)</label>
                            <input
                                type="number"
                                value={ca || ""}
                                onChange={(e) => setCa(Number(e.target.value))}
                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-mono outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Résultat net (FCFA)</label>
                            <input
                                type="number"
                                value={resultatNet || ""}
                                onChange={(e) => setResultatNet(Number(e.target.value))}
                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-mono outline-none"
                            />
                        </div>
                        <button
                            onClick={calculateMateriality}
                            disabled={ca === 0}
                            className="w-full py-4 bg-primary hover:brightness-110 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg transition-all disabled:opacity-50"
                        >
                            Calculer le seuil
                        </button>
                    </div>

                    {materiality !== null && (
                        <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Seuil de signification</p>
                            <p className="text-2xl sm:text-3xl font-black text-white mt-2">{materiality.toLocaleString("fr-FR")} FCFA</p>
                            <p className="text-[10px] text-slate-400 mt-2">Seuil de remontée usuel (5 %) : {Math.round(materiality * 0.05).toLocaleString("fr-FR")} FCFA</p>
                        </div>
                    )}
                </div>
            )}

            {currentPhase === "risk" && (
                <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-white/5 bg-slate-900/40">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-6">
                            <AlertTriangle className="w-6 h-6 text-rose-400" />
                            Matrice des risques
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            <select value={nouveauRisque.cycle} onChange={(e) => setNouveauRisque((f) => ({ ...f, cycle: e.target.value }))} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white">
                                {CYCLES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <input
                                value={nouveauRisque.description}
                                onChange={(e) => setNouveauRisque((f) => ({ ...f, description: e.target.value }))}
                                placeholder="Description du risque"
                                className="flex-1 min-w-[200px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
                            />
                            <select value={nouveauRisque.risqueInherent} onChange={(e) => setNouveauRisque((f) => ({ ...f, risqueInherent: e.target.value as NiveauRisque }))} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white">
                                {NIVEAUX.map((n) => <option key={n} value={n}>RI : {n}</option>)}
                            </select>
                            <select value={nouveauRisque.risqueControle} onChange={(e) => setNouveauRisque((f) => ({ ...f, risqueControle: e.target.value as NiveauRisque }))} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white">
                                {NIVEAUX.map((n) => <option key={n} value={n}>RC : {n}</option>)}
                            </select>
                            <button onClick={ajouterRisque} className="px-4 py-2 bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-600/50 rounded-xl text-xs font-black uppercase flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Ajouter
                            </button>
                        </div>
                    </div>
                    {risques.length === 0 ? (
                        <p className="p-8 text-sm text-slate-500">Aucun risque identifié pour cette mission.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="apix-table text-left">
                                <thead className="bg-slate-900/80 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-8 py-4">Cycle / Description</th>
                                        <th className="px-6 py-4 text-center">Risque inhérent</th>
                                        <th className="px-6 py-4 text-center">Risque contrôle</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {risques.map((risk) => (
                                        <tr key={risk.id} className="hover:bg-white/[0.02]">
                                            <td className="px-8 py-4">
                                                <span className="block text-xs font-bold text-primary uppercase mb-1">{risk.cycle}</span>
                                                <span className="text-sm font-medium text-white">{risk.description}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center"><RiskBadge level={risk.risqueInherent} /></td>
                                            <td className="px-6 py-4 text-center"><RiskBadge level={risk.risqueControle} /></td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => setRisques((prev) => prev.filter((r) => r.id !== risk.id))} className="text-slate-500 hover:text-rose-400">
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
            )}

            {currentPhase === "execution" && (
                <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-white/5 bg-slate-900/40">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <FileCheck className="w-6 h-6 text-emerald-400" />
                                Programme de travail
                            </h3>
                            <div className="text-xs font-black text-slate-500 uppercase tracking-widest bg-muted px-3 py-1 rounded-lg">
                                Progression : {progression}%
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <select value={nouvelleProcedure.cycle} onChange={(e) => setNouvelleProcedure((f) => ({ ...f, cycle: e.target.value }))} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white">
                                {CYCLES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <select value={nouvelleProcedure.assertion} onChange={(e) => setNouvelleProcedure((f) => ({ ...f, assertion: e.target.value }))} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white">
                                {ASSERTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                            </select>
                            <input
                                value={nouvelleProcedure.procedure}
                                onChange={(e) => setNouvelleProcedure((f) => ({ ...f, procedure: e.target.value }))}
                                placeholder="Procédure d'audit"
                                className="flex-1 min-w-[200px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
                            />
                            <button onClick={ajouterProcedure} className="px-4 py-2 bg-primary hover:brightness-110 text-white rounded-xl text-xs font-black uppercase flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Ajouter
                            </button>
                        </div>
                    </div>

                    {procedures.length === 0 ? (
                        <p className="p-8 text-sm text-slate-500">Aucune procédure enregistrée.</p>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {procedures.map((item) => (
                                <div key={item.id} className="p-6 hover:bg-white/[0.02] flex items-center gap-6 group">
                                    <button
                                        onClick={() => setProcedures((prev) => prev.map((p) => (p.id === item.id ? { ...p, fait: !p.fait } : p)))}
                                        className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center shrink-0"
                                    >
                                        {item.fait ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <div className="w-3 h-3 rounded-full bg-slate-700" />}
                                    </button>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 uppercase">{item.cycle}</span>
                                            <span className="text-[10px] font-black text-slate-600 uppercase border border-slate-700 px-2 py-0.5 rounded">{item.assertion}</span>
                                        </div>
                                        <p className="text-sm font-bold text-white">{item.procedure}</p>
                                    </div>
                                    <button onClick={() => setProcedures((prev) => prev.filter((p) => p.id !== item.id))} className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            </>
            )}

            <p className="flex items-center gap-2 text-xs text-slate-500">
                <Activity className="w-3.5 h-3.5" />
                Ce cahier de travail est saisi manuellement et enregistré sur le dossier client sélectionné.
                La génération automatique du rapport d&apos;audit et de la lettre de contrôle interne
                n&apos;est pas encore disponible.
            </p>
        </div>
    );
}
