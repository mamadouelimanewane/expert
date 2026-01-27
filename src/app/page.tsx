import { StatCard } from "@/components/dashboard/StatCard";
import { Users, Briefcase, AlertCircle, Wallet } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Tableau de Bord</h2>
          <p className="text-slate-400 mt-2">Bienvenue Maître, voici l'état de votre cabinet en zone OHADA.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40">
            + Nouveau Dossier
          </button>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors border border-slate-700">
            Scanner Pièce
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Chiffre d'Affaires" value="12.5M FCFA" trend="+12% vs M-1" trendUp icon={Wallet} color="indigo" />
        <StatCard title="Clients Actifs" value="142" trend="+3 ce mois" trendUp icon={Users} color="cyan" />
        <StatCard title="Déclarations (J-7)" value="28" trend="15 urgentes" trendUp={false} icon={AlertCircle} color="purple" />
        <StatCard title="Productivité" value="94%" trend="Stable" trendUp icon={Briefcase} color="emerald" />
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Deadlines Fiscales */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-700/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Échéances Fiscales (OHADA)</h3>
            <button className="text-sm text-indigo-400 hover:text-indigo-300">Voir calendrier</button>
          </div>

          <div className="space-y-4">
            {[
              { client: "Société Ivoirienne de Banque", type: "TVA Mensuelle", deadline: "15 Juin", status: "En attente", country: "CI" },
              { client: "Transport Logistique SARL", type: "Cotisation Sociale", deadline: "15 Juin", status: "En cours", country: "SN" },
              { client: "Boulangerie Moderne", type: "Acompte IS", deadline: "20 Juin", status: "Validé", country: "CM" },
              { client: "Tech Afrique SA", type: "Retenue à la source", deadline: "25 Juin", status: "En attente", country: "CI" },
            ].map((task, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-800/30 hover:bg-slate-800/60 rounded-xl transition-all border border-transparent hover:border-slate-700/50 cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors shrink-0">
                    {task.country}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-200 group-hover:text-white transition-colors">{task.client}</p>
                    <p className="text-sm text-slate-500">{task.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-white">{task.deadline}</p>
                    <p className="text-xs text-slate-500">Date limite</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${task.status === "Validé" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      task.status === "En cours" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-slate-700/50 text-slate-400 border-slate-600/50"
                    }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="glass-card rounded-2xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-bold text-white mb-6">Activités Récentes</h3>
          <div className="pl-4 border-l-2 border-slate-800 space-y-8">
            {[
              { text: "Nouveau document uploadé par Client X", sub: "Bilan_2024_Provisoire.pdf", time: "Il y a 2h", type: "doc" },
              { text: "Validation liasse fiscale Dossier Y", sub: "Approuvé par Expert", time: "Il y a 5h", type: "check" },
              { text: "Nouveau message client", sub: "Question sur la TVA déductible...", time: "Il y a 1j", type: "msg" },
              { text: "Facture générée", sub: "Honoraires Mensuels - Juin", time: "Il y a 1j", type: "bill" },
            ].map((act, i) => (
              <div key={i} className="relative group">
                <div className={`absolute -left-[23px] top-1 w-4 h-4 rounded-full border-4 border-slate-900 transition-colors ${act.type === 'check' ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`} />
                <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{act.text}</p>
                <p className="text-xs text-slate-500 mt-1">{act.sub}</p>
                <p className="text-[10px] text-slate-600 mt-2 uppercase tracking-wider">{act.time}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
