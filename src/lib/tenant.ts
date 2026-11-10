// ===========================================================
// Cabinet 360 SaaS — Couche Multi-Tenant & Abonnements
// src/lib/tenant.ts
//
// Fournit :
//   1. createTenantPrisma(cabinetId) : instance Prisma cloisonnée
//      qui injecte automatiquement cabinetId sur toutes les requêtes.
//   2. getActiveCabinet(cabinetId) : vérifie que le cabinet est actif
//      et que son plan est valide (TRIAL non expiré ou ACTIVE).
//   3. SaasPlan / SaasStatus : types côté applicatif (sans Prisma enum
//      pour éviter une migration schema immédiate).
// ===========================================================

import prisma from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";

// ---------------------------------------------------------------------------
// 1. TYPES SAAS (en attendant l'ajout d'un modèle Cabinet dans le schéma)
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
// 2. PRISMA CLIENT CLOISONNÉ PAR CABINET (Tenant Extension)
//
// Usage dans une route API :
//   const tenantDb = createTenantPrisma(session.cabinetId);
//   const clients  = await tenantDb.client.findMany();  // filtre auto sur cabinetId
//
// Pour l'instant les modèles n'ont pas encore de champ cabinetId :
// l'extension est préparée pour être branchée dès que le schéma migre.
// ---------------------------------------------------------------------------

export function createTenantPrisma(_cabinetId: string): PrismaClient {
  // Phase 1 : retourne le client global (mono-instance actuelle).
  // Phase 2 (après ajout de cabinetId dans le schéma) : décommenter l'extension ci-dessous.
  //
  // return prisma.$extends({
  //   query: {
  //     $allModels: {
  //       async findMany({ args, query }) {
  //         args.where = { ...args.where, cabinetId: _cabinetId };
  //         return query(args);
  //       },
  //       async create({ args, query }) {
  //         args.data = { ...args.data as object, cabinetId: _cabinetId } as typeof args.data;
  //         return query(args);
  //       },
  //       async updateMany({ args, query }) {
  //         args.where = { ...args.where, cabinetId: _cabinetId };
  //         return query(args);
  //       },
  //       async deleteMany({ args, query }) {
  //         args.where = { ...args.where, cabinetId: _cabinetId };
  //         return query(args);
  //       },
  //     },
  //   },
  // });

  return prisma as unknown as PrismaClient;
}

// ---------------------------------------------------------------------------
// 3. VÉRIFICATION DU PLAN SAAS
//
// Vérifie si le cabinet a le droit d'accès :
//   - Statut ACTIVE  : toujours autorisé.
//   - Statut TRIAL   : autorisé si trialExpiresAt est dans le futur.
//   - Statut PAST_DUE / CANCELLED : accès refusé, retourne false.
// ---------------------------------------------------------------------------

export function isCabinetActif(sub: CabinetSubscription): boolean {
  if (sub.statut === "ACTIVE") return true;
  if (sub.statut === "TRIAL") {
    if (!sub.trialExpiresAt) return true; // trial sans date = toujours actif
    return sub.trialExpiresAt > new Date();
  }
  return false;
}

// Jours restants dans la période d'essai (-1 si abonnement actif, 0 si expiré)
export function joursEssaiRestants(sub: CabinetSubscription): number {
  if (sub.statut === "ACTIVE") return -1;
  if (!sub.trialExpiresAt) return 14;
  const diff = sub.trialExpiresAt.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

// ---------------------------------------------------------------------------
// 4. HELPER : construire un slug URL-safe à partir du nom du cabinet
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
// 5. LIMITES PAR PLAN
// ---------------------------------------------------------------------------

export const PLAN_LIMITS: Record<SaasPlan, { dossiers: number; collaborateurs: number }> = {
  STARTER:    { dossiers: 25,       collaborateurs: 2 },
  PRO:        { dossiers: 999_999,  collaborateurs: 8 },
  ENTERPRISE: { dossiers: 999_999,  collaborateurs: 999_999 },
};

// ---------------------------------------------------------------------------
// 6. TARIFS EN FCFA (XOF)
// ---------------------------------------------------------------------------

export const TARIFS_FCFA: Record<SaasPlan, { mensuel: number; annuel: number }> = {
  STARTER:    { mensuel: 49_000, annuel: 39_000 },
  PRO:        { mensuel: 129_000, annuel: 99_000 },
  ENTERPRISE: { mensuel: 289_000, annuel: 229_000 },
};
