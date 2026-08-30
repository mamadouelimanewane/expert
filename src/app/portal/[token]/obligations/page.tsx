"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, Calendar, CheckCircle2, ChevronRight, Download } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Calendrier des obligations — portail client.
//
// Cette page affichait cinq échéances fictives à n'importe quel client
// authentifié : une TVA de 12 500 000 FCFA marquée « URGENT » à deux jours, une
// autre marquée « RÉGLÉ ». C'est l'écran le plus sensible de l'application :
// il s'adresse à un tiers hors du cabinet, sans supervision d'un collaborateur
// au moment de la lecture. Un client pouvait croire avoir déjà payé une somme
// due, ou l'inverse.
//
// Elle affiche désormais les déclarations réellement enregistrées pour ce
// client (/api/portal/obligations, authentifié par le token du lien).
// ─────────────────────────────────────────────────────────────────────────────

type Obligation = {
    id: string;
    type: string;
    date: string;
    amount: string;
    status: string;
    days: number;
};

export default function ClientPortalObligationsPage() {
    const params = useParams<{ token: string }>();
    const [obligations, setObligations] = useState<Obligation[]>([]);
    const [aucuneDonnee, setAucuneDonnee] = useState(false);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState<string | null>(null);

    const charger = useCallback(async () => {
        setChargement(true);
        setErreur(null);
        try {
            const res = await fetch("/api/portal/obligations", {
                headers: { "x-portal-token": params.token },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? `Réponse ${res.status}`);
            setObligations(data.obligations ?? []);
            setAucuneDonnee(Boolean(data.aucuneDonnee));
        } catch (e) {
            console.error("Chargement des obligations :", e);
            setErreur("Impossible de charger vos échéances. Contactez votre expert-comptable.");
            setObligations([]);
        } finally {
            setChargement(false);
        }
    }, [params.token]);

    useEffect(() => {
        charger();
    }, [charger]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700 p-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
                <div>
                    <h2 className="page-title mb-0 flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-primary" /> Calendrier des Obligations
                    </h2>
                    <p className="page-subtitle mb-0">Vos échéances fiscales et sociales</p>
                </div>
                <button className="px-6 py-3 bg-primary hover:brightness-110 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 shadow-sm">
                    Contacter l&apos;Expert
                </button>
            </div>

            {erreur && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-5 text-sm">
                    {erreur}
                </div>
            )}

            {!chargement && !erreur && aucuneDonnee && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-5 text-sm">
                    Aucune déclaration n&apos;a encore été enregistrée par votre cabinet. Cette page se
                    mettra à jour dès qu&apos;une échéance sera saisie.
                </div>
            )}

            <div className="space-y-4">
                {chargement ? (
                    <p className="text-sm text-slate-500">Chargement…</p>
                ) : (
                    obligations.map((ob, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={ob.id}
                            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border",
                                        ob.status === "URGENT"
                                            ? "bg-red-50 border-red-200 text-red-500"
                                            : ob.status === "PROCHE"
                                              ? "bg-amber-50 border-amber-200 text-amber-500"
                                              : ob.status === "RÉGLÉ"
                                                ? "bg-emerald-50 border-emerald-200 text-emerald-500"
                                                : "bg-slate-50 border-slate-200 text-slate-400"
                                    )}
                                >
                                    {ob.status === "RÉGLÉ" ? (
                                        <CheckCircle2 className="w-6 h-6" />
                                    ) : (
                                        <Calendar className="w-6 h-6" />
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">{ob.type}</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Échéance : <strong className="text-slate-700">{ob.date}</strong>
                                    </p>
                                    {ob.status === "RÉGLÉ" ? (
                                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-2 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Déclaré et payé
                                        </p>
                                    ) : (
                                        <p
                                            className={cn(
                                                "text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-1",
                                                ob.status === "URGENT"
                                                    ? "text-red-500"
                                                    : ob.status === "PROCHE"
                                                      ? "text-amber-500"
                                                      : "text-primary"
                                            )}
                                        >
                                            {ob.status === "URGENT" && <AlertCircle className="w-3 h-3" />}
                                            {ob.status} {ob.days > 0 && `(J-${ob.days})`}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-6 sm:border-l sm:border-slate-100 sm:pl-6">
                                <div className="text-left sm:text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                        Montant
                                    </p>
                                    <p className="text-xl font-black text-slate-800">{ob.amount}</p>
                                </div>

                                {ob.status !== "RÉGLÉ" ? (
                                    <button className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-primary flex items-center justify-center transition-colors">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <button className="w-10 h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center transition-colors">
                                        <Download className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
