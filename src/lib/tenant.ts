// ===========================================================
// Cabinet 360 SaaS — Couche Multi-Tenant & Abonnements
// src/lib/tenant.ts
//
// Types, règles d'abonnement et limites des espaces cabinet.
// ===========================================================


// ---------------------------------------------------------------------------
// 1. TYPES SAAS
// ---------------------------------------------------------------------------

export type SaasPlan = "STARTER" | "PRO" | "ENTERPRISE";
export type SaasStatus = "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELLED";

export interface CabinetSubscription {
  cabinetId: string;         // identifiant MongoDB
  slug: string;              // ex: "cabinet-alpha-conseil"
  nom: string;               // nom humain
  plan: SaasPlan;
  statut: SaasStatus;
  trialExpiresAt: Date | null;
  maxDossiers: number;
  maxCollaborateurs: number;
  pays: string;
}

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// 2. VÉRIFICATION DU PLAN SAAS
//
// Vérifie si le cabinet a le droit d'accès :
//   - Statut ACTIVE  : toujours autorisé.
//   - Statut TRIAL   : autorisé si trialExpiresAt est dans le futur.
//   - Statut PAST_DUE / CANCELLED : accès refusé, retourne false.
// ---------------------------------------------------------------------------

export function isCabinetActif(sub: CabinetSubscription): boolean {
  if (sub.statut === "ACTIVE") return true;
  if (sub.statut === "TRIAL") {
    if (!sub.trialExpiresAt) return false;
    return sub.trialExpiresAt > new Date();
  }
  return false;
}

// Jours restants dans la période d'essai (-1 si abonnement actif, 0 si expiré)
export function joursEssaiRestants(sub: CabinetSubscription): number {
  if (sub.statut === "ACTIVE") return -1;
  if (!sub.trialExpiresAt) return 0;
  const diff = sub.trialExpiresAt.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

// ---------------------------------------------------------------------------
// 3. HELPER : construire un slug URL-safe à partir du nom du cabinet
// ---------------------------------------------------------------------------

export function slugifyCabinet(nom: string): string {
  return nom
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // supprimer les accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// ---------------------------------------------------------------------------
// 4. LIMITES PAR PLAN
// ---------------------------------------------------------------------------

export const PLAN_LIMITS: Record<SaasPlan, { dossiers: number; collaborateurs: number }> = {
  STARTER:    { dossiers: 25,       collaborateurs: 2 },
  PRO:        { dossiers: 999_999,  collaborateurs: 8 },
  ENTERPRISE: { dossiers: 999_999,  collaborateurs: 999_999 },
};

// ---------------------------------------------------------------------------
// 5. TARIFS EN FCFA (XOF)
// ---------------------------------------------------------------------------

export const TARIFS_FCFA: Record<SaasPlan, { mensuel: number; annuel: number }> = {
  STARTER:    { mensuel: 49_000, annuel: 39_000 },
  PRO:        { mensuel: 129_000, annuel: 99_000 },
  ENTERPRISE: { mensuel: 289_000, annuel: 229_000 },
};
