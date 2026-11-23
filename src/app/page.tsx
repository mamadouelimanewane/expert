"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  Calculator,
  FileSpreadsheet,
  FilePieChart,
  Users,
  Briefcase,
  Receipt,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Bot,
  BrainCircuit,
  Lock,
  Database,
  Building2,
  FileText,
  Clock,
  ChevronRight,
  CreditCard,
  Search,
  Scale,
  Award,
  BarChart3,
  Globe2,
  Layers,
  HelpCircle,
  Eye,
  Check,
  ChevronDown,
  MessageSquare,
  MessageCircle,
  Play,
  X,
  TrendingUp,
  Percent,
  CheckCircle,
  PhoneCall,
  Send,
  Loader2,
  Star
} from "lucide-react";

const ONBOARDING_PAUSED = true;

export default function SaaSGrandLandingPage() {
  const [billingCycle, setBillingCycle] = useState<"mensuel" | "annuel">("annuel");
  const [activeTab, setActiveTab] = useState<number>(0);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  // Modal d'information sur les inscriptions et l'accès cabinet
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [trialFormSubmitted, setTrialFormSubmitted] = useState(false);
  const [trialCabinetName, setTrialCabinetName] = useState("");
  const [trialEmail, setTrialEmail] = useState("");
  const [trialPhone, setTrialPhone] = useState("");
  const [trialCountry, setTrialCountry] = useState("SN");
  const [trialDossiers, setTrialDossiers] = useState("20 à 50 dossiers");
  const [isSubmittingTrial, setIsSubmittingTrial] = useState(false);

  // Simulateur ROI Gain de Temps Cabinet TPE/PME
  const [tpeCount, setTpeCount] = useState<number>(35);

  const [trialPassword, setTrialPassword] = useState("");
  const [trialError, setTrialError] = useState("");

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  const handleTrialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrialError("");
    setIsSubmittingTrial(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cabinetName: trialCabinetName,
          email: trialEmail,
          phone: trialPhone,
          country: trialCountry,
          dossiersCount: trialDossiers,
          password: trialPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de l'inscription.");
      }

      setTrialFormSubmitted(true);
    } catch (err: any) {
      setTrialError(err.message || "Erreur lors de la création de votre essai.");
    } finally {
      setIsSubmittingTrial(false);
    }
  };

  // Calculs ROI
  // Moyenne classique : 4h de saisie manuelle par dossier TPE/mois
  // Avec Cabinet 360 IA & WhatsApp : 25 min (0.42h)
  const heuresGagnees = Math.round(tpeCount * 3.5);
  const economieEstimeeFCFA = (heuresGagnees * 8500).toLocaleString("fr-FR");

  const modules = [
    {
      id: "tpe-pme",
      icon: MessageCircle,
      tag: "Usine IA TPE/PME",
      title: "Automatisation Dossiers TPE & WhatsApp Bot",
      desc: "Collectez tickets, factures et notes vocales des commerçants par WhatsApp. L'IA extrait les montants en FCFA, pré-impute le compte SYSCOHADA (601, 701, 613) et génère les écritures prêtes à valider en 1 clic.",
      highlights: [
        "Collecte passive : vos clients envoient photos et vocaux WhatsApp",
        "Pré-imputation automatique sans saisie manuelle au cabinet",
        "Validation en lot (Batch Processing) en quelques secondes",
        "Comptabilité SMT & Système Normal sans paperasse"
      ],
      badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
      featured: true,
    },
    {
      id: "compta",
      icon: FilePieChart,
      tag: "Production SYSCOHADA",
      title: "Comptabilité & États Financiers AUDCIF",
      desc: "Génération automatisée et sans artifice du Bilan (Système Normal & SMT), Compte de Résultat et SIG en cascade exacte. Aucun forçage d'équilibre comptable : les écarts et anomalies sont fidèlement identifiés et tracés.",
      highlights: [
        "Affectation unique par préfixe le plus long",
        "Reclassement automatique des soldes de tiers (409/419)",
        "Cascade complète des soldes intermédiaires de gestion (SIG)",
        "Liasse fiscale OHADA téléchargeable et imprimable aux normes"
      ],
      badgeColor: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20",
    },
    {
      id: "paie",
      icon: Calculator,
      tag: "Social & Déclarations",
      title: "Moteur de Paie Sénégal Conforme CGI Art. 174",
      desc: "Calcul rigoureux des bulletins avec barème d'impôt sur le revenu progressif sénégalais, abattements familiaux, cotisations IPRES (général et cadres), CSS, CFCE, TRIMF et heures supplémentaires par paliers réglementaires.",
      highlights: [
        "Zéro approximation : barème annuel légal sénégalais",
        "Gestion automatique des parts et charges de famille",
        "Bulletins de paie nominatifs avec mentions obligatoires",
        "Refus d'extrapolation arbitraire aux autres pays"
      ],
      badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    },
    {
      id: "ia-ocr",
      icon: Sparkles,
      tag: "Nexus IA & Vision",
      title: "Lecture Documentaire Hybride & Imputation Intelligente",
      desc: "Traitement des pièces à 3 niveaux : SheetJS pour fichiers structurés, OCR local Tesseract pour documents imprimés/scannés, et Vision IA Claude pour manuscrits et reçus froissés. Aucune hallucination de chiffres.",
      highlights: [
        "Traitement local sécurisé des PDF et factures",
        "Détection et réconciliation automatique des totaux",
        "Affectation comptable intelligente avec compte d'attente 471",
        "Assistant vocal et contextuel Nexus Copilot intégré"
      ],
      badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    },
    {
      id: "crm",
      icon: Briefcase,
      tag: "Pilotage & Missions",
      title: "CRM 360°, Lettres de Mission & Suivi des Temps",
      desc: "Centralisez votre portefeuille avec identifiants officiels (NINEA, RCCM, IFU). Générez vos lettres de mission personnalisées, suivez la rentabilité de chaque dossier en temps réel et analysez les feuilles de temps des collaborateurs.",
      highlights: [
        "Fiches clients enrichies et conformes zone OHADA",
        "Chronométrage des tâches et rentabilité horaire réelle",
        "Génération de lettres de mission types de l'Ordre",
        "Agenda et planification partagée des échéances"
      ],
      badgeColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    },
    {
      id: "fintech",
      icon: Receipt,
      tag: "Encaissements & FinTech",
      title: "Facturation UEMOA & Règlements Wave Mobile Money",
      desc: "Émettez des factures conformes aux normes fiscales régionales avec liens de paiement instantanés. Intégration native de l'API Wave Business Production et Orange Money pour un recouvrement sans friction.",
      highlights: [
        "Encaissement instantané par QR Code et lien Wave",
        "Rapprochement et lettrage automatique des règlements",
        "Relances automatisées des impayés par WhatsApp et e-mail",
        "Tableau de bord de trésorerie du cabinet"
      ],
      badgeColor: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
    },
    {
      id: "portail",
      icon: Users,
      tag: "Collaboration Client",
      title: "Portail Client Collaboratif Sécurisé",
      desc: "Offrez à chaque dirigeant client un espace digital moderne avec lien magique d'accès sans mot de passe opaque et révocable. Dépôt de justificatifs en temps réel et consultation des fiches de paie et bilans.",
      highlights: [
        "Lien sécurisé tokenisé sans risque d'oubli de mot de passe",
        "Dépôt express de pièces comptables (drag & drop)",
        "Téléchargement autonome des déclarations et bulletins",
        "Expérience client prestigieuse renforçant l'image du cabinet"
      ],
      badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      id: "audit",
      icon: ShieldCheck,
      tag: "Audit & Conformité",
      title: "Audit FEC, Contrôle Interne & KYC / LCB-FT",
      desc: "Vérification automatisée du Fichier des Écritures Comptables (FEC), détection d'anomalies critiques (caisses créditrices, écritures du week-end, montants ronds) et screening anti-blanchiment LCB-FT.",
      highlights: [
        "Scanner complet des journaux et balances",
        "Détection préventive des risques de redressement fiscal",
        "Registre des assemblées générales et gouvernance juridique",
        "Piste d'audit fiable horodatée"
      ],
      badgeColor: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
    },
    {
      id: "strategie",
      icon: BarChart3,
      tag: "Finance & Conseil",
      title: "Consolidation, Valorisation & Simulateur Fiscal",
      desc: "Accompagnez les dirigeants dans leurs décisions stratégiques : consolidation de groupes avec éliminations inter-compagnies, valorisation financière multi-méthodes (DCF, EBITDA, ANR) et simulateur d'impôt minimum forfaitaire.",
      highlights: [
        "Élimination des opérations intra-groupe et contrôles d'équilibre",
        "Valorisation d'entreprises selon 3 approches financières",
        "Simulateur de régime d'imposition et d'agrément Zone Franche",
        "Rapports exécutifs prêts pour les conseils d'administration"
      ],
      badgeColor: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
    }
  ];

  const pricingPlans = [
    {
      name: "Starter Cabinet",
      subtitle: "Pour experts-comptables indépendants et créateurs de cabinet",
      priceMonthly: 49000,
      priceAnnual: 39000,
      features: [
        "Jusqu'à 25 dossiers clients",
        "2 accès collaborateurs staff",
        "Comptabilité & Bilan SYSCOHADA normal & SMT",
        "Module Paie Sénégal (jusqu'à 30 salariés)",
        "Facturation UEMOA & Liens de paiement Wave",
        "Portail client sécurisé par lien magique",
        "OCR local factures et relevés (SheetJS & Tesseract)",
        "Support standard par e-mail sous 24h"
      ],
      popular: false,
      cta: "Inscriptions suspendues",
      badge: "Indépendant"
    },
    {
      name: "Cabinet Pro",
      subtitle: "La solution SaaS complète pour cabinets en pleine croissance",
      priceMonthly: 129000,
      priceAnnual: 99000,
      features: [
        "Dossiers clients illimités",
        "Jusqu'à 8 collaborateurs inclus",
        "Usine de Traitement IA & WhatsApp Bot pour TPE",
        "Suite SYSCOHADA complète avec Liasse Fiscale auto",
        "Module Paie Sénégal illimité (CGI art. 174)",
        "Nexus IA Copilot & Vision Claude pour manuscrits",
        "Intégration Wave for Business API directe",
        "Audit FEC & Contrôle interne anti-fraude",
        "Suivi des temps, rentabilité et lettres de mission",
        "Application mobile Android & PWA",
        "Support prioritaire WhatsApp & Téléphone"
      ],
      popular: true,
      cta: "Inscriptions suspendues",
      badge: "Recommandé"
    },
    {
      name: "Réseau & Multi-Sites",
      subtitle: "Pour grands cabinets, réseaux régionaux OHADA et groupes d'audit",
      priceMonthly: 289000,
      priceAnnual: 229000,
      features: [
        "Dossiers et collaborateurs illimités",
        "Multi-bureaux / multi-pays avec segmentation",
        "Automatisation massive TPE/PME multi-collaborateurs",
        "Module Consolidation & Valorisation financière (M&A)",
        "Screening KYC / LCB-FT et conformité avancée",
        "Clés API dédiées & connecteurs ERP sur mesure",
        "Instance de base de données dédiée",
        "Formation de l'équipe sur site ou visio",
        "Account Manager dédié et SLA garanti 99.9%"
      ],
      popular: false,
      cta: "Inscriptions suspendues",
      badge: "Sur-mesure"
    }
  ];

  const faqs = [
    {
      q: "Pourquoi les nouvelles inscriptions sont-elles suspendues ?",
      a: "Les nouvelles inscriptions sont suspendues. Les espaces SaaS associés à un cabinet restent en pause jusqu'à la validation du cloisonnement des données. Les comptes mono-cabinet existants peuvent toujours se connecter."
    },
    {
      q: "Comment l'IA automatise-t-elle la gestion des dossiers TPE/PME du cabinet ?",
      a: "Les dirigeants de TPE ou commerçants envoient leurs reçus, photos de factures et notes vocales sur un numéro WhatsApp relié à votre cabinet. Les fonctions de collecte et de pré-imputation sont une assistance à la saisie. Leur disponibilité dépend de la configuration; chaque proposition doit être vérifiée sur la pièce et approuvée par un collaborateur. Aucun gain de productivité n’est garanti sans mesure sur vos dossiers."
    },
    {
      q: "Puis-je accéder à la démonstration publique ?",
      a: "La démonstration publique est momentanément indisponible. Nous ne donnons pas accès à un compte partagé pendant la sécurisation des espaces cabinets."
    },
    {
      q: "L'application respecte-t-elle strictement le référentiel SYSCOHADA révisé ?",
      a: "Le dépôt contient un moteur de calcul SYSCOHADA et des contrôles associés. Cela ne certifie pas chaque dossier ou état. Les résultats, comptes non reconnus et écarts doivent être rapprochés des pièces, puis revus par un professionnel."
    },
    {
      q: "Comment fonctionne le calcul de la paie sénégalaise ?",
      a: "Le moteur vise la paie sénégalaise. Vérifiez taux, plafonds, textes et dates d’effet pour la période calculée; faites contrôler bulletins et déclarations par un professionnel local. Les règles sénégalaises ne s’appliquent pas aux autres pays."
    },
    {
      q: "Quels sont les modes de règlement acceptés ?",
      a: "Les paiements SaaS et la souscription en libre-service sont actuellement suspendus. Aucun paiement ne sera initié depuis cette page."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* ============================================================ */}
      {/* BANNIÈRE FLASH ESSAI GRATUIT & DÉMO                          */}
      {/* ============================================================ */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white text-xs font-semibold py-2.5 px-4 text-center flex items-center justify-center gap-3">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
        </span>
        <span>
          <strong>Accès aux cabinets pilotes :</strong> les inscriptions et la démonstration publique sont suspendues pendant la sécurisation des espaces.
        </span>
        <Link href="/login" className="underline font-bold text-amber-200 hover:text-white transition-colors ml-1">
          Connexion &rarr;
        </Link>
      </div>

      {/* ============================================================ */}
      {/* 1. NAVBAR SAAS                                              */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 dark:bg-slate-950/85 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Badge */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Cabinet <span className="text-emerald-600 dark:text-emerald-400">360</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  SaaS OHADA
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">ERP Expert-Comptable & Audit</p>
            </div>
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#tpe-ia" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
              <Sparkles className="w-4 h-4 text-amber-500" />
              IA & TPE/PME
            </a>
            <a href="#modules" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Tous les Modules
            </a>
            <a href="#syscohada" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              SYSCOHADA & Paie
            </a>
            <a href="#simulateur-roi" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Gain de Temps
            </a>
            <a href="#tarifs" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Tarifs
            </a>
            <a href="#faq" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Boutons d'action */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center px-3.5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Connexion Staff
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all"
            >
              <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              <span>Connexion</span>
            </Link>

            <button
              onClick={() => setIsTrialModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md shadow-emerald-600/25 transition-all hover:scale-105 active:scale-95"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Inscriptions suspendues</span>
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. HERO SECTION                                             */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-200/40 via-teal-100/20 to-transparent dark:from-emerald-950/30 dark:via-teal-950/10 dark:to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Badge haut */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Gestion de cabinet • Zone OHADA • Paie Sénégal</span>
            <span className="hidden sm:inline text-emerald-400">•</span>
            <span className="hidden sm:inline font-semibold text-emerald-700 dark:text-emerald-200">Accès existants uniquement</span>
          </div>

          {/* Titre principal */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-5xl mx-auto leading-[1.12]">
            Automatisez la Gestion de Vos{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500">
              Dossiers TPE, PME & Grandes Entreprises
            </span>{" "}
            Grâce à l'IA et au SYSCOHADA
          </h1>

          {/* Sous-titre */}
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Ne perdez plus des heures à saisir manuellement les tickets et factures de vos clients. 
            Avec la <strong>collecte WhatsApp passive</strong>, l'<strong>imputation IA Nexus</strong>, le moteur de <strong>paie sénégalaise CGI</strong> et le <strong>bilan SYSCOHADA AUDCIF</strong> : 
            Les calculs et propositions automatisées nécessitent une revue professionnelle. Les inscriptions publiques restent suspendues pendant la validation du cloisonnement des données.
          </p>

          {/* Actions CTA Triples */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setIsTrialModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-xl shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Zap className="w-5 h-5 text-amber-300" />
              <span>Voir l&apos;état des inscriptions</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 shadow-md transition-all"
            >
              <Play className="w-5 h-5 text-emerald-600 fill-emerald-600" />
              <span>Connexion à un espace existant</span>
            </Link>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Les nouvelles inscriptions et la démonstration publique sont suspendues pendant le renforcement du cloisonnement des données.
          </p>

          {/* Éléments de réassurance */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Outils SYSCOHADA : résultats à valider</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Barème Paie Sénégal CGI Art. 174</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Usine de Traitement IA & WhatsApp Bot</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Règlements Wave Mobile Money Directs</span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* MOCKUP INTERACTIF DU DASHBOARD                               */}
          {/* ============================================================ */}
          <div className="pt-10 max-w-6xl mx-auto">
            <div className="relative rounded-2xl sm:rounded-3xl p-2 sm:p-4 bg-gradient-to-b from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900 shadow-2xl border border-slate-200/80 dark:border-slate-800">
              <div className="rounded-xl sm:rounded-2xl bg-white dark:bg-slate-950 overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-inner">
                {/* Barre de titre type macOS */}
                <div className="px-4 py-3 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                    <span className="ml-2 text-xs font-mono text-slate-500">cabinet360.sn/bi — Tableau de bord & Usine IA</span>
                  </div>
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Aperçu illustratif • Données fictives
                  </div>
                </div>

                {/* Contenu du mockup */}
                <div className="p-4 sm:p-8 space-y-6 text-left">
                  {/* Cartes KPI */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Portefeuille TPE & PME</div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">48 Dossiers</div>
                      <div className="text-xs text-emerald-600 font-semibold mt-1">Exemple illustratif</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Bilan & États AUDCIF</div>
                      <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">Équilibré</div>
                      <div className="text-xs text-slate-500 mt-1">Écart arithmétique : 0 FCFA</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Paie Sénégal (Août/Sept)</div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">124 Bulletins</div>
                      <div className="text-xs text-emerald-600 font-semibold mt-1">Paie Sénégal : revue requise</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Flux Wave Encaissés</div>
                      <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">18,450,000 F</div>
                      <div className="text-xs text-slate-500 mt-1">Rapprochement à contrôler</div>
                    </div>
                  </div>

                  {/* Aperçu double colonne */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-emerald-600" />
                          Flux WhatsApp Reçus — Usine de Traitement IA TPE
                        </h4>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                          3 flux en attente de validation
                        </span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">Boutique Ndiaye & Frères :</span>{" "}
                            <span className="text-slate-600 dark:text-slate-400">« Vendu 85 000 FCFA ciment et riz »</span>
                          </div>
                          <span className="font-mono font-bold text-emerald-600">Compte 701000 (+85 000 F)</span>
                        </div>
                        <div className="p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">Atelier Thiès Mécanique :</span>{" "}
                            <span className="text-slate-600 dark:text-slate-400">Ticket carburant station Total 15 000 FCFA</span>
                          </div>
                          <span className="font-mono font-bold text-amber-600">Compte 605000 (-15 000 F)</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Bot className="w-4 h-4 text-purple-600" />
                        Nexus IA & Audit FEC
                      </h4>
                      <div className="p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <Sparkles className="w-3 h-3" />
                          Validation automatique
                        </div>
                        <p>
                          « Barème IR appliqué avec 3 parts familiales pour M. Diallo. Cotisation IPRES plafonnée à 432 000 FCFA. Aucun décalage détecté. »
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. SECTION MAJEURE : GESTION AUTOMATISÉE TPE/PME ET IA       */}
      {/* ============================================================ */}
      <section id="tpe-ia" className="py-20 lg:py-28 bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs sm:text-sm font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
              Révolution pour Votre Cabinet
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Usine de Traitement IA pour TPE & PME : Rentabilisez Enfin les Petits Dossiers
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              Historiquement, les dossiers de commerçants et TPE prennent trop de temps en saisie manuelle pour un honoraire modeste. 
              <strong> Cabinet 360 change la donne :</strong> vos clients envoient leurs pièces sur WhatsApp, l'IA fait la pré-imputation et vous validez en quelques clics.
            </p>
          </div>

          {/* Étapes du workflow d'automatisation */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Collecte WhatsApp</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Le client envoie une photo de reçu, une capture de paiement Wave ou un message vocal. Pas besoin d'application compliquée pour lui.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Extraction & Pré-imputation</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                L'IA analyse le texte ou la voix, identifie le montant en Francs CFA et classe sur le compte SYSCOHADA adéquat (Achats 601, Ventes 701, etc.).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Validation en Lot (1-Click)</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Toute proposition automatisée doit être vérifiée sur sa pièce source et approuvée avant comptabilisation. La validation en lot reste soumise aux contrôles disponibles dans l’espace.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center">
                4
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Bilan SMT & TVA Prêts</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Les états et déclarations nécessitent des contrôles, rapprochements et validations professionnels avant tout dépôt ou transmission.
              </p>
            </div>
          </div>

          {/* Bannière d'impact cabinet */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Un collaborateur peut désormais gérer jusqu'à 80 dossiers TPE/PME</h3>
              <p className="text-emerald-100 text-sm max-w-2xl">
                Les gains de temps dépendent des dossiers, de la qualité des pièces et des contrôles requis. Aucun niveau de productivité n’est garanti sans mesure sur votre portefeuille.
              </p>
            </div>
            <button
              onClick={() => setIsTrialModalOpen(true)}
              className="shrink-0 px-6 py-3.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl font-bold shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              Accès à la démonstration suspendu &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. CALCULATEUR INTERACTIF DU GAIN DE TEMPS (ROI CABINET)     */}
      {/* ============================================================ */}
      <section id="simulateur-roi" className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
              Calculateur de Rentabilité Cabinet
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Combien d'Heures Votre Cabinet Peut-il Économiser ?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Déplacez le curseur pour simuler les gains mensuels d'automatisation sur votre portefeuille.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Nombre de dossiers TPE & PME gérés par votre cabinet :
                </label>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {tpeCount} dossiers
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="150"
                step="5"
                value={tpeCount}
                onChange={(e) => setTpeCount(Number(e.target.value))}
                className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>5 dossiers</span>
                <span>50 dossiers</span>
                <span>100 dossiers</span>
                <span>150+ dossiers</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <div className="text-xs text-slate-500 font-semibold uppercase">Temps de Saisie Économisé</div>
                <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                  ~{heuresGagnees} heures
                </div>
                <div className="text-xs text-slate-500 mt-1">par mois pour vos collaborateurs</div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <div className="text-xs text-slate-500 font-semibold uppercase">Valeur Productive Estimée</div>
                <div className="text-4xl font-black text-amber-500 mt-2">
                  +{economieEstimeeFCFA} FCFA
                </div>
                <div className="text-xs text-slate-500 mt-1">de marge supplémentaire par mois</div>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setIsTrialModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md hover:scale-105"
              >
                <span>Consulter l&apos;état des inscriptions</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. LES 9 MODULES MÉTIER EN DÉTAIL                            */}
      {/* ============================================================ */}
      <section id="modules" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs sm:text-sm font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
              Couverture Fonctionnelle Exhaustive
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              9 Briques Métier Spécialisées pour un Cabinet 360°
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              Chaque brique a été conçue sur mesure pour répondre aux réalités fiscales, juridiques et économiques 
              des cabinets de la région OHADA.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((m) => {
              const IconComp = m.icon;
              return (
                <div
                  key={m.id}
                  className={`rounded-2xl p-7 bg-white dark:bg-slate-900 border shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col justify-between group ${
                    m.featured
                      ? "border-2 border-emerald-500 ring-2 ring-emerald-500/20"
                      : "border-slate-200/90 dark:border-slate-800"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-100 group-hover:scale-110 transition-transform">
                        <IconComp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${m.badgeColor}`}>
                        {m.tag}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {m.title}
                    </h3>

                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {m.desc}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                      {m.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-4 flex items-center justify-between">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                      <span>Tester en démo</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => setIsTrialModalOpen(true)}
                      className="text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
                    >
                      Inscription suspendue &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. FOCUS NORMES SYSCOHADA & PAIE SÉNÉGAL                     */}
      {/* ============================================================ */}
      <section id="syscohada" className="py-20 bg-slate-100 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
                Rigueur Comptable & Juridique
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Zéro Compromis sur les Calculs : Le Moteur Comptable & Social le Plus Strict de la Région
              </h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Cabinet 360 n'est pas un logiciel comptable générique traduit. Il applique à la lettre le 
                <strong> Système Comptable OHADA Révisé (AUDCIF)</strong> et le 
                <strong> Code Général des Impôts du Sénégal</strong>.
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <Scale className="w-5 h-5 text-emerald-600" />
                    <span>Pas d'équilibre forcé du bilan</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Le résultat net provient obligatoirement de la cascade des classes 6 et 7. Aucun compte d'ajustement 
                    fantôme n'est créé pour forcer artificiellement l'équilibre. Tout écart est signalé à l'écran.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <Calculator className="w-5 h-5 text-amber-500" />
                    <span>Calculs de paie sénégalaise stricts</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Application stricte des taux IPRES (5.6% ouvrier, 2.4% complémentaire), CSS (prestation 3%, accident 1-5%), 
                    CFCE (3%), barème IR progressif par tranches et TRIMF. L'application refuse expressément d'appliquer un barème à un pays non paramétré.
                  </p>
                </div>
              </div>
            </div>

            {/* Fiche technique de conformité */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                Matrice des Contrôles Automatisés
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Affectation unique compte / poste</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">Garanti</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Reclassement Fournisseurs débiteurs (409)</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">Automatique</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Reclassement Clients créditeurs (419)</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">Automatique</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Cascade SIG (Marge, VA, EBE, REX, RCAO)</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">SYSCOHADA</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Test de propriété 1 000 balances aléatoires</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">322/322 OK</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300">
                💡 <strong>Audit-Proof :</strong> Chaque écriture dispose de son empreinte horodatée pour répondre sans stress aux vérifications des inspecteurs de la DGID ou commissaires aux comptes.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. TARIFS SAAS SPÉCIAL CABINÈTES                             */}
      {/* ============================================================ */}
      <section id="tarifs" className="py-20 lg:py-32 bg-slate-100/80 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs sm:text-sm font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
              Abonnements SaaS & Tarifs Transparents
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Choisissez le Forfait Adapté à la Taille de Votre Cabinet
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              Les forfaits présentés sont indicatifs. L&apos;inscription et le paiement en libre-service sont suspendus pendant le renforcement du cloisonnement des données.
            </p>

            {/* Toggle Mensuel / Annuel */}
            <div className="pt-4 flex items-center justify-center gap-3">
              <span className={`text-sm font-semibold ${billingCycle === "mensuel" ? "text-slate-900 dark:text-white" : "text-slate-500"}`}>
                Facturation Mensuelle
              </span>
              <button
                type="button"
                onClick={() => setBillingCycle(billingCycle === "mensuel" ? "annuel" : "mensuel")}
                className="w-14 h-8 rounded-full bg-slate-300 dark:bg-slate-700 p-1 relative transition-colors focus:outline-none"
              >
                <div
                  className={`w-6 h-6 rounded-full bg-emerald-600 transition-transform ${
                    billingCycle === "annuel" ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
              <div className="flex items-center gap-1.5">
                <span className={`text-sm font-semibold ${billingCycle === "annuel" ? "text-slate-900 dark:text-white" : "text-slate-500"}`}>
                  Facturation Annuelle
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                  -20% (2 mois offerts)
                </span>
              </div>
            </div>
          </div>

          {/* Grille des 3 forfaits */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {pricingPlans.map((plan) => {
              const price = billingCycle === "annuel" ? plan.priceAnnual : plan.priceMonthly;
              return (
                <div
                  key={plan.name}
                  className={`rounded-3xl p-8 flex flex-col justify-between transition-all relative ${
                    plan.popular
                      ? "bg-white dark:bg-slate-950 border-2 border-emerald-500 shadow-2xl scale-105 z-10"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md">
                      Le Choix des Cabinets (Top Vente)
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        {plan.badge}
                      </span>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{plan.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{plan.subtitle}</p>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                          {price.toLocaleString("fr-FR")}
                        </span>
                        <span className="text-sm font-semibold text-slate-500">FCFA / mois</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {billingCycle === "annuel" ? "Facturé annuellement (économie de 2 mois)" : "Facturé au mois, sans engagement"}
                      </p>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-3">
                      <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Fonctionnalités incluses :</p>
                      {plan.features.map((feat, fidx) => (
                        <div key={fidx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8">
                    <button
                      onClick={() => setIsTrialModalOpen(true)}
                      className={`w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 ${
                        plan.popular
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/30"
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <span>{plan.cta}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto space-y-1">
            <p>Paiements sécurisés acceptés via <strong>Wave Mobile Money</strong>, <strong>Orange Money</strong>, Cartes Bancaires (Visa, Mastercard) ou Virement UEMOA.</p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. FOIRE AUX QUESTIONS (FAQ)                                  */}
      {/* ============================================================ */}
      <section id="faq" className="py-20 lg:py-28 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <span className="text-xs sm:text-sm font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
              Questions Fréquentes
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Tout ce que Vous Devez Savoir Avant de Tester
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 dark:text-white hover:text-emerald-600 transition-colors"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-500 shrink-0 transition-transform ${
                      faqOpen === idx ? "rotate-180 text-emerald-600" : ""
                    }`}
                  />
                </button>
                {faqOpen === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 9. BANDEAU D'APPEL FINAL                                     */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-950 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Prêt à Déployer l'IA & le SYSCOHADA dans Votre Cabinet ?
          </h2>
          <p className="text-base sm:text-lg text-emerald-100 max-w-2xl mx-auto">
            Les cabinets déjà équipés peuvent se connecter. Les nouvelles inscriptions et démonstrations publiques reprendront après validation du cloisonnement des données.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsTrialModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-slate-950 bg-white hover:bg-emerald-50 rounded-xl shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              <Zap className="w-5 h-5 text-emerald-700" />
              <span>Consulter l&apos;état des inscriptions</span>
            </button>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-emerald-950/60 hover:bg-emerald-950/80 rounded-xl border border-emerald-500/40 shadow-xl transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Connexion à un espace existant</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 10. FOOTER SAAS                                              */}
      {/* ============================================================ */}
      <footer className="py-12 bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                C
              </div>
              <span className="text-base font-black text-white">Cabinet 360</span>
              <span className="text-xs text-slate-500">Suite SaaS OHADA • v2.0.0</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400">
              <a href="#tpe-ia" className="hover:text-white transition-colors">Usine IA TPE</a>
              <a href="#modules" className="hover:text-white transition-colors">Modules</a>
              <a href="#syscohada" className="hover:text-white transition-colors">SYSCOHADA</a>
              <a href="#tarifs" className="hover:text-white transition-colors">Tarifs</a>
              <Link href="/login" className="hover:text-white transition-colors">Connexion Staff</Link>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
            <p>© 2026 Cabinet 360 SaaS. Tous droits réservés. Conforme AUDCIF OHADA & CGI Sénégal.</p>
            <p>Conçu pour l'excellence des cabinets d'expertise comptable et de commissariat aux comptes.</p>
          </div>
        </div>
      </footer>

      {/* ============================================================ */}
      {/* MODALE INTERACTIVE : ESSAI GRATUIT 14 JOURS                 */}
      {/* ============================================================ */}
      {isTrialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => {
                setIsTrialModalOpen(false);
                setTrialFormSubmitted(false);
              }}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {ONBOARDING_PAUSED ? (
              <div role="status" className="py-6 space-y-4 text-center">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Inscriptions momentanément suspendues</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Nous terminons la sécurisation de l&apos;isolation des données entre cabinets avant d&apos;ouvrir de nouveaux espaces. Aucun paiement ou renseignement de contact ne sera demandé ici.
                </p>
                <Link href="/login" className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl">
                  Se connecter à un espace existant
                </Link>
              </div>
            ) : !trialFormSubmitted ? (
              <form onSubmit={handleTrialSubmit} className="space-y-5">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Inscriptions actuellement suspendues</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    Activez Votre Espace Cabinet SaaS
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Démarrez immédiatement sans carte bancaire. Vous accédez à tous les modules ainsi qu'à l'Usine IA pour TPE/PME.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nom du Cabinet d'Expertise / Audit *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Cabinet Alpha Conseil & Audit"
                      value={trialCabinetName}
                      onChange={(e) => setTrialCabinetName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        E-mail Professionnel *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="expert@votrecabinet.sn"
                        value={trialEmail}
                        onChange={(e) => setTrialEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        WhatsApp / Téléphone *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+221 77 000 00 00"
                        value={trialPhone}
                        onChange={(e) => setTrialPhone(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Mot de passe du compte *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={12}
                      maxLength={128}
                      autoComplete="new-password"
                      placeholder="12 caractères minimum"
                      value={trialPassword}
                      onChange={(e) => setTrialPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-slate-500">Utilisez un mot de passe unique. Aucun mot de passe par défaut n&apos;est créé.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Pays Principal
                      </label>
                      <select
                        value={trialCountry}
                        onChange={(e) => setTrialCountry(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="SN">Sénégal</option>
                        <option value="CI">Côte d&apos;Ivoire</option>
                        <option value="CM">Cameroun</option>
                        <option value="BJ">Bénin</option>
                        <option value="TG">Togo</option>
                        <option value="ML">Mali</option>
                        <option value="OTHER">Autre pays OHADA</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Volume Portefeuille
                      </label>
                      <select
                        value={trialDossiers}
                        onChange={(e) => setTrialDossiers(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="1 à 20 dossiers">1 à 20 dossiers</option>
                        <option value="20 à 50 dossiers">20 à 50 dossiers</option>
                        <option value="50 à 100 dossiers">50 à 100 dossiers</option>
                        <option value="Plus de 100 dossiers">Plus de 100 dossiers</option>
                      </select>
                    </div>
                  </div>
                </div>

                {trialError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
                    ⚠️ {trialError}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingTrial}
                    className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                  >
                    {isSubmittingTrial ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Création de votre espace en cours...</span>
                      </>
                    ) : (
                      <>
                        <span>Valider et Accéder à Mon Espace Gratuit</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  🎉 Votre Espace Cabinet est Prêt !
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                  Compte créé pour <strong>{trialCabinetName || trialEmail}</strong>. Connectez-vous avec votre e-mail et le mot de passe choisi.
                </p>

                <div className="pt-2 flex flex-col gap-3">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-all text-xs"
                  >
                    <span>Se connecter à mon espace cabinet ({trialEmail})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
