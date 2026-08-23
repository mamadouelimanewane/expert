"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { REPORT_TEMPLATES } from "@/components/reporting/ReportTemplates";

// ─────────────────────────────────────────────────────────────────────────────
// Générateur de rapports PDF.
//
// Cette page proposait un sélecteur de client limité à trois entreprises
// réelles (Senelec SA, Sonatel, Orange SN), affichait toujours « SENELEC SA »
// dans l'aperçu quel que soit le choix, et un bouton « Générer le PDF »
// affirmait un succès sans qu'aucun document n'ait été produit. Une liste
// « Rapports Récents » nommait cinq entreprises réelles avec des documents et
// des tailles de fichier fabriqués.
//
// Aucune génération de PDF n'est implémentée dans l'application, pour aucun
// type de rapport. Plutôt que de le simuler, cette page liste les modèles
// disponibles et redirige vers l'outil réel quand il existe (la liasse
// fiscale et le rapport de gestion sont tous deux calculés à partir de
// données réelles ailleurs dans l'application) ; pour les modèles sans
// générateur réel, elle le dit explicitement.
// ─────────────────────────────────────────────────────────────────────────────

const DESTINATION_REELLE: Record<string, { href: string; label: string }> = {
    liasse: { href: "/comptabilite/liasse-fiscale", label: "Ouvrir la liasse fiscale" },
    annuel: { href: "/comptabilite/reporting", label: "Ouvrir le rapport de gestion" },
};

export default function PdfGeneratorPage() {
    const [clients, setClients] = useState<{ id: string; nom: string }[]>([]);
    const [selectedType, setSelectedType] = useState(REPORT_TEMPLATES[0].id);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/clients?limit=200&isActive=true");
                if (!res.ok) return;
                const data = await res.json();
                setClients(
                    (data.clients ?? []).map((c: Record<string, unknown>) => ({
                        id: String(c.id),
                        nom: (c.companyName as string) || [c.firstName, c.lastName].filter(Boolean).join(" ") || "Client sans nom",
                    }))
                );
            } catch (e) {
                console.error("Chargement du portefeuille :", e);
            }
        })();
    }, []);

    const activeTemplate = REPORT_TEMPLATES.find((t) => t.id === selectedType) ?? REPORT_TEMPLATES[0];
    const destination = DESTINATION_REELLE[selectedType];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Générateur de rapports</h2>
                <p className="text-slate-400 text-sm font-medium mt-1">
                    {clients.length} client{clients.length > 1 ? "s" : ""} dans le portefeuille
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl">
                        <h3 className="text-lg font-black text-white mb-6">Type de rapport</h3>
                        <div className="space-y-3">
                            {REPORT_TEMPLATES.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setSelectedType(t.id)}
                                    className={cn(
                                        "w-full text-left p-4 rounded-2xl border transition-all",
                                        selectedType === t.id ? "bg-indigo-600/20 border-indigo-500/50" : "bg-slate-950/50 border-white/5 hover:border-white/20"
                                    )}
                                >
                                    <p className="text-sm font-bold text-white">{t.name}</p>
                                    <p className="text-xs text-slate-500 mt-1">{t.description}</p>
                                </button>
                            ))}
                        </div>

                        <div className="mt-6">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Sections du modèle</label>
                            <div className="space-y-2">
                                {activeTemplate.sections.map((section) => (
                                    <div key={section.id} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl border border-white/5">
                                        <span className="text-sm text-slate-300">{section.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {destination ? (
                            <Link
                                href={destination.href}
                                className="w-full mt-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/30"
                            >
                                {destination.label} <ArrowRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <div className="w-full mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-200">
                                    La génération PDF de ce modèle n&apos;est pas encore implémentée.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-7">
                    <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl">
                        <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3">
                            <FileText className="w-5 h-5 text-indigo-400" /> {activeTemplate.name}
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{activeTemplate.description}</p>

                        <div className="mt-8 space-y-2">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Ce modèle inclut</p>
                            {activeTemplate.sections.map((s) => (
                                <div key={s.id} className="h-8 bg-slate-800/40 rounded-lg flex items-center px-4 text-xs text-slate-400">
                                    {s.title}
                                </div>
                            ))}
                        </div>

                        {clients.length > 0 && (
                            <p className="mt-8 text-xs text-slate-500">
                                {destination
                                    ? `Sélectionnez le client concerné depuis « ${destination.label} ».`
                                    : "Aucun outil réel ne produit encore ce document."}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
