"use client";

import { useState, useCallback } from "react";
import {
    ShieldAlert,
    AlertTriangle,
    CheckCircle2,
    TrendingUp,
    PlusCircle,
    Trash2,
    Loader2,
    Calendar,
    HelpCircle,
    Info,
    FileCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaysFiscal } from "@/lib/tax-simulator";
import type { DonneesAuditFiscal, SyntheseAuditFiscalAvance, GraviteAnomalie } from "@/lib/ohada/audit-fiscal-avance";

interface VehiculeInput {
    id: string;
    immatriculation: string;
    prixAcquisitionTTC: number;
    tauxAmortissementAnnuel: number;
    dotationComptabilisee: number;
}

const f = (n: number) => n.toLocaleString("fr-FR") + " F CFA";

export default function MatriceRisquesFiscauxPage() {
    const [pays, setPays] = useState<PaysFiscal>("SN");
    const [exercice, setExercice] = useState(new Date().getFullYear() - 1);
    const [chiffreAffairesHT, setChiffreAffairesHT] = useState(500_000_000);
    const [beneficeAvantFraisSiege, setBeneficeAvantFraisSiege] = useState(45_000_000);
    const [capitalSocialTotal, setCapitalSocialTotal] = useState(100_000_000);
    const [capitalSocialLibere, setCapitalSocialLibere] = useState(100_000_000);

    // CCA
    const [soldeMoyenCCA, setSoldeMoyenCCA] = useState(20_000_000);
    const [tauxInteretCCA, setTauxInteretCCA] = useState(7.5);
    const [tauxBCEAOMax, setTauxBCEAOMax] = useState(5.5);

    // Frais de siège
    const [fraisDeSiege, setFraisDeSiege] = useState(6_000_000);

    // Dons
    const [dons, setDons] = useState(3_500_000);

    // Véhicules
    const [vehicules, setVehicules] = useState<VehiculeInput[]>([
        {
            id: "1",
            immatriculation: "DK-1234-AB",
            prixAcquisitionTTC: 25_000_000,
            tauxAmortissementAnnuel: 20,
            dotationComptabilisee: 5_000_000
        }
    ]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [synthese, setSynthese] = useState<SyntheseAuditFiscalAvance | null>(null);

    const ajouterVehicule = () => {
        setVehicules(prev => [
            ...prev,
            {
                id: Date.now().toString(),
                immatriculation: "",
                prixAcquisitionTTC: 20_000_000,
                tauxAmortissementAnnuel: 20,
                dotationComptabilisee: 4_000_000
            }
        ]);
    };

    const supprimerVehicule = (id: string) => {
        setVehicules(prev => prev.filter(v => v.id !== id));
    };

    const majVehicule = (id: string, field: keyof VehiculeInput, value: string | number) => {
        setVehicules(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
    };

    const lancerAudit = useCallback(async () => {
        setLoading(true);
        setError("");
        setSynthese(null);

        const payload: DonneesAuditFiscal = {
            pays,
            exercice,
            chiffreAffairesHT,
            beneficeAvantFraisSiege,
            capitalSocialTotal,
            capitalSocialLibere,
            comptesCourants: {
                soldeMoyenAnnuel: soldeMoyenCCA,
                tauxInteretApplique: tauxInteretCCA,
                tauxBCEAOMax: tauxBCEAOMax
            },
            fraisDeSiegeComptabilises: fraisDeSiege,
            vehiculesTourisme: vehicules.map(v => ({
                immatriculation: v.immatriculation || "NON_RENSEIGNE",
                prixAcquisitionTTC: v.prixAcquisitionTTC,
                tauxAmortissementAnnuel: v.tauxAmortissementAnnuel,
                dotationComptabilisee: v.dotationComptabilisee
            })),
            donsComptabilises: dons
        };

        try {
            const res = await fetch("/api/fiscalite/matrice-risques", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erreur lors du calcul de la matrice");
            setSynthese(data.synthese);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur inattendue");
        } finally {
            setLoading(false);
        }
    }, [pays, exercice, chiffreAffairesHT, beneficeAvantFraisSiege, capitalSocialTotal, capitalSocialLibere, soldeMoyenCCA, tauxInteretCCA, tauxBCEAOMax, fraisDeSiege, vehicules, dons]);

    const badgeGravite = (gravite: GraviteAnomalie) => {
        switch (gravite) {
            case "CRITIQUE":
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-950/80 text-red-300 border border-red-800">CRITIQUE</span>;
            case "ELEVE":
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800">ÉLEVÉ</span>;
            case "MODERE":
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-yellow-950/80 text-yellow-300 border border-yellow-800">MODÉRÉ</span>;
            default:
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800">FAIBLE</span>;
        }
    };

    const badgeRisqueGlobal = (statut: string) => {
        switch (statut) {
            case "CRITIQUE":
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-500/20 text-red-400 border border-red-500/40">RISQUE CRITIQUE</span>;
            case "ELEVE":
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">RISQUE ÉLEVÉ</span>;
            case "MODERE":
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">RISQUE MODÉRÉ</span>;
            default:
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">RISQUE FAIBLE</span>;
        }
    };

    return (
        <div className="space-y-8 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="page-title text-2xl font-bold tracking-tight">Matrice des Risques Fiscaux</h1>
                <p className="page-subtitle text-sm text-muted-foreground mt-1">
                    Audit fiscal approfondi UEMOA / OHADA : intérêts CCA, plafonnement frais de siège, amortissements véhicules de tourisme, dons et prescription.
                </p>
            </div>

            {/* Formulaire des données d'audit */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Général & CCA */}
                <div className="space-y-6">
                    <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">1</span>
                            Société & Paramètres Généraux
                        </h2>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">Pays fiscal</label>
                                <select
                                    value={pays}
                                    onChange={(e) => setPays(e.target.value as PaysFiscal)}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-primary"
                                >
                                    <option value="SN">Sénégal (SN - IS 30%)</option>
                                    <option value="CI">Côte d&apos;Ivoire (CI - IS 25%)</option>
                                    <option value="CM">Cameroun (CM - IS 30%)</option>
                                    <option value="BJ">Bénin (BJ - IS 25%)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">Exercice fiscal</label>
                                <input
                                    type="number"
                                    value={exercice}
                                    onChange={(e) => setExercice(Number(e.target.value))}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">CA Annuel HT (FCFA)</label>
                                <input
                                    type="number"
                                    value={chiffreAffairesHT}
                                    onChange={(e) => setChiffreAffairesHT(Number(e.target.value))}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">Bénéfice avant frais de siège</label>
                                <input
                                    type="number"
                                    value={beneficeAvantFraisSiege}
                                    onChange={(e) => setBeneficeAvantFraisSiege(Number(e.target.value))}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">Capital social total</label>
                                <input
                                    type="number"
                                    value={capitalSocialTotal}
                                    onChange={(e) => setCapitalSocialTotal(Number(e.target.value))}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">Capital libéré (100% requis CCA)</label>
                                <input
                                    type="number"
                                    value={capitalSocialLibere}
                                    onChange={(e) => setCapitalSocialLibere(Number(e.target.value))}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Comptes Courants d'Associés */}
                    <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">2</span>
                            Comptes Courants d&apos;Associés (CCA)
                        </h2>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">Solde moyen annuel</label>
                                <input
                                    type="number"
                                    value={soldeMoyenCCA}
                                    onChange={(e) => setSoldeMoyenCCA(Number(e.target.value))}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">Taux intérêt appliqué (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={tauxInteretCCA}
                                    onChange={(e) => setTauxInteretCCA(Number(e.target.value))}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">Plafond BCEAO (réf + 2%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={tauxBCEAOMax}
                                    onChange={(e) => setTauxBCEAOMax(Number(e.target.value))}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Frais siège, Dons & Véhicules */}
                <div className="space-y-6">
                    <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">3</span>
                            Frais de Siège & Dons
                        </h2>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">Frais de siège comptabilisés</label>
                                <input
                                    type="number"
                                    value={fraisDeSiege}
                                    onChange={(e) => setFraisDeSiege(Number(e.target.value))}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">Dons & libéralités (comptabilisés)</label>
                                <input
                                    type="number"
                                    value={dons}
                                    onChange={(e) => setDons(Number(e.target.value))}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Véhicules de tourisme */}
                    <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">4</span>
                                Véhicules de Tourisme (Plafonds déductibilité)
                            </h2>
                            <button
                                type="button"
                                onClick={ajouterVehicule}
                                className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
                            >
                                <PlusCircle className="h-3.5 w-3.5" />
                                Ajouter un véhicule
                            </button>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {vehicules.length === 0 ? (
                                <p className="text-xs text-muted-foreground italic">Aucun véhicule de tourisme renseigné.</p>
                            ) : (
                                vehicules.map((v) => (
                                    <div key={v.id} className="grid grid-cols-12 gap-2 items-center bg-background/50 border border-border p-2 rounded-lg text-xs">
                                        <div className="col-span-3">
                                            <input
                                                type="text"
                                                placeholder="Immatriculation"
                                                value={v.immatriculation}
                                                onChange={(e) => majVehicule(v.id, "immatriculation", e.target.value)}
                                                className="w-full bg-background border border-border rounded px-2 py-1 text-xs"
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <input
                                                type="number"
                                                placeholder="Prix TTC"
                                                value={v.prixAcquisitionTTC}
                                                onChange={(e) => majVehicule(v.id, "prixAcquisitionTTC", Number(e.target.value))}
                                                className="w-full bg-background border border-border rounded px-2 py-1 text-xs"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="number"
                                                placeholder="Taux %"
                                                value={v.tauxAmortissementAnnuel}
                                                onChange={(e) => majVehicule(v.id, "tauxAmortissementAnnuel", Number(e.target.value))}
                                                className="w-full bg-background border border-border rounded px-2 py-1 text-xs"
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <input
                                                type="number"
                                                placeholder="Dotation"
                                                value={v.dotationComptabilisee}
                                                onChange={(e) => majVehicule(v.id, "dotationComptabilisee", Number(e.target.value))}
                                                className="w-full bg-background border border-border rounded px-2 py-1 text-xs"
                                            />
                                        </div>
                                        <div className="col-span-1 text-center">
                                            <button
                                                type="button"
                                                onClick={() => supprimerVehicule(v.id)}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={lancerAudit}
                    disabled={loading}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
                    Exécuter l&apos;audit fiscal approfondi
                </button>
                {error && <span className="text-xs text-red-400 font-medium">{error}</span>}
            </div>

            {/* Résultats de l'audit */}
            {synthese && (
                <div className="space-y-6 pt-4 border-t border-border">
                    {/* Synthèse des risques & KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-card/60 border border-border p-4 rounded-xl space-y-1">
                            <span className="text-xs text-muted-foreground uppercase font-medium">Niveau d&apos;exposition</span>
                            <div className="pt-2">{badgeRisqueGlobal(synthese.statutRisqueFiscal)}</div>
                        </div>

                        <div className="bg-card/60 border border-border p-4 rounded-xl space-y-1">
                            <span className="text-xs text-muted-foreground uppercase font-medium">Réintégrations Fiscales</span>
                            <p className="text-xl font-bold text-foreground">{f(synthese.totalReintegrationsFiscale)}</p>
                            <span className="text-xs text-muted-foreground">Base taxable additionnelle</span>
                        </div>

                        <div className="bg-card/60 border border-border p-4 rounded-xl space-y-1">
                            <span className="text-xs text-muted-foreground uppercase font-medium">Rappel d&apos;IS Estimé</span>
                            <p className="text-xl font-bold text-amber-400">{f(synthese.totalRappelImpotEstime)}</p>
                            <span className="text-xs text-muted-foreground">Taux IS appliqué : {(synthese.tauxISApplique * 100).toFixed(0)}%</span>
                        </div>

                        <div className="bg-card/60 border border-border p-4 rounded-xl space-y-1">
                            <span className="text-xs text-muted-foreground uppercase font-medium">Exposition Globale</span>
                            <p className="text-xl font-bold text-red-400">{f(synthese.expositionGlobale)}</p>
                            <span className="text-xs text-muted-foreground">Dont pénalités : {f(synthese.totalPenalitesEstimees)}</span>
                        </div>
                    </div>

                    {/* Matrice détaillée des anomalies */}
                    <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                        <h3 className="text-base font-semibold text-foreground flex items-center justify-between">
                            <span>Anomalies et Risques Détectés ({synthese.anomalies.length})</span>
                            <span className="text-xs font-normal text-muted-foreground">Références légales CGI & Actes Uniformes</span>
                        </h3>

                        {synthese.anomalies.length === 0 ? (
                            <div className="flex items-center gap-3 p-4 bg-emerald-950/30 border border-emerald-900 rounded-lg text-emerald-400 text-xs">
                                <CheckCircle2 className="h-5 w-5 shrink-0" />
                                <span>Aucune anomalie fiscale détectée sur les périmètres CCA, frais de siège, véhicules et libéralités.</span>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {synthese.anomalies.map((anomalie) => (
                                    <div
                                        key={anomalie.code}
                                        className="p-4 rounded-lg border border-border bg-background/60 space-y-2 text-xs"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    {badgeGravite(anomalie.gravite)}
                                                    <span className="font-semibold text-foreground">{anomalie.description}</span>
                                                    <span className="text-muted-foreground">({anomalie.code})</span>
                                                </div>
                                                <p className="text-muted-foreground">
                                                    Base de réintégration : <strong className="text-foreground">{f(anomalie.montantReintegrationFiscale)}</strong> | Rappel IS : <strong className="text-amber-400">{f(anomalie.rappelImpotEstime)}</strong> (Pénalités : {f(anomalie.penalitesEstimees)})
                                                </p>
                                            </div>
                                            <span className="text-xs font-mono bg-muted/30 border border-border px-2 py-1 rounded text-primary shrink-0">
                                                {anomalie.referenceLegale}
                                            </span>
                                        </div>
                                        <div className="bg-primary/5 border border-primary/20 rounded p-2 text-foreground/90 mt-2">
                                            <strong>Recommandation du cabinet :</strong> {anomalie.recommandationExpert}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Prescription fiscale */}
                    <div className="bg-card/40 border border-border rounded-xl p-5 space-y-3">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            Contrôle & Délais de Prescription Fiscale
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            {synthese.prescriptionFiscale.description}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                            {synthese.prescriptionFiscale.anneesNonPrescrites.map((an) => (
                                <span
                                    key={an}
                                    className="px-2.5 py-1 rounded bg-muted text-foreground font-mono text-xs border border-border"
                                >
                                    Exercice {an} {an === exercice ? "(En cours d'audit)" : "(Auditable)"}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
