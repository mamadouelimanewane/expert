export const dynamic = 'force-dynamic';

import { StatCard } from "@/components/dashboard/StatCard";
import { Users, Briefcase, AlertCircle, Wallet } from "lucide-react";
import prisma from "@/lib/prisma";

// ─────────────────────────────────────────────────────────────────────────────
// Les quatre valeurs principales (CA, clients actifs, missions en cours,
// alertes fiscales) provenaient bien de la base — seules les pastilles de
// tendance ("+12% vs M-1", "+3 ce mois", "85% complétion", "Urgences J-7")
// étaient des chaînes fixes affichées quel que soit le résultat réel. Elles
// sont désormais calculées à partir des mêmes données (comparaison au mois
// précédent, nouveaux clients du mois, missions terminées, échéances à J-7).
// ─────────────────────────────────────────────────────────────────────────────

export default async function ConfidentielStats() {
  const debutMois = new Date();
  debutMois.setDate(1);
  debutMois.setHours(0, 0, 0, 0);
  const debutMoisPrecedent = new Date(debutMois);
  debutMoisPrecedent.setMonth(debutMoisPrecedent.getMonth() - 1);
  const dans7Jours = new Date();
  dans7Jours.setDate(dans7Jours.getDate() + 7);

  const [
    clientCount,
    nouveauxClientsCeMois,
    missionCount,
    missionsTerminees,
    recentDeclarations,
    declarationsUrgentes,
    invoicesCeMois,
    invoicesMoisPrecedent,
  ] = await Promise.all([
    prisma.client.count({ where: { isActive: true } }),
    prisma.client.count({ where: { isActive: true, createdAt: { gte: debutMois } } }),
    prisma.mission.count(),
    prisma.mission.count({ where: { status: 'COMPLETED' } }),
    prisma.taxDeclaration.findMany({
      take: 4,
      orderBy: { dueDate: 'asc' },
      include: { client: true }
    }),
    prisma.taxDeclaration.count({ where: { dueDate: { lte: dans7Jours }, status: { not: 'SUBMITTED' } } }),
    prisma.invoice.aggregate({ _sum: { total: true }, where: { status: 'PAID', issueDate: { gte: debutMois } } }),
    prisma.invoice.aggregate({ _sum: { total: true }, where: { status: 'PAID', issueDate: { gte: debutMoisPrecedent, lt: debutMois } } }),
  ]);

  const invoices = await prisma.invoice.aggregate({
    _sum: { total: true },
    where: { status: 'PAID' }
  });
  const totalCA = invoices._sum.total || 0;

  const caCeMois = invoicesCeMois._sum.total || 0;
  const caMoisPrecedent = invoicesMoisPrecedent._sum.total || 0;
  const tendanceCA = caMoisPrecedent > 0
    ? `${caCeMois >= caMoisPrecedent ? "+" : ""}${Math.round(((caCeMois - caMoisPrecedent) / caMoisPrecedent) * 100)}% vs M-1`
    : "Pas de données M-1";

  const tauxCompletion = missionCount > 0 ? Math.round((missionsTerminees / missionCount) * 100) : 0;

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
          trend={tendanceCA}
          trendUp={caCeMois >= caMoisPrecedent}
          icon={Wallet}
          color="indigo"
        />
        <StatCard
          title="Clients Actifs"
          value={clientCount.toString()}
          trend={`+${nouveauxClientsCeMois} ce mois`}
          trendUp={nouveauxClientsCeMois > 0}
          icon={Users}
          color="cyan"
        />
        <StatCard
          title="Missions en cours"
          value={missionCount.toString()}
          trend={`${tauxCompletion}% complétion`}
          trendUp={tauxCompletion >= 50}
          icon={Briefcase}
          color="emerald"
        />
        <StatCard
          title="Alertes Fiscales"
          value={recentDeclarations.length.toString()}
          trend={declarationsUrgentes > 0 ? `${declarationsUrgentes} urgence${declarationsUrgentes > 1 ? "s" : ""} J-7` : "Aucune urgence J-7"}
          trendUp={declarationsUrgentes === 0}
          icon={AlertCircle}
          color="purple"
        />
      </div>
    </div>
  );
}
