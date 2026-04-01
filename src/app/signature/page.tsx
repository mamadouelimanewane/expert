"use client";

import { useState } from "react";
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

interface DocToSign {
    id: string;
    title: string;
    owners: string[];
    sentDate: string;
    status: "Signé" | "En attente" | "Partiel";
    expiry: string;
    level: "Simple" | "Avancé" | "Qualifié";
}

const MOCK_DOCS: DocToSign[] = [
    { id: "SIG-001", title: "Lettre de Mission - Audit SIB", owners: ["M. Touré", "Assoc. Cabinet"], sentDate: "22/05/2024", status: "Partiel", expiry: "05/06/2024", level: "Qualifié" },
    { id: "SIG-002", title: "Approbation Comptes Annuels 2023", owners: ["J. Dupont"], sentDate: "20/05/2024", status: "Signé", expiry: "30/05/2024", level: "Avancé" },
    { id: "SIG-003", title: "Contrat de Travail - Junior", owners: ["P. Ndiaye", "RH Cabinet"], sentDate: "24/05/2024", status: "En attente", expiry: "10/06/2024", level: "Simple" },
];

const SEALED_DOCS = [
    { id: "VAULT-092", title: "Statuts Traoré Import-Export", date: "15/04/2024", hash: "0x82f...a92b", seal: "OHADA-QS-2024" },
    { id: "VAULT-114", title: "PV Assemblée Générale SOGECOM", date: "10/04/2024", hash: "0x44d...f81e", seal: "OHADA-QS-2024" },
    { id: "VAULT-221", title: "Convention Réglementée BIDC", date: "02/04/2024", hash: "0x11c...772d", seal: "OHADA-QS-2024" },
];

