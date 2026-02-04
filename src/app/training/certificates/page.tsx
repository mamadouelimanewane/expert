"use client";

import { useState } from "react";
import {
    Award,
    Download,
    Share2,
    CheckCircle2,
    Calendar,
    Clock,
    BookOpen,
    Star,
    Shield,
    Sparkles,
    ExternalLink,
    Loader2,
    Printer,
    Eye,
    QrCode
} from "lucide-react";
import { cn } from "@/lib/utils";

const CERTIFICATES = [
    {
        id: "CERT-2026-001",
        title: "Consolidation OHADA - Niveau Avancé",
        instructor: "Prof. Amadou Koné",
        issueDate: "15 Janvier 2026",
        expiryDate: null,
        cpfHours: 12,
        grade: "A",
        score: 92,
        status: "valid",
        verificationCode: "OHADA-AK-2026-7845",
        skills: ["Consolidation", "SYSCOHADA", "États Financiers Groupe"]
    },
    {
        id: "CERT-2025-024",
        title: "Loi de Finances 2025 - Impacts Entreprises",
        instructor: "Me. Fatou Diallo",
        issueDate: "20 Décembre 2025",
        expiryDate: "20 Décembre 2026",
        cpfHours: 4,
        grade: "A+",
        score: 98,
        status: "valid",
        verificationCode: "FISC-FD-2025-3421",
        skills: ["Fiscalité", "IR", "IS", "TVA"]
    },
    {
        id: "CERT-2025-018",
        title: "Cybersécurité pour Cabinets",
        instructor: "Jean-Pierre Mensah",
        issueDate: "10 Octobre 2025",
        expiryDate: null,
        cpfHours: 6,
        grade: "B+",
        score: 85,
        status: "valid",
        verificationCode: "CYBER-JM-2025-9102",
        skills: ["Sécurité", "RGPD", "Bonnes Pratiques IT"]
    }
];

const PENDING_CERTIFICATES = [
    {
        id: "PEND-001",
        title: "IFRS 16 - Contrats de Location",
        progress: 78,
        remainingLessons: 4
    }
];

