import { useRef, useState } from "react";
import {
    ScanLine,
    UploadCloud,
    FileCheck,
    Loader2,
    Save,
    X,
    Camera,
    Sparkles,
    AlertTriangle,
    CheckCircle2,
    Image as ImageIcon,
    Download,
    FileText,
    FileSpreadsheet
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function OCRPage() {
    const [step, setStep] = useState<"upload" | "scanning" | "review">("upload");
    const [extractedData, setExtractedData] = useState<any>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = async (format: 'excel' | 'fec') => {
        setIsExporting(true);
        try {
            const response = await fetch(`/api/export?format=${format}`);
            if (!response.ok) throw new Error("Export failed");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = format === 'fec' ? `fec_export_${Date.now()}.txt` : `accounting_export_${Date.now()}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Export error:", err);
            setError("Impossible d'exporter les données.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Prévisualisation
        const reader = new FileReader();
        reader.onload = () => setPreviewUrl(reader.result as string);
        reader.readAsDataURL(file);

        await processOCR(file);
    };

    const processOCR = async (file: File) => {
        setStep("scanning");
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", "FACTURE");

            const response = await fetch("/api/documents", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Une erreur est survenue lors de l'OCR");
            }

            if (result.ocrResult?.success && result.ocrResult.data) {
                const data = result.ocrResult.data;
                setExtractedData({
                    merchant: data.supplier || "Inconnu",
                    date: data.date || "",
                    total: data.totalTTC ? `${data.totalTTC.toLocaleString()} FCFA` : "",
                    tva: data.tva ? `${data.tva.toLocaleString()} FCFA` : "",
                    confidence: Math.round(result.ocrResult.confidence) || 0,
                    invoiceNumber: data.invoiceNumber || ""
                });
                setStep("review");
            } else {
                throw new Error("Impossible d'extraire les données de cette image. Assurez-vous qu'il s'agit d'une facture lisible.");
            }
        } catch (err: any) {
            console.error("OCR Error:", err);
            setError(err.message);
            setStep("upload");
            setPreviewUrl(null);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <ScanLine className="w-8 h-8 text-indigo-500" />
                        Smart Scan OCR
                    </h2>
                    <p className="text-slate-400 mt-1">Numérisation et extraction automatique des pièces comptables par IA.</p>
                </div>
            </div>

            {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-400 animate-in slide-in-from-top-4">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-rose-500/10 rounded-lg">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Area */}
                <div className="space-y-4">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                    />

                    <div className={cn(
                        "border-2 border-dashed rounded-[32px] h-[500px] flex flex-col items-center justify-center text-center transition-all relative overflow-hidden group",
                        step === "scanning"
                            ? "border-indigo-500 bg-slate-900/50"
                            : step === "review"
                                ? "border-emerald-500/50 bg-slate-900"
                                : "border-slate-700 bg-slate-800/20 hover:bg-slate-800/40 hover:border-indigo-500/50 cursor-pointer shadow-inner"
                    )} onClick={step === "upload" ? handleUploadClick : undefined}>

                        {step === "upload" && (
                            <>
                                <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 group-hover:bg-indigo-600 transition-all border border-white/5">
                                    <Camera className="w-10 h-10 text-indigo-400 group-hover:text-white" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">Prendre une photo</h3>
                                <p className="text-slate-500 max-w-sm font-medium">Ou glissez-déposez votre facture ici (PDF, JPG, PNG)</p>
                                <div className="mt-8 flex gap-3">
                                    <div className="px-4 py-2 bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/5">Auto-Détection</div>
                                    <div className="px-4 py-2 bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/5">OCR Cloud</div>
                                </div>
                            </>
                        )}

                        {step === "scanning" && (
                            <>
                                <div className="absolute inset-0 bg-indigo-500/10 animate-pulse" />
                                <div className="w-full h-1.5 bg-indigo-500 absolute top-0 animate-[scan_2s_ease-in-out_infinite]" style={{ boxShadow: "0 0 25px #6366f1" }} />

                                {previewUrl && (
                                    <img src={previewUrl} className="absolute inset-0 w-full h-full object-contain opacity-30 grayscale" alt="Scanning" />
                                )}

                                <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mb-6 relative z-10 shadow-2xl border border-indigo-500/30">
                                    <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2 relative z-10">Analyse IA en cours...</h3>
                                <p className="text-indigo-300 font-bold uppercase tracking-widest text-xs relative z-10 animate-bounce">Extraction du commerçant, date et montants</p>
                            </>
                        )}

                        {step === "review" && previewUrl && (
                            <div className="relative w-full h-full bg-slate-900 overflow-hidden flex items-center justify-center group/preview">
                                <img src={previewUrl} className="w-full h-full object-contain" alt="Preview" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover/preview:opacity-100 transition-opacity flex flex-col justify-end p-8">
                                    <button
                                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white py-3 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all border border-white/10"
                                        onClick={() => { setStep("upload"); setPreviewUrl(null); setExtractedData(null); }}
                                    >
                                        <X className="w-5 h-5" /> Remplacer le document
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Area */}
                <div className="glass-card rounded-[32px] p-8 border border-slate-700/30 bg-slate-900/40 flex flex-col shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none rounded-full" />

                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors",
                                extractedData ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-600"
                            )}>
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight">Données Extraites</h3>
                                {extractedData && (
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                        Confiance IA: <span className="text-emerald-400">{extractedData.confidence}%</span>
                                    </p>
                                )}
                            </div>
                        </div>
                        {extractedData && (
                            <div className="p-2 bg-emerald-500/10 rounded-xl">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            </div>
                        )}
                    </div>

                    {extractedData ? (
                        <div className="space-y-6 flex-1 relative z-10">
                            <div className="space-y-5">
                                <div className="group">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Commerçant / Fournisseur</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={extractedData.merchant}
                                            onChange={(e) => setExtractedData({ ...extractedData, merchant: e.target.value })}
                                            className="w-full bg-slate-800/50 border border-slate-700 group-focus-within:border-indigo-500 rounded-2xl px-4 py-3 text-white font-bold transition-all outline-none"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="group">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Date</label>
                                        <input
                                            type="text"
                                            value={extractedData.date}
                                            onChange={(e) => setExtractedData({ ...extractedData, date: e.target.value })}
                                            className="w-full bg-slate-800/50 border border-slate-700 group-focus-within:border-indigo-500 rounded-2xl px-4 py-3 text-white font-bold transition-all outline-none"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">N° Facture</label>
                                        <input
                                            type="text"
                                            value={extractedData.invoiceNumber}
                                            onChange={(e) => setExtractedData({ ...extractedData, invoiceNumber: e.target.value })}
                                            className="w-full bg-slate-800/50 border border-slate-700 group-focus-within:border-indigo-500 rounded-2xl px-4 py-3 text-white font-bold transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="group">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Total TTC</label>
                                        <input
                                            type="text"
                                            value={extractedData.total}
                                            onChange={(e) => setExtractedData({ ...extractedData, total: e.target.value })}
                                            className="w-full bg-slate-800 border border-indigo-500/50 group-focus-within:border-indigo-400 rounded-2xl px-4 py-3 text-emerald-400 font-black text-lg transition-all outline-none shadow-lg shadow-indigo-500/5"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">TVA (18%)</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={extractedData.tva}
                                                onChange={(e) => setExtractedData({ ...extractedData, tva: e.target.value })}
                                                className="w-full bg-slate-800/50 border border-slate-700 group-focus-within:border-indigo-500 rounded-2xl px-4 py-3 text-white font-bold transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-inner">
                                    <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <ScanLine className="w-3.5 h-3.5" />
                                        Imputation Comptable (OHADA)
                                    </label>
                                    <select className="w-full bg-transparent border-none p-0 text-white font-bold focus:ring-0 cursor-pointer">
                                        <option className="bg-slate-900">6051 - Achats de fournitures non stockables</option>
                                        <option className="bg-slate-900">6243 - Transports sur achats</option>
                                        <option className="bg-slate-900">6324 - Commissions et courtages</option>
                                        <option className="bg-slate-900">6110 - Fournitures et entretien</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 mt-auto border-t border-white/5">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Options d'Export</label>
                                    {isExporting && <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleExport('fec')}
                                        disabled={isExporting}
                                        className="py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border border-white/5 transition-all"
                                    >
                                        <FileText className="w-4 h-4 text-emerald-400" />
                                        Exporter FEC
                                    </button>
                                    <button
                                        onClick={() => handleExport('excel')}
                                        disabled={isExporting}
                                        className="py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border border-white/5 transition-all"
                                    >
                                        <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                                        Excel / CSV
                                    </button>
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <button className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 active:scale-95">
                                        <Save className="w-5 h-5" />
                                        Enregistrer l'écriture
                                    </button>
                                    <button className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-2xl transition-all border border-white/5 shadow-lg" onClick={() => { setStep("upload"); setExtractedData(null); setPreviewUrl(null); }}>
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                            <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-6 border border-white/5 opacity-50">
                                <ScanLine className="w-10 h-10 text-slate-600" />
                            </div>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs max-w-xs leading-relaxed">En attente d'un document pour lancer l'extraction intelligente des données.</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @keyframes scan {
                    0%, 100% { top: 0; }
                    50% { top: 100%; }
                }
            `}</style>
        </div>
    );
}

