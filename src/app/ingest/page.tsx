"use client";

import { useState } from "react";
import {
    Upload,
    FileSpreadsheet,
    ArrowRight,
    Check,
    AlertCircle,
    Database,
    Wand2,
    Save,
    Trash2,
    Table
} from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "upload" | "mapping" | "review" | "success";

interface Transaction {
    id: string;
    date: string;
    label: string;
    amount: string;
    type: "recette" | "depense";
    suggestedAccount: string;
    accountLabel: string;
    confidence: number;
    status: "pending" | "validated" | "error";
}

const MOCK_IMPORTED_DATA: Transaction[] = [
    { id: "1", date: "02/06/2024", label: "Vente Marchandises - Client X", amount: "150 000", type: "recette", suggestedAccount: "701100", accountLabel: "Vente March. A", confidence: 0.99, status: "pending" },
    { id: "2", date: "03/06/2024", label: "Station Total - Carburant", amount: "-25 000", type: "depense", suggestedAccount: "605100", accountLabel: "Transport", confidence: 0.95, status: "pending" },
    { id: "3", date: "05/06/2024", label: "Achat Fournitures Bureau", amount: "-12 000", type: "depense", suggestedAccount: "604100", accountLabel: "Achats Mat.", confidence: 0.88, status: "pending" },
    { id: "4", date: "06/06/2024", label: "Règlement CIE (Électricité)", amount: "-45 000", type: "depense", suggestedAccount: "605200", accountLabel: "Électricité", confidence: 0.92, status: "pending" },
    { id: "5", date: "10/06/2024", label: "Retrait Espèces Inconnu", amount: "-50 000", type: "depense", suggestedAccount: "471000", accountLabel: "Compte d'attente", confidence: 0.40, status: "error" },
];

