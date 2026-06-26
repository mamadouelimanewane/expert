"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Camera, ScanText, Loader2, CheckCircle2, Receipt, AlertCircle, Save } from "lucide-react";
import { createWorker } from "tesseract.js";
import { cn } from "@/lib/utils";

export default function ExpenseNotesPage() {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [extractedData, setExtractedData] = useState<{
        merchant: string;
        date: string;
        totalTTC: string;
        tva: string;
    } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError("Veuillez importer une image (JPG, PNG).");
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result as string);
                setExtractedData(null);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const processImage = async () => {
        if (!imageSrc) return;
        setIsScanning(true);
        setError(null);
        setProgress(10);

        try {
            const worker = await createWorker('fra', 1, {
                logger: (m: any) => {
                    if (m.status === 'recognizing text') {
                        setProgress(parseInt((m.progress * 100).toString(), 10));
                    }
                }
            } as any);

            
            const { data: { text } } = await worker.recognize(imageSrc);
            console.log("OCR Text:", text);
            await worker.terminate();

            // Very basic heuristic for parsing receipts
            // Extract Total
            const totalMatch = text.match(/(?:total|ttc|montant|somme)[\s:A-Z]*([\d]+[.,][\d]{2})/i);
            const totalFallback = text.match(/([\d]+[.,][\d]{2})/g);
            let totalTTC = "0.00";
            
            if (totalMatch) {
                totalTTC = totalMatch[1].replace(',', '.');
            } else if (totalFallback && totalFallback.length > 0) {
                // Find max amount
                const amounts = totalFallback.map(a => parseFloat(a.replace(',', '.'))).filter(a => !isNaN(a));
                totalTTC = Math.max(...amounts).toFixed(2);
            }

            // Extract Date (DD/MM/YYYY)
            const dateMatch = text.match(/(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{4}|\d{2})/);
            let dateStr = new Date().toISOString().split('T')[0];
            if (dateMatch) {
                const year = dateMatch[3].length === 2 ? `20${dateMatch[3]}` : dateMatch[3];
                dateStr = `${year}-${dateMatch[2]}-${dateMatch[1]}`;
            }

            // Extract Merchant (first non empty line usually)
            const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
            const merchant = lines.length > 0 ? lines[0] : "Commerçant Inconnu";

            // Calculate TVA (Assumption 18% OHADA default if not found)
            const tvaMatch = text.match(/(?:tva)[\s:]*([\d]+[.,][\d]{2})/i);
            let tva = "0.00";
            if (tvaMatch) {
                tva = tvaMatch[1].replace(',', '.');
            } else {
                const totalFloat = parseFloat(totalTTC);
                tva = ((totalFloat * 18) / 118).toFixed(2); // Retrouver la TVA depuis TTC
            }

            setExtractedData({
                merchant,
                date: dateStr,
                totalTTC,
                tva
            });
            setIsScanning(false);

        } catch (err) {
            console.error(err);
            setError("Erreur lors de l'analyse OCR. Assurez-vous que l'image est nette.");
            setIsScanning(false);
            setProgress(0);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <ScanText className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">Scanner de Notes de Frais</h1>
                        <p className="text-slate-400 font-medium text-sm">Extraction intelligente (OCR) des tickets de caisse via IA embarquée.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Upload & Preview Section */}
                <div className="space-y-6">
                    <div className="glass-card rounded-[32px] p-6 border border-white/5 bg-slate-900/40">
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />

                        {imageSrc ? (
                            <div className="space-y-6">
                                <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-black aspect-[3/4] flex items-center justify-center group">
                                    <img src={imageSrc} alt="Preview" className="max-w-full max-h-full object-contain" />
                                    
                                    {/* Scan Line Animation */}
                                    {isScanning && (
                                        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_#3b82f6] animate-scan-line" />
                                    )}

                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all backdrop-blur-md"
                                        >
                                            <Camera className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {isScanning ? (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold text-blue-400">
                                            <span>Analyse OCR en cours...</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-blue-500 h-1.5 transition-all duration-300" style={{ width: `${progress}%` }} />
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={processImage}
                                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/30"
                                    >
                                        <ScanText className="w-5 h-5" />
                                        Lancer l'extraction IA
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-700 hover:border-blue-400 hover:bg-slate-800/50 bg-slate-900/40 rounded-2xl p-4 sm:p-8 lg:p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all aspect-[3/4]"
                            >
                                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-6 group-hover:text-blue-400 group-hover:scale-110 transition-all">
                                    <Camera className="w-10 h-10" />
                                </div>
                                <h3 className="text-white font-bold text-lg">Photographier un ticket</h3>
                                <p className="text-sm text-slate-500 mt-2 max-w-[250px]">
                                    Importez une photo du reçu (resto, taxi, achat). L'IA extraira automatiquement les montants.
                                </p>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                            <p className="text-xs font-bold text-rose-200">{error}</p>
                        </div>
                    )}
                </div>

                {/* Form Section */}
                <div className="space-y-6">
                    <div className="glass-card rounded-[32px] p-8 border border-white/5 bg-slate-900/40 h-full">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg font-black text-white flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-blue-400" /> Validation de la dépense
                            </h2>
                            {extractedData && <CheckCircle2 className="w-6 h-6 text-emerald-500 animate-in zoom-in" />}
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 ml-1">Commerçant / Fournisseur</label>
                                <input
                                    type="text"
                                    value={extractedData?.merchant || ""}
                                    onChange={(e) => extractedData && setExtractedData({...extractedData, merchant: e.target.value})}
                                    placeholder="Ex: Restaurant Le Plateau"
                                    className={cn(
                                        "w-full px-4 py-3 bg-slate-950/50 border rounded-xl text-white outline-none transition-all font-medium text-sm",
                                        extractedData ? "border-emerald-500/50 focus:border-emerald-500" : "border-white/10 focus:border-blue-500"
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 ml-1">Date</label>
                                    <input
                                        type="date"
                                        value={extractedData?.date || ""}
                                        onChange={(e) => extractedData && setExtractedData({...extractedData, date: e.target.value})}
                                        className={cn(
                                            "w-full px-4 py-3 bg-slate-950/50 border rounded-xl text-white outline-none transition-all font-medium text-sm",
                                            extractedData ? "border-emerald-500/50 focus:border-emerald-500" : "border-white/10 focus:border-blue-500"
                                        )}
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 ml-1">Catégorie</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500 transition-all font-medium text-sm appearance-none"
                                    >
                                        <option>Restauration & Réception</option>
                                        <option>Déplacement & Transport</option>
                                        <option>Fournitures de bureau</option>
                                        <option>Hébergement</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 ml-1">Montant Total TTC</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={extractedData?.totalTTC || ""}
                                            onChange={(e) => extractedData && setExtractedData({...extractedData, totalTTC: e.target.value})}
                                            placeholder="0.00"
                                            className={cn(
                                                "w-full px-4 py-3 bg-slate-950/50 border rounded-xl text-white outline-none transition-all font-black text-lg",
                                                extractedData ? "border-emerald-500/50 focus:border-emerald-500 text-emerald-400" : "border-white/10 focus:border-blue-500"
                                            )}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">FCFA</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 ml-1">Dont TVA</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={extractedData?.tva || ""}
                                            onChange={(e) => extractedData && setExtractedData({...extractedData, tva: e.target.value})}
                                            placeholder="0.00"
                                            className={cn(
                                                "w-full px-4 py-3 bg-slate-950/50 border rounded-xl text-white outline-none transition-all font-medium text-sm",
                                                extractedData ? "border-emerald-500/50 focus:border-emerald-500 text-amber-400" : "border-white/10 focus:border-blue-500"
                                            )}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">FCFA</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-6 border-t border-white/5">
                            <button
                                disabled={!extractedData}
                                className={cn(
                                    "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all",
                                    !extractedData 
                                        ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                                        : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/30"
                                )}
                            >
                                <Save className="w-5 h-5" />
                                Enregistrer la dépense
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
