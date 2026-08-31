import { NextResponse } from "next/server";

import { requireStaff } from "@/lib/api-auth";

// ─────────────────────────────────────────────────────────────────────────────
// Rapprochement bancaire automatique — non branché.
//
// Cette route fabriquait elle-même le relevé bancaire qu'elle prétendait
// rapprocher : elle prenait les deux premières factures au statut SENT du
// client, en recopiait le montant dans des « virements » inventés
// (`BANK-TX-0`, `BANK-TX-1`), puis passait ces factures réelles à PAID avec
// une date de paiement, et journalisait « Rapprochement IA réussi » dans la
// piste d'audit. Aucun flux bancaire n'était consulté : le simple appel de
// l'endpoint encaissait comptablement des factures qui n'avaient jamais été
// payées. En l'absence de clientId valide, la cible était de surcroît le
// premier client retourné par la base.
//
// Aucune connexion bancaire (agrégateur ou API d'établissement) n'existe dans
// l'application. Tant qu'il n'y en a pas, la route refuse explicitement plutôt
// que d'altérer le statut de factures réelles — même politique que le PATCH de
// réconciliation de /api/fintech/mobile-money.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST() {
    const { denied } = await requireStaff();
    if (denied) return denied;

    return NextResponse.json(
        {
            notConfigured: true,
            error:
                "Le rapprochement bancaire automatique n'est pas disponible : aucune connexion bancaire n'est configurée. " +
                "Marquez les factures réglées depuis la facturation, sur la base d'un relevé réel.",
        },
        { status: 501 }
    );
}
