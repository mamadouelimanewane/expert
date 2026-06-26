"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileSpreadsheet, Calculator, ArrowRight, Loader2, Download, AlertCircle, Building2 } from "lucide-react";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";

export default function LiasseFiscalePage() {
    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<{
        actif: number;
        passif: number;
        chiffreAffaires: number;
        charges: number;
        resultat: number;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls') || droppedFile.name.endsWith('.csv'))) {
            setFile(droppedFile);
            setError(null);
        } else {
            setError("Veuillez importer un fichier Excel (.xlsx, .xls) ou CSV.");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
        }
    };

    const processFile = async () => {
        if (!file) return;
        setIsAnalyzing(true);
        setError(null);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Expected columns: Compte, Libellé, Débit, Crédit, Solde Débiteur, Solde Créditeur
            // We use raw data
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
            
            let actif = 0;
            let passif = 0;
            let produits = 0;
            let charges = 0;

            // Simple heuristic to find Account and Balance columns
            // Assuming col 0 is account, and last cols are balances, or cols 4,5 are balances
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                if (!row || row.length < 2) continue;
                
                const accountRaw = row[0]?.toString().trim() || "";
                if (!accountRaw.match(/^\d+$/)) continue; // Not a valid account number
                
                const account = accountRaw;
                const debit = parseFloat(row[2] || 0) || 0;
                const credit = parseFloat(row[3] || 0) || 0;
                const balance = debit - credit;

                const soldeDebiteur = balance > 0 ? balance : 0;
                const soldeCrediteur = balance < 0 ? Math.abs(balance) : 0;

                // Classes OHADA
                // Classe 1 à 4: Bilan
                // Classe 5: Trésorerie (Bilan)
                // Classe 6: Charges
                // Classe 7: Produits
                // Classe 8: Autres (Résultat)
                if (account.startsWith('1') || account.startsWith('4')) {
                    if (account.startsWith('4') && balance > 0) actif += soldeDebiteur;
                    else passif += soldeCrediteur;
                    if(account.startsWith('1')) passif += soldeCrediteur;
                } else if (account.startsWith('2') || account.startsWith('3')) {
                    actif += soldeDebiteur;
                } else if (account.startsWith('5')) {
                    if (balance > 0) actif += soldeDebiteur;
                    else passif += soldeCrediteur;
                } else if (account.startsWith('6')) {
                    charges += soldeDebiteur;
                } else if (account.startsWith('7')) {
                    produits += soldeCrediteur;
                } else if (account.startsWith('8')) {
                    if (parseInt(account.charAt(1)) % 2 === 0) charges += soldeDebiteur; // 82, 84 etc (Charges HAO)
                    else produits += soldeCrediteur; // 81, 83 (Produits HAO)
                }
            }

            const resultat = produits - charges;
            // Equilibre du bilan: Passif inclut le résultat
            passif += resultat;

            // Simulate parsing time for UX
            setTimeout(() => {
                setResults({
                    actif,
                    passif,
                    chiffreAffaires: produits,
                    charges,
                    resultat
                });
                setIsAnalyzing(false);
            }, 1500);

        } catch (err) {
            console.error(err);
            setError("Erreur lors de la lecture du fichier. Assurez-vous qu'il s'agit d'une balance à 6 colonnes.");
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <FileSpreadsheet className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">Liasse Fiscale Auto</h1>
                        <p className="text-slate-400 font-medium text-sm">Génération automatique des états SYSCOHADA depuis une Balance Générale.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Upload Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFileDrop}
                        className={cn(
                            "glass-card rounded-[32px] p-8 border-2 border-dashed flex flex-col items-center justify-center text-center transition-all cursor-pointer group h-80",
                            file ? "border-indigo-500 bg-indigo-500/5" : "border-slate-700 hover:border-indigo-400 hover:bg-slate-800/50 bg-slate-900/40"
                        )}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input 
                            type="file" 
                            accept=".xlsx, .xls, .csv" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        
                        {file ? (
                            <div className="space-y-4 animate-in zoom-in">
                                <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto text-indigo-400">
                                    <FileSpreadsheet className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm truncate max-w-[200px]">{file.name}</h3>
                                    <p className="text-xs text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <button 
                                    className="text-xs font-bold text-rose-400 hover:text-rose-300"
                                    onClick={(e) => { e.stopPropagation(); setFile(null); setResults(null); }}
                                >
                                    Retirer
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400 group-hover:scale-110 group-hover:text-indigo-400 transition-all">
                                    <UploadCloud className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm">Importer la Balance</h3>
                                    <p className="text-xs text-slate-500 mt-2 max-w-[200px] mx-auto">Glissez-déposez votre fichier Excel (.xlsx) ou cliquez pour parcourir.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                            <p className="text-xs font-bold text-rose-200">{error}</p>
                        </div>
                    )}

                    <button
                        onClick={processFile}
                        disabled={!file || isAnalyzing}
                        className={cn(
                            "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all",
                            !file 
                                ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30"
                        )}
                    >
                        {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calculator className="w-5 h-5" />}
                        Générer la Liasse
                    </button>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-2">
                    {results ? (
                        <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                            {/* Bilan */}
                            <div className="glass-card rounded-[32px] p-8 border border-white/5 bg-slate-900/40">
                                <h3 className="text-lg font-black text-white flex items-center gap-2 mb-6">
                                    <Building2 className="w-5 h-5 text-indigo-400" /> Bilan Actif / Passif
                                </h3>
                                
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end border-b border-white/10 pb-2">
                                            <span className="text-xs font-bold text-slate-500 uppercase">Actif Total</span>
                                            <span className="text-lg font-black text-white">{results.actif.toLocaleString("fr-FR")} <span className="text-xs text-slate-500">FCFA</span></span>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end border-b border-white/10 pb-2">
                                            <span className="text-xs font-bold text-slate-500 uppercase">Passif Total</span>
                                            <span className="text-lg font-black text-white">{results.passif.toLocaleString("fr-FR")} <span className="text-xs text-slate-500">FCFA</span></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className={cn("w-2 h-2 rounded-full", Math.abs(results.actif - results.passif) < 1 ? "bg-emerald-500" : "bg-rose-500")} />
                                    <p className="text-xs font-bold text-slate-400">
                                        {Math.abs(results.actif - results.passif) < 1 ? "Bilan Équilibré" : "Déséquilibre détecté"}
                                    </p>
                                </div>
                            </div>

                            {/* Compte de Résultat */}
                            <div className="glass-card rounded-[32px] p-8 border border-white/5 bg-slate-900/40">
                                <h3 className="text-lg font-black text-white flex items-center gap-2 mb-6">
                                    <Calculator className="w-5 h-5 text-emerald-400" /> Compte de Résultat
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-slate-950/50 rounded-xl">
                                        <span className="text-sm font-bold text-slate-400">Chiffre d'Affaires & Produits</span>
                                        <span className="text-white font-bold">{results.chiffreAffaires.toLocaleString("fr-FR")} FCFA</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-slate-950/50 rounded-xl">
                                        <span className="text-sm font-bold text-slate-400">Charges d'Exploitation & Diverses</span>
                                        <span className="text-rose-400 font-bold">- {results.charges.toLocaleString("fr-FR")} FCFA</span>
                                    </div>
                                    <div className="flex justify-between items-center p-5 bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-xl">
                                        <span className="text-sm font-black text-emerald-400 uppercase tracking-widest">Résultat Net</span>
                                        <span className="text-2xl font-black text-emerald-400">{results.resultat.toLocaleString("fr-FR")} FCFA</span>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all">
                                <Download className="w-4 h-4" /> Exporter la Liasse (PDF)
                            </button>
                        </div>
                    ) : (
                        <div className="h-full min-h-[280px] sm:h-[350px] lg:h-[400px] glass-card rounded-[32px] border border-white/5 bg-slate-900/20 flex flex-col items-center justify-center text-center p-8">
                            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                                <Calculator className="w-10 h-10 text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-300 mb-2">En attente d'analyse</h3>
                            <p className="text-sm text-slate-500 max-w-[300px]">
                                Importez une balance générale pour générer instantanément vos états financiers OHADA.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
