export const dynamic = 'force-dynamic';

import { Plus, Scan, Lock } from "lucide-react";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AuthService } from "@/lib/auth";
import { TaxDeclaration, Client, AuditLog, User } from "@/types/prisma";

type TaxDeclarationWithClient = TaxDeclaration & { client: Client | null };
type AuditLogWithUser = AuditLog & { user: User | null };

export default async function Home() {
  const session = await AuthService.getSession();
  const isPrivileged = session?.role === 'ADMIN' || session?.role === 'EXPERT';

  const [recentDeclarations, recentLogs] = await Promise.all([
    prisma.taxDeclaration.findMany({ take: 4, orderBy: { dueDate: 'asc' }, include: { client: true } }),
    prisma.auditLog.findMany({ take: 4, orderBy: { createdAt: 'desc' }, include: { user: true } })
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Tableau de Bord</h2>
          <p className="text-slate-400 mt-1 text-sm sm:text-base font-medium">Bienvenue, voici le pilotage de votre cabinet OHADA en temps réel.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-95">
            <Plus className="w-4 h-4" /> Nouveau Dossier
          </button>
          <a href="/scan" className="flex-1 sm:flex-none px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-white/5 flex items-center justify-center gap-2 shadow-lg">
            <Scan className="w-4 h-4" /> Scanner Pièce
          </a>
        </div>
      </div>

      {isPrivileged ? (
        <a href="/reporting" className="flex items-center gap-4 p-5 bg-indigo-950/60 border border-indigo-500/30 rounded-2xl hover:bg-indigo-900/40 hover:border-indigo-400/50 transition-all group shadow-lg shadow-indigo-900/20">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-indigo-300 uppercase tracking-widest">Reporting Confidentiel</p>
            <p className="text-xs text-slate-500 mt-0.5">Chiffre affaires · Clients actifs · Missions · Alertes fiscales</p>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 group-hover:text-indigo-300 transition-colors">Accéder →</span>
        </a>
      ) : (
        <div className="flex items-center gap-4 p-5 bg-slate-900/40 border border-white/5 rounded-2xl opacity-50 cursor-not-allowed">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Reporting Confidentiel</p>
            <p className="text-xs text-slate-600 mt-0.5">Accès réservé aux Experts et Administrateurs</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card rounded-[32px] p-8 border border-white/5 bg-slate-900/40 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-white tracking-tight">Échéances Fiscales OHADA</h3>
            <a href="/declarations" className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">Voir le calendrier complet</a>
          </div>
          <div className="space-y-4">
            {recentDeclarations.length > 0 ? recentDeclarations.map((task: TaxDeclarationWithClient, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-800/30 hover:bg-slate-800/60 rounded-2xl transition-all border border-white/5 hover:border-indigo-500/30 cursor-pointer group">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-black text-xs text-slate-400 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-all shadow-inner uppercase">
                    {task.client?.country || "CI"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white group-hover:text-indigo-400 transition-colors truncate">{task.client?.companyName || "Client inconnu"}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{task.type} - {task.period}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-black text-white">{format(new Date(task.dueDate), 'dd MMM', { locale: fr })}</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Date limite</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-lg ${task.status === 'VALIDATED' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : task.status === 'PENDING' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-slate-800/80 text-slate-400 border-white/10"}`}>{task.status}</span>
                </div>
              </div>
            )) : (
              <div className="py-10 text-center"><p className="text-slate-500 font-medium">Aucune échéance fiscale à venir.</p></div>
            )}
          </div>
        </div>
        <div className="glass-card rounded-[32px] p-8 border border-white/5 bg-slate-900/40 shadow-2xl">
          <h3 className="text-xl font-black text-white tracking-tight mb-8">Flux d'Activité</h3>
          <div className="pl-6 border-l-2 border-slate-800 space-y-8">
            {recentLogs.length > 0 ? recentLogs.map((act: AuditLogWithUser, i: number) => (
              <div key={i} className="relative group">
                <div className="absolute -left-[33px] top-1 w-4 h-4 rounded-full border-4 border-slate-900 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] group-hover:scale-125 transition-all" />
                <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{act.action}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">{act.details || "Action effectuée dans le système"}</p>
                <p className="text-[9px] font-black text-slate-600 mt-3 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
                  {format(new Date(act.createdAt), 'HH:mm', { locale: fr })} · {act.user?.firstName || "Système"}
                </p>
              </div>
            )) : (
              <div className="relative group">
                <div className="absolute -left-[33px] top-1 w-4 h-4 rounded-full border-4 border-slate-900 bg-slate-700" />
                <p className="text-sm font-bold text-slate-500">En attente d'activités...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}