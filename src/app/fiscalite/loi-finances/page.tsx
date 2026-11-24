"use client";

import { useState } from "react";
import {
    TrendingDown, TrendingUp, Sliders, Play, Download,
    Building, AlertCircle, Scale, Info
} from "lucide-react";

interface ImpactClient {
    clientId: string;
    nom: string;
    chargeActuelle: number;
    chargeSimulee: number;
    delta: number;
    deltaPct: number;
    detail: {
        minimumAppliqueActuel: boolean;
        minimumAppliqueSimule: boolean;
        note?: string;
    };
}

interface ResultatSimulation {
    params: {
        pays: string;
        typeChangement: string;
        valeurActuelle: number;
        valeurProposee: number;
        exercice: number;
    };
    impacts: ImpactClient[];
    totalActuel: number;
    totalSimule: number;
    totalDelta: number;
    moyenneDelta: number;
    clientsConcernes: number;
    timestamp: string;
}

export default function LoiFinancesSimulatorPage() {
    const [clients, setClients] = useState([{ id: "1", nom: "", resultatFiscal: "", chiffreAffaires: "", caTtc: "", tvaCollectee: "" }]);
    const [pays, setPays] = useState<"sn" | "ci" | "cm" | "bj">("sn");
    const [typeChangement, setTypeChangement] = useState<string>("IS_TAUX");
    const [valeurActuelle, setValeurActuelle] = useState<number>(0.3);
    const [valeurProposee, setValeurProposee] = useState<number>(0.25);
    const [exercice, setExercice] = useState<number>(new Date().getFullYear());

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resultat, setResultat] = useState<ResultatSimulation | null>(null);

    // Ajuster les valeurs par défaut selon le pays et le type
    const changerType = (nouveauType: string) => {
        setTypeChangement(nouveauType);
        if (nouveauType === "IS_TAUX") {
            const tauxDefaut = pays === "cm" ? 0.33 : pays === "ci" ? 0.25 : 0.3;
            setValeurActuelle(tauxDefaut);
            setValeurProposee(tauxDefaut - 0.05);
        } else if (nouveauType === "IMF_TAUX") {
            setValeurActuelle(0.005);
            setValeurProposee(0.003);
        } else if (nouveauType === "TVA_TAUX") {
            setValeurActuelle(0.18);
            setValeurProposee(0.2);
        } else if (nouveauType === "CREDIT_IMPOT") {
            setValeurActuelle(0);
            setValeurProposee(2_000_000);
        }
    };

    const lancerSimulation = async () => {
        if (clients.some((client) => !client.nom.trim() || [client.resultatFiscal, client.chiffreAffaires, client.caTtc, client.tvaCollectee].some((value) => value.trim() === "" || !Number.isFinite(Number(value))))) {
            setError("Renseignez le nom et les quatre montants comptables pour chaque entreprise.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/fiscalite/loi-finances", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    params: {
                        pays,
                        typeChangement,
                        valeurActuelle: Number(valeurActuelle),
                        valeurProposee: Number(valeurProposee),
                        exercice: Number(exercice),
                    },
                    clients: clients.map((client) => ({
                        clientId: `simulation-client-${client.id}`,
                        nom: client.nom.trim(),
                        resultatFiscal: Number(client.resultatFiscal),
                        chiffreAffaires: Number(client.chiffreAffaires),
                        caTtc: Number(client.caTtc),
                        tvaCollectee: Number(client.tvaCollectee),
                    })),
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erreur lors de la simulation");

            setResultat(data);
        } catch (err: any) {
            setError(err.message || "Erreur de communication avec le moteur fiscal.");
        } finally {
            setLoading(false);
        }
    };

    const exporterCSV = () => {
        if (!resultat) return;
        const entete = "Client,Charge Actuelle (FCFA),Charge Projetée (FCFA),Variation (FCFA),Variation (%),Note\n";
        const lignes = resultat.impacts
            .map(
                (i) =>
                    `"${i.nom.replace(/"/g, '""')}",${i.chargeActuelle},${i.chargeSimulee},${i.delta},${i.deltaPct}%,"${(i.detail.note || "").replace(/"/g, '""')}"`
            )
            .join("\n");
        const blob = new Blob([entete + lignes], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `impact_loi_finances_${pays}_${exercice}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-16">
            {/* Header */}
            <div>
                <h2 className="page-title flex items-center gap-3">
                    <Scale className="w-6 h-6 text-primary" />
                    Simulateur Stratégique d'Impact — Loi de Finances
                </h2>
                <p className="page-subtitle">
                    Modélisez en amont les réformes fiscales votées ou annoncées pour mesurer l'impact net immédiat sur la trésorerie et la charge d'impôt de votre portefeuille clients.
                </p>
            </div>

            {error && (
                <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 text-rose-300 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Formulaire de paramétrage de la réforme */}
            <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-border text-foreground font-semibold text-sm">
                    <Sliders className="w-4 h-4 text-primary" />
                    Hypothèses Législatives & Paramètres de la Réforme
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Juridiction Fiscale
                        </label>
                        <select
                            value={pays}
                            onChange={(e: any) => {
                                setPays(e.target.value);
                            }}
                            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                        >
                            <option value="sn">Sénégal (LFI / CGI)</option>
                            <option value="ci">Côte d'Ivoire (Annexe Fiscale)</option>
                            <option value="cm">Cameroun (Loi Finances)</option>
                            <option value="bj">Bénin (CGI Révisé)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Dispositif Fiscal Modifié
                        </label>
                        <select
                            value={typeChangement}
                            onChange={(e) => changerType(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                        >
                            <option value="IS_TAUX">Taux d'Impôt sur les Sociétés (IS)</option>
                            <option value="IMF_TAUX">Impôt Minimum Forfaitaire (IMF)</option>
                            <option value="CREDIT_IMPOT">Crédit d'Impôt / Incitation</option>
                            <option value="TVA_TAUX">Taux Normal de TVA</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Valeur Actuelle ({typeChangement === "CREDIT_IMPOT" ? "FCFA" : "taux décimal, ex. 0,30 = 30 %"})
                        </label>
                        <input
                            type="number"
                            step={typeChangement === "CREDIT_IMPOT" ? "100000" : "0.01"}
                            value={valeurActuelle}
                            onChange={(e) => setValeurActuelle(Number(e.target.value))}
                            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Valeur Réformée ({typeChangement === "CREDIT_IMPOT" ? "FCFA" : "taux décimal, ex. 0,25 = 25 %"})
                        </label>
                        <input
                            type="number"
                            step={typeChangement === "CREDIT_IMPOT" ? "100000" : "0.01"}
                            value={valeurProposee}
                            onChange={(e) => setValeurProposee(Number(e.target.value))}
                            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono font-medium text-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Exercice d'application
                        </label>
                        <input
                            type="number"
                            value={exercice}
                            onChange={(e) => setExercice(Number(e.target.value))}
                            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono"
                        />
                    </div>
                </div>

                <div className="space-y-3 border-t border-border pt-5">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h3 className="text-sm font-semibold">Données comptables par entreprise</h3>
                            <p className="text-xs text-muted-foreground">Montants de l’exercice sélectionné, en FCFA. Les chiffres sont fournis par l’utilisateur et doivent être vérifiés.</p>
                        </div>
                        <button type="button" onClick={() => setClients((items) => [...items, { id: String(Date.now()), nom: "", resultatFiscal: "", chiffreAffaires: "", caTtc: "", tvaCollectee: "" }])} className="px-3 py-2 rounded-lg border border-border text-xs font-medium">Ajouter une entreprise</button>
                    </div>
                    {clients.map((client, index) => {
                        const fields = [
                            ["nom", "Entreprise", "text"],
                            ["resultatFiscal", "Résultat fiscal", "number"],
                            ["chiffreAffaires", "CA HT", "number"],
                            ["caTtc", "CA TTC", "number"],
                            ["tvaCollectee", "TVA collectée", "number"],
                        ] as const;
                        return <div key={client.id} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end rounded-xl border border-border/70 p-3">
                            {fields.map(([field, label, type]) => <label key={field} className="text-xs text-muted-foreground">{label}<input type={type} step={type === "number" ? "any" : undefined} value={client[field]} onChange={(event) => setClients((items) => items.map((item, i) => i === index ? { ...item, [field]: event.target.value } : item))} className="mt-1 w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground" /></label>)}
                            <button type="button" disabled={clients.length === 1} onClick={() => setClients((items) => items.filter((_, i) => i !== index))} className="px-3 py-2 rounded-lg border border-border text-xs disabled:opacity-40">Retirer</button>
                        </div>;
                    })}
                </div>

                <p className="text-xs text-amber-300/90 flex gap-2 items-start"><Info className="w-4 h-4 shrink-0" />Simulation indicative fondée sur les montants saisis. Elle ne remplace pas la validation des règles applicables ni la revue d’un professionnel.</p>

                <div className="flex justify-end pt-2">
                    <button
                        onClick={lancerSimulation}
                        disabled={loading}
                        className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm flex items-center gap-2 transition disabled:opacity-50"
                    >
                        {loading ? (
                            <>Calcul de l'impact en cours...</>
                        ) : (
                            <>
                                <Play className="w-4 h-4 fill-current" />
                                Simuler l'Impact Portefeuille
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Résultats de simulation */}
            {resultat && (
                <div className="space-y-6">
                    {/* Cartes KPI */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-5 rounded-2xl border border-border bg-card/60 space-y-1">
                            <span className="text-xs text-muted-foreground block font-medium">Entreprises Analysées</span>
                            <span className="text-2xl font-black text-foreground">
                                {resultat.clientsConcernes} dossiers
                            </span>
                            <span className="text-xs text-muted-foreground block">Portefeuille {pays.toUpperCase()}</span>
                        </div>

                        <div className="p-5 rounded-2xl border border-border bg-card/60 space-y-1">
                            <span className="text-xs text-muted-foreground block font-medium">Charge Fiscale Actuelle</span>
                            <span className="text-2xl font-black text-foreground">
                                {resultat.totalActuel.toLocaleString("fr-FR")} F
                            </span>
                            <span className="text-xs text-muted-foreground block">Cumul exercice en cours</span>
                        </div>

                        <div className="p-5 rounded-2xl border border-border bg-card/60 space-y-1">
                            <span className="text-xs text-muted-foreground block font-medium">Charge Projetée (Loi Finances)</span>
                            <span className="text-2xl font-black text-foreground">
                                {resultat.totalSimule.toLocaleString("fr-FR")} F
                            </span>
                            <span className="text-xs text-muted-foreground block">Après application de la mesure</span>
                        </div>

                        <div
                            className={`p-5 rounded-2xl border space-y-1 ${
                                resultat.totalDelta <= 0
                                    ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                                    : "bg-rose-950/20 border-rose-500/40 text-rose-300"
                            }`}
                        >
                            <span className="text-xs opacity-80 block font-medium flex items-center gap-1.5">
                                {resultat.totalDelta <= 0 ? (
                                    <>
                                        <TrendingDown className="w-4 h-4 text-emerald-400" />
                                        Économie Fiscale Nette
                                    </>
                                ) : (
                                    <>
                                        <TrendingUp className="w-4 h-4 text-rose-400" />
                                        Surcoût Fiscal Net
                                    </>
                                )}
                            </span>
                            <span className="text-2xl font-black">
                                {Math.abs(resultat.totalDelta).toLocaleString("fr-FR")} F
                            </span>
                            <span className="text-xs opacity-80 block">
                                Moyenne : {Math.abs(resultat.moyenneDelta).toLocaleString("fr-FR")} F / dossier
                            </span>
                        </div>
                    </div>

                    {/* Tableau détaillé */}
                    <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <Building className="w-4 h-4 text-primary" />
                                Impact Détaillé par Entreprise
                            </h3>
                            <button
                                onClick={exporterCSV}
                                className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-medium flex items-center gap-1.5 transition"
                            >
                                <Download className="w-3.5 h-3.5 text-primary" />
                                Exporter en CSV
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="text-muted-foreground uppercase border-b border-border/60">
                                    <tr>
                                        <th className="py-2.5 px-3">Entreprise</th>
                                        <th className="py-2.5 px-3 text-right">Charge Actuelle</th>
                                        <th className="py-2.5 px-3 text-right">Charge Projetée</th>
                                        <th className="py-2.5 px-3 text-right">Variation Nette</th>
                                        <th className="py-2.5 px-3 text-right">Variation (%)</th>
                                        <th className="py-2.5 px-3">Note Fiscale</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/40 font-mono">
                                    {resultat.impacts.map((i) => (
                                        <tr key={i.clientId} className="hover:bg-muted/30 transition">
                                            <td className="py-3 px-3 font-sans font-medium text-foreground">
                                                {i.nom}
                                            </td>
                                            <td className="py-3 px-3 text-right text-muted-foreground">
                                                {i.chargeActuelle.toLocaleString("fr-FR")} F
                                            </td>
                                            <td className="py-3 px-3 text-right text-foreground font-semibold">
                                                {i.chargeSimulee.toLocaleString("fr-FR")} F
                                            </td>
                                            <td
                                                className={`py-3 px-3 text-right font-bold ${
                                                    i.delta < 0
                                                        ? "text-emerald-400"
                                                        : i.delta > 0
                                                        ? "text-rose-400"
                                                        : "text-muted-foreground"
                                                }`}
                                            >
                                                {i.delta > 0 ? "+" : ""}
                                                {i.delta.toLocaleString("fr-FR")} F
                                            </td>
                                            <td
                                                className={`py-3 px-3 text-right font-bold ${
                                                    i.deltaPct < 0
                                                        ? "text-emerald-400"
                                                        : i.deltaPct > 0
                                                        ? "text-rose-400"
                                                        : "text-muted-foreground"
                                                }`}
                                            >
                                                {i.deltaPct > 0 ? "+" : ""}
                                                {i.deltaPct} %
                                            </td>
                                            <td className="py-3 px-3 font-sans text-muted-foreground text-[11px]">
                                                {i.detail.note || (i.detail.minimumAppliqueSimule ? "Plancher IMF" : "Régime normal")}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
