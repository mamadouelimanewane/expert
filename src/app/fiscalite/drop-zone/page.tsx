"use client";

import { useState, useCallback } from "react";
import {
    Upload,
    Sparkles,
    RefreshCw,
    AlertTriangle,
    PiggyBank,
    Lightbulb,
} from "lucide-react";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";

export default function DropZoneFiscalePage() {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisComplete, setAnalysisComplete] = useState(false);
    const [analysisText, setAnalysisText] = useState<string | null>(null);
    const [notConfigured, setNotConfigured] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const extractTextFromFile = async (file: File): Promise<string | null> => {
        const name = file.name.toLowerCase();
        if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: "array" });
            const sheetTexts = workbook.SheetNames.map((sheetName) => {
                const sheet = workbook.Sheets[sheetName];
                return `--- Feuille: ${sheetName} ---\n${XLSX.utils.sheet_to_csv(sheet)}`;
            });
            return sheetTexts.join("\n\n");
        }
        if (name.endsWith(".csv") || name.endsWith(".txt") || name.endsWith(".xml")) {
            return await file.text();
        }
        return null; // Format non supporté pour l'extraction (ex: PDF)
    };

    const runAnalysis = async (file: File) => {
        setIsAnalyzing(true);
        setAnalysisComplete(false);
        setAnalysisText(null);
        setNotConfigured(false);
        setError(null);

        try {
            const content = await extractTextFromFile(file);
            if (content === null) {
                setError("L'extraction de contenu n'est supportée que pour les fichiers Excel (.xlsx, .xls), CSV, XML ou texte. Les fichiers PDF ne peuvent pas encore être analysés automatiquement.");
                setIsAnalyzing(false);
                return;
            }
            if (content.trim().length === 0) {
                setError("Le fichier semble vide ou n'a pas pu être lu.");
                setIsAnalyzing(false);
                return;
            }

            const res = await fetch("/api/fiscalite/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, fileName: file.name }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Erreur lors de l'analyse.");
            } else if (data.notConfigured) {
                setNotConfigured(true);
                setAnalysisText(data.response);
            } else {
                setAnalysisText(data.response);
            }
            setAnalysisComplete(true);
        } catch {
            setError("Erreur réseau lors de l'analyse du document.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            setUploadedFile(file);
            runAnalysis(file);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedFile(file);
            runAnalysis(file);
        }
    };

    const formatAnalysis = (text: string) => {
        return text.split("\n").map((line, i) => {
            const trimmed = line.trim();
            if (trimmed.startsWith("### ")) return <h4 key={i} className="text-sm font-black text-white mt-4 mb-1">{trimmed.slice(4)}</h4>;
            if (trimmed.startsWith("## ")) return <h3 key={i} className="text-base font-black text-white mt-5 mb-2">{trimmed.slice(3)}</h3>;
            if (trimmed.startsWith("# ")) return <h2 key={i} className="text-lg font-black text-white mt-5 mb-2">{trimmed.slice(2)}</h2>;
            if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) return <p key={i} className="text-sm text-slate-300 pl-3 mb-1">• {trimmed.slice(2)}</p>;
            if (trimmed === "") return <div key={i} className="h-2" />;
            return <p key={i} className="text-sm text-slate-300 mb-1 leading-relaxed">{trimmed}</p>;
        });
    };

    const reset = () => {
        setAnalysisComplete(false);
        setUploadedFile(null);
        setAnalysisText(null);
        setNotConfigured(false);
        setError(null);
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <PiggyBank className="w-64 h-64 text-emerald-400" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-emerald-500/20">
                            Analyse IA du document déposé
                        </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight uppercase">
                        Drop Zone <span className="text-emerald-400">Fiscale</span>
                    </h2>
                    <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                        Déposez un fichier Excel/CSV (déclaration, balance, liasse) : son contenu est envoyé à l'assistant IA pour identifier des pistes d'optimisation et de risque — jamais des résultats prédéfinis.
                    </p>
                </div>
            </div>

            {/* Drop Zone */}
            {!analysisComplete && (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={cn(
                        "glass-card rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border-2 border-dashed p-20 text-center transition-all duration-300",
                        isDragging ? "border-emerald-500 bg-emerald-500/5" : "border-white/10 bg-slate-900/40",
                        isAnalyzing && "pointer-events-none"
                    )}
                >
                    {isAnalyzing ? (
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center animate-pulse">
                                <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white mb-2">Analyse en cours...</h3>
                                <p className="text-slate-500">Nexus IA lit le contenu de « {uploadedFile?.name} »</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-6">
                            <div className={cn(
                                "w-24 h-24 rounded-full flex items-center justify-center transition-all",
                                isDragging ? "bg-emerald-500/20 scale-110" : "bg-white/5"
                            )}>
                                <Upload className={cn("w-12 h-12", isDragging ? "text-emerald-400" : "text-slate-500")} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white mb-2">
                                    {isDragging ? "Déposez le fichier ici" : "Glissez-déposez votre liasse fiscale"}
                                </h3>
                                <p className="text-slate-500">Formats analysables : Excel (.xlsx, .xls), CSV, XML, texte</p>
                            </div>
                            <label className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] cursor-pointer transition-all shadow-lg shadow-emerald-600/30">
                                <input type="file" className="hidden" onChange={handleFileSelect} accept=".pdf,.xlsx,.xls,.xml,.csv,.txt" />
                                Ou sélectionner un fichier
                            </label>

                            {error && (
                                <div className="flex items-start gap-3 p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl text-left max-w-lg">
                                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                    <p className="text-xs text-rose-400">{error}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Results */}
            {analysisComplete && (
                <>
                    {notConfigured && (
                        <div className="flex items-start gap-3 p-6 bg-amber-500/5 border border-amber-500/20 rounded-[28px]">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-amber-400 mb-1">Intégration IA non configurée</p>
                                <p className="text-xs text-slate-400 leading-relaxed">{analysisText}</p>
                            </div>
                        </div>
                    )}

                    {!notConfigured && analysisText && (
                        <div className="glass-card rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border border-white/5 bg-slate-900/40 p-4 sm:p-6 lg:p-10 shadow-2xl">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                    <Lightbulb className="w-6 h-6 text-amber-400" />
                                    Analyse Nexus IA — {uploadedFile?.name}
                                </h3>
                                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20 flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3" /> Généré par IA — à vérifier
                                </span>
                            </div>

                            <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                                {formatAnalysis(analysisText)}
                            </div>

                            <div className="mt-6 flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-amber-400 leading-relaxed">
                                    Cette analyse est générée par un modèle de langage général, sans base documentaire fiscale OHADA vérifiée en temps réel. Chaque piste doit être validée par l'expert-comptable avant toute décision.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Reset Button */}
                    <div className="text-center">
                        <button
                            onClick={reset}
                            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-white/10"
                        >
                            Analyser un autre document
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
