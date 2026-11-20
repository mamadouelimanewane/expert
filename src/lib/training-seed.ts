import { prismaSystem as prisma } from "./prisma";

// Contenu de catalogue de démarrage (formations génériques réelles pour experts-comptables
// OHADA — contenu de référence, pas des statistiques d'engagement inventées : aucun nombre
// d'étudiants ni note n'est stocké ici, ils sont calculés depuis les vraies inscriptions).
const CATALOG: Array<{
  title: string; subtitle?: string; category: string; level: any; durationLabel: string;
  price: number; cpfHours: number; isCertifying: boolean; isPopular: boolean;
  instructorName: string; color: string; skills: string[];
}> = [
  { title: "Expert SYSCOHADA Révisé", subtitle: "Maîtrisez le plan comptable OHADA de A à Z", category: "syscohada", level: "INTERMEDIAIRE", durationLabel: "40h", price: 150000, cpfHours: 40, isCertifying: true, isPopular: true, instructorName: "Prof. Koné", color: "from-teal-500 to-emerald-600", skills: ["Plan Comptable", "Écritures", "États Financiers", "Annexes"] },
  { title: "Maîtriser la Consolidation", subtitle: "Des bases aux techniques avancées de consolidation groupe", category: "consolidation", level: "AVANCE", durationLabel: "25h", price: 200000, cpfHours: 25, isCertifying: true, isPopular: true, instructorName: "Prof. Koné", color: "from-violet-500 to-purple-600", skills: ["IG", "IP", "MEE", "Goodwill", "Éliminations"] },
  { title: "Fiscalité Entreprise UEMOA", subtitle: "IS, IR, TVA et optimisation fiscale légale", category: "fiscal", level: "INTERMEDIAIRE", durationLabel: "30h", price: 175000, cpfHours: 30, isCertifying: true, isPopular: false, instructorName: "Me. Diallo", color: "from-amber-500 to-orange-600", skills: ["TVA", "IS", "IR", "Contentieux", "Optimisation"] },
  { title: "Audit & CAC Niveau 1", subtitle: "Fondamentaux du commissariat aux comptes", category: "audit", level: "INTERMEDIAIRE", durationLabel: "35h", price: 225000, cpfHours: 35, isCertifying: true, isPopular: false, instructorName: "Cabinet BDO", color: "from-rose-500 to-pink-600", skills: ["Planification", "Seuils", "Tests", "Rapport"] },
  { title: "Transformation Digitale Cabinet", subtitle: "Modernisez votre cabinet : outils, process et stratégie", category: "digital", level: "DEBUTANT", durationLabel: "15h", price: 100000, cpfHours: 15, isCertifying: false, isPopular: false, instructorName: "J-P Mensah", color: "from-sky-500 to-blue-600", skills: ["Cloud", "Automatisation", "IA", "Cybersécurité"] },
  { title: "Paie & Social Sénégal/CI", subtitle: "Maîtrisez la paie dans l'espace UEMOA", category: "social", level: "INTERMEDIAIRE", durationLabel: "20h", price: 125000, cpfHours: 20, isCertifying: true, isPopular: false, instructorName: "M. Bah", color: "from-rose-400 to-pink-500", skills: ["Bulletins", "CNPS", "CSS", "Licenciement"] },
];

const FEATURED_COURSE_MODULES = [
  {
    title: "Introduction à la Consolidation", order: 0, duration: "1h 15min",
    lessons: [
      { title: "Périmètre et notions fondamentales", duration: "18:30", type: "VIDEO" as const },
      { title: "Le cadre réglementaire SYSCOHADA", duration: "22:15", type: "VIDEO" as const },
      { title: "Ressources téléchargeables", duration: "-", type: "DOC" as const },
    ],
  },
  {
    title: "Méthodes de Consolidation", order: 1, duration: "2h 45min",
    lessons: [
      { title: "Intégration Globale (IG)", duration: "35:20", type: "VIDEO" as const },
      { title: "Intégration Proportionnelle", duration: "28:45", type: "VIDEO" as const },
      { title: "Mise en Équivalence", duration: "32:10", type: "VIDEO" as const },
      { title: "Exercice pratique : Choix de méthode", duration: "25:00", type: "VIDEO" as const },
    ],
  },
  {
    title: "Écritures de Retraitement", order: 2, duration: "2h 30min",
    lessons: [
      { title: "Homogénéisation des comptes", duration: "30:00", type: "VIDEO" as const },
      { title: "Élimination des opérations intra-groupe", duration: "35:00", type: "VIDEO" as const },
      { title: "Traitement des écarts de conversion", duration: "28:00", type: "VIDEO" as const },
    ],
  },
];

