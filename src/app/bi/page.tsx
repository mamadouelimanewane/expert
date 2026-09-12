export const dynamic = 'force-dynamic';

import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { TaxDeclaration, Client } from "@prisma/client";
import { AuditService } from "@/lib/audit";
import { AuthService } from "@/lib/auth";
import { HubModules } from "@/components/dashboard/HubModules";

// ─────────────────────────────────────────────────────────────────────────────
// Hub principal du cabinet — c'est la page réelle vers laquelle /login
// redirige après connexion (voir router.push("/bi") dans src/app/login/
// page.tsx). Reprend le même contenu que /dashboard, qui devient un simple
// redirect ici pour éviter de maintenir deux copies du même Hub.
// ─────────────────────────────────────────────────────────────────────────────

type TaxDeclarationWithClient = TaxDeclaration & { client: Client | null };
type AuditLogWithUser = any;

// Fuseau de référence du cabinet (UTC+0, Dakar) : évite tout écart entre
// l'heure rendue côté serveur (Vercel, UTC) et celle du navigateur.
const TZ = "Africa/Dakar";


export default async function BusinessIntelligencePage() {
  // Récupération des données réelles
  const [recentDeclarations, recentLogs, session] = await Promise.all([
    prisma.taxDeclaration.findMany({
      take: 4,
      orderBy: { dueDate: 'asc' },
      include: { client: true }
    }),
    AuditService.getRecentLogs(4),
    AuthService.getSession(),
  ]);

  // Accueil personnalisé : prénom et date du jour. La date est formatée dans
  // un fuseau fixe pour que le HTML serveur et le rendu client coïncident
  // (sinon React signale une erreur d'hydratation dès que les fuseaux
  // diffèrent).
  const prenom = session?.name?.split(" ")[0] || null;
  const heure = Number(new Intl.DateTimeFormat("fr-FR", { hour: "numeric", hour12: false, timeZone: TZ }).format(new Date()));
  const salutation = heure < 18 ? "Bonjour" : "Bonsoir";
  const dateDuJour = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TZ }).format(new Date());
  const formatHeure = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: TZ });

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-8 sm:space-y-12 animate-in fade-in duration-700 max-w-[1400px] mx-auto">

      {/* Bandeau d'identité — adaptatif mobile / desktop */}
      <div
        className="c360-bandeau-colore p-5 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl shadow-xl text-white"
        style={{
          background: 'linear-gradient(135deg, #006B3F 0%, #009639 100%)',
        }}
      >
        <p role="heading" aria-level={1} className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight m-0">
          CABINET<span style={{ color: '#F29400' }}>360</span>
        </p>
        <p className="text-sm sm:text-base lg:text-lg text-emerald-100 mt-2 font-medium">
          {prenom ? `${salutation} ${prenom}, ` : `${salutation}, `}
          <span className="capitalize">{dateDuJour}</span>. Que souhaitez-vous faire aujourd&apos;hui ?
        </p>
      </div>

      <HubModules />

      {/* Live Data Insights & Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 pt-4 sm:pt-6">

        {/* Left Column: Deadlines Fiscales */}
        <div className="apix-card p-4 sm:p-6 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
            <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white tracking-tight">Échéances Fiscales Récentes</h3>
            <Link href="/declarations" className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#006B3F] hover:text-[#004b2c] transition-colors dark:text-primary">Voir le calendrier complet</Link>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {recentDeclarations.length > 0 ? recentDeclarations.map((task: TaxDeclarationWithClient, i: number) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/30 dark:hover:bg-slate-800/60 rounded-xl sm:rounded-2xl transition-all border border-black/5 dark:border-white/5 hover:border-[#006B3F]/30 cursor-pointer group gap-3">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center font-black text-xs text-slate-500 dark:text-slate-400 group-hover:bg-[#006B3F]/10 group-hover:text-[#006B3F] transition-all shadow-inner uppercase shrink-0">
                    {task.client?.country || "CI"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm sm:text-base text-slate-800 dark:text-white group-hover:text-[#006B3F] dark:group-hover:text-primary transition-colors truncate">
                      {task.client?.companyName || "Client inconnu"}
                    </p>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest truncate">{task.type} - {task.period}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5 dark:border-white/5">
                  <div className="text-left sm:text-right">
                    <p className="text-xs sm:text-sm font-black text-slate-800 dark:text-white">{format(new Date(task.dueDate), 'dd MMM', { locale: fr })}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date limite</p>
                  </div>
                  <span className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border shadow-sm ${task.status === 'VALIDATED' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" :
                    task.status === 'PENDING' ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400" :
                      "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-white/10"
                    }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            )) : (
              <div className="py-10 text-center">
                <p className="text-slate-500 font-medium text-sm">Aucune échéance fiscale à venir.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="apix-card p-4 sm:p-6 rounded-2xl">
          <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white tracking-tight mb-6">Flux d'Activité Système</h3>
          <div className="pl-5 sm:pl-6 border-l-2 border-slate-300 dark:border-slate-800 space-y-6 sm:space-y-8">
            {recentLogs.length > 0 ? recentLogs.map((act: AuditLogWithUser, i: number) => (
              <div key={i} className="relative group">
                <div className="absolute -left-[29px] sm:-left-[33px] top-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-4 border-white dark:border-slate-900 bg-[#006B3F] shadow-[0_0_15px_rgba(0,107,63,0.5)] group-hover:scale-125 transition-all" />
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#006B3F] dark:group-hover:text-white transition-colors leading-snug">{act.action}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">{act.details || "Action effectuée dans le système"}</p>
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 mt-2 sm:mt-3 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-700 rounded-full" />
                  {formatHeure.format(new Date(act.createdAt))} • {act.user?.firstName || "Système"}
                </p>
              </div>
            )) : (
              <div className="relative group">
                <div className="absolute -left-[29px] sm:-left-[33px] top-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-4 border-white dark:border-slate-900 bg-slate-700" />
                <p className="text-sm font-bold text-slate-500">En attente d'activités...</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