export default function SignaturePage() {
    const [signingDoc, setSigningDoc] = useState<string | null>(null);
    const [signatureCertificate, setSignatureCertificate] = useState<any>(null);

    const handleSign = async (docId: string) => {
        setSigningDoc(docId);
        try {
            const res = await fetch("/api/signature/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documentId: docId, userName: "Expert Principal" })
            });
            const data = await res.json();
            setSignatureCertificate(data.certificate);
            setSigningDoc(null);
            alert(`Document signé avec succès !\nHash : ${data.certificate.hash}\nValeur : ${data.certificate.validity}`);
        } catch (error) {
            console.error("Signature failed:", error);
            setSigningDoc(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            {/* ... rest of the component (header, cards, etc.) ... */}
            {/* Header Premium */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                    <Fingerprint className="w-48 h-48 text-indigo-400" />
                </div>

                <div className="relative z-10">
                    <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-5">
                        <div className="p-4 bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-600/30">
                            <PenTool className="w-8 h-8 text-white" />
                        </div>
                        Signature Électronique Certifiée
                    </h2>
                    <p className="text-slate-400 mt-2 max-w-2xl font-medium text-lg leading-relaxed">
                        Faites signer vos documents juridiques et comptables avec une valeur probante certifiée (ISO/IEC 27001).
                    </p>
                </div>

                <div className="flex gap-4 relative z-10">
                    <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/5 flex items-center gap-3 transition-all">
                        <Key className="w-4 h-4 text-indigo-400" /> Mes Certificats
                    </button>
                    <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30 active:scale-95">
                        <Plus className="w-5 h-5" /> Signer un Document
                    </button>
                </div>
            </div>

            {/* Verification & Trust Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TrustCard icon={ShieldCheck} title="Valeur Probante" desc="Conforme aux règlements eIDAS & OHADA." color="text-indigo-400" />
                <TrustCard icon={Smartphone} title="Validation Mobile" desc="Double authentification par SMS/Email." color="text-cyan-400" />
                <TrustCard icon={History} title="Audit Trail" desc="Historique complet et scellé pour chaque acte." color="text-emerald-400" />
            </div>

            {/* NEW: Certification Levels & Compliance Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card p-10 rounded-[48px] border border-white/5 bg-slate-900/60 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <Lock className="w-48 h-48 text-indigo-400" />
                    </div>

                    <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-indigo-400" />
                        Niveaux de Certification Disponibles
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <CertificationCard
                            level="Qualifiée (AES)"
                            desc="Valeur juridique identique à la signature manuscrite. Vérification d'identité face-à-face (ID Now)."
                            price="Haute Sécurité"
                            color="text-emerald-400"
                        />
                        <CertificationCard
                            level="Avancée"
                            desc="Établit un lien univoque avec le signataire. Idéal pour les contrats commerciaux et RH."
                            price="Standard"
                            color="text-indigo-400"
                        />
                        <CertificationCard
                            level="Simple"
                            desc="Validation rapide par email ou SMS. Adapté aux documents internes et devis."
                            price="Rapide"
                            color="text-slate-400"
                        />
                    </div>
                </div>

                <div className="glass-card p-10 rounded-[48px] border border-white/5 bg-slate-900/40 flex flex-col justify-center">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Zap className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h4 className="text-white font-black text-xl">Nexus Sign IA</h4>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto">
                            L'IA analyse vos documents pour suggérer automatiquement le niveau de signature requis selon la législation OHADA.
                        </p>
                        <button className="mt-6 px-8 py-3 bg-white text-indigo-950 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all">
                            Activer l'Auto-Compliance
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Workflow Tracking Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="glass-card p-10 rounded-[48px] border border-white/5 bg-slate-900/60 shadow-2xl">
                        <h3 className="text-xl font-black text-white mb-8">Workflows en Cours</h3>
                        <div className="space-y-6">
                            <WorkflowItem
                                title="Approbation Bilan SIB"
                                steps={3}
                                current={2}
                                nextSigner="Commissaire aux Comptes"
                            />
                            <WorkflowItem
                                title="Contrat Consultant"
                                steps={2}
                                current={1}
                                nextSigner="Directeur Général"
                            />
                        </div>

                        <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/5">
                            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Relance Intelligente</h5>
                            <p className="text-xs text-slate-400 mb-4 font-medium leading-relaxed">
                                2 signataires sont en retard. Voulez-vous envoyer une relance SMS automatique ?
                            </p>
                            <button className="text-xs font-black text-indigo-400 uppercase tracking-widest hover:underline">Relancer tout le monde</button>
                        </div>
                    </div>

                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40">
                        <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-6">Statistiques Signature</h4>
                        <div className="space-y-8">
                            <StatProgress label="Signatures Réussies" value={98} total={100} color="bg-emerald-500" />
                            <StatProgress label="Délai Moyen" value={4} total={24} unit="h" color="bg-indigo-500" />
                            <StatProgress label="Économie Papier" value={1250} total={1500} unit=" pages" color="bg-cyan-500" />
                        </div>
                    </div>
                </div>

                {/* Main Documents Table */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    <div className="glass-card rounded-[48px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40">
                            <h3 className="text-xl font-black text-white flex items-center gap-3">
                                <History className="w-5 h-5 text-indigo-400" />
                                Suivi des Signatures
                            </h3>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                <input
                                    type="text"
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
                                        <th className="px-6 py-6 font-black text-center">Niveau</th>
                                        <th className="px-6 py-6 font-black">Statut</th>
                                        <th className="px-8 py-6 font-black text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {MOCK_DOCS.map((doc) => (
                                        <tr key={doc.id} className="hover:bg-indigo-600/5 transition-colors group cursor-pointer">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                                        <FileText className="w-6 h-6 text-slate-400 group-hover:text-white" />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-white block group-hover:text-indigo-400 transition-colors">{doc.title}</span>
                                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Réf: {doc.id} • {doc.sentDate}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <span className={cn(
                                                    "text-[9px] px-3 py-1 rounded-full font-black uppercase border tracking-tighter",
                                                    doc.level === "Qualifié" ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/5" :
                                                        doc.level === "Avancé" ? "border-indigo-500/30 text-indigo-400 bg-indigo-500/5" :
                                                            "border-slate-700 text-slate-500"
                                                )}>
                                                    {doc.level}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className={cn(
                                                    "flex items-center gap-2 text-[10px] font-black uppercase px-4 py-1.5 rounded-full border w-fit shadow-lg transition-transform group-hover:scale-105",
                                                    doc.status === "Signé" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10" :
                                                        doc.status === "Partiel" ? "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/10" :
                                                            "bg-slate-800 text-slate-500 border-slate-700"
                                                )}>
                                                    {doc.status === "Signé" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                                    {doc.status}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-500 hover:text-white transition-all shadow-sm">
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleSign(doc.id)}
                                                        disabled={signingDoc === doc.id}
                                                        className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                                                    >
                                                        {signingDoc === doc.id ? "Signature..." : (doc.status === "Signé" ? "Consulter" : "Signer")}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* NEW: Probatory Vault Section */}
                    <div className="glass-card rounded-[48px] border border-white/10 bg-slate-900/60 p-10 overflow-hidden relative shadow-[0_0_50px_rgba(99,102,241,0.1)]">
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                            <Lock className="w-48 h-48 text-indigo-400" />
                        </div>
                        
                        <div className="flex justify-between items-center mb-10 relative z-10">
                            <div>
                                <h3 className="text-2xl font-black text-white flex items-center gap-4">
                                    <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                                        <Layers className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    Coffre-Fort Probatoire Scellé
                                </h3>
                                <p className="text-sm text-slate-500 mt-1 font-medium italic">Actes avec valeur probante certifiée OHADA.</p>
                            </div>
                            <button className="text-[10px] font-black text-indigo-400 border border-indigo-500/30 px-5 py-2 rounded-xl uppercase tracking-widest hover:bg-indigo-500/10 transition-all">
                                Certifier nouveau
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            {SEALED_DOCS.map((vaultDoc) => (
                                <div key={vaultDoc.id} className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] transition-all group relative overflow-hidden">
                                     <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500 group-hover:text-indigo-400">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[8px] font-black text-emerald-400 border border-emerald-400/30 px-2 py-0.5 rounded-full uppercase">Scellé</span>
                                        </div>
                                     </div>
                                     <h4 className="font-bold text-white text-sm mb-1">{vaultDoc.title}</h4>
                                     <p className="text-[10px] text-slate-500 mb-4 font-mono">{vaultDoc.date} • {vaultDoc.seal}</p>
                                     <div className="flex items-center gap-2 pt-4 border-t border-white/5 mt-2">
                                        <Fingerprint className="w-3 h-3 text-slate-600" />
                                        <span className="text-[9px] text-slate-600 font-mono truncate flex-1">{vaultDoc.hash}</span>
                                        <button className="text-indigo-400 hover:text-white transition-colors">
                                            <Maximize2 className="w-3.5 h-3.5" />
                                        </button>
                                     </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function WorkflowItem({ title, steps, current, nextSigner }: any) {
    const progress = (current / steps) * 100;
    return (
        <div className="p-5 bg-white/5 rounded-3xl border border-white/5 space-y-4 hover:bg-white/10 transition-all group">
            <div className="flex justify-between items-start">
                <h5 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{title}</h5>
                <span className="text-[10px] font-black text-slate-500 uppercase">{current}/{steps}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                <p className="text-[9px] text-slate-400 font-medium">Prochain signataire : <span className="text-white font-bold">{nextSigner}</span></p>
            </div>
        </div>
    );
}

function CertificationCard({ level, desc, price, color }: any) {
    return (
        <div className="p-6 bg-slate-950/40 rounded-[32px] border border-white/5 space-y-4 hover:bg-slate-950 transition-all group">
            <div className={cn("text-[10px] font-black uppercase tracking-widest", color)}>{level}</div>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{desc}</p>
            <div className="pt-2 border-t border-white/5 text-[9px] font-black uppercase text-slate-600">{price}</div>
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

function StatProgress({ label, value, total, unit, color }: any) {
    const percentage = Math.round((value / total) * 100);
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-end">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{label}</span>
                <span className="text-xs font-black text-white">{value}{unit || ""}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-1000 shadow-[0_0_10px]", color)} style={{ width: `${percentage}%`, opacity: 0.8 }} />
            </div>
        </div>
    );
}
