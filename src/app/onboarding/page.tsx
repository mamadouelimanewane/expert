"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    FileSignature, ShieldCheck, CheckCircle2, ArrowRight, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Onboarding & KYC.
//
// L'étape 1 pré-remplissait un client fictif ("Groupe ABC Logistics",
// "Mamadou Diop") et proposait un bouton "Rechercher API" sans intégration
// réelle. L'étape 2 lançait une "Analyse IA" (3 secondes d'attente) qui
// renvoyait systématiquement "Client Conforme, aucune liste de sanctions" —
// aucune vérification OFAC/PPE n'est en réalité effectuée nulle part dans
// l'application (compliance/kyc-screening lit uniquement le statut déjà
// enregistré, il ne l'établit pas) : c'est le type de fabrication le plus
// risqué de cette page, une conformité LCB-FT présentée comme vérifiée sans
// l'être. L'étape 3 affirmait avoir généré "LM_Groupe_ABC_Logistics.pdf" et
// ne créait jamais rien.
//
// Cette version : saisie réelle du client (créé via POST /api/clients),
// une étape KYC honnête qui explique l'absence de contrôle automatisé et
// demande une attestation manuelle plutôt que de simuler un scan, et une
// redirection vers /lettres-mission/new (générateur réel) pour la lettre de
// mission au lieu d'un faux PDF.
// ─────────────────────────────────────────────────────────────────────────────