export default function CertificatesPage() {
    const [selectedCert, setSelectedCert] = useState(CERTIFICATES[0]);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = () => {
        setIsDownloading(true);
        setTimeout(() => {
            setIsDownloading(false);
            window.print();
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8 animate-in fade-in duration-500 print:p-0 print:bg-white print:text-black">

            <style jsx global>{`
                @media print {
                    body { background: white !important; }
                    .min-h-screen { padding: 0 !important; space-y: 0 !important; }
                    .print\\:hidden { display: none !important; }
                    .lg\\:col-span-12 { display: block !important; }
                    .lg\\:col-span-5 { display: none !important; }
                    .lg\\:col-span-7 { width: 100% !important; margin: 0 !important; }
                    .bg-gradient-to-br { background: white !important; border: 2px solid #f59e0b !important; }
                    .text-white { color: black !important; }
                    .text-slate-400 { color: #4b5563 !important; }
                    .bg-slate-900 { background: white !important; }
                    .border-white\\/5 { border-color: #e5e7eb !important; }
                    .shadow-xl { shadow: none !important; }
                }
            `}</style>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-8 border-b border-white/5 print:hidden">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-amber-500/20">
                        <Award className="w-3 h-3" /> Mes Certifications
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        Centre de Certifications
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl">
                        Vos diplômes et attestations de formation.
                        <span className="text-amber-400 font-bold"> Téléchargez et partagez</span> vos réussites.
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="text-center p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                        <p className="text-2xl font-black text-amber-400">{CERTIFICATES.length}</p>
                        <p className="text-[10px] text-slate-500 uppercase">Certificats</p>
                    </div>
                    <div className="text-center p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                        <p className="text-2xl font-black text-white">{CERTIFICATES.reduce((acc, c) => acc + c.cpfHours, 0)}h</p>
                        <p className="text-[10px] text-slate-500 uppercase">CPF Validés</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Certificates List */}
                <div className="lg:col-span-5 space-y-6">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Certifications Obtenues
                    </h3>

                    <div className="space-y-4">
                        {CERTIFICATES.map((cert) => (
                            <div
                                key={cert.id}
                                onClick={() => setSelectedCert(cert)}
                                className={cn(
                                    "p-5 rounded-[24px] border cursor-pointer transition-all group relative overflow-hidden",
                                    selectedCert.id === cert.id ? "bg-slate-800/80 border-amber-500/40 shadow-xl" : "bg-slate-900/30 border-white/5 hover:border-white/10"
                                )}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                                        <Award className="w-7 h-7" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors line-clamp-2">{cert.title}</h4>
                                        <p className="text-xs text-slate-500 mt-1">{cert.instructor}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                                <Calendar className="w-3 h-3" /> {cert.issueDate}
                                            </span>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[10px] font-black",
                                                cert.grade.startsWith('A') ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                                            )}>
                                                {cert.grade}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pending */}
                    {PENDING_CERTIFICATES.length > 0 && (
                        <>
                            <h3 className="font-bold text-white flex items-center gap-2 mt-8">
                                <Clock className="w-5 h-5 text-slate-400" /> En cours
                            </h3>
                            {PENDING_CERTIFICATES.map((pend) => (
                                <div key={pend.id} className="p-5 rounded-[24px] bg-slate-900/20 border border-white/5">
                                    <h4 className="font-bold text-slate-400 text-sm">{pend.title}</h4>
                                    <div className="flex items-center gap-4 mt-3">
                                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-teal-500 rounded-full" style={{ width: `${pend.progress}%` }} />
                                        </div>
                                        <span className="text-xs text-teal-400 font-bold">{pend.progress}%</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">{pend.remainingLessons} leçons restantes</p>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                {/* Certificate Preview */}
                <div className="lg:col-span-7 space-y-6">

                    {/* Certificate Display */}
                    <div className="relative">
                        {/* Certificate Card */}
                        <div className="bg-gradient-to-br from-amber-900/20 via-slate-900 to-slate-900 rounded-[40px] border-2 border-amber-500/30 p-10 relative overflow-hidden">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 left-0 w-32 h-32 border-l-4 border-t-4 border-amber-500/20 rounded-tl-[40px]" />
                            <div className="absolute bottom-0 right-0 w-32 h-32 border-r-4 border-b-4 border-amber-500/20 rounded-br-[40px]" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-amber-500/5 rounded-full" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-amber-500/5 rounded-full" />

                            <div className="relative z-10 text-center">
                                {/* Logo */}
                                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl">
                                    <Award className="w-10 h-10 text-white" />
                                </div>

                                <h2 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-2">Certificat de Réussite</h2>
                                <h1 className="text-2xl font-black text-white mb-6">{selectedCert.title}</h1>

                                <p className="text-slate-400 text-sm mb-8">
                                    Ce certificat atteste que <span className="text-white font-bold">Mamadou Wane</span> a complété avec succès la formation ci-dessus.
                                </p>

                                {/* Score & Grade */}
                                <div className="flex justify-center gap-8 mb-8">
                                    <div className="text-center">
                                        <p className="text-4xl font-black text-white">{selectedCert.score}<span className="text-lg text-slate-500">%</span></p>
                                        <p className="text-[10px] text-slate-500 uppercase">Score Final</p>
                                    </div>
                                    <div className="w-px bg-white/10" />
                                    <div className="text-center">
                                        <p className={cn(
                                            "text-4xl font-black",
                                            selectedCert.grade.startsWith('A') ? "text-emerald-400" : "text-amber-400"
                                        )}>{selectedCert.grade}</p>
                                        <p className="text-[10px] text-slate-500 uppercase">Mention</p>
                                    </div>
                                </div>

                                {/* Skills */}
                                <div className="flex justify-center gap-2 flex-wrap mb-8">
                                    {selectedCert.skills.map((skill, i) => (
                                        <span key={i} className="px-3 py-1 bg-slate-800/50 text-slate-400 text-xs rounded-full border border-white/5">
                                            {skill}
                                        </span>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="flex justify-between items-end pt-6 border-t border-white/5">
                                    <div className="text-left">
                                        <p className="text-[10px] text-slate-500 uppercase mb-1">Formateur</p>
                                        <p className="text-sm text-white font-bold">{selectedCert.instructor}</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center mb-1">
                                            <QrCode className="w-10 h-10 text-slate-500" />
                                        </div>
                                        <p className="text-[8px] text-slate-600 font-mono">{selectedCert.verificationCode}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-500 uppercase mb-1">Date d'émission</p>
                                        <p className="text-sm text-white font-bold">{selectedCert.issueDate}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 print:hidden">
                        <button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="flex-1 py-4 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-white rounded-2xl font-bold transition-all shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2"
                        >
                            {isDownloading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> Génération en cours...
                                </>
                            ) : (
                                <>
                                    <Download className="w-5 h-5" /> Télécharger PDF
                                </>
                            )}
                        </button>
                        <button className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all border border-white/10 flex items-center justify-center gap-2">
                            <Share2 className="w-5 h-5" /> Partager sur LinkedIn
                        </button>
                    </div>

                    {/* Verification Info */}
                    <div className="p-6 bg-slate-900/40 border border-white/5 rounded-[24px] flex items-center gap-6 print:hidden">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-white text-sm">Certificat Vérifié & Authentique</h4>
                            <p className="text-xs text-slate-500 mt-1">
                                Ce certificat est enregistré sur notre plateforme et peut être vérifié par tout employeur via le code :
                                <span className="text-teal-400 font-mono ml-1">{selectedCert.verificationCode}</span>
                            </p>
                        </div>
                        <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
                            <ExternalLink className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
