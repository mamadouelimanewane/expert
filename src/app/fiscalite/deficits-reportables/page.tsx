"use client";

import { useState } from "react";
import { TrendingDown, AlertTriangle, Calculator, FileSpreadsheet, Plus, Trash2 } from "lucide-react";
import type { BordereauDeficits, ImputationDeficit, ProjectionExerciceFutur } from "@/lib/ohada/deficits-reportables";

interface ResultatDeficits {
    bordereau: BordereauDeficits;
    imputation: ImputationDeficit | null;
    projections: ProjectionExerciceFutur[] | null;
    rapport: string;
}

export default function DeficitsReportablesPage() {
    const [pays, setPays] = useState("");
    const [exerciceCourant, setExerciceCourant] = useState<number | "">(new Date().getFullYear() - 1);
    const [resultatBrut, setResultatBrut] = useState<number | "">("");
    const [lignes, setLignes] = useState<Array<{ exercice: number | ""; montant: number | ""; type: string; montantDejaImpute: number | "" }>>([]);

    const [loading, setLoading] = useState(false);
    const [donnees, setDonnees] = useState<ResultatDeficits | null>(null);
    const [error, setError] = useState("");

    const ajouterLigne = () => {
        setLignes([...lignes, { exercice: "", montant: "", type: "ORDINAIRE", montantDejaImpute: "" }]);
    };

    const supprimerLigne = (idx: number) => {
        setLignes(lignes.filter((_, i) => i !== idx));
    };

    const calculer = async () => {
        if (!pays || exerciceCourant === "" || !Number.isInteger(exerciceCourant) || exerciceCourant < 1900
            || resultatBrut === "" || !Number.isFinite(resultatBrut) || resultatBrut < 0 || lignes.length === 0
            || lignes.some((ligne) => ligne.exercice === "" || !Number.isInteger(ligne.exercice) || ligne.exercice < 1900
                || ligne.exercice >= exerciceCourant || ligne.montant === "" || !Number.isFinite(ligne.montant) || ligne.montant <= 0
                || ligne.montantDejaImpute === "" || !Number.isFinite(ligne.montantDejaImpute) || ligne.montantDejaImpute < 0 || ligne.montantDejaImpute > ligne.montant)) {
            setError("Renseignez le pays, l’exercice, le résultat fiscal et chaque déficit réel (année, montant et imputation antérieure valide).");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/fiscalite/deficits-reportables", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pays,
                    exerciceCourant: Number(exerciceCourant),
                    resultatFiscalBrut: Number(resultatBrut),
                    historique: lignes.map((ligne) => ({ ...ligne, exercice: Number(ligne.exercice), montant: Number(ligne.montant), montantDejaImpute: Number(ligne.montantDejaImpute) })),
                }),
            });
            const data = await res.json();
            if (data.bordereau) {
                setDonnees(data);
            } else {
                setError(data.error || "Le calcul des déficits n’a pas abouti.");
            }
        } catch (err) {
            console.error("Erreur calcul déficits:", err);
            setError(err instanceof Error ? err.message : "Le calcul des déficits n’a pas abouti.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <TrendingDown className="w-6 h-6 text-rose-400" />
                    <h1 className="page-title text-2xl font-bold tracking-tight">Déficits Reportables & ARD (IS OHADA)</h1>
                </div>
                <p className="page-subtitle text-sm text-muted-foreground">
                    Suivi pluriannuel, contrôle de péremption triennale et liquidation FIFO optimale de l&apos;Impôt sur les Sociétés.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Paramètres et saisie de l'historique */}
                <div className="md:col-span-1 bg-card/40 border border-border rounded-xl p-5 space-y-4">
                    <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-primary" />
                        Paramètres d&apos;arrêté
                    </h2>

                    <div className="space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-muted-foreground">Juridiction fiscale</label>
                                <select
                                    value={pays}
                                    onChange={(e) => setPays(e.target.value)}
                                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"
                                >
                                    <option value="">Choisir le pays</option>
                                    <option value="sn">Sénégal (SN)</option>
                                    <option value="ci">Côte d&apos;Ivoire (CI)</option>
                                    <option value="cm">Cameroun (CM)</option>
                                    <option value="bj">Bénin (BJ)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-muted-foreground">Exercice clos</label>
                                <input
                                    type="number"
                                    value={exerciceCourant}
                                    onChange={(e) => setExerciceCourant(e.target.value === "" ? "" : Number(e.target.value))}
                                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-muted-foreground">Résultat fiscal brut avant imputation (FCFA)</label>
                            <input
                                type="number"
                                value={resultatBrut}
                                min="0"
                                onChange={(e) => setResultatBrut(e.target.value === "" ? "" : Number(e.target.value))}
                                className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background font-semibold text-emerald-400"
                            />
                        </div>

                        <div className="pt-2">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-muted-foreground font-semibold">Historique des déficits</label>
                                <button
                                    onClick={ajouterLigne}
                                    className="text-primary hover:underline flex items-center gap-1 text-[11px]"
                                >
                                    <Plus className="w-3 h-3" /> Ajouter
                                </button>
                            </div>

                            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                {lignes.map((l, idx) => (
                                    <div key={idx} className="p-2.5 rounded-lg border border-border bg-background/50 space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <input
                                                type="number"
                                                value={l.exercice}
                                                onChange={(e) => {
                                                    const nl = [...lignes];
                                                    nl[idx].exercice = e.target.value === "" ? "" : Number(e.target.value);
                                                    setLignes(nl);
                                                }}
                                                className="w-20 px-1.5 py-0.5 rounded border border-border text-[11px]"
                                                placeholder="Année"
                                            />
                                            <select
                                                value={l.type}
                                                onChange={(e) => {
                                                    const nl = [...lignes];
                                                    nl[idx].type = e.target.value;
                                                    setLignes(nl);
                                                }}
                                                className="px-1.5 py-0.5 rounded border border-border text-[10px]"
                                            >
                                                <option value="ORDINAIRE">Ordinaire (3 ans)</option>
                                                <option value="AMORTISSEMENT_DIFFERE">ARD (Illimité)</option>
                                            </select>
                                            <button
                                                onClick={() => supprimerLigne(idx)}
                                                className="text-rose-400 hover:text-rose-300"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <input
                                            type="number"
                                            value={l.montant}
                                            min="0"
                                            onChange={(e) => {
                                                const nl = [...lignes];
                                                nl[idx].montant = e.target.value === "" ? "" : Number(e.target.value);
                                                setLignes(nl);
                                            }}
                                            className="w-full px-2 py-1 rounded border border-border text-xs"
                                            placeholder="Montant FCFA"
                                        />
                                        <label className="sr-only" htmlFor={`montant-impute-${idx}`}>Montant déjà imputé</label>
                                        <input
                                            id={`montant-impute-${idx}`}
                                            type="number"
                                            min="0"
                                            value={l.montantDejaImpute}
                                            onChange={(e) => {
                                                const nl = [...lignes];
                                                nl[idx].montantDejaImpute = e.target.value === "" ? "" : Number(e.target.value);
                                                setLignes(nl);
                                            }}
                                            className="w-full px-2 py-1 rounded border border-border text-xs"
                                            placeholder="Montant déjà imputé (FCFA)"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={calculer}
                            disabled={loading}
                            className="w-full mt-3 py-2 px-4 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 flex items-center justify-center gap-2"
                        >
                            <Calculator className="w-4 h-4" />
                            Liquider l&apos;imputation fiscale
                        </button>
                    </div>
                    {error && <p role="alert" className="text-xs text-rose-400">{error}</p>}
                </div>

                {/* Synthèse & Imputation */}
                <div className="md:col-span-2 space-y-4">
                    {donnees ? (
                        <>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-4 rounded-xl border border-border bg-card/40">
                                    <div className="text-xs text-muted-foreground">Déficits Disponibles</div>
                                    <div className="text-lg font-bold mt-1 text-emerald-400">
                                        {donnees.bordereau.totalDeficitDisponible.toLocaleString("fr-FR")} FCFA
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl border border-border bg-card/40">
                                    <div className="text-xs text-muted-foreground">Imputation Exercice</div>
                                    <div className="text-lg font-bold mt-1 text-blue-400">
                                        {donnees.imputation?.totalDeficitImpute.toLocaleString("fr-FR")} FCFA
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl border border-border bg-card/40">
                                    <div className="text-xs text-muted-foreground">Base IS après Imputation</div>
                                    <div className="text-lg font-bold mt-1 text-foreground">
                                        {donnees.imputation?.baseImposableApresImputation.toLocaleString("fr-FR")} FCFA
                                    </div>
                                </div>
                            </div>

                            {/* Alertes d'expiration */}
                            {donnees.bordereau.alertesExpiration.length > 0 && (
                                <div className="bg-card/40 border border-border rounded-xl p-4 space-y-2">
                                    <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                                        Alertes de prescription fiscale
                                    </div>
                                    <div className="space-y-1">
                                        {donnees.bordereau.alertesExpiration.map((alt: string, i: number) => (
                                            <div key={i} className="text-xs text-muted-foreground">
                                                {alt}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tableau de suivi bordereau */}
                            <div className="bg-card/40 border border-border rounded-xl p-5 space-y-3">
                                <h3 className="text-sm font-semibold text-foreground">
                                    Bordereau fiscal pluriannuel (Tableau 7/8 DSF)
                                </h3>
                                <div className="divide-y divide-border text-xs">
                                    {donnees.bordereau.deficits.map((d) => (
                                        <div key={d.exercice} className="py-2.5 flex items-center justify-between">
                                            <div>
                                                <span className="font-semibold text-foreground">Exercice {d.exercice}</span>
                                                <span className="ml-2 text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-secondary">
                                                    {d.type}
                                                </span>
                                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                                    Initial: {d.montantInitial.toLocaleString("fr-FR")} FCFA •
                                                    Expiration: fin {d.expirationExercice}
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="font-semibold text-foreground">
                                                    Solde: {d.soldeDisponible.toLocaleString("fr-FR")} FCFA
                                                </div>
                                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                                    d.expire ? "bg-rose-500/20 text-rose-400" :
                                                    d.anneesRestantes === 0 ? "bg-amber-500/20 text-amber-400" :
                                                    "bg-emerald-500/20 text-emerald-400"
                                                }`}>
                                                    {d.expire ? "PRESCRIT" : d.anneesRestantes === 0 ? "DERNIÈRE ANNÉE" : "ACTIF"}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-xl text-center text-muted-foreground text-sm">
                            <TrendingDown className="w-8 h-8 text-rose-400/50 mb-3" />
                            <p>Saisissez l&apos;historique des exercices déficitaires pour liquider l&apos;imputation et contrôler les péremptions.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
