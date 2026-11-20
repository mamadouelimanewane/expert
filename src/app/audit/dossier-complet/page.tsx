"use client";

import { useState } from "react";
import { FolderLock, ShieldCheck, FileCheck, AlertCircle, Plus, CheckCircle2, Lock, RefreshCw } from "lucide-react";

export default function DossierCompletAuditPage() {
    const [entite, setEntite] = useState("COMPAGNIE INDUSTRIELLE SAHEL SA");
    const [exercice, setExercice] = useState(2024);
    const [seuilSignification, setSeuilSignification] = useState(30000000);
    const [signataire, setSignataire] = useState("Amadou Diallo (Associé Gérant)");

    const [loading, setLoading] = useState(false);
    const [dossier, setDossier] = useState<any>(null);
    const [bilan, setBilan] = useState<any>(null);
    const [scellement, setScellement] = useState<any>(null);

    const initialiser = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/audit/dossier-complet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "INITIALISER",
                    entite,
                    exercice: Number(exercice),
                    seuilSignification: Number(seuilSignification),
                }),
            });
            const data = await res.json();
            if (data.dossier) {
                setDossier(data.dossier);
                setBilan(data.bilan);
                setScellement(null);
            }
        } catch (err) {
            console.error("Erreur initialisation dossier:", err);
        } finally {
            setLoading(false);
        }
    };

    const simulerAjoutFeuille = async (secCode: string) => {
        if (!dossier) return;
        setLoading(true);
        try {
            const feuilleMock = {
                id: `FT-${Date.now().toString().slice(-4)}`,
                reference: `${secCode}.${Math.floor(Math.random() * 90) + 10}.1`,
                titre: `Feuille de contrôle et diligences ${secCode}`,
                objectifs: "Validation des soldes et examen des pièces justificatives",
                assertions: ["EXISTENCE", "EVALUATION"],
                conclusions: "Diligences satisfaisantes, contrôles probants sans anomalie significative.",
                redacteur: "Auditeur Senior",
                statut: "VALIDE",
                anomaliesDetectees: 0,
                montantAnomaliesFCFA: 0,
            };

            const res = await fetch("/api/audit/dossier-complet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "AJOUTER_FEUILLE",
                    dossier,
                    sectionCode: secCode,
                    feuille: feuilleMock,
                }),
            });
            const data = await res.json();
            if (data.dossier) {
                setDossier(data.dossier);
                setBilan(data.bilan);
            }
        } catch (err) {
            console.error("Erreur ajout feuille:", err);
        } finally {
            setLoading(false);
        }
    };

    const sceller = async () => {
        if (!dossier) return;
        setLoading(true);
        try {
            const res = await fetch("/api/audit/dossier-complet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "SCELLER",
                    dossier,
                    signataire,
                }),
            });
            const data = await res.json();
            if (data.scelle) {
                setScellement(data.scelle);
            }
        } catch (err) {
            console.error("Erreur scellement:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <FolderLock className="w-6 h-6 text-emerald-400" />
                    <h1 className="page-title text-2xl font-bold tracking-tight">Dossier de Travail CAC ISA 230 & Scellement</h1>
                </div>
                <p className="page-subtitle text-sm text-muted-foreground">
                    Arborescence normative des papiers de travail, contrôle de complétude d'opinion et scellement d'intégrité SHA-256.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Configuration de la mission d'audit */}
                <div className="md:col-span-1 bg-card/40 border border-border rounded-xl p-5 space-y-4">
                    <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-primary" />
                        Paramètres de la Mission
                    </h2>

                    <div className="space-y-3 text-xs">
                        <div>
                            <label className="text-muted-foreground">Raison sociale de l'entité auditée</label>
                            <input
                                type="text"
                                value={entite}
                                onChange={(e) => setEntite(e.target.value)}
                                className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-muted-foreground">Exercice clos</label>
                                <input
                                    type="number"
                                    value={exercice}
                                    onChange={(e) => setExercice(Number(e.target.value))}
                                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"
                                />
                            </div>
                            <div>
                                <label className="text-muted-foreground">Seuil ISA 320 (FCFA)</label>
                                <input
                                    type="number"
                                    value={seuilSignification}
                                    onChange={(e) => setSeuilSignification(Number(e.target.value))}
                                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background font-semibold text-emerald-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-muted-foreground">Commissaire aux Comptes signataire</label>
                            <input
                                type="text"
                                value={signataire}
                                onChange={(e) => setSignataire(e.target.value)}
                                className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"
                            />
                        </div>

                        <button
                            onClick={initialiser}
                            disabled={loading}
                            className="w-full mt-3 py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium text-white transition flex items-center justify-center gap-2"
                        >
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FolderLock className="w-4 h-4" />}
                            Initialiser le dossier ISA 230
                        </button>

                        {dossier && (
                            <button
                                onClick={sceller}
                                disabled={loading}
                                className="w-full mt-2 py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-medium text-white transition flex items-center justify-center gap-2"
                            >
                                <Lock className="w-4 h-4" />
                                Sceller le dossier & Certificat SHA-256
                            </button>
                        )}
                    </div>
                </div>

                {/* Arborescence & Sections du dossier */}
                <div className="md:col-span-2 space-y-4">
                    {dossier ? (
                        <>
                            {/* KPI de complétude */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-4 rounded-xl border border-border bg-card/40">
                                    <div className="text-xs text-muted-foreground">Complétude du dossier</div>
                                    <div className="text-2xl font-bold mt-1 text-emerald-400">
                                        {bilan?.tauxCompletudePourcentage}%
                                    </div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">
                                        {bilan?.sectionsValidees} / {dossier.sections.length} sections validées
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl border border-border bg-card/40">
                                    <div className="text-xs text-muted-foreground">Feuilles de travail</div>
                                    <div className="text-2xl font-bold mt-1 text-foreground">
                                        {bilan?.totalFeuilles}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">Diligences documentées</div>
                                </div>
                                <div className="p-4 rounded-xl border border-border bg-card/40">
                                    <div className="text-xs text-muted-foreground">Statut d'Opinion</div>
                                    <div className={`text-sm font-bold mt-2 ${
                                        bilan?.pretPourEmissionOpinion ? "text-emerald-400" : "text-amber-400"
                                    }`}>
                                        {bilan?.pretPourEmissionOpinion ? "PRÊT POUR ÉMISSION" : "REVUE EN COURS"}
                                    </div>
                                </div>
                            </div>

                            {/* Certificat de scellement si actif */}
                            {scellement && (
                                <div className="p-4 rounded-xl border border-indigo-500/40 bg-indigo-500/10 space-y-2 text-xs">
                                    <div className="flex items-center justify-between font-semibold text-indigo-300">
                                        <span className="flex items-center gap-1.5">
                                            <ShieldCheck className="w-4 h-4 text-indigo-400" />
                                            Dossier Scellé et Horodaté avec Succès
                                        </span>
                                        <span className="font-mono text-[10px] bg-background/50 px-2 py-0.5 rounded">
                                            {scellement.signatureCertificat}
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-muted-foreground font-mono break-all">
                                        Empreinte SHA-256 : {scellement.hashSHA256}
                                    </div>
                                </div>
                            )}

                            {/* Liste des sections normatives */}
                            <div className="bg-card/40 border border-border rounded-xl p-5 space-y-3">
                                <h3 className="text-sm font-semibold text-foreground">
                                    Structure Normative des Sections (10 Sections ISA 230)
                                </h3>
                                <div className="divide-y divide-border text-xs max-h-[420px] overflow-y-auto pr-1">
                                    {dossier.sections.map((sec: any) => (
                                        <div key={sec.code} className="py-2.5 flex items-center justify-between gap-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-foreground">Section {sec.code} : {sec.nom}</span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                                        sec.statut === "VALIDE" ? "bg-emerald-500/20 text-emerald-400" :
                                                        sec.statut === "REVUE_REQUISE" ? "bg-amber-500/20 text-amber-400" :
                                                        sec.statut === "EN_COURS" ? "bg-blue-500/20 text-blue-400" :
                                                        "bg-secondary text-muted-foreground"
                                                    }`}>
                                                        {sec.statut}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                                    {sec.description} ({sec.feuilles.length} feuille(s))
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => simulerAjoutFeuille(sec.code)}
                                                className="px-2.5 py-1 rounded border border-border hover:bg-secondary text-[11px] flex items-center gap-1 shrink-0 text-foreground"
                                            >
                                                <Plus className="w-3 h-3 text-primary" />
                                                Ajouter feuille
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full min-h-[350px] flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-xl text-center text-muted-foreground text-sm">
                            <FolderLock className="w-8 h-8 text-emerald-400/50 mb-3" />
                            <p>Initialisez la structure normative ISA 230 pour gérer les feuilles de travail et générer le scellement d'intégrité.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
