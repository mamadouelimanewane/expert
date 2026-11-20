"use client";

import { useState, useCallback } from "react";
import {
    Clock,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    ShieldAlert,
    CheckCircle2,
    Calculator,
    Loader2,
    FileText,
    Copy,
    DollarSign,
    Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
    MetriquesDossierSizing,
    SizingMissionResult,
    DonneesSuiviMission,
    SentinelleBoniMaliResult
} from "@/lib/ohada/mission-budget-sentinel";

const f = (n: number) => n.toLocaleString("fr-FR") + " F CFA";

export default function MissionBudgetSentinelPage() {
    const [modeOnglet, setModeOnglet] = useState<"sizing" | "sentinelle">("sizing");

    // Sizing state
    const [ca, setCa] = useState(350_000_000);
    const [ecritures, setEcritures] = useState(4_500);
    const [tiers, setTiers] = useState(65);
    const [immos, setImmos] = useState(30);
    const [salaries, setSalaries] = useState(14);
    const [complexite, setComplexite] = useState<"STANDARD" | "INTERMEDIAIRE" | "COMPLEXE">("INTERMEDIAIRE");
    const [typeMission, setTypeMission] = useState<"TENUE_COMPTABLE" | "SURVEILLANCE_REVISION" | "COMMISSARIAT_AUX_COMPTES">("TENUE_COMPTABLE");

    const [sizingResult, setSizingResult] = useState<SizingMissionResult | null>(null);
    const [loadingSizing, setLoadingSizing] = useState(false);

    // Sentinelle state
    const [heuresBudget, setHeuresBudget] = useState(120);
    const [heuresPassees, setHeuresPassees] = useState(85);
    const [avancement, setAvancement] = useState(50);
    const [honorairesSignes, setHonorairesSignes] = useState(3_600_000);
    const [tauxHoraireMoyen, setTauxHoraireMoyen] = useState(30_000);

    const [sentinelleResult, setSentinelleResult] = useState<SentinelleBoniMaliResult | null>(null);
    const [loadingSentinelle, setLoadingSentinelle] = useState(false);
    const [copieAvenant, setCopieAvenant] = useState(false);

    const calculerSizing = useCallback(async () => {
        setLoadingSizing(true);
        setSizingResult(null);

        const metriques: MetriquesDossierSizing = {
            chiffreAffairesAnnuel: ca,
            nombreEcrituresAnnuelles: ecritures,
            nombreComptesTiersActifs: tiers,
            nombreLignesImmobilisations: immos,
            nombreSalariesMensuel: salaries,
            complexiteFiscale: complexite,
            typeMission,
        };

        try {
            const res = await fetch("/api/missions/budget-sentinel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mode: "SIZING", metriques }),
            });
            const data = await res.json();
            if (data.ok) setSizingResult(data.sizing);
        } catch {} finally {
            setLoadingSizing(false);
        }
    }, [ca, ecritures, tiers, immos, salaries, complexite, typeMission]);

    const evaluerSentinelle = useCallback(async () => {
        setLoadingSentinelle(true);
        setSentinelleResult(null);

        const suivi: DonneesSuiviMission = {
            heuresBudgetees: heuresBudget,
            heuresPasseesADate: heuresPassees,
            avancementTravauxPourcentage: avancement,
            honorairesSignesHT: honorairesSignes,
            tauxHoraireMoyenCabinet: tauxHoraireMoyen,
        };

        try {
            const res = await fetch("/api/missions/budget-sentinel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mode: "SENTINELLE", suivi }),
            });
            const data = await res.json();
            if (data.ok) setSentinelleResult(data.sentinelle);
        } catch {} finally {
            setLoadingSentinelle(false);
        }
    }, [heuresBudget, heuresPassees, avancement, honorairesSignes, tauxHoraireMoyen]);

    const copier = (texte: string) => {
        navigator.clipboard.writeText(texte);
        setCopieAvenant(true);
        setTimeout(() => setCopieAvenant(false), 2000);
    };

    return (
        <div className="space-y-8 p-6 max-w-7xl mx-auto">
            {/* Header Tabs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                    <h1 className="page-title text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Clock className="w-6 h-6 text-primary" />
                        Sentinelle Budgétaire Boni/Mali & Sizing d&apos;Honoraires
                    </h1>
                    <p className="page-subtitle text-xs text-muted-foreground mt-0.5">
                        Dimensionnement prédictif des honoraires à partir de la balance et détection précoce des dérives de temps.
                    </p>
                </div>
                <div className="flex items-center gap-1 bg-card/60 border border-border p-1 rounded-xl text-xs">
                    <button
                        onClick={() => setModeOnglet("sizing")}
                        className={cn(
                            "px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5",
                            modeOnglet === "sizing" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Calculator className="w-3.5 h-3.5" />
                        Sizing & Devis Mission
                    </button>
                    <button
                        onClick={() => setModeOnglet("sentinelle")}
                        className={cn(
                            "px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5",
                            modeOnglet === "sentinelle" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Sentinelle Dérive Boni/Mali
                    </button>
                </div>
            </div>

            {/* TAB 1: SIZING PREDICTIF */}
            {modeOnglet === "sizing" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-primary" />
                            Métriques du Dossier Client
                        </h2>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="col-span-2">
                                <label className="block text-muted-foreground mb-1 font-medium">Type de mission</label>
                                <select
                                    value={typeMission}
                                    onChange={(e) => setTypeMission(e.target.value as any)}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                                >
                                    <option value="TENUE_COMPTABLE">Tenue Complète (Saisie + Révision + Liasse)</option>
                                    <option value="SURVEILLANCE_REVISION">Surveillance & Révision périodique</option>
                                    <option value="COMMISSARIAT_AUX_COMPTES">Commissariat aux Comptes (Audit Légal)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">Chiffre d&apos;Affaires Annuel</label>
                                <input
                                    type="number"
                                    value={ca}
                                    onChange={(e) => setCa(Number(e.target.value))}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">Nombre d&apos;écritures annuelles</label>
                                <input
                                    type="number"
                                    value={ecritures}
                                    onChange={(e) => setEcritures(Number(e.target.value))}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">Comptes tiers actifs (401 + 411)</label>
                                <input
                                    type="number"
                                    value={tiers}
                                    onChange={(e) => setTiers(Number(e.target.value))}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">Lignes d&apos;immobilisations (classe 2)</label>
                                <input
                                    type="number"
                                    value={immos}
                                    onChange={(e) => setImmos(Number(e.target.value))}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">Salariés à gérer mensuellement</label>
                                <input
                                    type="number"
                                    value={salaries}
                                    onChange={(e) => setSalaries(Number(e.target.value))}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">Complexité fiscale</label>
                                <select
                                    value={complexite}
                                    onChange={(e) => setComplexite(e.target.value as any)}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                >
                                    <option value="STANDARD">Standard (CGI droit commun)</option>
                                    <option value="INTERMEDIAIRE">Intermédiaire (BRS, flux UEMOA)</option>
                                    <option value="COMPLEXE">Complexe (Zone Franche, Import-Export, Minier)</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={calculerSizing}
                            disabled={loadingSizing}
                            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-xs hover:bg-primary/90 disabled:opacity-50"
                        >
                            {loadingSizing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Calculator className="h-3.5 w-3.5" />}
                            Calculer le Budget & Devis Recommandé
                        </button>
                    </div>

                    {/* Résultats du sizing */}
                    <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-emerald-400" />
                            Proposition de Budget & Honoraires
                        </h2>

                        {!sizingResult ? (
                            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground text-xs p-6 border border-dashed border-border rounded-xl">
                                <span>Ajustez les paramètres à gauche pour obtenir le sizing horaire et tarifaire.</span>
                            </div>
                        ) : (
                            <div className="space-y-4 text-xs">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-muted/40 border border-border rounded-xl">
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Volume Annuel Estimé</span>
                                        <p className="text-xl font-bold text-foreground mt-1">{sizingResult.heuresTotalesRecommandees} heures</p>
                                    </div>
                                    <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded-xl">
                                        <span className="text-[10px] text-emerald-300 uppercase font-bold">Forfait Mensuel HT</span>
                                        <p className="text-xl font-bold text-emerald-400 mt-1">{f(sizingResult.honorairesMensuelsHT)}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 p-3 bg-background border border-border rounded-xl">
                                    <span className="font-semibold block mb-1">Répartition des heures par grade :</span>
                                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                                        <div className="p-2 bg-muted/30 rounded">
                                            <span className="text-muted-foreground block text-[10px]">Associé</span>
                                            <strong className="text-foreground">{sizingResult.repartitionHeures.associe} h</strong>
                                        </div>
                                        <div className="p-2 bg-muted/30 rounded">
                                            <span className="text-muted-foreground block text-[10px]">Manager</span>
                                            <strong className="text-foreground">{sizingResult.repartitionHeures.manager} h</strong>
                                        </div>
                                        <div className="p-2 bg-muted/30 rounded">
                                            <span className="text-muted-foreground block text-[10px]">Senior</span>
                                            <strong className="text-foreground">{sizingResult.repartitionHeures.senior} h</strong>
                                        </div>
                                        <div className="p-2 bg-muted/30 rounded">
                                            <span className="text-muted-foreground block text-[10px]">Assistant</span>
                                            <strong className="text-foreground">{sizingResult.repartitionHeures.assistant} h</strong>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1 text-muted-foreground text-[11px] pt-1">
                                    {sizingResult.justificationMetriques.map((j, i) => (
                                        <p key={i}>• {j}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: SENTINELLE BONI/MALI */}
            {modeOnglet === "sentinelle" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            Suivi d&apos;Avancement & Consommation des Heures
                        </h2>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">Heures budgetées initiales</label>
                                <input
                                    type="number"
                                    value={heuresBudget}
                                    onChange={(e) => setHeuresBudget(Number(e.target.value))}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">Heures consommées à date</label>
                                <input
                                    type="number"
                                    value={heuresPassees}
                                    onChange={(e) => setHeuresPassees(Number(e.target.value))}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-400"
                                />
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">Avancement réel des travaux (%)</label>
                                <input
                                    type="number"
                                    value={avancement}
                                    onChange={(e) => setAvancement(Number(e.target.value))}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">Taux horaire moyen cabinet (FCFA)</label>
                                <input
                                    type="number"
                                    value={tauxHoraireMoyen}
                                    onChange={(e) => setTauxHoraireMoyen(Number(e.target.value))}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={evaluerSentinelle}
                            disabled={loadingSentinelle}
                            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-xs hover:bg-primary/90 disabled:opacity-50"
                        >
                            {loadingSentinelle ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                            Projeter l&apos;Atterrissage & Évaluer le Risque
                        </button>
                    </div>

                    {/* Résultat Sentinelle */}
                    <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-primary" />
                            Diagnostic de Rentabilité & Projection d&apos;Atterrissage
                        </h2>

                        {!sentinelleResult ? (
                            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground text-xs p-6 border border-dashed border-border rounded-xl">
                                <span>Renseignez les temps consommés pour projeter l&apos;atterrissage et détecter les malis.</span>
                            </div>
                        ) : (
                            <div className="space-y-4 text-xs">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-muted/40 border border-border rounded-xl">
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Atterrissage Projeté</span>
                                        <p className="text-xl font-bold text-foreground mt-1">{sentinelleResult.heuresAtterrissageProjettées} h</p>
                                        <span className="text-[10px] text-muted-foreground">Budget initial : {heuresBudget} h</span>
                                    </div>
                                    <div className={cn(
                                        "p-3 rounded-xl border",
                                        sentinelleResult.ecartHeuresFinal > 0 ? "bg-red-950/40 border-red-800" : "bg-emerald-950/40 border-emerald-800"
                                    )}>
                                        <span className="text-[10px] uppercase font-bold">
                                            {sentinelleResult.ecartHeuresFinal > 0 ? "Mali Projeté" : "Boni Projeté"}
                                        </span>
                                        <p className="text-xl font-bold mt-1">
                                            {sentinelleResult.ecartHeuresFinal > 0 ? `+${sentinelleResult.ecartHeuresFinal} h` : `${sentinelleResult.ecartHeuresFinal} h`}
                                        </p>
                                        <span className="text-[10px]">{f(sentinelleResult.impactFinancierFCFA)}</span>
                                    </div>
                                </div>

                                <div className="p-3 bg-background border border-border rounded-xl">
                                    <p className="font-semibold text-foreground">{sentinelleResult.recommandationAction}</p>
                                </div>

                                {sentinelleResult.projetAvenantLettreMission && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-xs">Proposition d&apos;Avenant Générée</span>
                                            <button
                                                onClick={() => copier(sentinelleResult.projetAvenantLettreMission!)}
                                                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                                {copieAvenant ? "Copié !" : "Copier"}
                                            </button>
                                        </div>
                                        <pre className="p-3 bg-background border border-border rounded-lg text-[10px] font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                                            {sentinelleResult.projetAvenantLettreMission}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
