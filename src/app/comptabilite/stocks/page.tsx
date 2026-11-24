"use client";

import { useState, useCallback } from "react";
import {
    Boxes, PackageCheck, AlertTriangle, Printer,
    RefreshCw, Plus, CheckCircle2, FileText, ArrowRight, Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ArticleRow {
    id: string;
    reference: string;
    designation: string;
    categorie: "MARCHANDISES" | "MATIERES_PREMIERES" | "PRODUITS_FINIS";
    quantitePhysique: number;
    prixUnitaireAchatCUMP: number;
    valeurRealisableNette?: number;
}

export default function StocksInventairePage() {
    const [clientId, setClientId] = useState("");
    const [exercice, setExercice] = useState(new Date().getFullYear());
    const [stockInitialMarchandises, setStockInitialMarchandises] = useState(0);
    const [stockInitialMatieres, setStockInitialMatieres] = useState(0);
    const [ventesExercice, setVentesExercice] = useState(0);
    const [achatsExercice, setAchatsExercice] = useState(0);

    const [articles, setArticles] = useState<ArticleRow[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resultat, setResultat] = useState<any | null>(null);

    const ajouterArticle = () => {
        setArticles([
            ...articles,
            {
                id: String(Date.now()),
                reference: "",
                designation: "",
                categorie: "MARCHANDISES",
                quantitePhysique: 0,
                prixUnitaireAchatCUMP: 0,
            },
        ]);
    };

    const supprimerArticle = (id: string) => {
        if (articles.length === 1) return;
        setArticles(articles.filter((a) => a.id !== id));
    };

    const modifierArticle = (id: string, champ: keyof ArticleRow, val: any) => {
        setArticles(articles.map((a) => (a.id === id ? { ...a, [champ]: val } : a)));
    };

    const calculerInventaire = async () => {
        if (!clientId.trim() || clientId.trim().length < 12) {
            setError("Veuillez renseigner un identifiant client valide (MongoDB ID).");
            return;
        }
        if (articles.length === 0 || articles.some((article) => !article.reference.trim() || !article.designation.trim())) {
            setError("Ajoutez au moins un article d'inventaire avec sa référence et sa désignation réelles.");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/comptabilite/stocks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clientId: clientId.trim(),
                    exercice,
                    stockInitialParCategorie: {
                        MARCHANDISES: Number(stockInitialMarchandises),
                        MATIERES_PREMIERES: Number(stockInitialMatieres),
                        PRODUITS_FINIS: 0,
                        EN_COURS: 0,
                    },
                    articles,
                    ventesExercice: Number(ventesExercice),
                    achatsExercice: Number(achatsExercice),
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erreur de calcul");
            setResultat(data.resultat);
        } catch (err: any) {
            setError(err.message || "Erreur lors du calcul de l'inventaire des stocks.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-16">
            {/* Header */}
            <div>
                <h2 className="page-title flex items-center gap-3">
                    <Boxes className="w-6 h-6 text-primary" />
                    Inventaire Intermittent & Variations de Stocks (SYSCOHADA)
                </h2>
                <p className="page-subtitle">
                    Comptabilisation de clôture annuelle pour PME : annulation du stock initial, constatation du stock physique final, calcul des dépréciations et impact direct sur la marge commerciale.
                </p>
            </div>

            {error && (
                <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 text-rose-300 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Paramètres de l'exercice */}
            <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">
                            Identifiant Dossier Client (MongoDB ID) *
                        </label>
                        <input
                            type="text"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            placeholder="ex: 60c72b2f9b1d8b2bad592a88"
                            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">
                            Exercice de Clôture
                        </label>
                        <input
                            type="number"
                            value={exercice}
                            onChange={(e) => setExercice(Number(e.target.value))}
                            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">
                            Stock Initial Marchandises (SI N-1)
                        </label>
                        <input
                            type="number"
                            value={stockInitialMarchandises}
                            onChange={(e) => setStockInitialMarchandises(Number(e.target.value))}
                            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">
                            Stock Initial Matières Premières
                        </label>
                        <input
                            type="number"
                            value={stockInitialMatieres}
                            onChange={(e) => setStockInitialMatieres(Number(e.target.value))}
                            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl font-mono"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/40">
                    <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">
                            Total Ventes de Marchandises (Compte 701)
                        </label>
                        <input
                            type="number"
                            value={ventesExercice}
                            onChange={(e) => setVentesExercice(Number(e.target.value))}
                            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">
                            Total Achats de Marchandises (Compte 601)
                        </label>
                        <input
                            type="number"
                            value={achatsExercice}
                            onChange={(e) => setAchatsExercice(Number(e.target.value))}
                            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl font-mono"
                        />
                    </div>
                </div>
            </div>

            {/* Saisie des Articles d'Inventaire Physique */}
            <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <PackageCheck className="w-4 h-4 text-primary" />
                        Comptage Physique des Stocks au 31 Décembre ({articles.length} références)
                    </h3>
                    <button
                        type="button"
                        onClick={ajouterArticle}
                        className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-medium flex items-center gap-1.5 transition"
                    >
                        <Plus className="w-3.5 h-3.5 text-primary" />
                        Ajouter un article
                    </button>
                </div>

                <div className="space-y-2.5">
                    {articles.map((art) => (
                        <div
                            key={art.id}
                            className="p-3 bg-background/60 rounded-xl border border-border/80 grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs"
                        >
                            <div className="md:col-span-2">
                                <input
                                    type="text"
                                    value={art.reference}
                                    onChange={(e) => modifierArticle(art.id, "reference", e.target.value)}
                                    placeholder="Référence"
                                    className="w-full px-2 py-1.5 rounded border border-border bg-background font-mono"
                                />
                            </div>
                            <div className="md:col-span-3">
                                <input
                                    type="text"
                                    value={art.designation}
                                    onChange={(e) => modifierArticle(art.id, "designation", e.target.value)}
                                    placeholder="Désignation"
                                    className="w-full px-2 py-1.5 rounded border border-border bg-background"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <select
                                    value={art.categorie}
                                    onChange={(e: any) => modifierArticle(art.id, "categorie", e.target.value)}
                                    className="w-full px-2 py-1.5 rounded border border-border bg-background"
                                >
                                    <option value="MARCHANDISES">Marchandises (31)</option>
                                    <option value="MATIERES_PREMIERES">Matières (32)</option>
                                    <option value="PRODUITS_FINIS">Produits Finis (36)</option>
                                </select>
                            </div>
                            <div className="md:col-span-1">
                                <input
                                    type="number"
                                    value={art.quantitePhysique}
                                    onChange={(e) => modifierArticle(art.id, "quantitePhysique", Number(e.target.value))}
                                    placeholder="Qté"
                                    className="w-full px-2 py-1.5 rounded border border-border bg-background font-mono font-medium"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <input
                                    type="number"
                                    value={art.prixUnitaireAchatCUMP}
                                    onChange={(e) => modifierArticle(art.id, "prixUnitaireAchatCUMP", Number(e.target.value))}
                                    placeholder="Prix CUMP"
                                    className="w-full px-2 py-1.5 rounded border border-border bg-background font-mono font-medium"
                                />
                            </div>
                            <div className="md:col-span-1">
                                <input
                                    type="number"
                                    value={art.valeurRealisableNette || ""}
                                    onChange={(e) => modifierArticle(art.id, "valeurRealisableNette", e.target.value ? Number(e.target.value) : undefined)}
                                    placeholder="VRN test"
                                    className="w-full px-2 py-1.5 rounded border border-border bg-background font-mono text-amber-400"
                                    title="Valeur Réalisable Nette de marché pour test de dépréciation"
                                />
                            </div>
                            <div className="md:col-span-1 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => supprimerArticle(art.id)}
                                    disabled={articles.length === 1}
                                    className="p-1.5 text-muted-foreground hover:text-rose-400 disabled:opacity-30 transition"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end pt-3">
                    <button
                        onClick={calculerInventaire}
                        disabled={loading}
                        className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm flex items-center gap-2 transition disabled:opacity-50"
                    >
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                        Calculer l'Inventaire & Générer les Écritures
                    </button>
                </div>
            </div>

            {/* Résultats d'Inventaire & Écritures OD */}
            {resultat && (
                <div className="space-y-6">
                    {/* Cartes KPI Synthétiques */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 font-mono text-xs">
                        <div className="p-4 rounded-2xl border border-border bg-card/60">
                            <span className="text-muted-foreground font-sans block">Stock Initial (N-1)</span>
                            <span className="text-lg font-black text-foreground">
                                {resultat.totalStockInitial.toLocaleString("fr-FR")} F
                            </span>
                        </div>
                        <div className="p-4 rounded-2xl border border-border bg-card/60">
                            <span className="text-muted-foreground font-sans block">Stock Final Brut (N)</span>
                            <span className="text-lg font-black text-foreground">
                                {resultat.totalStockFinalBrut.toLocaleString("fr-FR")} F
                            </span>
                        </div>
                        <div
                            className={cn(
                                "p-4 rounded-2xl border",
                                resultat.variationGlobaleStock >= 0
                                    ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
                                    : "border-amber-500/40 bg-amber-950/20 text-amber-300"
                            )}
                        >
                            <span className="font-sans block opacity-80">
                                {resultat.variationGlobaleStock >= 0 ? "Stockage Net" : "Déstockage Net"}
                            </span>
                            <span className="text-lg font-black">
                                {resultat.variationGlobaleStock >= 0 ? "+" : ""}
                                {resultat.variationGlobaleStock.toLocaleString("fr-FR")} F
                            </span>
                        </div>
                        <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-950/20 text-rose-300">
                            <span className="font-sans block opacity-80">Dépréciations (Compte 39)</span>
                            <span className="text-lg font-black">
                                {resultat.totalDepreciations.toLocaleString("fr-FR")} F
                            </span>
                        </div>
                        <div className="p-4 rounded-2xl border border-primary/40 bg-primary/10 text-primary">
                            <span className="font-sans block opacity-80">Marge Commerciale Réelle</span>
                            <span className="text-lg font-black">
                                {resultat.impactMargeBrute.margeCommerciale.toLocaleString("fr-FR")} F
                            </span>
                            <span className="font-sans text-[10px] block opacity-90">
                                Taux de marque : {resultat.impactMargeBrute.tauxMarque} %
                            </span>
                        </div>
                    </div>

                    {/* Écritures Comptables Générées (Journal OD) */}
                    <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                Écritures d'Inventaire Intermittent Générées ({resultat.ecrituresCloture.length} lignes)
                            </h3>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-medium flex items-center gap-1.5 transition"
                            >
                                <Printer className="w-3.5 h-3.5 text-primary" />
                                Imprimer les Écritures
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="text-muted-foreground uppercase border-b border-border/60">
                                    <tr>
                                        <th className="py-2.5 px-3">Date</th>
                                        <th className="py-2.5 px-3">Compte Débit</th>
                                        <th className="py-2.5 px-3">Compte Crédit</th>
                                        <th className="py-2.5 px-3">Libellé d'Écriture</th>
                                        <th className="py-2.5 px-3 text-right font-bold text-foreground">Montant (FCFA)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/40 font-mono">
                                    {resultat.ecrituresCloture.map((e: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-muted/30 transition">
                                            <td className="py-2.5 px-3 text-muted-foreground">{e.date}</td>
                                            <td className="py-2.5 px-3">
                                                <strong className="text-emerald-400">{e.compteDebit}</strong>
                                                <span className="text-[10px] text-muted-foreground block font-sans">{e.intituleDebit}</span>
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <strong className="text-rose-400">{e.compteCredit}</strong>
                                                <span className="text-[10px] text-muted-foreground block font-sans">{e.intituleCredit}</span>
                                            </td>
                                            <td className="py-2.5 px-3 font-sans text-foreground">{e.libelle}</td>
                                            <td className="py-2.5 px-3 text-right font-black text-foreground">
                                                {Number(e.montant).toLocaleString("fr-FR")} F
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
