"use client";

import React from "react";
import Link from "next/link";
import {
    Cpu,
    ShieldCheck,
    TrendingUp,
    Users,
    ArrowRight,
    CheckCircle2,
    Globe,
    Zap,
    Layers,
    BarChart3,
    Award,
    Play,
    ChevronDown,
    Menu,
    X,
    Star,
    Mail
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LandingPage() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-[#0a0c10]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="font-bold text-white text-xl">C</span>
                        </div>
                        <span className="text-xl font-black text-white tracking-tighter">CABINET 360 <span className="text-indigo-500">ELITE</span></span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-10">
                        <a href="#features" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Solutions</a>
                        <a href="#academy" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Academy</a>
                        <a href="#impact" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Impact</a>
                        <a href="/documentation" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Docs</a>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-white px-6 py-2 hover:text-indigo-400 transition-colors">Connexion</Link>
                        <Link href="/dashboard" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-indigo-600/20">Accéder au Dashboard</Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-[#0a0c10] border-b border-white/5 p-6 space-y-4 animate-in slide-in-from-top duration-300">
                        <a href="#features" className="block text-sm font-bold uppercase tracking-widest text-slate-400">Solutions</a>
                        <a href="#academy" className="block text-sm font-bold uppercase tracking-widest text-slate-400">Academy</a>
                        <a href="#impact" className="block text-sm font-bold uppercase tracking-widest text-slate-400">Impact</a>
                        <Link href="/login" className="block text-sm font-bold uppercase tracking-widest text-white">Connexion</Link>
                        <Link href="/dashboard" className="block w-full py-4 bg-indigo-600 text-center rounded-xl font-black uppercase tracking-widest text-xs">Dashboard</Link>
                    </div>
                )}
            </nav>

            <main>
                {/* Hero Section */}
                <section className="relative pt-40 pb-32 overflow-hidden">
                    {/* Background Glows */}
                    <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full" />
                    <div className="absolute bottom-0 -right-20 w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full" />

                    <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8 animate-in fade-in slide-in-from-bottom duration-700">
                            <Zap className="w-3 h-3" /> Propulsé par Nexus AI
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight leading-[0.9] uppercase mb-8 animate-in fade-in slide-in-from-bottom duration-1000">
                            L'Expertise <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 italic">Nouvelle Ère</span>
                        </h1>

                        <p className="max-w-3xl mx-auto text-slate-400 text-lg md:text-xl font-medium leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
                            La première plateforme de gestion "Zero Entry" pour les cabinets d'expertise comptable, d'audit et de conseil en zone OHADA.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
                            <Link href="/dashboard" className="w-full sm:w-auto px-12 py-6 bg-white text-slate-900 rounded-[24px] font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-2xl shadow-white/10 group flex items-center justify-center gap-3">
                                Débuter l'Expérience <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="/documentation/welcome-pack" className="w-full sm:w-auto px-12 py-6 bg-white/5 text-white border border-white/10 rounded-[24px] font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                                <Play className="w-4 h-4 fill-current" /> Voir la démo
                            </Link>
                        </div>

                        {/* App Mockup Preview */}
                        <div className="mt-24 relative max-w-5xl mx-auto group animate-in zoom-in duration-1000 delay-500">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[40px] border border-white/10 p-4 shadow-2xl overflow-hidden aspect-video relative">
                                <img
                                    src="/cabinet360_hero_abstract_1770222007438.png"
                                    alt="Cabinet 360 Interface"
                                    className="w-full h-full object-cover rounded-[32px] opacity-80"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-transparent to-transparent" />
                                <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end text-left">
                                    <div>
                                        <p className="text-4xl font-black text-white uppercase tracking-tighter">Nexus Insight Dashboard</p>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">Pilotage Prédictif & Sécurité Blockchain</p>
                                    </div>
                                    <div className="hidden md:flex gap-4">
                                        <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex flex-col items-center">
                                            <span className="text-indigo-400 font-black text-lg">98%</span>
                                            <span className="text-[8px] font-black uppercase text-slate-500">Précision IA</span>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex flex-col items-center">
                                            <span className="text-emerald-400 font-black text-lg">AES-256</span>
                                            <span className="text-[8px] font-black uppercase text-slate-500">Sécurité</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-32 bg-[#0c0e14] relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20 text-left">
                            <div className="max-w-2xl">
                                <h2 className="text-xs font-black text-indigo-500 uppercase tracking-[0.5em] mb-4">L'Ecosystème Elite</h2>
                                <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none">
                                    Une solution pour <br />
                                    chaque <span className="text-slate-500">défi stratégique</span>
                                </h3>
                            </div>
                            <p className="text-slate-500 font-medium max-w-sm mb-2">
                                Finie la multiplicité des outils. Cabinet 360 unifie votre production, votre conformité et votre relation client.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { title: "Expertise Comptable", desc: "Flux 'Zero Entry' avec OCR sémantique et révision digitale assistée par IA.", icon: Cpu, delay: "duration-500" },
                                { title: "Audit & Assurance", desc: "Digitalisation des missions selon les normes ISA avec détection de fraude mathématique.", icon: ShieldCheck, delay: "duration-700" },
                                { title: "Tax Intelligence", desc: "Diagnostic automatique des risques fiscaux OHADA et optimisation des déclarations.", icon: Zap, delay: "duration-1000" },
                                { title: "Payroll & Social", desc: "Gestion complexe du social UEMOA avec portail employé et virement en un clic.", icon: Users, delay: "duration-500" },
                                { title: "Corporate Legal", desc: "Secrétariat juridique dématérialisé et archivage blockchain des actes.", icon: Globe, delay: "duration-700" },
                                { title: "Market Intel", desc: "BI Stratégique et benchmarking sectoriel exclusif pour un conseil haute valeur.", icon: BarChart3, delay: "duration-1000" },
                            ].map((feature, i) => (
                                <div key={i} className={cn("glass-card p-10 rounded-[48px] border border-white/5 bg-slate-900/40 hover:border-indigo-500/30 transition-all group", feature.delay)}>
                                    <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                        <feature.icon className="w-8 h-8 text-indigo-400" />
                                    </div>
                                    <h4 className="text-2xl font-black text-white uppercase mb-4">{feature.title}</h4>
                                    <p className="text-slate-500 text-sm leading-relaxed mb-8">{feature.desc}</p>
                                    <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0">
                                        En savoir plus <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Academy Teaser Section */}
                <section id="academy" className="py-32 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="bg-indigo-600 rounded-[80px] p-12 md:p-24 relative overflow-hidden shadow-2xl shadow-indigo-600/20">
                            <div className="absolute top-0 right-0 p-24 opacity-10 rotate-12">
                                <Award className="w-80 h-80 text-white" />
                            </div>

                            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-indigo-100 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                                        Valeur Ajoutée Elite
                                    </div>
                                    <h2 className="text-5xl md:text-6xl font-black text-white uppercase leading-none mb-8">
                                        Cabinet <br />360 <span className="text-indigo-200 underline decoration-indigo-300">Academy</span>
                                    </h2>
                                    <p className="text-indigo-100 text-lg font-medium leading-relaxed mb-12">
                                        Le service après-vente redéfini. Nous ne vendons pas qu'un logiciel, nous formons vos équipes à l'excellence opérationnelle grâce à nos manuels premium.
                                    </p>
                                    <Link href="/documentation/training-manuals" className="inline-flex items-center gap-4 px-10 py-5 bg-white text-indigo-600 rounded-3xl font-black uppercase tracking-widest text-xs hover:shadow-2xl transition-all shadow-xl">
                                        Découvrir les Manuels <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    {[
                                        { label: "Parcours Certifiants", val: "12" },
                                        { label: "Experts Formés", val: "1.2k+" },
                                        { label: "Manuels Premium", val: "400p+" },
                                        { label: "Support Dédié", val: "24/7" },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white/10 backdrop-blur-md p-8 rounded-[40px] border border-white/10 text-center">
                                            <p className="text-3xl font-black text-white leading-none mb-2">{stat.val}</p>
                                            <p className="text-[10px] font-bold uppercase text-indigo-200 tracking-widest">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trust & Impact Section */}
                <section id="impact" className="py-32 bg-[#0a0c10]">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-24">
                            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.5em] mb-6 tracking-widest">Confiance & Performance</h2>
                            <h3 className="text-5xl font-black text-white uppercase tracking-tight">Ils pilotent avec <span className="text-indigo-500">Élite</span></h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {[
                                { client: "Industries du Sahel", metric: "70%", desc: "Gain de productivité sur la clôture mensuelle." },
                                { client: "Afrimoney Tech", metric: "100%", desc: "Fiabilité des données lors de levée de fonds." },
                                { client: "Bénin Retail Group", metric: "450", desc: "Salariés gérés sereinement chaque mois." },
                            ].map((impact, i) => (
                                <div key={i} className="text-center group">
                                    <div className="w-32 h-32 mx-auto bg-slate-900 border border-white/5 rounded-full flex items-center justify-center mb-8 group-hover:border-indigo-500/50 transition-all relative">
                                        <span className="text-4xl font-black text-white">{impact.metric}</span>
                                        <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <h4 className="text-xl font-bold text-white mb-2 uppercase">{impact.client}</h4>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{impact.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Integration logos grayscale */}
                        <div className="mt-32 pt-20 border-t border-white/5 flex flex-wrap justify-center items-center gap-16 grayscale opacity-20">
                            <span className="text-2xl font-black tracking-tighter">OHADA</span>
                            <span className="text-2xl font-black tracking-tighter">ONECCA</span>
                            <span className="text-2xl font-black tracking-tighter">DGTCP</span>
                            <span className="text-2xl font-black tracking-tighter">BCEAO</span>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-32 bg-[#0c0e14] relative overflow-hidden transition-all duration-1000">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-20">
                            <h2 className="text-xs font-black text-indigo-500 uppercase tracking-[0.5em] mb-4">Investissement Stratégique</h2>
                            <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">Des plans adaptés à votre <span className="text-slate-500 font-serif">ambition</span></h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    name: "Essential",
                                    price: "60 000",
                                    desc: "Parfait pour les cabinets en démarrage.",
                                    features: ["Comptabilité Core OHADA", "OCR Basique (50 pièces/mois)", "Tableau de Bord Standard", "2 Utilisateurs Inclus", "Support Email 5j/7"],
                                    active: false,
                                    label: "Light"
                                },
                                {
                                    name: "Professional",
                                    price: "100 000",
                                    desc: "La solution complète pour cabinets établis.",
                                    features: ["Tout le pack Essential", "Module Audit & Assurance", "Tax Intelligence (IA)", "Portail Client Collaboratif", "5 Utilisateurs Inclus", "Support Prioritaire"],
                                    active: true,
                                    label: "Standard"
                                },
                                {
                                    name: "Elite",
                                    price: "150 000",
                                    desc: "Le summum de l'intelligence financière.",
                                    features: ["Tout le pack Professional", "IA Morning Brief & Predictive", "Nexus Vault (Blockchain)", "Accompagnement Dédié 24/7", "Certifications Academy", "Utilisateurs Illimités"],
                                    active: false,
                                    label: "Full"
                                }
                            ].map((plan, i) => (
                                <div key={i} className={cn(
                                    "p-10 rounded-[50px] border flex flex-col transition-all hover:scale-[1.02] duration-500",
                                    plan.active
                                        ? "bg-indigo-600 border-indigo-400 shadow-2xl shadow-indigo-600/20 text-white"
                                        : "bg-slate-900/40 border-white/5 text-slate-300"
                                )}>
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <span className={cn("text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 inline-block", plan.active ? "bg-white/10" : "bg-indigo-500/10 text-indigo-400")}>
                                                {plan.label}
                                            </span>
                                            <h4 className="text-3xl font-black uppercase tracking-tighter">{plan.name}</h4>
                                        </div>
                                        {plan.active && <Star className="w-6 h-6 fill-current text-white animate-pulse" />}
                                    </div>

                                    <div className="mb-10">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-black tracking-tight">{plan.price}</span>
                                            <span className="text-sm font-bold opacity-60">FCFA / MOIS</span>
                                        </div>
                                        <p className="text-sm mt-4 font-medium opacity-60 italic">{plan.desc}</p>
                                    </div>

                                    <ul className="space-y-4 mb-12 flex-1">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-3 text-sm font-medium">
                                                <CheckCircle2 className={cn("w-4 h-4 shrink-0", plan.active ? "text-indigo-200" : "text-indigo-500")} />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <button className={cn(
                                        "w-full py-5 rounded-[24px] font-black uppercase tracking-widest text-xs transition-all",
                                        plan.active ? "bg-white text-indigo-600 shadow-xl" : "bg-white/5 border border-white/10 hover:bg-white/10"
                                    )}>
                                        Sélectionner ce plan
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section id="contact" className="py-32 relative overflow-hidden bg-[#0a0c10]">
                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-12">
                            <div>
                                <h2 className="text-xs font-black text-indigo-500 uppercase tracking-[0.5em] mb-4">Direct Link</h2>
                                <h3 className="text-5xl font-black text-white uppercase tracking-tight leading-[0.9]">
                                    Un projet ? <br />
                                    <span className="text-slate-500 italic">Discutons-en.</span>
                                </h3>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-center gap-6 group cursor-pointer">
                                    <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all duration-500">
                                        <Globe className="w-8 h-8 text-indigo-400 group-hover:text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Téléphone Direct</p>
                                        <a href="tel:+221777529288" className="text-2xl font-black text-white hover:text-indigo-400 transition-colors tracking-tight">+221 77 752 92 88</a>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 group cursor-pointer">
                                    <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all duration-500">
                                        <Mail className="w-8 h-8 text-indigo-400 group-hover:text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Email Stratégique</p>
                                        <a href="mailto:mamadouelimane@gmail.com" className="text-2xl font-black text-white hover:text-indigo-400 transition-colors tracking-tight">mamadouelimane@gmail.com</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-10 md:p-12 rounded-[60px] border border-white/5 bg-slate-900/40 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                                <Zap className="w-64 h-64 text-white" />
                            </div>

                            <form className="space-y-8 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Nom Complet</label>
                                        <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500 transition-all" placeholder="Abdoulaye Fall" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Cabinet / Entreprise</label>
                                        <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500 transition-all" placeholder="Cabinet Expert XYZ" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Votre Message</label>
                                    <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500 transition-all resize-none" placeholder="Décrivez votre besoin stratégique..." />
                                </div>
                                <button className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-indigo-600/30">
                                    Envoyer la Demande
                                </button>
                            </form>
                        </div>
                    </div>
                </section>

                {/* Final Call to Action */}
                <section className="py-32 border-t border-white/5">
                    <div className="max-w-5xl mx-auto px-6 text-center">
                        <div className="flex justify-center mb-10">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-16 h-16 rounded-full bg-slate-800 border-4 border-[#0a0c10] overflow-hidden flex items-center justify-center text-xs font-bold text-slate-500">
                                        <Users className="w-6 h-6" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tight leading-none mb-10">
                            Prêt pour la <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-emerald-500">Révolution OHADA ?</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link href="/" className="px-16 py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-indigo-600/30 transition-all hover:scale-105">
                                Commencer Gratuitement
                            </Link>
                            <Link href="/contact" className="px-16 py-6 bg-white/5 text-white border border-white/10 rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all">
                                Parler à un Expert
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-[#080a0e] border-t border-white/5 pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 text-left">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg">
                                <span className="font-bold text-white text-lg leading-none">C</span>
                            </div>
                            <span className="text-lg font-black text-white tracking-tighter">CABINET 360</span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed font-medium">
                            L'excellence technologique pour les professionnels du chiffre et du droit en Afrique.
                        </p>
                        <div className="flex gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-indigo-400 cursor-pointer">
                                    <Globe className="w-4 h-4" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase text-white tracking-[0.3em] mb-8">Plateforme</h4>
                        <ul className="space-y-4 text-sm font-bold text-slate-500">
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Core Accounting</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Audit & Assurance</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Fiscalité OHADA</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Nexus AI Brief</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase text-white tracking-[0.3em] mb-8">Ressources</h4>
                        <ul className="space-y-4 text-sm font-bold text-slate-500">
                            <li><Link href="/documentation" className="hover:text-indigo-400 transition-colors">Centre d'aide</Link></li>
                            <li><Link href="/documentation/training-manuals" className="hover:text-indigo-400 transition-colors">Elite Academy</Link></li>
                            <li><Link href="/documentation/release-notes" className="hover:text-indigo-400 transition-colors">Nouveautés</Link></li>
                            <li><Link href="/documentation/full-manual" className="hover:text-indigo-400 transition-colors">Guide Expert</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase text-white tracking-[0.3em] mb-8">Présence Régionale</h4>
                        <ul className="space-y-4 text-sm font-bold text-slate-500">
                            <li className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Dakar, Sénégal
                            </li>
                            <li className="flex items-center gap-3 text-slate-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" /> Abidjan, CI (Ouverture)
                            </li>
                            <li className="flex items-center gap-3 text-slate-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" /> Cotonou, Bénin
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest">
                        © 2026 CABINET EXPERT & CONSULTING OHADA. TOUS DROITS RÉSERVÉS.
                    </p>
                    <div className="flex gap-8 text-[10px] font-black uppercase text-slate-600 tracking-widest">
                        <a href="/legal" className="hover:text-white transition-colors">Mentions Légales</a>
                        <a href="/privacy" className="hover:text-white transition-colors">Confidentialité</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
