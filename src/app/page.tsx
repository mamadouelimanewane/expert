import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, BrainCircuit, BarChart3, Fingerprint } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="font-bold text-white text-xl">C</span>
             </div>
             <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">CABINET 360</h1>
          </div>
          <div className="flex items-center gap-4">
             <Link href="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">Se connecter</Link>
             <Link href="/dashboard" className="px-6 py-2.5 rounded-full bg-white text-slate-900 font-bold text-sm hover:bg-indigo-50 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
               Accéder au Portail
             </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto relative z-10">
         <div className="text-center max-w-4xl mx-auto mt-20 space-y-8 animate-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-black uppercase tracking-widest mb-4">
              <Zap className="w-4 h-4" /> La nouvelle norme de l'expertise comptable OHADA
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
              Pilotez votre cabinet avec l'<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Intelligence Artificielle</span>.
            </h1>
            <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
              Cabinet 360 est la plateforme ultime pour les experts-comptables de l'espace OHADA. Liasse fiscale automatisée, audit IA, gestion KYC et BPO informel en un seul endroit.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
               <Link href="/login" className="w-full sm:w-auto px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 group">
                 Commencer maintenant <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </Link>
               <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-black text-sm uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center gap-3">
                 Découvrir le Tableau de bord
               </Link>
            </div>
         </div>

         {/* Features Grid */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
            {[
              { icon: BrainCircuit, title: "Nexus IA", desc: "Assistant vocal et textuel pour analyser vos dossiers en temps réel et générer des rapports." },
              { icon: ShieldCheck, title: "Conformité & KYC", desc: "Vérifications anti-blanchiment LCB-FT et sanctions internationales intégrées." },
              { icon: BarChart3, title: "Liasse OHADA", desc: "Génération automatique des états financiers (Bilan, Compte de Résultat, TAFIRE)." }
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-[32px] glass-card border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-colors group">
                 <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                   <f.icon className="w-7 h-7 text-indigo-400" />
                 </div>
                 <h3 className="text-xl font-black text-white mb-3">{f.title}</h3>
                 <p className="text-slate-400 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
         </div>
      </main>
    </div>
  );
}