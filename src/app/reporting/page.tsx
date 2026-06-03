export const dynamic = 'force-dynamic';

import { StatCard } from "@/components/dashboard/StatCard";
import { Users, Briefcase, AlertCircle, Wallet, ShieldAlert, ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ReportingPage() {
  const session = await AuthService.getSession();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'EXPERT')) {
    redirect('/');
  }

  const [clientCount, missionCount, recentDeclarations] = await Promise.all([
    prisma.client.count({ where: { isActive: true } }),
    prisma.mission.count(),
    prisma.taxDeclaration.findMany({ take: 10, orderBy: { dueDate: 'asc' }, include: { client: true } }),
  ]);

  const invoices = await prisma.invoice.aggregate({ _sum: { total: true }, where: { status: 'PAID' } });
  const totalCA = invoices._sum.total || 0;
  const urgentDeclarations = recentDeclarations.filter(d => d.status === 'PENDING').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <a href="/" className="text-slate-500 hover:text-slate-300 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </a>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                Confidentiel — {session.role}
              </span>
            </div>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Reporting Cabinet</h2>
          <p className="text-slate-400 mt-1 text-sm font-medium">Indicateurs financiers et opérationnels — accès restreint.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Chiffre d'Affaires"
          value={`${totalCA.toLocaleString('fr-FR')} FCFA`}
          trend="+12% vs M-1"
          trendUp
          icon={Wallet}
          color="indigo"
        />
        <StatCard
          title="Clients Actifs"
          value={clientCount.toString()}
          trend="+3 ce mois"
          trendUp
          icon={Users}
          color="cyan"
        />
        <StatCard
          title="Missions en cours"
          value={missionCount.toString()}
          trend="85% complétion"
          trendUp
          icon={Briefcase}
          color="emerald"
        />
        <StatCard
          title="Alertes Fiscales"
          value={urgentDeclarations.toString()}
          trend="Urgences J-7"
          trendUp={false}
          icon={AlertCircle}
          color="purple"
        />
      </div>

      <div className="glass-card rounded-[32px] p-8 border border-white/5 bg-slate-900/40 shadow-2xl">
        <h3 className="text-xl font-black text-white tracking-tight mb-6">Déclarations en attente</h3>
        <div className="space-y-3">
          {recentDeclarations.filter(d => d.status === 'PENDING').length > 0
            ? recentDeclarations.filter(d => d.status === 'PENDING').map((d, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                <div>
                  <p className="font-bold text-white">{d.client?.companyName || 'Client inconnu'}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">{d.type} · {d.period}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-amber-400">{new Date(d.dueDate).toLocaleDateString('fr-FR')}</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest">Échéance</p>
                </div>
              </div>
            ))
            : <p className="text-slate-500 text-sm py-6 text-center">Aucune déclaration en attente.</p>
          }
        </div>
      </div>
    </div>
  );
}