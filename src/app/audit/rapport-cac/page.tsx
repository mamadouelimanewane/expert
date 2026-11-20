"use client";

import { useState, useCallback } from "react";
import {
    FileCheck2,
    ShieldCheck,
    AlertOctagon,
    AlertTriangle,
    PlusCircle,
    Trash2,
    Copy,
    CheckCircle2,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
    DonneesRapportCAC,
    RapportCACResult,
    OpinionCAC,
    KeyAuditMatter,
    ReserveAudit
} from "@/lib/ohada/audit-rapport-cac";

export default function RapportCACPage() {
    const [denomination, setDenomination] = useState("AGRO-INDUSTRIES SAHEL SA");
    const [forme, setForme] = useState("Société Anonyme");
    const [rccm, setRccm] = useState("SN-DKR-2015-B-1122");
    const [siege, setSiege] = useState("Zone Industrielle de Dakar");
    const [capital, setCapital] = useState(500_000_000);
    const [exerciceClos, setExerciceClos] = useState("31 décembre 2025");

    const [ca, setCa] = useState(4_500_000_000);
    const [resultatNet, setResultatNet] = useState(280_000_000);
    const [totalBilan, setTotalBilan] = useState(3_200_000_000);

    const [opinion, setOpinion] = useState<OpinionCAC>("CERTIFICATION_SANS_RESERVE");

    // KAM
    const [kams, setKams] = useState<KeyAuditMatter[]>([
        {
            titre: "Évaluation et dépréciation des stocks",
            risqueIdentifie: "Risque de surévaluation sur les stocks à rotation lente",
            reponseAuditApportee: "Test des coûts unitaires moyens pondérés et rapprochement avec l'inventaire physique contradictoire",
        }
    ]);

    // Réserves
    const [reserves, setReserves] = useState<ReserveAudit[]>([]);

    const [loading, setLoading] = useState(false);
    const [resultat, setResultat] = useState<RapportCACResult | null>(null);
    const [copieGen, setCopieGen] = useState(false);
    const [copieSpe, setCopieSpe] = useState(false);

    const ajouterKAM = () => {
        setKams(prev => [...prev, { titre: "", risqueIdentifie: "", reponseAuditApportee: "" }]);
    };

    const majKAM = (idx: number, field: keyof KeyAuditMatter, val: string) => {
        setKams(prev => prev.map((k, i) => i === idx ? { ...k, [field]: val } : k));
    };

    const supprimerKAM = (idx: number) => {
        setKams(prev => prev.filter((_, i) => i !== idx));
    };

    const ajouterReserve = () => {
        setReserves(prev => [...prev, { titre: "", motif: "", incidenceChiffree: 0 }]);
    };

    const majReserve = (idx: number, field: keyof ReserveAudit, val: string | number) => {
        setReserves(prev => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r));
    };

    const supprimerReserve = (idx: number) => {
        setReserves(prev => prev.filter((_, i) => i !== idx));
    };

    const genererRapport = useCallback(async () => {
        setLoading(true);
        setResultat(null);

        const payload: DonneesRapportCAC = {
            societe: {
                denomination,
                formeJuridique: forme,
                rccm,
                siegeSocial: siege,
                capitalSocial: capital,
            },
            exerciceClos,
            chiffreAffaires: ca,
            resultatNet,
            totalBilan,
            opinion,
            reserves,
            pointsClesAudit: kams.filter(k => k.titre.trim() !== ""),
            conventionsReglementeesMentionnees: [
                {
                    beneficiaire: "Société Holding Africaine",
                    natureConvention: "Contrat de prestations d'assistance technique",
                    montantExercice: 45_000_000,
                    autorisationPrealableConseil: true,
                }
            ],
            cabinet: {
                denomination: "Cabinet 360 Audit & Advisory",
                ville: "Dakar",
                associeSignataire: "Mamadou Sow, Expert-Comptable Associé",
                ordreNational: "ONECCA Sénégal",
            },
            dateRapport: new Date().toISOString().split("T")[0],
        };

        try {
            const res = await fetch("/api/audit/rapport-cac", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.ok) setResultat(data.resultat);
        } catch {} finally {
            setLoading(false);
        }
    }, [denomination, forme, rccm, siege, capital, exerciceClos, ca, resultatNet, totalBilan, opinion, reserves, kams]);

    const copier = (texte: string, isGen: boolean) => {
        navigator.clipboard.writeText(texte);
        if (isGen) {
            setCopieGen(true);
            setTimeout(() => setCopieGen(false), 2000);
        } else {
            setCopieSpe(true);
            setTimeout(() => setCopieSpe(false), 2000);
        }
    };

    return (
        <div className="space-y-8 p-6 max-w-7xl mx-auto">
            <div>
                <h1 className="page-title text-2xl font-bold tracking-tight flex items-center gap-2">
                    <FileCheck2 className="w-6 h-6 text-primary" />
                    Rapports du Commissaire aux Comptes (ISA 700 / 705 / 706 & AUSCGIE)
                </h1>
                <p className="page-subtitle text-xs text-muted-foreground mt-1">
                    Générateur certifié des rapports annuels de CAC : rapport général d&apos;opinion avec Points Clés d&apos;Audit (KAM) et rapport spécial des conventions réglementées.
                </p>
            </div>

            {/* Formulaire entité & opinion */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">1</span>
                        Entité Auditée & Données de Clôture
                    </h2>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="col-span-2">
                            <label className="block text-muted-foreground mb-1 font-medium">Dénomination sociale</label>
                            <input
                                type="text"
                                value={denomination}
                                onChange={(e) => setDenomination(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-muted-foreground mb-1 font-medium">Forme juridique</label>
                            <input
                                type="text"
                                value={forme}
                                onChange={(e) => setForme(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-muted-foreground mb-1 font-medium">RCCM</label>
                            <input
                                type="text"
                                value={rccm}
                                onChange={(e) => setRccm(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-muted-foreground mb-1 font-medium">Total Bilan (FCFA)</label>
                            <input
                                type="number"
                                value={totalBilan}
                                onChange={(e) => setTotalBilan(Number(e.target.value))}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-muted-foreground mb-1 font-medium">Chiffre d&apos;Affaires HT</label>
                            <input
                                type="number"
                                value={ca}
                                onChange={(e) => setCa(Number(e.target.value))}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">2</span>
                        Opinion du Commissaire aux Comptes (ISA 700 / 705)
                    </h2>

                    <div>
                        <label className="block text-xs text-muted-foreground mb-1 font-medium">Type d&apos;opinion formulée</label>
                        <select
                            value={opinion}
                            onChange={(e) => setOpinion(e.target.value as OpinionCAC)}
                            className="w-full bg-background border border-border rounded-lg px-2.5 py-2 text-xs font-semibold"
                        >
                            <option value="CERTIFICATION_SANS_RESERVE">Certification sans réserve (Image fidèle et sincère)</option>
                            <option value="CERTIFICATION_AVEC_RESERVES">Certification avec réserves (Désaccord ou limitation circonscrite)</option>
                            <option value="REFUS_DE_CERTIFIER">Refus de certifier (Désaccord profond et généralisé)</option>
                            <option value="IMPOSSIBILITE_DE_CONCLURE">Impossibilité d&apos;exprimer une opinion (Limitation majeure)</option>
                        </select>
                    </div>

                    {opinion === "CERTIFICATION_AVEC_RESERVES" && (
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-foreground">Réserves à formuler</span>
                                <button
                                    onClick={ajouterReserve}
                                    type="button"
                                    className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                                >
                                    <PlusCircle className="w-3.5 h-3.5" /> Ajouter réserve
                                </button>
                            </div>
                            {reserves.map((r, i) => (
                                <div key={i} className="p-2.5 bg-background border border-border rounded-lg text-xs space-y-2">
                                    <div className="flex items-center justify-between">
                                        <input
                                            type="text"
                                            placeholder="Titre de la réserve"
                                            value={r.titre}
                                            onChange={(e) => majReserve(i, "titre", e.target.value)}
                                            className="w-3/4 bg-muted/40 border border-border rounded px-2 py-1 text-xs"
                                        />
                                        <button onClick={() => supprimerReserve(i)} className="text-red-400">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <textarea
                                        rows={2}
                                        placeholder="Motif détaillé du désaccord et incidence sur les comptes..."
                                        value={r.motif}
                                        onChange={(e) => majReserve(i, "motif", e.target.value)}
                                        className="w-full bg-muted/40 border border-border rounded px-2 py-1 text-xs"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* KAM (Points clés d'audit ISA 701) */}
            <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        Justification des Appréciations & Points Clés d&apos;Audit (ISA 701)
                    </h2>
                    <button
                        onClick={ajouterKAM}
                        type="button"
                        className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                    >
                        <PlusCircle className="w-3.5 h-3.5" /> Ajouter un point clé (KAM)
                    </button>
                </div>

                <div className="space-y-3">
                    {kams.map((k, idx) => (
                        <div key={idx} className="p-3 bg-background border border-border rounded-lg text-xs space-y-2">
                            <div className="flex items-center justify-between">
                                <input
                                    type="text"
                                    placeholder="Titre du point clé (ex: Évaluation des immobilisations)"
                                    value={k.titre}
                                    onChange={(e) => majKAM(idx, "titre", e.target.value)}
                                    className="w-2/3 bg-background border border-border rounded px-2 py-1 text-xs font-semibold"
                                />
                                <button onClick={() => supprimerKAM(idx)} className="text-red-400">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <textarea
                                    rows={2}
                                    placeholder="Risque d'anomalie significative identifié..."
                                    value={k.risqueIdentifie}
                                    onChange={(e) => majKAM(idx, "risqueIdentifie", e.target.value)}
                                    className="bg-muted/30 border border-border rounded p-2 text-xs"
                                />
                                <textarea
                                    rows={2}
                                    placeholder="Procédures et réponses d'audit mises en œuvre..."
                                    value={k.reponseAuditApportee}
                                    onChange={(e) => majKAM(idx, "reponseAuditApportee", e.target.value)}
                                    className="bg-muted/30 border border-border rounded p-2 text-xs"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action */}
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={genererRapport}
                    disabled={loading}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck2 className="h-4 w-4" />}
                    Générer les Rapports Général & Spécial de CAC
                </button>
            </div>

            {/* Résultats */}
            {resultat && (
                <div className="space-y-6 pt-4 border-t border-border">
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-xs font-semibold flex items-center justify-between">
                        <span>Synthèse de l&apos;opinion : <strong>{resultat.syntheseOpinion}</strong></span>
                        <span className="font-mono text-muted-foreground">{resultat.referencesLegales[0]}</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Rapport Général */}
                        <div className="bg-card/40 border border-border rounded-xl p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold">Rapport Général sur les Comptes Annuels</h3>
                                <button
                                    onClick={() => copier(resultat.rapportGeneralTexte, true)}
                                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                    {copieGen ? "Copié !" : "Copier"}
                                </button>
                            </div>
                            <pre className="p-3 bg-background border border-border rounded-lg text-[11px] font-mono whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                                {resultat.rapportGeneralTexte}
                            </pre>
                        </div>

                        {/* Rapport Spécial */}
                        <div className="bg-card/40 border border-border rounded-xl p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold">Rapport Spécial Conventions Réglementées</h3>
                                <button
                                    onClick={() => copier(resultat.rapportSpecialConventionsTexte, false)}
                                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                    {copieSpe ? "Copié !" : "Copier"}
                                </button>
                            </div>
                            <pre className="p-3 bg-background border border-border rounded-lg text-[11px] font-mono whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                                {resultat.rapportSpecialConventionsTexte}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
