export const dynamic = 'force-dynamic';

import { StatCard } from "@/components/dashboard/StatCard";
import { Users, Briefcase, AlertCircle, Wallet } from "lucide-react";
import prisma from "@/lib/prisma";

export default async function ConfidentielStats() {
  const [clientCount, missionCount, recentDeclarations] = await Promise.all([
    prisma.client.count({ where: { isActive: true } }),
    prisma.mission.count(),
    prisma.taxDeclaration.findMany({
      take: 4,
      orderBy: { dueDate: 'asc' },
      include: { client: true }
    })
  ]);

  const invoices = await prisma.invoice.aggregate({
    _sum: { total: true },
    where: { status: 'PAID' }
  });
  const totalCA = invoices._sum.total || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">Statistiques Confidentielles</h2>
          <p className="text-slate-400 mt-1 text-sm sm:text-base font-medium">Accès restreint aux données sensibles du cabinet.</p>
        </div>
        <div className="flex gap-3">
          <a href="/dashboard" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg border border-white/5">
            Retour au Dashboard
          </a>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Chiffre d'Affaires"
          value={`${totalCA.toLocaleString()} FCFA`}
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
          value={recentDeclarations.length.toString()}
          trend="Urgences J-7"
          trendUp={false}
          icon={AlertCircle}
          color="purple"
        />
      </div>
    </div>
  );
}
