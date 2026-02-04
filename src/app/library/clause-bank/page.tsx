"use client";

import { useState } from "react";
import {
    BookOpen,
    Search,
    Filter,
    Copy,
    Star,
    StarOff,
    FileText,
    Tag,
    ChevronRight,
    Plus,
    Edit3,
    Download,
    Info,
    Scale,
    Building2,
    Users,
    Handshake,
    Sparkles,
    Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Clause {
    id: string;
    title: string;
    category: string;
    subcategory: string;
    content: string;
    annotations: string[];
    negotiationTips: string[];
    acteUniforme: string;
    isFavorite: boolean;
    usageCount: number;
    lastUsed?: string;
}

const CLAUSE_CATEGORIES = [
    { id: "societes", label: "Sociétés", icon: Building2, count: 45 },
    { id: "contrats", label: "Contrats", icon: Handshake, count: 32 },
    { id: "surete", label: "Sûretés", icon: Scale, count: 18 },
    { id: "emploi", label: "Travail", icon: Users, count: 24 },
];

const MOCK_CLAUSES: Clause[] = [
    {
        id: "CLZ-001",
        title: "Clause de non-concurrence - Associé sortant",
        category: "societes",
        subcategory: "Statuts SARL",
        content: `L'associé sortant s'engage, pendant une durée de [DURÉE] ans à compter de la cessation de ses fonctions, à ne pas exercer directement ou indirectement une activité concurrente à celle de la société dans un rayon de [RAYON] kilomètres.

Cette interdiction s'applique tant à titre personnel qu'en qualité d'associé, gérant, salarié ou consultant d'une entreprise concurrente.

En cas de violation, l'associé sortant sera redevable d'une indemnité forfaitaire de [MONTANT] FCFA, sans préjudice de tous dommages-intérêts complémentaires.`,
        annotations: [
            "La durée doit être raisonnable (généralement 2-3 ans max)",
            "Le périmètre géographique doit être proportionné à l'activité",
            "Prévoir une contrepartie financière si l'associé est également salarié"
        ],
        negotiationTips: [
            "Négocier une réduction de durée contre une indemnité plus élevée",
            "Prévoir des exceptions pour certains secteurs d'activité",
            "Définir précisément ce qui constitue une activité 'concurrente'"
        ],
        acteUniforme: "AUSCGIE Art. 853",
        isFavorite: true,
        usageCount: 28,
        lastUsed: "2026-01-15"
    },
    {
        id: "CLZ-002",
        title: "Clause d'agrément - Cession de parts sociales",
        category: "societes",
        subcategory: "Statuts SARL",
        content: `Les parts sociales sont librement cessibles entre associés.

Toute cession de parts à un tiers, à quelque titre que ce soit, est soumise à l'agrément préalable de la collectivité des associés statuant à la majorité des associés représentant au moins [QUORUM] du capital social.

Le projet de cession doit être notifié à la société et à chacun des associés par acte extrajudiciaire ou par lettre recommandée avec avis de réception. Dans un délai de [DÉLAI] mois à compter de cette notification, la société doit faire connaître sa décision.

À défaut de réponse dans ce délai, l'agrément est réputé acquis.`,
        annotations: [
            "Le quorum légal minimum est de 3/4 (AUSCGIE Art. 319)",
            "Le délai de réponse ne peut excéder 3 mois",
            "En cas de refus, les associés ont 3 mois pour racheter les parts"
        ],
        negotiationTips: [
            "Prévoir des cas d'agrément automatique (succession, donation au conjoint)",
            "Définir le prix de rachat en cas de refus d'agrément",
            "Ajouter une clause de sortie forcée en cas de blocage"
        ],
        acteUniforme: "AUSCGIE Art. 318-320",
        isFavorite: true,
        usageCount: 42,
        lastUsed: "2026-01-28"
    },
    {
        id: "CLZ-003",
        title: "Clause de garantie d'actif et de passif",
        category: "contrats",
        subcategory: "Cession de fonds/actions",
        content: `Le Cédant garantit le Cessionnaire contre toute diminution de l'actif net de la société cible résultant:
- De l'inexactitude des déclarations figurant à l'Annexe [X];
- De tout passif non comptabilisé ou insuffisamment provisionné à la date de cession;
- De tout redressement fiscal ou social portant sur la période antérieure à la cession.

Cette garantie est plafonnée à [MONTANT] FCFA et soumise à une franchise de [FRANCHISE] FCFA par réclamation.

La durée de la garantie est de:
- [DURÉE_FISCALE] ans pour les risques fiscaux et sociaux;
- [DURÉE_GENERALE] ans pour les autres risques.`,
        annotations: [
            "Le plafond de garantie représente généralement 20-50% du prix",
            "Prévoir un mécanisme de séquestre ou caution bancaire",
            "Distinguer les garanties de conformité et les garanties de passif"
        ],
        negotiationTips: [
            "Négocier un mécanisme de révision de prix plutôt qu'une indemnisation",
            "Prévoir des exceptions pour les risques connus de l'acquéreur",
            "Définir précisément les modalités de notification des réclamations"
        ],
        acteUniforme: "AUDCG Art. 234",
        isFavorite: false,
        usageCount: 15
    },
    {
        id: "CLZ-004",
        title: "Clause pénale - Retard de livraison",
        category: "contrats",
        subcategory: "Contrat commercial",
        content: `En cas de retard de livraison imputable au Fournisseur, celui-ci sera redevable de pénalités de retard calculées comme suit:
- [TAUX_1]% du prix de la commande par jour de retard pendant les [JOURS_1] premiers jours;
- [TAUX_2]% du prix de la commande par jour de retard au-delà.

Ces pénalités sont plafonnées à [PLAFOND]% du prix total de la commande.

Au-delà de [DÉLAI_RÉSOLUTION] jours de retard, le Client pourra résoudre le contrat de plein droit, sans mise en demeure préalable, par simple notification écrite.`,
        annotations: [
            "Les pénalités doivent rester proportionnées au préjudice estimé",
            "Le juge peut modérer les clauses pénales manifestement excessives",
            "Distinguer retard et inexécution totale"
        ],
        negotiationTips: [
            "Prévoir des cas d'exonération (force majeure, fait du client)",
            "Négocier un plafond global de responsabilité",
            "Ajouter un délai de grâce avant application des pénalités"
        ],
        acteUniforme: "AUDCG Art. 294",
        isFavorite: false,
        usageCount: 31
    },
];

export default function ClauseBankPage() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedClause, setSelectedClause] = useState<Clause | null>(null);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    const filteredClauses = MOCK_CLAUSES.filter(c => {
        if (selectedCategory && c.category !== selectedCategory) return false;
        if (showFavoritesOnly && !c.isFavorite) return false;
        if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <BookOpen className="w-64 h-64 text-amber-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-amber-500/20">
                                Bibliothèque de Clauses • OHADA
                            </span>
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                                NEXUS Premium
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            Clause Bank <span className="text-amber-400">OHADA</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Bibliothèque de clauses types conformes aux Actes Uniformes OHADA avec annotations d'experts et conseils de négociation.
                        </p>
                    </div>

                    <button className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-amber-600/30 active:scale-95">
                        <Plus className="w-5 h-5" /> Nouvelle Clause
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Search */}
                    <div className="relative">
                        <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Rechercher une clause..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-900/60 border border-white/5 rounded-2xl text-sm text-white focus:ring-2 focus:ring-amber-500"
                        />
                    </div>

                    {/* Categories */}
                    <div className="glass-card rounded-[32px] border border-white/5 bg-slate-900/40 p-6">
                        <h3 className="text-sm font-black text-white mb-4 uppercase tracking-widest">Catégories</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={cn(
                                    "w-full flex items-center justify-between p-3 rounded-xl transition-all text-left",
                                    !selectedCategory ? "bg-amber-500/20 text-amber-400" : "hover:bg-white/5 text-slate-400"
                                )}
                            >
                                <span className="text-sm font-bold">Toutes les clauses</span>
                                <span className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded">{MOCK_CLAUSES.length}</span>
                            </button>
                            {CLAUSE_CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 rounded-xl transition-all text-left",
                                        selectedCategory === cat.id ? "bg-amber-500/20 text-amber-400" : "hover:bg-white/5 text-slate-400"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <cat.icon className="w-4 h-4" />
                                        <span className="text-sm font-bold">{cat.label}</span>
                                    </div>
                                    <span className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded">{cat.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Favorites Toggle */}
                    <button
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        className={cn(
                            "w-full flex items-center justify-center gap-3 p-4 rounded-2xl transition-all font-bold text-sm",
                            showFavoritesOnly ? "bg-amber-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
                        )}
                    >
                        {showFavoritesOnly ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                        {showFavoritesOnly ? "Afficher tout" : "Mes favoris"}
                    </button>
                </div>

                {/* Clauses List */}
                <div className="lg:col-span-9">
                    {selectedClause ? (
                        /* Clause Detail View */
                        <div className="glass-card rounded-[48px] border border-white/5 bg-slate-900/40 p-10 shadow-2xl animate-in fade-in duration-500">
                            <button
                                onClick={() => setSelectedClause(null)}
                                className="text-sm text-slate-500 hover:text-white mb-6 flex items-center gap-2 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 rotate-180" /> Retour à la liste
                            </button>

                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-white mb-2">{selectedClause.title}</h2>
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase rounded-full border border-amber-500/20">
                                            {selectedClause.subcategory}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-bold">
                                            Réf: {selectedClause.acteUniforme}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-3 hover:bg-white/5 rounded-xl text-slate-400 hover:text-amber-400 transition-all border border-white/10">
                                        <Star className={cn("w-5 h-5", selectedClause.isFavorite && "fill-amber-400 text-amber-400")} />
                                    </button>
                                    <button className="p-3 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all border border-white/10">
                                        <Copy className="w-5 h-5" />
                                    </button>
                                    <button className="p-3 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all border border-white/10">
                                        <Download className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Clause Content */}
                            <div className="bg-slate-800/50 rounded-3xl p-8 border border-white/5 mb-8">
                                <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                                    {selectedClause.content}
                                </pre>
                            </div>

                            {/* Annotations */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/20">
                                    <h4 className="text-sm font-black text-indigo-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                                        <Info className="w-4 h-4" /> Annotations Expert
                                    </h4>
                                    <ul className="space-y-3">
                                        {selectedClause.annotations.map((note, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                                                {note}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/20">
                                    <h4 className="text-sm font-black text-emerald-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" /> Conseils de Négociation
                                    </h4>
                                    <ul className="space-y-3">
                                        {selectedClause.negotiationTips.map((tip, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-4">
                                <button className="flex-1 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all">
                                    Insérer dans le document
                                </button>
                                <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-white/10">
                                    <Edit3 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Clauses Grid */
                        <div className="space-y-4">
                            {filteredClauses.map((clause) => (
                                <div
                                    key={clause.id}
                                    onClick={() => setSelectedClause(clause)}
                                    className="glass-card rounded-3xl border border-white/5 bg-slate-900/40 p-6 hover:border-amber-500/30 transition-all cursor-pointer hover:scale-[1.01]"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                {clause.isFavorite && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                                                <h4 className="text-lg font-black text-white">{clause.title}</h4>
                                            </div>
                                            <div className="flex items-center gap-4 text-[10px] text-slate-500 mb-3">
                                                <span className="px-2 py-0.5 bg-white/5 rounded border border-white/10">{clause.subcategory}</span>
                                                <span>{clause.acteUniforme}</span>
                                                <span>Utilisée {clause.usageCount}x</span>
                                            </div>
                                            <p className="text-sm text-slate-400 line-clamp-2">{clause.content}</p>
                                        </div>
                                        <button className="p-3 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all">
                                            <Eye className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