export default function IngestPage() {
    const [step, setStep] = useState<Step>("upload");
    const [transactions, setTransactions] = useState<Transaction[]>(MOCK_IMPORTED_DATA);
    const [fileName, setFileName] = useState("");

    const handleFileUpload = () => {
        // Simulate generic file upload
        setTimeout(() => {
            setFileName("Registre_Juin_2024.xlsx");
            setStep("mapping");
        }, 1000);
    };

    const startProcessing = () => {
        setStep("review");
    };

    const validateAll = () => {
        setStep("success");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Database className="w-8 h-8 text-emerald-400" />
                        Import & Saisie Automatisée
                    </h2>
                    <p className="text-slate-400 mt-1">Intégration des registres Recettes/Dépenses (Excel/CSV) avec imputation IA.</p>
                </div>
            </div>

            {/* Progress Stepper */}
            <div className="flex items-center justify-center gap-4 mb-8">
                {["Import Fichier", "Mapping", "Revue IA", "Validation"].map((label, idx) => {
                    const isActive =
                        (step === "upload" && idx === 0) ||
                        (step === "mapping" && idx === 1) ||
                        (step === "review" && idx === 2) ||
                        (step === "success" && idx === 3);
                    const isDone =
                        (step === "mapping" && idx < 1) ||
                        (step === "review" && idx < 2) ||
                        (step === "success" && idx < 3);

                    return (
                        <div key={idx} className="flex items-center gap-2">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                                isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" :
                                    isDone ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-500"
                            )}>
                                {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span className={cn(
                                "text-sm font-medium hidden sm:block",
                                isActive ? "text-white" : isDone ? "text-emerald-400" : "text-slate-500"
                            )}>{label}</span>
                            {idx < 3 && <div className="w-8 h-0.5 bg-slate-800 mx-2" />}
                        </div>
                    );
                })}
            </div>

            <div className="glass-card rounded-2xl border border-slate-700/50 p-6 min-h-[500px] flex flex-col">

                {/* STEP 1: UPLOAD */}
                {step === "upload" && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <div
                            onClick={handleFileUpload}
                            className="w-full max-w-xl h-64 border-2 border-dashed border-slate-600 hover:border-indigo-500 hover:bg-slate-800/30 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all group"
                        >
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <FileSpreadsheet className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Déposez le registre Excel / CSV</h3>
                            <p className="text-slate-400">Glissez le fichier envoyé par le client ici.</p>
                            <p className="text-xs text-slate-500 mt-4">(Modèles supportés: Recettes-Dépenses Standard, Relevé Bancaire)</p>
                        </div>
                    </div>
                )}

                {/* STEP 2: MAPPING */}
                {step === "mapping" && (
                    <div className="flex-1 max-w-2xl mx-auto w-full space-y-6">
                        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-6">
                            <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
                            <div>
                                <p className="text-sm font-bold text-white">Fichier détecté : {fileName}</p>
                                <p className="text-xs text-emerald-400">Colonnes identifiées avec succès.</p>
                            </div>
                        </div>

                        <h3 className="font-bold text-white mb-4">Confirmer le mapping des colonnes</h3>
                        <div className="space-y-4">
                            {[
                                { sys: "Date Opération", file: "Col A: Date" },
                                { sys: "Libellé / Tiers", file: "Col B: Description" },
                                { sys: "Montant", file: "Col D: Montant TTC" },
                                { sys: "Type (Rec/Dép)", file: "Automatique (Signe +/-)" },
                            ].map((map, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                    <span className="text-sm font-medium text-slate-300">{map.sys}</span>
                                    <ArrowRight className="w-4 h-4 text-slate-500" />
                                    <select className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500">
                                        <option>{map.file}</option>
                                    </select>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 flex justify-end">
                            <button
                                onClick={startProcessing}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/25"
                            >
                                <Wand2 className="w-4 h-4" />
                                Lancer l'imputation IA
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: REVIEW */}
                {step === "review" && (
                    <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white">Revue des Écritures</h3>
                                <p className="text-sm text-slate-400"><span className="text-emerald-400 font-bold">4</span> écritures fiables, <span className="text-amber-400 font-bold">1</span> à vérifier.</p>
                            </div>
                            <button
                                onClick={validateAll}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                            >
                                <Check className="w-4 h-4" />
                                Tout valider
                            </button>
                        </div>

                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-700 text-slate-500">
                                        <th className="p-3 font-medium">Date</th>
                                        <th className="p-3 font-medium">Libellé Importé</th>
                                        <th className="p-3 font-medium text-right">Montant</th>
                                        <th className="p-3 font-medium cursor-pointer group">
                                            <div className="flex items-center gap-1">
                                                Compte Suggéré (IA) <Wand2 className="w-3 h-3 text-indigo-400" />
                                            </div>
                                        </th>
                                        <th className="p-3 font-medium text-center">Confiance</th>
                                        <th className="p-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-800/30 group transition-colors">
                                            <td className="p-3 text-slate-300 font-mono text-xs">{tx.date}</td>
                                            <td className="p-3 text-white font-medium">{tx.label}</td>
                                            <td className={cn(
                                                "p-3 text-right font-mono font-bold",
                                                tx.type === "recette" ? "text-emerald-400" : "text-white"
                                            )}>
                                                {tx.amount}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        defaultValue={tx.suggestedAccount}
                                                        className={cn(
                                                            "w-16 bg-slate-900 border rounded px-2 py-1 text-center font-mono font-bold focus:outline-none focus:border-indigo-500",
                                                            tx.status === "error" ? "border-amber-500 text-amber-400" : "border-slate-700 text-indigo-300"
                                                        )}
                                                    />
                                                    <span className="text-xs text-slate-500 hidden sm:block">{tx.accountLabel}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className={cn(
                                                    "px-2 py-0.5 rounded text-[10px] font-bold inline-block min-w-[3rem]",
                                                    tx.confidence > 0.9 ? "bg-emerald-500/10 text-emerald-400" :
                                                        tx.confidence > 0.7 ? "bg-indigo-500/10 text-indigo-400" : "bg-rose-500/10 text-rose-400"
                                                )}>
                                                    {Math.round(tx.confidence * 100)}%
                                                </div>
                                            </td>
                                            <td className="p-3 text-right">
                                                <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-1.5 hover:bg-emerald-500/20 hover:text-emerald-400 rounded transition-colors" title="Valider">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-1.5 hover:bg-rose-500/20 hover:text-rose-400 rounded transition-colors" title="Supprimer">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* STEP 4: SUCCESS */}
                {step === "success" && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                            <Database className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Importation Réussie !</h3>
                        <p className="text-slate-400 mb-8">
                            <strong className="text-white">5 écritures</strong> ont été comptabilisées dans le journal de <br />
                            <span className="text-indigo-400">Société Ivoirienne de Banque</span>.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep("upload")}
                                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium border border-slate-700 transition-colors"
                            >
                                Importer un autre fichier
                            </button>
                            <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-colors">
                                Voir le Grand Livre
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
