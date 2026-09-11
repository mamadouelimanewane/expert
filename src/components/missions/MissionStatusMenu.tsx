"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical, ExternalLink, Play, CheckCircle2, Eye, XCircle, RotateCcw } from "lucide-react";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export type StatutMission = "DRAFT" | "IN_PROGRESS" | "PENDING_REVIEW" | "COMPLETED" | "CANCELLED";

// Même table que l'API (src/app/api/missions/[id]/route.ts) : on n'affiche
// que les transitions que le serveur acceptera.
export const TRANSITIONS: Record<StatutMission, StatutMission[]> = {
    DRAFT: ["IN_PROGRESS", "CANCELLED"],
    IN_PROGRESS: ["PENDING_REVIEW", "COMPLETED", "CANCELLED", "DRAFT"],
    PENDING_REVIEW: ["IN_PROGRESS", "COMPLETED", "CANCELLED"],
    COMPLETED: ["DRAFT"],
    CANCELLED: ["DRAFT"],
};

export const LIBELLES: Record<StatutMission, { label: string; icon: typeof Play; cls: string }> = {
    DRAFT: { label: "Remettre en brouillon", icon: RotateCcw, cls: "text-slate-600" },
    IN_PROGRESS: { label: "Démarrer / reprendre", icon: Play, cls: "text-blue-600" },
    PENDING_REVIEW: { label: "Soumettre à révision", icon: Eye, cls: "text-amber-600" },
    COMPLETED: { label: "Marquer terminée", icon: CheckCircle2, cls: "text-emerald-600" },
    CANCELLED: { label: "Annuler la mission", icon: XCircle, cls: "text-rose-600" },
};

/**
 * Change le statut d'une mission via PATCH /api/missions/[id] et rafraîchit
 * la page serveur. Utilisable seul (bouton) ou en menu (kanban).
 */
export async function changerStatut(id: string, statut: StatutMission): Promise<boolean> {
    const res = await fetch(`/api/missions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statut }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        toast.error(data.error || "Changement de statut refusé");
        return false;
    }
    const CONFIRMATIONS: Record<StatutMission, string> = {
        DRAFT: "Mission remise en brouillon",
        IN_PROGRESS: "Mission en cours",
        PENDING_REVIEW: "Mission soumise à révision",
        COMPLETED: "Mission terminée",
        CANCELLED: "Mission annulée",
    };
    toast.success(CONFIRMATIONS[statut]);
    return true;
}

export function MissionStatusMenu({ id, statut }: { id: string; statut: StatutMission }) {
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (!open) return;
        const fermer = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener("mousedown", fermer);
        return () => document.removeEventListener("mousedown", fermer);
    }, [open]);

    const appliquer = async (s: StatutMission) => {
        if (s === "CANCELLED" && !window.confirm("Annuler cette mission ? Les temps et factures déjà rattachés sont conservés.")) return;
        setBusy(true);
        try {
            if (await changerStatut(id, s)) { setOpen(false); router.refresh(); }
        } finally { setBusy(false); }
    };

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label="Actions sur la mission"
                className="text-muted-foreground hover:text-primary p-1 rounded-lg hover:bg-primary/10"
            >
                <MoreVertical className="w-4 h-4" />
            </button>
            {open && (
                <div role="menu" className="absolute right-0 top-full mt-1 z-30 w-56 rounded-xl border border-border bg-card shadow-lg p-1.5 text-sm">
                    <Link href={`/missions/${id}`} role="menuitem" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted font-bold">
                        <ExternalLink className="w-4 h-4 text-primary" /> Ouvrir la fiche
                    </Link>
                    <div className="my-1 border-t border-border" />
                    {TRANSITIONS[statut].map((s) => {
                        const L = LIBELLES[s];
                        return (
                            <button key={s} role="menuitem" disabled={busy} onClick={() => appliquer(s)} className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-left", L.cls)}>
                                <L.icon className="w-4 h-4" /> {L.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
