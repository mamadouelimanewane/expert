"use client";

import { useState } from "react";
import {
    ScanLine,
    UploadCloud,
    FileCheck,
    Loader2,
    Save,
    X,
    Camera
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function OCRPage() {
    const [step, setStep] = useState<"upload" | "scanning" | "review">("upload");
    const [extractedData, setExtractedData] = useState<any>(null);

    const handleUpload = () => {
        setStep("scanning");
        // Simulate AI processing time
        setTimeout(() => {
            setExtractedData({
                merchant: "Total Energies - Station Plateau",
                date: "24/05/2024",
                total: "45 000 FCFA",
                tva: "8 100 FCFA (18%)",
                category: "605 - Transport & Déplacements",
                confidence: 0.98
            });
            setStep("review");
        }, 2500);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Smart Scan OCR</h2>
                    <p className="text-slate-400 mt-1">Numérisation et extraction automatique des pièces comptables.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Upload Area */}
                <div className="space-y-4">
                    <div className={cn(
                        "border-2 border-dashed rounded-2xl h-96 flex flex-col items-center justify-center text-center transition-all relative overflow-hidden",
                        step === "scanning" ? "border-indigo-500 bg-slate-900/50" : "border-slate-700 bg-slate-800/20 hover:bg-slate-800/40 hover:border-indigo-500/50 cursor-pointer"
                    )} onClick={step === "upload" ? handleUpload : undefined}>

                        {step === "upload" && (
                            <>
                                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-6 shadow-xl">
                                    <Camera className="w-10 h-10 text-indigo-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Prendre une photo</h3>
                                <p className="text-slate-500 max-w-sm">ou glissez-déposez votre facture ici (PDF, JPG)</p>
                            </>
                        )}

                        {step === "scanning" && (
                            <>
                                <div className="absolute inset-0 bg-indigo-500/5 animate-pulse" />
                                <div className="w-full h-1 bg-indigo-500 absolute top-0 animate-[scan_2s_ease-in-out_infinite]" style={{ boxShadow: "0 0 15px #6366f1" }} />

                                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-6 relative z-10">
                                    <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 relative z-10">Analyse IA en cours...</h3>
                                <p className="text-indigo-300 text-sm relative z-10">Extraction du commerçant, date et montants</p>
                            </>
                        )}

                        {step === "review" && (
                            <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
                                <div className="text-slate-500 text-sm">Aperçu du document</div>
                                {/* Placeholder for doc preview */}
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Area */}
                <div className="glass-card rounded-2xl p-6 border border-slate-700/50 flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <SparklesIcon className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Données Extraites</h3>
                            <p className="text-xs text-slate-400">Confiance IA: <span className="text-emerald-400 font-bold">98%</span></p>
                        </div>
                    </div>

                    {extractedData ? (
                        <div className="space-y-6 flex-1">
                            <div className="space-y-4">
                                <div className="group">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Commerçant / Fournisseur</label>
                                    <input type="text" defaultValue={extractedData.merchant} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                                        <input type="text" defaultValue={extractedData.date} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Total TTC</label>
                                        <input type="text" defaultValue={extractedData.total} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-indigo-500 transition-colors" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">TVA (Détectée)</label>
                                    <div className="flex gap-2">
                                        <input type="text" defaultValue={extractedData.tva} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                                        <span className="px-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold flex items-center border border-emerald-500/30">OK</span>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                    <label className="block text-xs font-medium text-indigo-300 mb-1 flex items-center gap-2">
                                        <ScanLine className="w-3 h-3" />
                                        Imputation Comptable (Suggérée)
                                    </label>
                                    <input type="text" defaultValue={extractedData.category} className="w-full bg-transparent border-none p-0 text-white font-mono font-bold focus:ring-0" />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-slate-700/50 mt-auto">
                                <button className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2">
                                    <Save className="w-4 h-4" />
                                    Valider l'écriture
                                </button>
                                <button className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors border border-slate-700" onClick={() => { setStep("upload"); setExtractedData(null); }}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-center opacity-50">
                            <ScanLine className="w-12 h-12 text-slate-600 mb-4" />
                            <p className="text-sm text-slate-500">En attente d'un document...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SparklesIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
    );
}
