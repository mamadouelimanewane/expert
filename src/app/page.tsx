import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, BrainCircuit, BarChart3, FileSpreadsheet, ScanText, CheckCircle2, ChevronRight, Calculator, Globe } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 overflow-hidden relative font-sans">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="font-bold text-white text-xl">C</span>
             </div>
             <h1 className="text-xl font-black tracking-tight text-white">CABINET 360</h1>
          </div>
          <nav className="hidden md:flex items-center gap-8">
             <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Fonctionnalités</a>
             <a href="#ia" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Intelligence IA</a>
             <a href="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Tarifs</a>
          </nav>
          <div className="flex items-center gap-4">
             <Link href="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors hidden sm:block">Se connecter</Link>
             <Link href="/dashboard" className="px-6 py-2.5 rounded-full bg-white text-slate-900 font-bold text-sm hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">
               Essai Gratuit
             </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto relative z-10">
         <div className="text-center max-w-4xl mx-auto mt-20 space-y-8 animate-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase tracking-widest mb-4">
              <Zap className="w-4 h-4" /> Plateforme SaaS #1 en zone OHADA
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
              Votre cabinet d'expertise, propulsé par l'<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Intelligence Artificielle</span>.
            </h1>
            <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
              Cabinet 360 automatise la production comptable (SYSCOHADA), intègre l'audit légal par IA et numérise les factures par OCR. Reprenez le contrôle de votre temps.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
               <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 group">
                 Démarrer la démo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </Link>
               <a href="#features" className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-black text-sm uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center gap-3">
                 Découvrir l'outil
               </a>
            </div>
         </div>

         {/* Modules Premium (Hero Stats) */}
         <div className="mt-20 p-1 border border-white/10 rounded-3xl bg-slate-900/50 backdrop-blur-sm max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
                <div className="p-8 text-center">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-2">-70%</h3>
                    <p className="text-slate-400 text-sm font-medium">De temps passé sur la Liasse Fiscale</p>
                </div>
                <div className="p-8 text-center">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-2">100%</h3>
                    <p className="text-slate-400 text-sm font-medium">Automatique via OCR embarqué</p>
                </div>
                <div className="p-8 text-center">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-2">Zéro</h3>
                    <p className="text-slate-400 text-sm font-medium">Fuite de données (Edge Computing)</p>
                </div>
            </div>
         </div>

         {/* Features Grid */}
         <div id="features" className="mt-32 pt-10">
            <div className="text-center mb-16">
                <h2 className="text-xl sm:text-2xl lg:text-3xl md:text-5xl font-black text-white mb-6">Des outils pensés pour les experts</h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">Nous avons intégré les technologies de demain dans les processus d'aujourd'hui.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Liasse Fiscale */}
                <div className="p-8 rounded-[32px] glass-card border border-white/5 bg-slate-900/40 hover:bg-slate-900/80 transition-all group">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="w-7 h-7 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-3">Liasse Fiscale OHADA</h3>
                    <p className="text-slate-400 leading-relaxed font-medium mb-6">Importez une balance Excel, l'algorithme génère le Bilan et le Compte de Résultat instantanément.</p>
                    <Link href="/liasse-fiscale" className="flex items-center gap-2 text-indigo-400 text-sm font-bold group-hover:text-indigo-300">Essayer le module <ChevronRight className="w-4 h-4" /></Link>
                </div>

                {/* Audit IA */}
                <div className="p-8 rounded-[32px] glass-card border border-white/5 bg-slate-900/40 hover:bg-slate-900/80 transition-all group">
                    <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-7 h-7 text-rose-400" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-3">Audit Légal & FEC Analyzer</h3>
                    <p className="text-slate-400 leading-relaxed font-medium mb-6">L'IA scanne le Grand Livre, traque la caisse créditrice et détecte la fraude comptable (écritures le dimanche).</p>
                    <Link href="/audit-legal" className="flex items-center gap-2 text-rose-400 text-sm font-bold group-hover:text-rose-300">Voir l'analyseur <ChevronRight className="w-4 h-4" /></Link>
                </div>

                {/* Scanner OCR */}
                <div className="p-8 rounded-[32px] glass-card border border-white/5 bg-slate-900/40 hover:bg-slate-900/80 transition-all group">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <ScanText className="w-7 h-7 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-3">Notes de Frais (Scanner OCR)</h3>
                    <p className="text-slate-400 leading-relaxed font-medium mb-6">Prenez un ticket en photo. L'intelligence embarquée extrait la TVA, le montant HT et la date sans saisie.</p>
                    <Link href="/expense-notes" className="flex items-center gap-2 text-emerald-400 text-sm font-bold group-hover:text-emerald-300">Tester le scanner <ChevronRight className="w-4 h-4" /></Link>
                </div>
            </div>
         </div>

         {/* Value Proposition */}
         <div id="ia" className="mt-32 glass-card border border-indigo-500/20 bg-indigo-950/20 rounded-[40px] p-4 sm:p-8 lg:p-12 overflow-hidden relative">
             <div className="absolute top-0 right-0 p-24 opacity-10">
                 <BrainCircuit className="w-96 h-96 text-indigo-400" />
             </div>
             <div className="relative z-10 max-w-2xl">
                 <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-6">Confidentialité Totale (Zéro-Trust)</h2>
                 <p className="text-lg text-indigo-200/80 mb-8 leading-relaxed">
                     Le secret professionnel n'est pas une option. Contrairement aux autres ERP, Cabinet 360 exécute les calculs lourds, l'OCR et l'analyse de données <strong>directement dans votre navigateur</strong>. Aucune donnée financière sensible n'est transmise à un serveur IA distant.
                 </p>
                 <ul className="space-y-4">
                     {["Traitement 'Edge' ultra-rapide", "Architecture Next.js sécurisée", "Conformité stricte aux données clients"].map((item, i) => (
                         <li key={i} className="flex items-center gap-3 text-white font-bold">
                             <CheckCircle2 className="w-5 h-5 text-indigo-400" /> {item}
                         </li>
                     ))}
                 </ul>
             </div>
         </div>

         {/* CTA Section */}
         <div className="mt-32 text-center pb-20 border-t border-white/5 pt-20">
             <h2 className="text-4xl md:text-5xl font-black text-white mb-8">Prêt à digitaliser votre cabinet ?</h2>
             <Link href="/dashboard" className="inline-flex items-center justify-center px-10 py-5 rounded-full bg-white text-slate-900 font-black text-lg hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                 Accéder à l'application
             </Link>
             <p className="text-slate-500 mt-6 text-sm">Aucune carte bancaire requise. Accès immédiat.</p>
         </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-black/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <span className="font-bold text-white text-sm">C</span>
                 </div>
                 <span className="font-bold text-slate-300">Cabinet 360 © 2026</span>
              </div>
              <div className="flex gap-6 text-sm font-medium text-slate-500">
                  <a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a>
                  <a href="#" className="hover:text-white transition-colors">CGV</a>
                  <a href="#" className="hover:text-white transition-colors">Contact</a>
              </div>
          </div>
      </footer>
    </div>
  );
}