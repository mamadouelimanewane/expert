"use client";

import { useEffect, useRef, useState } from "react";
import { ScanLine, UploadCloud, FileCheck, Loader2, Save, X, Camera, Sparkles, AlertTriangle, CheckCircle2, Image as ImageIcon, Download, FileText, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";

// Les pieces numerisees ici etaient enregistrees sans client : elles
// n'apparaissaient dans aucun dossier, et l'export comptable qui suit
// agregeait alors les documents de tout le portefeuille dans un seul fichier.
// Le client est desormais choisi avant tout depot.
type ClientOption = { id: string; name: string };

export default function OCRPage() {
    const [step, setStep] = useState<"upload" | "scanning" | "review">("upload");
    const [extractedData, setExtractedData] = useState<any>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [clients, setClients] = useState<ClientOption[]>([]);
    const [clientId, setClientId] = useState<string>("");
    const [sens, setSens] = useState<"achat" | "vente" | "">("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    // Pièce déposée (id en base + fichier en mémoire) pour la relecture par IA
    const [documentId, setDocumentId] = useState<string | null>(null);
    const [fichierDepose, setFichierDepose] = useState<File | null>(null);
    const [iaDisponible, setIaDisponible] = useState<boolean | null>(null);
    const [iaEnCours, setIaEnCours] = useState(false);
    const [lectureIA, setLectureIA] = useState<{ manuscrite: boolean; document: string; confiance: Record<string, string>; champsIllisibles: string[]; remarques: string[]; modele: string; cout: number } | null>(null);

    useEffect(() => {
        fetch("/api/documents/000000000000000000000000/relire-ia").then((r) => r.json()).then((d) => setIaDisponible(!!d.disponible)).catch(() => setIaDisponible(false));
    }, []);

    // Relecture de la pièce par le modèle de vision (manuscrit, photo
    // dégradée). Opt-in : le fichier part vers l'API Anthropic.
    const lireParIA = async () => {
        if (!documentId || !fichierDepose) return;
        setIaEnCours(true); setError(null);
        try {
            const fd = new FormData(); fd.append("file", fichierDepose); if (sens) fd.append("sens", sens);
            const r = await fetch(`/api/documents/${documentId}/relire-ia`, { method: "POST", body: fd });
            const d = await r.json();
            if (!r.ok) { setError(d.error || "Lecture par IA impossible."); return; }
            const data = d.ocrResult.invoiceData ?? {};
            setExtractedData({
                merchant: data.supplier || "Inconnu",
                date: data.date || "",
                total: data.totalTTC ? `${data.totalTTC.toLocaleString()} FCFA` : "",
                tva: data.tva ? `${data.tva.toLocaleString()} FCFA` : "",
                confidence: d.ocrResult.confidence ?? 0,
                invoiceNumber: data.invoiceNumber || "",
            });
            setLectureIA({ manuscrite: d.lecture.manuscrite, document: d.lecture.document, confiance: d.lecture.confiance, champsIllisibles: d.lecture.champsIllisibles ?? [], remarques: d.lecture.remarques ?? [], modele: d.modele, cout: d.usage?.coutEstimeUSD ?? 0 });
            setStep("review");
        } catch {
            setError("Lecture par IA impossible.");
        } finally { setIaEnCours(false); }
    };

    useEffect(() => {
        fetch("/api/clients")
            .then(res => res.json())
            .then(data => {
                setClients((data.clients || []).map((c: any) => ({
                    id: c.id,
                    name: c.companyName || [c.firstName, c.lastName].filter(Boolean).join(" ") || "Client sans nom",
                })));
            })
            .catch(err => console.error("Failed to load clients", err));
    }, []);

    const handleExport = async (format: 'excel' | 'fec') => {
        if (!clientId) {
            setError("Selectionnez le client concerne avant d'exporter.");
            return;
        }
        setIsExporting(true);
        try {
            const response = await fetch(`/api/export?format=${format}&clientId=${clientId}`);
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
        setLectureIA(null);
        setFichierDepose(file);
        setDocumentId(null);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", "FACTURE");
            formData.append("clientId", clientId);
            formData.append("sens", sens);

            const response = await fetch("/api/documents", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Une erreur est survenue lors de l'OCR");
            }
            if (result.document?.id) setDocumentId(result.document.id);

            if (result.ocrResult?.success && result.ocrResult.invoiceData) {
                const data = result.ocrResult.invoiceData;
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
        if (!clientId) {
            setError("Selectionnez le client concerne avant de numeriser une piece.");
            return;
        }
        if (!sens) {
            setError("Indiquez s'il s'agit d'une facture d'achat (fournisseur) ou de vente (client) : l'imputation en depend.");
            return;
        }
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="page-title flex items-center gap-3">
                        <ScanLine className="w-8 h-8 text-primary" />
                        Smart Scan OCR
                    </h2>
                    <p className="page-subtitle">Numérisation et extraction automatique des pièces comptables par IA.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <select
                        value={clientId}
                        onChange={(e) => { setClientId(e.target.value); setError(null); }}
                        className="apix-input min-w-[220px] text-sm"
                    >
                        <option value="">Sélectionner un client…</option>
                        {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <select
                        value={sens}
                        onChange={(e) => { setSens(e.target.value as "achat" | "vente" | ""); setError(null); }}
                        className="apix-input min-w-[200px] text-sm"
                    >
                        <option value="">Sens de la facture…</option>
                        <option value="achat">Achat (fournisseur)</option>
                        <option value="vente">Vente (client)</option>
                    </select>
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
                        "border-2 border-dashed rounded-[32px] h-[300px] sm:h-[400px] lg:h-[500px] flex flex-col items-center justify-center text-center transition-all relative overflow-hidden group",
                        step === "scanning"
                            ? "border-primary bg-slate-900/50"
                            : step === "review"
                                ? "border-emerald-500/50 bg-slate-900"
                                : "border-slate-700 bg-slate-800/20 hover:bg-slate-800/40 hover:border-primary/50 cursor-pointer shadow-inner"
                    )} onClick={step === "upload" ? handleUploadClick : undefined}>

                        {step === "upload" && documentId && iaDisponible && !iaEnCours && (
                            <div className="relative z-20 mb-6 w-full max-w-md rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4 text-left" onClick={(e) => e.stopPropagation()}>
                                <p className="text-sm font-bold text-white">L&apos;OCR local n&apos;a pas suffi (écriture manuscrite, photo floue ?)</p>
                                <p className="text-xs text-slate-400 mt-1">La pièce peut être relue par l&apos;IA : le fichier sera transmis à Anthropic.</p>
                                <button type="button" onClick={lireParIA} className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:brightness-110"><Sparkles className="w-4 h-4" /> Lire avec l&apos;IA (manuscrit)</button>
                            </div>
                        )}
                        {step === "upload" && iaEnCours && (
                            <div className="relative z-20 mb-6 text-sm text-slate-300 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Lecture par l&apos;IA en cours (15 à 40 s)…</div>
                        )}
                        {step === "upload" && (
                            <>
                                <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 group-hover:brightness-110 transition-all border border-white/5">
                                    <Camera className="w-10 h-10 text-primary group-hover:text-white" />
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
                                <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                                <div className="w-full h-1.5 bg-primary absolute top-0 animate-[scan_2s_ease-in-out_infinite]" style={{ boxShadow: "0 0 25px #006B3F" }} />

                                {previewUrl && (
                                    <img src={previewUrl} className="absolute inset-0 w-full h-full object-contain opacity-30 grayscale" alt="Scanning" />
                                )}

                                <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mb-6 relative z-10 shadow-2xl border border-primary/30">
                                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2 relative z-10">Analyse IA en cours...</h3>
                                <p className="text-primary-foreground/70 font-bold uppercase tracking-widest text-xs relative z-10 animate-bounce">Extraction du commerçant, date et montants</p>
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
                <div className="apix-card flex flex-col relative overflow-hidden">
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
                            <div className="flex items-center gap-2">
                                {documentId && iaDisponible && !lectureIA && (
                                    <button type="button" onClick={lireParIA} disabled={iaEnCours} title="Relire la pièce avec le modèle de vision (manuscrit, photo dégradée). Le fichier sera transmis à Anthropic." className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-bold hover:brightness-110 disabled:opacity-60">
                                        {iaEnCours ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} {iaEnCours ? "Lecture…" : "Relire avec l'IA"}
                                    </button>
                                )}
                                <div className="p-2 bg-emerald-500/10 rounded-xl">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                </div>
                            </div>
                        )}
                    </div>

                    {lectureIA && (
                        <div className="relative z-10 mb-5 rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4 text-sm">
                            <p className="font-bold text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-violet-300" /> Lu par l&apos;IA · {lectureIA.modele} · {lectureIA.manuscrite ? "écriture manuscrite" : "imprimé"} · {lectureIA.document} · ≈ {lectureIA.cout.toFixed(3)} $</p>
                            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                                {(["fournisseur", "numero", "date", "montants"] as const).map((k) => (
                                    <span key={k} className={cn("px-2 py-0.5 rounded-full font-bold", lectureIA.confiance[k] === "haute" ? "bg-emerald-500/20 text-emerald-300" : lectureIA.confiance[k] === "moyenne" ? "bg-amber-500/20 text-amber-300" : "bg-rose-500/20 text-rose-300")}>{k} : {lectureIA.confiance[k]}</span>
                                ))}
                            </div>
                            {lectureIA.champsIllisibles.length > 0 && <p className="mt-2 text-rose-300 text-xs">Illisible : {lectureIA.champsIllisibles.join(", ")} — à compléter à la main.</p>}
                            {lectureIA.remarques.length > 0 && <ul className="mt-2 list-disc pl-5 text-slate-300 text-xs space-y-0.5">{lectureIA.remarques.map((r, i) => <li key={i}>{r}</li>)}</ul>}
                        </div>
                    )}

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
                                            className="w-full bg-slate-800/50 border border-slate-700 group-focus-within:border-primary rounded-2xl px-4 py-3 text-white font-bold transition-all outline-none"
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
                                            className="w-full bg-slate-800/50 border border-slate-700 group-focus-within:border-primary rounded-2xl px-4 py-3 text-white font-bold transition-all outline-none"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">N° Facture</label>
                                        <input
                                            type="text"
                                            value={extractedData.invoiceNumber}
                                            onChange={(e) => setExtractedData({ ...extractedData, invoiceNumber: e.target.value })}
                                            className="w-full bg-slate-800/50 border border-slate-700 group-focus-within:border-primary rounded-2xl px-4 py-3 text-white font-bold transition-all outline-none"
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
                                            className="w-full bg-slate-800 border border-primary/50 group-focus-within:border-primary rounded-2xl px-4 py-3 text-emerald-400 font-black text-lg transition-all outline-none shadow-lg shadow-primary/5"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">TVA (18%)</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={extractedData.tva}
                                                onChange={(e) => setExtractedData({ ...extractedData, tva: e.target.value })}
                                                className="w-full bg-slate-800/50 border border-slate-700 group-focus-within:border-primary rounded-2xl px-4 py-3 text-white font-bold transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Aucun controle anti-fraude (format Facture-X/FEC, IBAN, doublons)
                                    n'est effectue par l'application : ce bloc affichait auparavant
                                    trois statuts "CONFORME/VALIDE/UNIQUE" fixes, quel que soit le
                                    document scanne. Retire plutot que d'etre invente. */}
                                <div className="p-5 rounded-2xl bg-slate-800/50 border border-amber-500/20 flex items-start gap-3">
                                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-200/90 leading-relaxed">
                                        Aucune vérification anti-fraude automatisée (format, IBAN, doublons) n&apos;est effectuée : vérifiez ce document manuellement avant de l&apos;enregistrer.
                                    </p>
                                </div>

                                <div className="mt-4 p-5 rounded-2xl bg-primary/10 border border-primary/20 shadow-inner">
                                    <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
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
                                    {isExporting && <Loader2 className="w-3 h-3 text-primary animate-spin" />}
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
                                    <button disabled title="Non implémenté : le document est extrait mais aucune écriture comptable n'est encore générée automatiquement" className="flex-1 py-4 bg-slate-800/50 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 cursor-not-allowed">
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

