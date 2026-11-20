"use client";

import { useState } from "react";
import { Brain, ShieldAlert, CheckCircle2, AlertTriangle, FileText, ArrowRight, RefreshCw, Plus, Trash2 } from "lucide-react";

export default function AuditAIReasoningPage() {
    const [cycle, setCycle] = useState<string>("CLIENTS");
    const [seuil, setSeuil] = useState(25000000);
    const [soldeTotal, setSoldeTotal] = useState(120000000);
    const [constats, setConstats] = useState<Array<any>>([
        { id: "1", referenceCompte: "4111", libelle: "Clients ordinaires", descriptionDiligence: "Circularisation directe (ISA 505)", assertionVisee: "EXISTENCE", conforme: true, montantAnomalieFCFA: 0 },
        { id: "2", referenceCompte: "416", libelle: "Créances litigieuses", descriptionDiligence: "Test de dépréciation SYSCOHADA", assertionVisee: "EVALUATION", conforme: false, anomalieDetectee: "Créance ancienneté > 2 ans non provisionnée", montantAnomalieFCFA: 18000000 },
        { id: "3", referenceCompte: "418", libelle: "Factures à établir", descriptionDiligence: "Cut-off des ventes", assertionVisee: "EXHAUSTIVITE", conforme: true, montantAnomalieFCFA: 0 },
    ]);

    const [loading, setLoading] = useState(false);
    const [bilan, setBilan] = useState<any>(null);

    const ajouterConstat = () => {
        setConstats([
            ...constats,
            { id: Date.now().toString(), referenceCompte: "411", libelle: "Compte tiers", descriptionDiligence: "Diligence complémentaire", assertionVisee: "DROITS_OBLIGATIONS", conforme: true, montantAnomalieFCFA: 0 },
        ]);
    };

    const supprimerConstat = (id: string) => {
        setConstats(constats.filter((c) => c.id !== id));
    };

    const lancerRaisonnement = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/audit/ai-reasoning", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cycleAudit: cycle,
                    seuilSignificationFCFA: Number(seuil),
                    soldeComptableTotalFCFA: Number(soldeTotal),
                    constats,
                }),
            });
            const data = await res.json();
            if (data.bilan) {
                setBilan(data.bilan);
            }
        } catch (err) {
            console.error("Erreur raisonnement audit:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <Brain className="w-6 h-6 text-indigo-400" />
                    <h1 className="page-title text-2xl font-bold tracking-tight">Assistant IA d'Audit sur Feuilles de Travail</h1>
                </div>
                <p className="page-subtitle text-sm text-muted-foreground">
                    Évaluation automatique des assertions d'audit (ISA 500), mesure du risque résiduel et rédaction de synthèse de section.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Paramétrage de la section et constats */}
                <div className="md:col-span-1 bg-card/40 border border-border rounded-xl p-5 space-y-4">
                    <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Périmètre du Cycle
                    </h2>

                    <div className="space-y-3 text-xs">
                        <div>
                            <label className="text-muted-foreground">Cycle d'audit contrôlé</label>
                            <select
                                value={cycle}
                                onChange={(e) => setCycle(e.target.value)}
                                className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background font-medium"
                            >
                                <option value="CLIENTS">Cycle Ventes / Clients (41)</option>
                                <option value="FOURNISSEURS">Cycle Achats / Fournisseurs (40)</option>
                                <option value="TRESORERIE">Cycle Trésorerie & Banques (5)</option>
                                <option value="IMMOBILISATIONS">Cycle Immobilisations (2)</option>
                                <option value="STOCKS">Cycle Stocks & En-cours (3)</option>
                                <option value="PAIE_SOCIAL">Cycle Personnel & Paie (42/43/66)</option>
                                <option value="CAPITAUX">Cycle Capitaux & Dettes LT (1)</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-muted-foreground">Seuil ISA 320</label>
                                <input
                                    type="number"
                                    value={seuil}
                                    onChange={(e) => setSeuil(Number(e.target.value))}
                                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background font-semibold text-emerald-400"
                                />
                            </div>
                            <div>
                                <label className="text-muted-foreground">Solde Audité</label>
                                <input
                                    type="number"
                                    value={soldeTotal}
                                    onChange={(e) => setSoldeTotal(Number(e.target.value))}
                                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-muted-foreground font-semibold">Constats de l'auditeur</label>
                                <button
                                    onClick={ajouterConstat}
                                    className="text-primary hover:underline flex items-center gap-1 text-[11px]"
                                >
                                    <Plus className="w-3 h-3" /> Ajouter
                                </button>
                            </div>

                            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                {constats.map((c) => (
                                    <div key={c.id} className="p-2.5 rounded-lg border border-border bg-background/50 space-y-1.5 text-[11px]">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold">{c.referenceCompte}</span>
                                            <select
                                                value={c.assertionVisee}
                                                onChange={(e) => {
                                                    const nc = constats.map((item) => item.id === c.id ? { ...item, assertionVisee: e.target.value } : item);
                                                    setConstats(nc);
                                                }}
                                                className="px-1 py-0.5 rounded border border-border text-[10px]"
                                            >
                                                <option value="EXISTENCE">EXISTENCE</option>
                                                <option value="EXHAUSTIVITE">EXHAUSTIVITE</option>
                                                <option value="EVALUATION">EVALUATION</option>
                                                <option value="DROITS_OBLIGATIONS">DROITS & OBLIGATIONS</option>
                                                <option value="PRESENTATION">PRESENTATION</option>
                                            </select>
                                            <button onClick={() => supprimerConstat(c.id)} className="text-rose-400">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="flex items-center gap-1">
                                                <input
                                                    type="checkbox"
                                                    checked={c.conforme}
                                                    onChange={(e) => {
                                                        const nc = constats.map((item) => item.id === c.id ? { ...item, conforme: e.target.checked } : item);
                                                        setConstats(nc);
                                                    }}
                                                />
                                                <span className={c.conforme ? "text-emerald-400" : "text-rose-400"}>
                                                    {c.conforme ? "Conforme" : "Anomalie"}
                                                </span>
                                            </label>
                                            {!c.conforme && (
                                                <input
                                                    type="number"
                                                    value={c.montantAnomalieFCFA}
                                                    onChange={(e) => {
                                                        const nc = constats.map((item) => item.id === c.id ? { ...item, montantAnomalieFCFA: Number(e.target.value) } : item);
                                                        setConstats(nc);
                                                    }}
                                                    className="w-24 px-1.5 py-0.5 rounded border border-border text-[10px]"
                                                    placeholder="Montant FCFA"
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={lancerRaisonnement}
                            disabled={loading}
                            className="w-full mt-3 py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-medium text-white transition flex items-center justify-center gap-2"
                        >
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                            Évaluer avec le moteur IA
                        </button>
                    </div>
                </div>

                {/* Résultats de l'analyse & Synthèse d'opinion */}
                <div className="md:col-span-2 space-y-4">
                    {bilan ? (
                        <>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-4 rounded-xl border border-border bg-card/40">
                                    <div className="text-xs text-muted-foreground">Risque Résiduel</div>
                                    <div className="text-2xl font-bold mt-1 text-foreground flex items-baseline gap-2">
                                        <span>{bilan.scoreRisqueResiduel}/100</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                            bilan.niveauRisque === "CRITIQUE" ? "bg-rose-500/20 text-rose-400" :
                                            bilan.niveauRisque === "ELEVE" ? "bg-amber-500/20 text-amber-400" :
                                            "bg-emerald-500/20 text-emerald-400"
                                        }`}>
                                            {bilan.niveauRisque}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl border border-border bg-card/40">
                                    <div className="text-xs text-muted-foreground">Anomalies Cumulées</div>
                                    <div className="text-lg font-bold mt-1 text-rose-400">
                                        {bilan.montantCumuleAnomaliesFCFA.toLocaleString("fr-FR")} FCFA
                                    </div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">
                                        {(bilan.ratioSurSeuilSignification * 100).toFixed(1)}% du seuil ISA 320
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl border border-border bg-card/40">
                                    <div className="text-xs text-muted-foreground">Opinion Proposée</div>
                                    <div className="text-sm font-bold mt-2 text-foreground">
                                        {bilan.opinionProposeePourCycle}
                                    </div>
                                </div>
                            </div>

                            {/* Couverture des assertions ISA 500 */}
                            <div className="p-4 rounded-xl border border-border bg-card/40 space-y-2">
                                <h3 className="text-xs font-semibold text-foreground">Couverture des Assertions d'Audit (ISA 500)</h3>
                                <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                                    {Object.entries(bilan.assertionsCouvertes).map(([assertion, val]: any) => (
                                        <div
                                            key={assertion}
                                            className={`p-2 rounded-lg border ${
                                                !val.couverte ? "bg-secondary/40 border-border text-muted-foreground" :
                                                val.conforme ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                                                "bg-rose-500/10 border-rose-500/30 text-rose-400"
                                            }`}
                                        >
                                            <div className="font-bold">{assertion}</div>
                                            <div className="mt-1">
                                                {!val.couverte ? "Non couverte" : val.conforme ? "Conforme" : `${val.anomalies} anomalie`}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recommandations de diligences complémentaires */}
                            {bilan.recommandationsDiligences.length > 0 && (
                                <div className="p-4 rounded-xl border border-border bg-card/40 space-y-2">
                                    <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                                        Diligences Complémentaires Recommandées ({bilan.recommandationsDiligences.length})
                                    </h3>
                                    <div className="space-y-1.5 text-[11px]">
                                        {bilan.recommandationsDiligences.map((r: any, i: number) => (
                                            <div key={i} className="p-2 rounded bg-background/50 border border-border flex items-start justify-between gap-2">
                                                <div>
                                                    <span className="font-semibold text-primary">[{r.assertion}]</span> {r.diligenceSuggeree}
                                                    <div className="text-[10px] text-muted-foreground mt-0.5">{r.referenceNormative}</div>
                                                </div>
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                                    r.priorite === "HAUTE" ? "bg-rose-500/20 text-rose-400" : "bg-secondary text-muted-foreground"
                                                }`}>
                                                    {r.priorite}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Conclusion rédigée prête pour le rapport */}
                            <div className="p-5 rounded-xl border border-border bg-card/40 space-y-2">
                                <h3 className="text-sm font-semibold text-foreground">
                                    Conclusion de Section d'Audit Rédigée (ISA 500 / ISA 700)
                                </h3>
                                <pre className="p-3.5 rounded-lg bg-background border border-border font-mono text-[11px] text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                    {bilan.conclusionRapportSection}
                                </pre>
                            </div>
                        </>
                    ) : (
                        <div className="h-full min-h-[350px] flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-xl text-center text-muted-foreground text-sm">
                            <Brain className="w-8 h-8 text-indigo-400/50 mb-3" />
                            <p>Renseignez les constats d'audit pour générer l'évaluation des assertions, le risque résiduel et la conclusion de section.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
