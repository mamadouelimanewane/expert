"use client";

import { useState, useEffect } from "react";
import {
    ShieldCheck,
    PenTool,
    FileText,
    Users,
    Mail,
    Lock,
    Eye,
    Download,
    CheckCircle2,
    Clock,
    AlertCircle,
    Plus,
    Search,
    MoreVertical,
    History,
    Fingerprint,
    Smartphone,
    ArrowUpRight,
    Key,
    ExternalLink,
    Zap,
    Layers,
    Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DocRecord {
    id: string;
    title: string;
    client: string;
    date: string;
    status: string; // UPLOADED, PROCESSING, PROCESSED, ERROR
    ocrData?: any;
}

export default function SignaturePage() {
    const [documents, setDocuments] = useState<DocRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [signingDoc, setSigningDoc] = useState<string | null>(null);
    const [signResult, setSignResult] = useState<{ id: string; message: string } | null>(null);
    const [search, setSearch] = useState("");

    const loadDocuments = () => {
        fetch("/api/documents")
            .then(res => res.json())
            .then(data => {
                const docs: DocRecord[] = (data.documents || []).map((d: any) => ({
                    id: d.id,
                    title: d.originalName,
                    client: d.client?.companyName || `${d.client?.firstName ?? ""} ${d.client?.lastName ?? ""}`.trim() || "—",
                    date: d.createdAt,
                    status: d.status,
                    ocrData: d.ocrData,
                }));
                setDocuments(docs);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadDocuments(); }, []);

    const toSign = documents.filter(d => d.status !== "PROCESSED" && d.title.toLowerCase().includes(search.toLowerCase()));
    const signed = documents.filter(d => d.status === "PROCESSED" && d.ocrData?.hash);

    const handleSign = async (docId: string) => {
        setSigningDoc(docId);
        setSignResult(null);
        try {
            const res = await fetch("/api/signature/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documentId: docId, userName: "Expert Principal" })
            });
            const data = await res.json();
            if (res.ok) {
                setSignResult({ id: docId, message: `Signé — ${data.certificate.legalNotice}` });
                loadDocuments();
            } else {
                setSignResult({ id: docId, message: data.error || "Erreur lors de la signature" });
            }
        } catch (error) {
            setSignResult({ id: docId, message: "Erreur de connexion" });
        } finally {
            setSigningDoc(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            {/* ... rest of the component (header, cards, etc.) ... */}
            {/* Header Premium */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 sm:p-8 lg:p-16 opacity-5 pointer-events-none">
                    <Fingerprint className="w-48 h-48 text-indigo-400" />
                </div>

                <div className="relative z-10">
                    <h2 className="page-title flex items-center gap-5">
                        <div className="p-4 bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-600/30">
                            <PenTool className="w-8 h-8 text-white" />
                        </div>
                        Signature Électronique Certifiée
                    </h2>
                    <p className="page-subtitle">
                        Faites signer vos documents avec une empreinte d'intégrité (hash SHA-256 + horodatage), tracée dans le journal d'audit.
                    </p>
                </div>
            </div>

            {/* Avertissement légal honnête */}
            <div className="flex items-start gap-3 p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-300">
                    Ce module applique une empreinte d'intégrité (hash SHA-256 + horodatage + journal d'audit interne) à chaque document. Il ne s'agit <strong>pas</strong> d'une signature électronique qualifiée au sens du règlement eIDAS ou de l'AUSCGIE : aucun prestataire de confiance / autorité d'horodatage tierce n'est connecté à ce jour. Pour une valeur probante pleinement opposable, faites appel à un prestataire de signature électronique qualifié.
                </p>
            </div>

            {/* Verification & Trust Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TrustCard icon={Fingerprint} title="Empreinte SHA-256" desc="Hash calculé sur le document et le signataire réels." color="text-indigo-400" />
                <TrustCard icon={History} title="Journal d'Audit" desc="Chaque signature est tracée dans le journal d'audit du cabinet." color="text-emerald-400" />
                <TrustCard icon={Lock} title="Horodatage" desc="Date et heure exactes enregistrées avec le document." color="text-cyan-400" />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Stats Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40">
                        <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-6">Statistiques Signature (réelles)</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-400">Documents signés</span>
                                <span className="text-lg font-black text-emerald-400">{signed.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-400">En attente de signature</span>
                                <span className="text-lg font-black text-amber-400">{toSign.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-400">Total documents</span>
                                <span className="text-lg font-black text-white">{documents.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Documents Table */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    <div className="glass-card rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40">
                            <h3 className="text-xl font-black text-white flex items-center gap-3">
                                <History className="w-5 h-5 text-indigo-400" />
                                Documents à Signer
                            </h3>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Rechercher par titre..."
                                    className="w-full bg-slate-950 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500/50 outline-none"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-950/80 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                                    <tr>
                                        <th className="px-8 py-6">Document</th>
                                        <th className="px-6 py-6 font-black">Statut</th>
                                        <th className="px-8 py-6 font-black text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {toSign.map((doc) => (
                                        <tr key={doc.id} className="hover:bg-indigo-600/5 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                                        <FileText className="w-6 h-6 text-slate-400 group-hover:text-white" />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-white block group-hover:text-indigo-400 transition-colors">{doc.title}</span>
                                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{doc.client} • {new Date(doc.date).toLocaleDateString("fr-FR")}</span>
                                                        {signResult?.id === doc.id && (
                                                            <p className="text-[10px] text-indigo-300 mt-1">{signResult.message}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase px-4 py-1.5 rounded-full border w-fit bg-slate-800 text-slate-500 border-slate-700">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {doc.status}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleSign(doc.id)}
                                                        disabled={signingDoc === doc.id}
                                                        className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                                                    >
                                                        {signingDoc === doc.id ? "Signature..." : "Signer"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {!loading && toSign.length === 0 && (
                                        <tr><td colSpan={3} className="px-8 py-10 text-center text-sm text-slate-500">Aucun document en attente de signature.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Documents signés (empreinte réelle) */}
                    <div className="glass-card rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border border-white/10 bg-slate-900/60 p-4 sm:p-6 lg:p-10 overflow-hidden relative shadow-[0_0_50px_rgba(99,102,241,0.1)]">
                        <div className="absolute top-0 right-0 p-4 sm:p-8 lg:p-12 opacity-5 pointer-events-none">
                            <Lock className="w-48 h-48 text-indigo-400" />
                        </div>

                        <div className="mb-10 relative z-10">
                            <h3 className="text-2xl font-black text-white flex items-center gap-4">
                                <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                                    <Layers className="w-6 h-6 text-indigo-400" />
                                </div>
                                Documents Signés
                            </h3>
                            <p className="text-sm text-slate-500 mt-1 font-medium italic">Empreinte SHA-256 réelle, horodatage et traçabilité dans le journal d'audit.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            {signed.map((doc) => (
                                <div key={doc.id} className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] transition-all group relative overflow-hidden">
                                     <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500 group-hover:text-indigo-400">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[8px] font-black text-emerald-400 border border-emerald-400/30 px-2 py-0.5 rounded-full uppercase">Signé</span>
                                        </div>
                                     </div>
                                     <h4 className="font-bold text-white text-sm mb-1">{doc.title}</h4>
                                     <p className="text-[10px] text-slate-500 mb-4 font-mono">{new Date(doc.ocrData.signedAt).toLocaleString("fr-FR")} • {doc.ocrData.signerName}</p>
                                     <div className="flex items-center gap-2 pt-4 border-t border-white/5 mt-2">
                                        <Fingerprint className="w-3 h-3 text-slate-600" />
                                        <span className="text-[9px] text-slate-600 font-mono truncate flex-1">{doc.ocrData.hash}</span>
                                     </div>
                                </div>
                            ))}
                            {!loading && signed.length === 0 && (
                                <p className="text-sm text-slate-500 col-span-2">Aucun document signé pour l'instant.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TrustCard({ icon: Icon, title, desc, color }: any) {
    return (
        <div className="glass-card p-8 rounded-[40px] bg-slate-900/40 border border-white/5 flex items-start gap-6 group hover:bg-slate-900/60 transition-all">
            <div className={cn("p-4 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform", color)}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <h4 className="text-white font-black text-sm uppercase tracking-widest mb-1">{title}</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}