const FEATURED_QUIZ_QUESTIONS = [
  { question: "Quelle est la méthode de consolidation obligatoire pour les filiales sous contrôle exclusif ?", options: ["Mise en Équivalence", "Intégration Globale", "Intégration Proportionnelle", "Méthode du Coût"], correctIndex: 1, explanation: "L'Intégration Globale est la méthode utilisée pour les sociétés sous contrôle exclusif selon le SYSCOHADA." },
  { question: "Le pourcentage d'intérêt correspond à :", options: ["La quote-part du capital détenue par la société mère", "Le pourcentage de droits de vote en assemblée générale", "La somme des pourcentages de contrôle de toutes les filiales", "La part des dividendes reçus uniquement"], correctIndex: 0, explanation: "Le pourcentage d'intérêt mesure la part de patrimoine détenue directement et indirectement par la société mère." },
  { question: "Le Goodwill négatif (Badwill) doit être :", options: ["Inscrit en réserves consolidées", "Amorti sur 5 ans", "Immédiatement comptabilisé en résultat", "Déduit des immobilisations"], correctIndex: 2, explanation: "Le Goodwill négatif est considéré comme un profit et doit être enregistré immédiatement en résultat." },
  { question: "Les opérations internes au groupe (inter-compagnies) doivent être :", options: ["Conservées telles quelles", "Éliminées en totalité en intégration globale", "Éliminées à hauteur du pourcentage d'intérêt uniquement", "Ajoutées au Goodwill"], correctIndex: 1, explanation: "En intégration globale, les comptes réciproques et les profits internes doivent être éliminés à 100%." },
  { question: "Dans quel cas utilise-t-on la mise en équivalence ?", options: ["Contrôle Conjoint", "Contrôle Exclusif", "Influence Notable", "Contrôle de fait"], correctIndex: 2, explanation: "La mise en équivalence est la méthode pour les entreprises sur lesquelles le groupe exerce une influence notable (généralement entre 20% et 50% des droits de vote)." },
];

export async function ensureTrainingSeed() {
  const count = await prisma.trainingCourse.count();
  if (count > 0) return;

  for (const c of CATALOG) {
    await prisma.trainingCourse.create({ data: c });
  }

  const featured = await prisma.trainingCourse.create({
    data: {
      title: "Consolidation OHADA - Niveau Avancé",
      subtitle: "Maîtrisez les techniques de consolidation selon le SYSCOHADA révisé",
      category: "consolidation",
      level: "AVANCE",
      durationLabel: "12h 30min",
      price: 200000,
      cpfHours: 12,
      isCertifying: true,
      isPopular: true,
      instructorName: "Prof. Amadou Koné",
      color: "from-teal-500 to-emerald-600",
      skills: ["Consolidation", "SYSCOHADA", "États Financiers Groupe"],
    },
  });

  for (const mod of FEATURED_COURSE_MODULES) {
    await prisma.trainingModule.create({
      data: {
        title: mod.title,
        order: mod.order,
        duration: mod.duration,
        courseId: featured.id,
        lessons: {
          create: mod.lessons.map((l, i) => ({ title: l.title, duration: l.duration, type: l.type, order: i })),
        },
      },
    });
  }

  await prisma.quiz.create({
    data: {
      title: "Quiz : Méthodes de Consolidation",
      timeLimit: 600,
      passingScore: 70,
      courseId: featured.id,
      questions: {
        create: FEATURED_QUIZ_QUESTIONS.map((q, i) => ({ ...q, order: i })),
      },
    },
  });
}
