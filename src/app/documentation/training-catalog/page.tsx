import Link from 'next/link';
import {
    BookOpen,
    Award,
    Zap,
    Users,
    ChevronRight,
    ArrowRight,
    Play,
    Clock,
    ShieldCheck,
    Monitor,
} from 'lucide-react';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ─────────────────────────────────────────────────────────────────────────────
// Cette page affichait des statistiques fixes ("2 500+ Apprenants Certifiés",
// "12 Experts Formateurs", "45+ Formations Actives") et trois formations
// vedettes avec des notes inventées (4.9/4.8/4.7 étoiles, sans qu'aucun
// système de notation n'existe dans l'application), présentées comme des
// indicateurs réels. Les modèles TrainingCourse/TrainingEnrollment/
// Certificate existent déjà dans le schéma : les compteurs viennent
// désormais de ces tables, et les notes par étoiles — invérifiables, aucun
// modèle d'avis n'existe — ont été retirées plutôt que devinées.
// ─────────────────────────────────────────────────────────────────────────────

export default async function CatalogMarketingPage() {
    const [nbFormations, nbCertificats, formateurs, formationsPhares] = await Promise.all([
        prisma.trainingCourse.count(),
        prisma.certificate.count(),
        prisma.trainingCourse.findMany({ select: { instructorName: true }, distinct: ['instructorName'] }),
        prisma.trainingCourse.findMany({
            where: { isCertifying: true },
            orderBy: { isPopular: 'desc' },
            take: 3,
            select: { id: true, title: true, category: true, durationLabel: true, price: true },
        }),
    ]);
    const nbFormateurs = formateurs.filter((f) => f.instructorName).length;

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-12">

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-teal-900/20 via-slate-900 to-slate-900 rounded-[20px] sm:rounded-[36px] lg:rounded-[50px] border border-white/5 p-4 sm:p-8 lg:p-16 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <BookOpen className="w-64 h-64 text-teal-400" />
                </div>

                <div className="relative z-10 max-w-3xl space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 text-teal-400 rounded-full text-xs font-bold tracking-widest uppercase border border-teal-500/20">
                        Formation Continue
                    </div>
                    <h1 className="page-title-dark">
                        Élevez vos Compétences vers l'<span className="text-teal-400">Excellence</span>
                    </h1>
                    <p className="page-subtitle-dark">
                        Le catalogue de formations pour les professionnels du chiffre et du droit dans l'espace OHADA.
                    </p>
                    <div className="flex gap-4 pt-4">
                        <Link href="/training/catalog" className="px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-teal-600/30 flex items-center gap-2">
                            Voir le Catalogue Interactif <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Formations Actives", value: String(nbFormations), icon: Monitor },
                    { label: "Certificats Délivrés", value: String(nbCertificats), icon: Award },
                    { label: "Formateurs", value: String(nbFormateurs), icon: Users },
                ].map((stat) => (
                    <div key={stat.label} className="glass-card p-8 rounded-[32px] bg-slate-900/40 border border-white/5 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-400 mb-4">
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-black text-white">{stat.value}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Highlights */}
            <div className="space-y-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">Parcours <span className="text-teal-400">Certifiants</span></h2>
                    </div>
                    <Link href="/training/catalog" className="text-teal-400 font-bold text-sm hover:underline">Voir tout le catalogue</Link>
                </div>

                {formationsPhares.length === 0 ? (
                    <p className="text-sm text-slate-500">Aucune formation certifiante enregistrée pour le moment.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {formationsPhares.map((course) => (
                            <div key={course.id} className="glass-card rounded-[32px] border border-white/5 bg-slate-900/40 p-8 group hover:border-teal-500/30 transition-all hover:-translate-y-1 shadow-xl">
                                <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-400 group-hover:bg-teal-600 group-hover:text-white transition-all mb-6">
                                    <Award className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-black text-white mb-2 group-hover:text-teal-400 transition-colors">{course.title}</h3>
                                <p className="text-xs text-slate-500 mb-6 font-bold uppercase tracking-widest">{course.category}{course.durationLabel ? ` • ${course.durationLabel}` : ""}</p>

                                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                    <span className="text-lg font-black text-white">
                                        {course.price > 0 ? `${course.price.toLocaleString("fr-FR")} FCFA` : "Gratuit"}
                                    </span>
                                    <Link href="/training/catalog" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-teal-400 group-hover:bg-teal-600 group-hover:text-white transition-all">
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* E-Learning Features */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 lg:gap-12 py-12">
                <div className="space-y-8">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">Une Expérience d'<span className="text-teal-400">E-Learning</span> Moderne</h2>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Suivez votre progression, vos points CPF et vos certifications directement depuis votre espace membre.
                    </p>

                    <div className="space-y-4">
                        {[
                            { title: "Dashboard Personnel", desc: "Suivez votre progression et vos points CPF.", icon: Monitor },
                            { title: "Contenu Multi-Support", desc: "Vidéos, fiches de synthèse et quiz interactifs.", icon: Play },
                            { title: "Certificats Vérifiables", desc: "Chaque certificat porte un code de vérification unique.", icon: ShieldCheck },
                            { title: "Accès Illimité", desc: "Formez-vous à votre rythme, 24h/24 et 7j/7.", icon: Clock },
                        ].map((feature) => (
                            <div key={feature.title} className="flex gap-4 p-4 rounded-3xl hover:bg-white/5 transition-all">
                                <div className="w-10 h-10 bg-teal-500/10 rounded-2xl flex flex-shrink-0 items-center justify-center text-teal-400">
                                    <feature.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">{feature.title}</h4>
                                    <p className="text-sm text-slate-500">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-primary/20 blur-[100px] opacity-20" />
                    <div className="relative rounded-[40px] border border-white/10 bg-slate-900 shadow-2xl overflow-hidden aspect-video flex items-center justify-center">
                        <div className="p-4 sm:p-6 lg:p-10 text-center">
                            <Monitor className="w-20 h-20 text-teal-500/30 mx-auto mb-4" />
                            <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">Preview Plateforme</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-primary to-teal-700 rounded-[20px] sm:rounded-[36px] lg:rounded-[50px] p-20 text-center shadow-2xl shadow-teal-500/20">
                <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white mb-6">Prêt à transformer votre carrière ?</h2>
                <p className="text-teal-100 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                    Accédez au catalogue de formations dès aujourd'hui.
                </p>
                <div className="flex justify-center gap-6">
                    <Link href="/training/catalog" className="px-10 py-5 bg-white text-teal-600 rounded-[20px] font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 transition-all">
                        Explorer le Catalogue
                    </Link>
                    <Link href="/training/academy" className="px-10 py-5 bg-transparent border-2 border-white/30 text-white rounded-[20px] font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all">
                        Espace Membre
                    </Link>
                </div>
            </div>

        </div>
    );
}
