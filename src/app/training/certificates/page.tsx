"use client";

import { useState, useEffect } from "react";
import {
    Award,
    Download,
    Share2,
    CheckCircle2,
    Calendar,
    Clock,
    Shield,
    ExternalLink,
    Loader2,
    QrCode
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Certificate {
    id: string; title: string; instructor: string | null; issueDate: string; expiryDate: string | null;
    cpfHours: number; grade: string; score: number; verificationCode: string; skills: string[];
}
interface Pending { id: string; title: string; progress: number; remainingLessons: number; }

export default function CertificatesPage() {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [pending, setPending] = useState<Pending[]>([]);
    const [userName, setUserName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

    useEffect(() => {
        fetch("/api/training/certificates")
            .then(res => res.json())
            .then(data => {
                setCertificates(data.certificates ?? []);
                setPending(data.pending ?? []);
                setUserName(data.userName ?? null);
                setSelectedCert(data.certificates?.[0] ?? null);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>;
    }

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8 animate-in fade-in duration-500 print:p-0 print:bg-white print:text-black">

            <style jsx global>{`
                @media print {
                    body { background: white !important; }
                    .min-h-screen { padding: 0 !important; }
                    .print\\:hidden { display: none !important; }
                    .lg\\:col-span-5 { display: none !important; }
                    .lg\\:col-span-7 { width: 100% !important; margin: 0 !important; }
                    .bg-gradient-to-br { background: white !important; border: 2px solid #f59e0b !important; }
                    .text-white { color: black !important; }
                    .text-slate-400 { color: #4b5563 !important; }
                    .bg-slate-900 { background: white !important; }
                    .border-white\\/5 { border-color: #e5e7eb !important; }
                }
            `}</style>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-8 border-b border-white/5 print:hidden">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-amber-500/20">
                        <Award className="w-3 h-3" /> Mes Certifications
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                        Centre de Certifications
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl">
                        Vos diplômes et attestations de formation.
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="text-center p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                        <p className="text-2xl font-black text-amber-400">{certificates.length}</p>
                        <p className="text-[10px] text-slate-500 uppercase">Certificats</p>
                    </div>
                    <div className="text-center p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                        <p className="text-2xl font-black text-white">{certificates.reduce((acc, c) => acc + c.cpfHours, 0)}h</p>
                        <p className="text-[10px] text-slate-500 uppercase">CPF Validés</p>
                    </div>
                </div>
            </div>

            {certificates.length === 0 ? (
                <div className="p-10 bg-slate-900/40 border border-white/5 rounded-[32px] text-center">
                    <Award className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">Aucun certificat obtenu pour l'instant</p>
                    <p className="text-slate-500 text-sm mt-2">Terminez une formation certifiante et réussissez le quiz final pour obtenir votre premier certificat.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-5 space-y-6">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Certifications Obtenues
                        </h3>

                        <div className="space-y-4">
                            {certificates.map((cert) => (
                                <div
                                    key={cert.id}
                                    onClick={() => setSelectedCert(cert)}
                                    className={cn(
                                        "p-5 rounded-[24px] border cursor-pointer transition-all group relative overflow-hidden",
                                        selectedCert?.id === cert.id ? "bg-slate-800/80 border-amber-500/40 shadow-xl" : "bg-slate-900/30 border-white/5 hover:border-white/10"
                                    )}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                                            <Award className="w-7 h-7" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors line-clamp-2">{cert.title}</h4>
                                            <p className="text-xs text-slate-500 mt-1">{cert.instructor || "Formateur non précisé"}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Calendar className="w-3 h-3" /> {new Date(cert.issueDate).toLocaleDateString("fr-FR")}
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

                        {pending.length > 0 && (
                            <>
                                <h3 className="font-bold text-white flex items-center gap-2 mt-8">
                                    <Clock className="w-5 h-5 text-slate-400" /> En cours
                                </h3>
                                {pending.map((pend) => (
                                    <div key={pend.id} className="p-5 rounded-[24px] bg-slate-900/20 border border-white/5">
                                        <h4 className="font-bold text-slate-400 text-sm">{pend.title}</h4>
                                        <div className="flex items-center gap-4 mt-3">
                                            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-teal-500 rounded-full" style={{ width: `${pend.progress}%` }} />
                                            </div>
                                            <span className="text-xs text-teal-400 font-bold">{pend.progress}%</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">{pend.remainingLessons} leçon{pend.remainingLessons !== 1 ? "s" : ""} restante{pend.remainingLessons !== 1 ? "s" : ""}</p>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    <div className="lg:col-span-7 space-y-6">
                        {selectedCert && (
                            <>
                                <div className="relative">
                                    <div className="bg-gradient-to-br from-amber-900/20 via-slate-900 to-slate-900 rounded-[40px] border-2 border-amber-500/30 p-4 sm:p-6 lg:p-10 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-32 h-32 border-l-4 border-t-4 border-amber-500/20 rounded-tl-[40px]" />
                                        <div className="absolute bottom-0 right-0 w-32 h-32 border-r-4 border-b-4 border-amber-500/20 rounded-br-[40px]" />
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-amber-500/5 rounded-full" />
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-amber-500/5 rounded-full" />

                                        <div className="relative z-10 text-center">
                                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl">
                                                <Award className="w-10 h-10 text-white" />
                                            </div>

                                            <h2 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-2">Certificat de Réussite</h2>
                                            <h1 className="text-2xl font-black text-white mb-6">{selectedCert.title}</h1>

                                            <p className="text-slate-400 text-sm mb-8">
                                                Ce certificat atteste que <span className="text-white font-bold">{userName || "l'utilisateur"}</span> a complété avec succès la formation ci-dessus.
                                            </p>

                                            <div className="flex justify-center gap-8 mb-8">
                                                <div className="text-center">
                                                    <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">{selectedCert.score}<span className="text-lg text-slate-500">%</span></p>
                                                    <p className="text-[10px] text-slate-500 uppercase">Score Final</p>
                                                </div>
                                                <div className="w-px bg-white/10" />
                                                <div className="text-center">
                                                    <p className={cn("text-2xl sm:text-3xl lg:text-4xl font-black", selectedCert.grade.startsWith('A') ? "text-emerald-400" : "text-amber-400")}>{selectedCert.grade}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase">Mention</p>
                                                </div>
                                            </div>

                                            <div className="flex justify-center gap-2 flex-wrap mb-8">
                                                {selectedCert.skills.map((skill, i) => (
                                                    <span key={i} className="px-3 py-1 bg-slate-800/50 text-slate-400 text-xs rounded-full border border-white/5">{skill}</span>
                                                ))}
                                            </div>

                                            <div className="flex justify-between items-end pt-6 border-t border-white/5">
                                                <div className="text-left">
                                                    <p className="text-[10px] text-slate-500 uppercase mb-1">Formateur</p>
                                                    <p className="text-sm text-white font-bold">{selectedCert.instructor || "—"}</p>
                                                </div>
                                                <div className="text-center">
                                                    <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center mb-1">
                                                        <QrCode className="w-10 h-10 text-slate-500" />
                                                    </div>
                                                    <p className="text-[8px] text-slate-600 font-mono">{selectedCert.verificationCode}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-slate-500 uppercase mb-1">Date d'émission</p>
                                                    <p className="text-sm text-white font-bold">{new Date(selectedCert.issueDate).toLocaleDateString("fr-FR")}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 print:hidden">
                                    <button
                                        onClick={() => window.print()}
                                        className="flex-1 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-5 h-5" /> Télécharger / Imprimer
                                    </button>
                                    <button
                                        disabled
                                        title="Partage LinkedIn non encore configuré"
                                        className="flex-1 py-4 bg-slate-800 text-slate-500 rounded-2xl font-bold border border-white/10 flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
                                    >
                                        <Share2 className="w-5 h-5" /> Partager sur LinkedIn
                                    </button>
                                </div>

                                <div className="p-6 bg-slate-900/40 border border-white/5 rounded-[24px] flex items-center gap-6 print:hidden">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-white text-sm">Certificat Vérifié & Authentique</h4>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Ce certificat est enregistré sur notre plateforme, code de vérification :
                                            <span className="text-teal-400 font-mono ml-1">{selectedCert.verificationCode}</span>
                                        </p>
                                    </div>
                                    <button disabled title="Portail de vérification public non encore configuré" className="p-3 bg-slate-800 rounded-xl opacity-40 cursor-not-allowed">
                                        <ExternalLink className="w-5 h-5 text-slate-400" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