const PAYS = [
    { code: "CI", label: "Côte d'Ivoire" },
    { code: "SN", label: "Sénégal" },
    { code: "BJ", label: "Bénin" },
    { code: "TG", label: "Togo" },
    { code: "ML", label: "Mali" },
    { code: "BF", label: "Burkina Faso" },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [diligenceEffectuee, setDiligenceEffectuee] = useState(false);
    const [creation, setCreation] = useState(false);
    const [erreur, setErreur] = useState<string | null>(null);
    const [clientCree, setClientCree] = useState<{ id: string; nom: string } | null>(null);

    const [formData, setFormData] = useState({
        companyName: "",
        formeJuridique: "SARL",
        dirigeant: "",
        email: "",
        phone: "",
        country: "CI",
    });

    const finaliser = async () => {
        setCreation(true);
        setErreur(null);
        try {
            const res = await fetch("/api/clients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "ENTREPRISE",
                    companyName: formData.companyName,
                    email: formData.email,
                    phone: formData.phone,
                    country: formData.country,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setErreur(data.error || "La création du dossier a échoué.");
                return;
            }
            setClientCree({ id: data.client?.id ?? data.id, nom: formData.companyName });
        } catch {
            setErreur("Impossible de contacter le serveur.");
        } finally {
            setCreation(false);
        }
    };

    const step1Valide = formData.companyName.trim().length > 0 && formData.email.trim().length > 0 && formData.phone.trim().length > 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-4 sm:p-6 lg:p-10 rounded-[40px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-primary/20">
                            Nouveau Dossier
                        </span>
                    </div>
                    <h2 className="page-title">Onboarding & <span className="text-primary">KYC</span></h2>
                    <p className="page-subtitle">
                        Créez un nouveau dossier client en 3 étapes.
                    </p>
                </div>
            </div>

            {/* Stepper */}
            <div className="flex justify-between items-center bg-slate-900 border border-white/5 p-4 rounded-[30px] relative z-10">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-10 -translate-y-1/2" />
                {[
                    { num: 1, label: "Identification Client" },
                    { num: 2, label: "Vérification LCB-FT" },
                    { num: 3, label: "Lettre de Mission" }
                ].map((s) => (
                    <div key={s.num} className="flex flex-col items-center gap-3">
                        <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center font-black transition-all duration-500",
                            step > s.num ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" :
                            step === s.num ? "bg-primary text-white shadow-lg shadow-primary/30 ring-4 ring-primary/20" :
                            "bg-slate-800 text-slate-500 border border-slate-700"
                        )}>
                            {step > s.num ? <CheckCircle2 className="w-6 h-6" /> : s.num}
                        </div>
                        <span className={cn("text-[10px] font-black uppercase tracking-widest bg-slate-900 px-2", step >= s.num ? "text-white" : "text-slate-500")}>
                            {s.label}
                        </span>
                    </div>
                ))}
            </div>

            <div className="apix-card overflow-hidden">
                {step === 1 && (
                    <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-right-8 duration-500">
                        <div className="text-center mb-10">
                            <h3 className="text-2xl font-black text-white">Informations de la Société</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Raison Sociale</label>
                                <input type="text" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-primary" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Forme Juridique</label>
                                <select value={formData.formeJuridique} onChange={(e) => setFormData({ ...formData, formeJuridique: e.target.value })} className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-primary appearance-none">
                                    <option>SARL</option>
                                    <option>SA</option>
                                    <option>SAS</option>
                                    <option>SUARL</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Pays</label>
                                <select value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-primary appearance-none">
                                    {PAYS.map((p) => <option key={p.code} value={p.code}>{p.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Dirigeant (Bénéficiaire Effectif)</label>
                                <input type="text" value={formData.dirigeant} onChange={(e) => setFormData({ ...formData, dirigeant: e.target.value })} className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-primary" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Email Contact</label>
                                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-primary" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Téléphone</label>
                                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-primary" />
                            </div>
                        </div>

                        <div className="flex justify-end pt-8 mt-8 border-t border-white/5">
                            <button onClick={() => setStep(2)} disabled={!step1Valide} className="px-10 py-4 bg-primary hover:brightness-110 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-3 shadow-xl shadow-primary/30">
                                Étape Suivante <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-right-8 duration-500">
                        <div className="text-center mb-10">
                            <h3 className="text-2xl font-black text-white">Vérification LCB-FT</h3>
                            <p className="text-slate-400 mt-2 text-sm">
                                L&apos;application ne dispose d&apos;aucune intégration automatisée avec des listes de sanctions
                                (OFAC) ou de personnes politiquement exposées (PPE). Effectuez cette vérification selon la
                                procédure habituelle du cabinet avant de continuer.
                            </p>
                        </div>

                        <label className="flex items-start gap-4 p-6 bg-slate-900/60 border border-white/5 rounded-3xl cursor-pointer">
                            <input
                                type="checkbox"
                                checked={diligenceEffectuee}
                                onChange={(e) => setDiligenceEffectuee(e.target.checked)}
                                className="w-5 h-5 mt-0.5 rounded border-slate-700 text-primary focus:ring-primary bg-slate-800"
                            />
                            <span className="text-sm text-slate-300">
                                J&apos;atteste avoir vérifié manuellement l&apos;identité du dirigeant ({formData.dirigeant || "non renseigné"})
                                et l&apos;absence de signalement connu.
                            </span>
                        </label>

                        <div className="flex justify-between pt-8 mt-8 border-t border-white/5">
                            <button onClick={() => setStep(1)} className="px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-white/5">
                                Retour
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={!diligenceEffectuee}
                                className={cn("px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-3",
                                    diligenceEffectuee ? "bg-primary hover:brightness-110 text-white shadow-xl shadow-primary/30" : "bg-slate-800 text-slate-500 cursor-not-allowed"
                                )}
                            >
                                Étape Suivante <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-right-8 duration-500">
                        <div className="text-center mb-10">
                            <h3 className="text-2xl font-black text-white">Créer le dossier</h3>
                            <p className="text-slate-400 mt-2 text-sm">
                                Le dossier client sera créé ; la lettre de mission se rédige ensuite depuis l&apos;outil dédié.
                            </p>
                        </div>

                        {erreur && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-4">{erreur}</p>}

                        {clientCree ? (
                            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl space-y-4 text-center">
                                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                                <p className="text-emerald-300 font-bold">Dossier créé pour {clientCree.nom}</p>
                                <div className="flex gap-3 justify-center">
                                    <button onClick={() => router.push(`/clients/${clientCree.id}`)} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest border border-white/10">
                                        Ouvrir le dossier
                                    </button>
                                    <button onClick={() => router.push("/lettres-mission/new")} className="px-6 py-3 bg-primary hover:brightness-110 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                        <FileSignature className="w-4 h-4" /> Rédiger la lettre de mission
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-center">
                                <button onClick={finaliser} disabled={creation} className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-3 shadow-xl shadow-emerald-500/30">
                                    {creation ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                    Créer le Dossier
                                </button>
                            </div>
                        )}

                        {!clientCree && (
                            <div className="flex justify-start pt-8 mt-8 border-t border-white/5">
                                <button onClick={() => setStep(2)} className="px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-white/5">
                                    Retour
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
