"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, ShieldAlert, AlertTriangle, CheckCircle2, Search, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";

interface Anomaly {
    id: number;
    type: "CAISSE_CREDITRICE" | "DIMANCHE" | "MONTANT_SUSPECT";
    severity: "HIGH" | "MEDIUM" | "LOW";
    description: string;
    date: string;
    compte: string;
    montant: number;
    libelle: string;
}

export default function AuditLegalPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [anomalies, setAnomalies] = useState<Anomaly[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.csv'))) {
            setFile(droppedFile);
            setError(null);
        } else {
            setError("Veuillez importer un fichier FEC Excel (.xlsx) ou CSV.");
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
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            
            // Expected cols: Date, Compte, Libelle, Debit, Credit
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
            
            const foundAnomalies: Anomaly[] = [];
            let soldeCaisse = 0;
            
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                if (!row || row.length < 5) continue;

                // Simple column guessing:
                // Assuming format: [0:Date, 1:Compte, 2:Libelle, 3:Debit, 4:Credit]
                const dateRaw = row[0];
                const compte = row[1]?.toString() || "";
                const libelle = row[2]?.toString() || "";
                const debit = parseFloat(row[3] || 0) || 0;
                const credit = parseFloat(row[4] || 0) || 0;

                // Parse Date (XLSX serial or string)
                let dateObj = new Date();
                if (typeof dateRaw === 'number') {
                    dateObj = new Date(Math.round((dateRaw - 25569) * 86400 * 1000));
                } else if (typeof dateRaw === 'string') {
                    dateObj = new Date(dateRaw);
                }
                const dateStr = dateObj.toLocaleDateString('fr-FR');
                
                // Règle 1 : Saisie le dimanche
                if (dateObj.getDay() === 0) {
                    foundAnomalies.push({
                        id: Math.random(),
                        type: "DIMANCHE",
                        severity: "MEDIUM",
                        description: "Écriture passée un dimanche",
                        date: dateStr, compte, montant: debit || credit, libelle
                    });
                }

                // Règle 2 : Caisse créditrice (OHADA 57)
                if (compte.startsWith('57')) {
                    soldeCaisse += debit - credit;
                    if (soldeCaisse < 0) {
                        foundAnomalies.push({
                            id: Math.random(),
                            type: "CAISSE_CREDITRICE",
                            severity: "HIGH",
                            description: "Solde de caisse devenu créditeur",
                            date: dateStr, compte, montant: soldeCaisse, libelle
                        });
                        // Reset solde for demo
                        soldeCaisse = 0; 
                    }
                }

                // Règle 3 : Montant suspect (rond, ex: 50 000, 100 000) dans les charges (6)
                if (compte.startsWith('6') && debit > 0) {
                    if (debit >= 100000 && debit % 50000 === 0) {
                        foundAnomalies.push({
                            id: Math.random(),
                            type: "MONTANT_SUSPECT",
                            severity: "LOW",
                            description: "Montant rond suspect dans une charge",
                            date: dateStr, compte, montant: debit, libelle
                        });
                    }
                }
            }

            setTimeout(() => {
                setAnomalies(foundAnomalies.slice(0, 100)); // limit to 100
                setIsAnalyzing(false);
            }, 2000);

        } catch (err) {
            console.error(err);
            setError("Erreur lors de la lecture du fichier. Assurez-vous d'importer un FEC valide.");
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                        <ShieldAlert className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">Audit Légal IA (FEC Analyzer)</h1>
                        <p className="text-slate-400 font-medium text-sm">Détection algorithmique des anomalies comptables (Caisse créditrice, fraudes).</p>
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
                            file ? "border-rose-500 bg-rose-500/5" : "border-slate-700 hover:border-rose-400 hover:bg-slate-800/50 bg-slate-900/40"
                        )}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input 
                            type="file" 
                            accept=".xlsx, .csv" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        
                        {file ? (
                            <div className="space-y-4 animate-in zoom-in">
                                <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto text-rose-400">
                                    <ShieldAlert className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm truncate max-w-[200px]">{file.name}</h3>
                                    <p className="text-xs text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <button 
                                    className="text-xs font-bold text-slate-400 hover:text-white"
                                    onClick={(e) => { e.stopPropagation(); setFile(null); setAnomalies(null); }}
                                >
                                    Changer de fichier
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400 group-hover:scale-110 group-hover:text-rose-400 transition-all">
                                    <UploadCloud className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm">Importer le FEC</h3>
                                    <p className="text-xs text-slate-500 mt-2 max-w-[200px] mx-auto">Glissez-déposez le Grand Livre (Excel/CSV) pour l'analyse.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={processFile}
                        disabled={!file || isAnalyzing}
                        className={cn(
                            "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all",
                            !file 
                                ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                                : "bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-600/30"
                        )}
                    >
                        {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                        Lancer l'Audit IA
                    </button>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-2">
                    {anomalies ? (
                        <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                            
                            {/* Score Card */}
                            <div className="glass-card rounded-[32px] p-8 border border-white/5 bg-slate-900/40 flex items-center gap-8">
                                <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="64" cy="64" r="56" className="stroke-slate-800" strokeWidth="12" fill="none" />
                                        <circle 
                                            cx="64" cy="64" r="56" 
                                            className={cn("transition-all duration-1000", anomalies.length > 5 ? "stroke-rose-500" : "stroke-emerald-500")}
                                            strokeWidth="12" 
                                            fill="none" 
                                            strokeDasharray="351" 
                                            strokeDashoffset={351 - (351 * Math.min((anomalies.length * 2), 100)) / 100}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-xl sm:text-2xl lg:text-3xl font-black text-white">{anomalies.length}</span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Alertes</span>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tight mb-2">Rapport d'Audit Généré</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        L'analyse du FEC a détecté <span className="text-rose-400 font-bold">{anomalies.filter(a => a.severity === 'HIGH').length} risques critiques</span> et {anomalies.filter(a => a.severity !== 'HIGH').length} anomalies mineures/moyennes nécessitant une révision manuelle.
                                    </p>
                                </div>
                            </div>

                            {/* Anomalies List */}
                            <div className="glass-card rounded-[32px] p-6 border border-white/5 bg-slate-900/40">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 px-2">Détail des écritures suspectes</h3>
                                
                                <div className="space-y-3 max-h-[280px] sm:h-[350px] lg:h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {anomalies.length > 0 ? anomalies.map((anomaly) => (
                                        <div key={anomaly.id} className="p-4 bg-slate-950/50 rounded-2xl border border-white/5 flex gap-4 items-start group hover:border-rose-500/30 transition-all">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                                anomaly.severity === 'HIGH' ? "bg-rose-500/20 text-rose-400" : 
                                                anomaly.severity === 'MEDIUM' ? "bg-amber-500/20 text-amber-400" : 
                                                "bg-blue-500/20 text-blue-400"
                                            )}>
                                                <AlertTriangle className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4 mb-1">
                                                    <h4 className="text-sm font-bold text-white truncate">{anomaly.description}</h4>
                                                    <span className="text-sm font-black text-slate-300 shrink-0">{anomaly.montant.toLocaleString('fr-FR')} FCFA</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                                    <span className="bg-slate-800 px-2 py-0.5 rounded font-mono text-[10px]">{anomaly.compte}</span>
                                                    <span>{anomaly.date}</span>
                                                    <span className="truncate flex-1" title={anomaly.libelle}>{anomaly.libelle}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-12 text-center flex flex-col items-center justify-center">
                                            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
                                            <p className="text-white font-bold">Aucune anomalie détectée</p>
                                            <p className="text-slate-500 text-sm mt-1">Le fichier ne présente pas de risques apparents selon nos règles.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="h-full min-h-[280px] sm:h-[350px] lg:h-[400px] glass-card rounded-[32px] border border-white/5 bg-slate-900/20 flex flex-col items-center justify-center text-center p-8">
                            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                                <Search className="w-10 h-10 text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-300 mb-2">Moteur d'Audit En Veille</h3>
                            <p className="text-sm text-slate-500 max-w-[300px]">
                                Importez un FEC. Notre algorithme analysera 100% des lignes pour détecter la fraude et les erreurs comptables.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
