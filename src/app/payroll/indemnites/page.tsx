"use client";

import { useState, useCallback } from "react";
import {
    Calculator,
    UserMinus,
    FileText,
    Copy,
    CheckCircle2,
    Loader2,
    Calendar,
    Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaysFiscal } from "@/lib/tax-simulator";
import type {
    DonneesRuptureContrat,
    SoldeDeToutCompteDetail,
    MotifRupture,
    StatutSalarie
} from "@/lib/payroll/indemnites-rupture";

const f = (n: number) => n.toLocaleString("fr-FR") + " F CFA";

export default function IndemnitesRupturePage() {
    const [pays, setPays] = useState<PaysFiscal>("SN");
    const [nomSalarie, setNomSalarie] = useState("Mamadou Ndiaye");
    const [matricule, setMatricule] = useState("EMP-042");
    const [statut, setStatut] = useState<StatutSalarie>("CADRE_DIRIGEANT");
    const [motif, setMotif] = useState<MotifRupture>("LICENCIEMENT_MOTIF_PERSONNEL");

    const [dateEmbauche, setDateEmbauche] = useState("2018-03-01");
    const [dateFinContrat, setDateFinContrat] = useState(new Date().toISOString().split("T")[0]);

    const [salaireMoyen, setSalaireMoyen] = useState(1_250_000);
    const [dernierSalaire, setDernierSalaire] = useState(1_250_000);
    const [joursConges, setJoursConges] = useState(15);
    const [preavisEffectue, setPreavisEffectue] = useState(false);

    const [loading, setLoading] = useState(false);
    const [resultat, setResultat] = useState<SoldeDeToutCompteDetail | null>(null);
    const [error, setError] = useState("");
    const [copie, setCopie] = useState(false);

    const calculer = useCallback(async () => {
        setLoading(true);
        setError("");
        setResultat(null);

        const payload: DonneesRuptureContrat = {
            pays,
            nomSalarie,
            matricule: matricule || undefined,
            statut,
            dateEmbauche,
            dateFinContrat,
            motif,
            salaireMoyen12DerniersMois: salaireMoyen,
            dernierSalaireBrut: dernierSalaire,
            joursCongesRestants: joursConges,
            preavisEffectue,
        };

        try {
            const res = await fetch("/api/payroll/indemnites-rupture", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erreur de calcul");
            setResultat(data.resultat);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur inattendue");
        } finally {
            setLoading(false);
        }
    }, [pays, nomSalarie, matricule, statut, dateEmbauche, dateFinContrat, motif, salaireMoyen, dernierSalaire, joursConges, preavisEffectue]);

    const copierRecu = (texte: string) => {
        navigator.clipboard.writeText(texte);
        setCopie(true);
        setTimeout(() => setCopie(false), 2000);
    };

    return (
        <div className="space-y-8 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="page-title text-2xl font-bold tracking-tight flex items-center gap-2">
                    <UserMinus className="w-6 h-6 text-primary" />
                    Indemnités de Rupture de Contrat & Solde de Tout Compte
                </h1>
                <p className="page-subtitle text-xs text-muted-foreground mt-1">
                    Calcul légal des indemnités de licenciement, préavis et congés payés selon le Code du Travail et les barèmes de la CCNI.
                </p>
            </div>

            {/* Formulaire salarié & contrat */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">1</span>
                            Salarié & Motif de Rupture
                        </h2>
                        <select
                            value={pays}
                            onChange={(e) => setPays(e.target.value as PaysFiscal)}
                            className="bg-background border border-border rounded-lg px-2 py-1 text-xs"
                        >
                            <option value="SN">Sénégal (CCNI Sénégal)</option>
                            <option value="CI">Côte d&apos;Ivoire (CCNI Côte d&apos;Ivoire)</option>
                            <option value="CM">Cameroun</option>
                            <option value="BJ">Bénin</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                            <label className="block text-muted-foreground mb-1 font-medium">Nom complet</label>
                            <input
                                type="text"
                                value={nomSalarie}
                                onChange={(e) => setNomSalarie(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-muted-foreground mb-1 font-medium">Matricule</label>
                            <input
                                type="text"
                                value={matricule}
                                onChange={(e) => setMatricule(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-muted-foreground mb-1 font-medium">Statut / Catégorie</label>
                            <select
                                value={statut}
                                onChange={(e) => setStatut(e.target.value as StatutSalarie)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                            >
                                <option value="CADRE_DIRIGEANT">Cadre / Cadre Supérieur (3 mois préavis)</option>
                                <option value="AGENT_MAITRISE">Agent de Maîtrise / Technicien (2 mois préavis)</option>
                                <option value="OUVRIER_EMPLOYE">Ouvrier / Employé (1 mois préavis)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-muted-foreground mb-1 font-medium">Motif de la rupture</label>
                            <select
                                value={motif}
                                onChange={(e) => setMotif(e.target.value as MotifRupture)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                            >
                                <option value="LICENCIEMENT_MOTIF_PERSONNEL">Licenciement (motif personnel non fautif)</option>
                                <option value="LICENCIEMENT_ECONOMIQUE">Licenciement économique (+20% majoration)</option>
                                <option value="RUPTURE_CONVENTIONNELLE">Rupture conventionnelle négociée</option>
                                <option value="DEPART_RETRAITE">Départ à la retraite</option>
                                <option value="DEMISSION">Démission (pas d&apos;indemnité de licenciement)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-muted-foreground mb-1 font-medium">Date d&apos;embauche</label>
                            <input
                                type="date"
                                value={dateEmbauche}
                                onChange={(e) => setDateEmbauche(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-muted-foreground mb-1 font-medium">Date de fin de contrat</label>
                            <input
                                type="date"
                                value={dateFinContrat}
                                onChange={(e) => setDateFinContrat(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">2</span>
                        Rémunération & Préavis
                    </h2>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                            <label className="block text-muted-foreground mb-1 font-medium">Salaire Brut Moyen (12 derniers mois)</label>
                            <input
                                type="number"
                                value={salaireMoyen}
                                onChange={(e) => setSalaireMoyen(Number(e.target.value))}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-muted-foreground mb-1 font-medium">Dernier Salaire Brut</label>
                            <input
                                type="number"
                                value={dernierSalaire}
                                onChange={(e) => setDernierSalaire(Number(e.target.value))}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-muted-foreground mb-1 font-medium">Jours de congés payés restants</label>
                            <input
                                type="number"
                                value={joursConges}
                                onChange={(e) => setJoursConges(Number(e.target.value))}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-muted-foreground mb-1 font-medium">Situation du préavis</label>
                            <select
                                value={preavisEffectue ? "true" : "false"}
                                onChange={(e) => setPreavisEffectue(e.target.value === "true")}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                            >
                                <option value="false">Préavis NON effectué (Payé par l&apos;employeur)</option>
                                <option value="true">Préavis effectué et travaillé</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action */}
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={calculer}
                    disabled={loading}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
                    Calculer le Solde de Tout Compte
                </button>
                {error && <span className="text-xs text-red-400">{error}</span>}
            </div>

            {/* Résultat */}
            {resultat && (
                <div className="space-y-6 pt-4 border-t border-border">
                    {/* KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-card/60 border border-border p-4 rounded-xl">
                            <span className="text-xs text-muted-foreground uppercase font-medium">Ancienneté Retenue</span>
                            <p className="text-xl font-bold text-foreground mt-1">
                                {resultat.ancienneteAnnees} ans et {resultat.ancienneteMois} mois
                            </p>
                        </div>
                        <div className="bg-card/60 border border-border p-4 rounded-xl">
                            <span className="text-xs text-muted-foreground uppercase font-medium">Indemnité de Licenciement</span>
                            <p className="text-xl font-bold text-foreground mt-1">{f(resultat.indemniteDepart)}</p>
                            <span className="text-[10px] text-emerald-400 font-medium">100% Exonérée d&apos;impôt</span>
                        </div>
                        <div className="bg-card/60 border border-border p-4 rounded-xl">
                            <span className="text-xs text-muted-foreground uppercase font-medium">Indemnité Préavis + Congés</span>
                            <p className="text-xl font-bold text-amber-400 mt-1">
                                {f(resultat.indemnitePreavis + resultat.indemniteCongesPayes)}
                            </p>
                            <span className="text-[10px] text-muted-foreground">Soumis à retenues</span>
                        </div>
                        <div className="bg-card/60 border border-border p-4 rounded-xl">
                            <span className="text-xs text-muted-foreground uppercase font-medium">Net à Payer Salarié</span>
                            <p className="text-2xl font-bold text-emerald-400 mt-1">{f(resultat.netAPayerSolde)}</p>
                            <span className="text-[10px] text-muted-foreground">Brut total : {f(resultat.totalBrutRupture)}</span>
                        </div>
                    </div>

                    {/* Décomposition des tranches CCNI & Reçu */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                            <h3 className="text-sm font-semibold flex items-center justify-between">
                                <span>Paliers de calcul CCNI</span>
                                <span className="text-xs text-muted-foreground">Salaire Réf : {f(resultat.salaireReferenceBrut)}</span>
                            </h3>

                            <div className="space-y-2 text-xs">
                                {resultat.detailTranches.map((t, i) => (
                                    <div key={i} className="flex items-center justify-between p-2.5 bg-background border border-border rounded-lg">
                                        <div>
                                            <span className="font-semibold text-foreground">{t.tranche}</span>
                                            <span className="text-muted-foreground ml-2">({t.anneesDansTranche} an(s) à {t.tauxPourcentage}%)</span>
                                        </div>
                                        <span className="font-mono font-bold text-foreground">{f(t.montantTranche)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Reçu formel */}
                        <div className="bg-card/40 border border-border rounded-xl p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-primary" />
                                    Reçu pour Solde de Tout Compte
                                </h3>
                                <button
                                    onClick={() => copierRecu(resultat.recuPourSoldeTexte)}
                                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                    {copie ? "Copié !" : "Copier"}
                                </button>
                            </div>
                            <pre className="p-3 bg-background border border-border rounded-lg text-[11px] font-mono whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed">
                                {resultat.recuPourSoldeTexte}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
