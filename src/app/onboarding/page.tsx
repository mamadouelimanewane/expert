"use client";

import { useState } from "react";
import {
    UserPlus, FileSignature, ShieldCheck, CheckCircle2, ChevronRight,
    Building2, FileText, Banknote, Mail, Smartphone, ArrowRight, Zap, RefreshCw, Search
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isCheckingKYC, setIsCheckingKYC] = useState(false);
    const [kycResult, setKycResult] = useState<"pending" | "approved">("pending");

    const handleRunKYC = () => {
        setIsCheckingKYC(true);
        setTimeout(() => {
            setIsCheckingKYC(false);
            setKycResult("approved");
        }, 3000);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[40px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <UserPlus className="w-48 h-48 text-indigo-400" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                            Nouveau Dossier
                        </span>
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tight">Onboarding & <span className="text-indigo-400">KYC</span></h2>
                    <p className="text-slate-400 mt-2 max-w-xl font-medium">
                        Créez un nouveau dossier client en 3 étapes. Génération automatique de la Lettre de Mission et vérifications légales LCB-FT.
                    </p>
                </div>
            </div>

            {/* Stepper */}
            <div className="flex justify-between items-center bg-slate-900 border border-white/5 p-4 rounded-[30px] relative z-10">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-10 -translate-y-1/2" />
                {[
                    { num: 1, label: "Identification Client", icon: Building2 },
                    { num: 2, label: "Vérifications KYC / LCB-FT", icon: ShieldCheck },
                    { num: 3, label: "Lettre de Mission", icon: FileSignature }
                ].map((s) => (
                    <div key={s.num} className="flex flex-col items-center gap-3">
                        <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center font-black transition-all duration-500",
                            step > s.num ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" :
                            step === s.num ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-4 ring-indigo-600/20" :
                            "bg-slate-800 text-slate-500 border border-slate-700"
                        )}>
                            {step > s.num ? <CheckCircle2 className="w-6 h-6" /> : <s.icon className="w-6 h-6" />}
                        </div>
                        <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest bg-slate-900 px-2",
                            step >= s.num ? "text-white" : "text-slate-500"
                        )}>
                            {s.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/40 overflow-hidden shadow-2xl p-10 min-h-[500px]">
                
                {step === 1 && (
                    <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-right-8 duration-500">
                        <div className="text-center mb-10">
                            <h3 className="text-2xl font-black text-white">Informations de la Société</h3>
                            <p className="text-slate-400 mt-2 text-sm">Entrez le NINEA/RCCM pour pré-remplir les données.</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2 relative">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">NINEA ou RCCM</label>
                                <div className="flex gap-4">
                                    <input type="text" placeholder="Ex: 001423456" className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-indigo-500" />
                                    <button className="px-6 py-4 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20 font-black uppercase text-xs tracking-widest hover:bg-indigo-500/20 transition-colors flex items-center gap-2 whitespace-nowrap">
                                        <Search className="w-4 h-4" /> Rechercher API
                                    </button>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Raison Sociale</label>
                                <input type="text" defaultValue="Groupe ABC Logistics" className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Forme Juridique</label>
                                <select className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-indigo-500 appearance-none">
                                    <option>SARL</option>
                                    <option>SA</option>
                                    <option>SAS</option>
                                    <option>SUARL</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Dirigeant (Bénéficiaire Effectif)</label>
                                <input type="text" defaultValue="Mamadou Diop" className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Email Contact</label>
                                <input type="email" defaultValue="direction@abc-logistics.sn" className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-indigo-500" />
                            </div>
                        </div>

                        <div className="flex justify-end pt-8 mt-8 border-t border-white/5">
                            <button onClick={() => setStep(2)} className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-3 shadow-xl shadow-indigo-600/30">
                                Étape Suivante <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-right-8 duration-500">
                        <div className="text-center mb-10">
                            <h3 className="text-2xl font-black text-white">Vérifications LCB-FT</h3>
                            <p className="text-slate-400 mt-2 text-sm">Contrôle anti-blanchiment et identification du bénéficiaire effectif requis par l'Ordre.</p>
                        </div>

                        {kycResult === "pending" ? (
                            <div className="glass-card p-12 border-2 border-dashed border-indigo-500/30 rounded-[40px] text-center bg-slate-900/40">
                                {isCheckingKYC ? (
                                    <>
                                        <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin" />
                                        </div>
                                        <h4 className="text-xl font-black text-white mb-2 uppercase tracking-widest">Interrogation des bases mondiales...</h4>
                                        <p className="text-slate-400 text-sm">Vérification de "Mamadou Diop" sur les listes de sanctions OFAC et Personnes Politiquement Exposées (PPE).</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                                            <ShieldCheck className="w-10 h-10 text-slate-500" />
                                        </div>
                                        <h4 className="text-xl font-black text-white mb-2">Aucune vérification effectuée</h4>
                                        <p className="text-slate-400 text-sm mb-8">Lancez le scan KYC pour vérifier la conformité du client.</p>
                                        <button onClick={handleRunKYC} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-2 mx-auto">
                                            <Zap className="w-4 h-4" /> Lancer l'Analyse IA
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-start gap-4">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                                    <div>
                                        <h4 className="text-lg font-black text-emerald-400">Client Conforme (Risque Faible)</h4>
                                        <p className="text-emerald-400/80 mt-1 text-sm">Le dirigeant ne figure sur aucune liste de sanctions internationale. L'activité "Logistique" présente un risque standard.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl flex justify-between items-center">
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Liste OFAC / Sanctions</span>
                                        <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">Vierge</span>
                                    </div>
                                    <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl flex justify-between items-center">
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Personne Politique (PPE)</span>
                                        <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">Négatif</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between pt-8 mt-8 border-t border-white/5">
                            <button onClick={() => setStep(1)} className="px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-white/5">
                                Retour
                            </button>
                            <button 
                                onClick={() => setStep(3)} 
                                disabled={kycResult !== "approved"}
                                className={cn("px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-3",
                                    kycResult === "approved" ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30" : "bg-slate-800 text-slate-500 cursor-not-allowed"
                                )}
                            >
                                Étape Suivante <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-8 duration-500">
                        <div className="text-center mb-10">
                            <h3 className="text-2xl font-black text-white">Génération Lettre de Mission</h3>
                            <p className="text-slate-400 mt-2 text-sm">Définissez les honoraires et générez le document final pour signature électronique.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Missions Incluses</label>
                                    <div className="space-y-2">
                                        {["Tenue Comptable Complète", "Déclarations Fiscales Mensuelles", "Gestion Sociale (Jusqu'à 10 salariés)", "Bilan & Liasse Fiscale Annuelle"].map((mission, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-slate-900 border border-white/5 rounded-xl">
                                                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-600 bg-slate-800" />
                                                <span className="text-sm font-bold text-white">{mission}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Honoraires Mensuels (FCFA)</label>
                                    <div className="relative">
                                        <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                        <input type="text" defaultValue="250 000" className="w-full bg-slate-900 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-xl font-black text-white focus:outline-none focus:border-indigo-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-6 border border-white/5 rounded-[32px] bg-slate-900/60 flex flex-col items-center justify-center text-center">
                                <div className="w-24 h-24 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-center mb-6">
                                    <FileText className="w-12 h-12 text-indigo-400" />
                                </div>
                                <h4 className="text-lg font-black text-white mb-2">LM_Groupe_ABC_Logistics.pdf</h4>
                                <p className="text-slate-400 text-xs mb-8 max-w-xs">Le document a été généré avec les clauses standards de l'Ordre, prêt à être signé.</p>
                                
                                <div className="flex gap-3 w-full">
                                    <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all">
                                        Prévisualiser
                                    </button>
                                    <button className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2">
                                        <Smartphone className="w-4 h-4" /> Envoyer pour Signature
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between pt-8 mt-8 border-t border-white/5">
                            <button onClick={() => setStep(2)} className="px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-white/5">
                                Retour
                            </button>
                            <button className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-3 shadow-xl shadow-emerald-500/30">
                                Terminer & Créer Dossier <CheckCircle2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
