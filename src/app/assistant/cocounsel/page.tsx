"use client";

import { useState } from "react";
import {
    Sparkles,
    MessageSquare,
    FileText,
    Send,
    History,
    Lightbulb,
    BookOpen,
    Scale,
    Calculator,
    PenTool,
    Copy,
    Download,
    RefreshCw,
    ChevronRight,
    User,
    Bot,
    Zap,
    ShieldAlert,
    AlertTriangle,
    CheckCircle2,
    FileSearch,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaysFiscal } from "@/lib/tax-simulator";
import type { ResultatAnalyseContrat, RisqueContractuel } from "@/lib/ohada/nexus-legal-core";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    sources?: string[];
}

interface QuickAction {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    prompt: string;
    category: string;
}

const QUICK_ACTIONS: QuickAction[] = [
    { id: "1", label: "Analyser un contrat", icon: FileText, prompt: "Analysez ce contrat et identifiez les clauses à risque selon le droit OHADA", category: "Analyse" },
    { id: "2", label: "Recherche juridique", icon: Scale, prompt: "Quelle est la procédure de recouvrement de créances selon l'AUPSRVE ?", category: "Recherche" },
    { id: "3", label: "Calcul fiscal", icon: Calculator, prompt: "Calculez l'IS pour une société avec un bénéfice de 50M FCFA au Sénégal", category: "Fiscal" },
    { id: "4", label: "Rédiger une clause", icon: PenTool, prompt: "Rédigez une clause de non-concurrence conforme à l'AUSCGIE", category: "Rédaction" },
    { id: "5", label: "Veille réglementaire", icon: BookOpen, prompt: "Quelles sont les dernières modifications des Actes Uniformes OHADA en 2025 ?", category: "Veille" },
    { id: "6", label: "Conseil stratégique", icon: Lightbulb, prompt: "Conseillez-moi sur l'optimisation fiscale pour une PME exportatrice", category: "Conseil" },
];

export default function CoCounselPage() {
    const [activeTab, setActiveTab] = useState<"chat" | "analyse_contrat" | "consultation">("chat");

    // Chat state
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Analyse contrat state
    const [texteContrat, setTexteContrat] = useState("");
    const [paysContrat, setPaysContrat] = useState<PaysFiscal>("sn");
    const [isAnalyzingContract, setIsAnalyzingContract] = useState(false);
    const [contractResult, setContractResult] = useState<ResultatAnalyseContrat | null>(null);
    const [contractError, setContractError] = useState("");

    // Consultation state
    const [sujetConsultation, setSujetConsultation] = useState("");
    const [contexteConsultation, setContexteConsultation] = useState("");
    const [paysConsultation, setPaysConsultation] = useState<PaysFiscal>("sn");
    const [isGeneratingConsultation, setIsGeneratingConsultation] = useState(false);
    const [consultationResult, setConsultationResult] = useState<string | null>(null);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        const question = inputValue;
        setInputValue("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/nexus/legal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mode: "CONSULTATION", message: question, payload: { pays: "sn" } }),
            });
            const data = await res.json();
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.reponse || data.error || "Erreur lors de la réponse de l'assistant.",
                timestamp: new Date(),
                sources: data.notConfigured ? undefined : ["Doctrine OHADA & CGI UEMOA validés"],
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Erreur de connexion à l'assistant IA Nexus Legal.",
                timestamp: new Date(),
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAction = (action: QuickAction) => {
        if (action.id === "1") {
            setActiveTab("analyse_contrat");
        } else {
            setActiveTab("chat");
            setInputValue(action.prompt);
        }
    };

    const handleAnalyzeContract = async () => {
        if (!texteContrat.trim()) {
            setContractError("Veuillez coller le texte d'un contrat à auditer.");
            return;
        }
        setIsAnalyzingContract(true);
        setContractError("");
        setContractResult(null);

        try {
            const res = await fetch("/api/nexus/legal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mode: "ANALYSE_CONTRAT",
                    payload: { texteContrat, pays: paysContrat }
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erreur d'analyse");
            setContractResult(data.resultat);
        } catch (err) {
            setContractError(err instanceof Error ? err.message : "Erreur inattendue");
        } finally {
            setIsAnalyzingContract(false);
        }
    };

    const handleGenerateConsultation = async () => {
        if (!sujetConsultation.trim()) return;
        setIsGeneratingConsultation(true);
        setConsultationResult(null);

        try {
            const res = await fetch("/api/nexus/legal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mode: "CONSULTATION",
                    payload: { sujet: sujetConsultation, contexte: contexteConsultation, pays: paysConsultation }
                })
            });
            const data = await res.json();
            setConsultationResult(data.reponse || data.error || "Erreur de génération");
        } catch {
            setConsultationResult("Erreur de communication avec le serveur.");
        } finally {
            setIsGeneratingConsultation(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 animate-in fade-in duration-500 max-w-7xl mx-auto p-4 sm:p-6">
            {/* Header Tabs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                    <h1 className="page-title text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-primary" />
                        Nexus Legal & Tax Co-Counsel
                    </h1>
                    <p className="page-subtitle text-xs text-muted-foreground mt-0.5">
                        Intelligence artificielle juridique et fiscale spécialisée OHADA, Actes Uniformes et CGI régionaux.
                    </p>
                </div>
                <div className="flex items-center gap-1 bg-card/60 border border-border p-1 rounded-xl text-xs">
                    <button
                        onClick={() => setActiveTab("chat")}
                        className={cn(
                            "px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5",
                            activeTab === "chat" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Dialogue Juridique
                    </button>
                    <button
                        onClick={() => setActiveTab("analyse_contrat")}
                        className={cn(
                            "px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5",
                            activeTab === "analyse_contrat" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <FileSearch className="w-3.5 h-3.5" />
                        Audit de Contrat
                    </button>
                    <button
                        onClick={() => setActiveTab("consultation")}
                        className={cn(
                            "px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5",
                            activeTab === "consultation" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        Consultation Fiscale
                    </button>
                </div>
            </div>

            {/* TAB 1: CHAT */}
            {activeTab === "chat" && (
                <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-14rem)] lg:overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-full lg:w-80 flex flex-col gap-4">
                        <div className="bg-card/40 border border-border rounded-2xl p-4">
                            <h4 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">Actions Rapides</h4>
                            <div className="space-y-1.5">
                                {QUICK_ACTIONS.map(action => (
                                    <button
                                        key={action.id}
                                        onClick={() => handleQuickAction(action)}
                                        className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-muted/50 transition-all text-left group text-xs"
                                    >
                                        <div className="p-1.5 bg-muted rounded-lg group-hover:bg-primary/20 transition-all">
                                            <action.icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-foreground group-hover:text-primary truncate">{action.label}</p>
                                            <p className="text-[10px] text-muted-foreground">{action.category}</p>
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-xs text-muted-foreground space-y-2">
                            <span className="font-semibold text-foreground flex items-center gap-1.5">
                                <Scale className="w-4 h-4 text-primary" /> Référentiel OHADA actif
                            </span>
                            <p>AUSCGIE, AUPSRVE, AUS, Traité OHADA et CGI Sénégal / Côte d&apos;Ivoire / Cameroun / Bénin intégrés.</p>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 min-h-[50vh] bg-card/30 border border-border rounded-2xl flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-4">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                                    <div className="p-3 bg-primary/10 rounded-2xl">
                                        <Bot className="w-8 h-8 text-primary" />
                                    </div>
                                    <h3 className="text-base font-bold text-foreground">Comment puis-je vous assister aujourd&apos;hui ?</h3>
                                    <p className="text-xs text-muted-foreground max-w-md">
                                        Posez une question juridique OHADA, demandez l&apos;analyse d&apos;une situation fiscale ou vérifiez une obligation légale.
                                    </p>
                                </div>
                            ) : (
                                messages.map(message => (
                                    <div
                                        key={message.id}
                                        className={cn("flex gap-3", message.role === "user" ? "flex-row-reverse" : "")}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold",
                                            message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-primary"
                                        )}>
                                            {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                        </div>
                                        <div className={cn(
                                            "max-w-2xl rounded-2xl p-4 text-xs space-y-2",
                                            message.role === "user"
                                                ? "bg-primary/20 border border-primary/30 rounded-tr-none text-foreground"
                                                : "bg-background/80 border border-border rounded-tl-none text-foreground"
                                        )}>
                                            <div
                                                className="leading-relaxed whitespace-pre-wrap font-sans"
                                                dangerouslySetInnerHTML={{
                                                    __html: message.content
                                                        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                                                        .replace(/\n/g, '<br/>')
                                                }}
                                            />
                                            {message.sources && message.sources.length > 0 && (
                                                <div className="pt-2 border-t border-border flex flex-wrap gap-1">
                                                    {message.sources.map((s, idx) => (
                                                        <span key={idx} className="text-[10px] bg-muted/60 px-2 py-0.5 rounded text-muted-foreground">
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                            {isLoading && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-primary animate-pulse" />
                                    </div>
                                    <div className="bg-background/80 border border-border rounded-2xl rounded-tl-none p-3 flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-3 bg-background/50 border-t border-border">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                    placeholder="Ex: Quelle est la sanction d'une convention réglementée non approuvée selon l'AUSCGIE ?"
                                    className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!inputValue.trim() || isLoading}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-primary/90 disabled:opacity-50"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: AUDIT DE CONTRAT */}
            {activeTab === "analyse_contrat" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-card/40 border border-border rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold flex items-center gap-2">
                                <FileSearch className="w-4 h-4 text-primary" />
                                Saisie du texte contractuel
                            </h2>
                            <select
                                value={paysContrat}
                                onChange={(e) => setPaysContrat(e.target.value as PaysFiscal)}
                                className="bg-background border border-border rounded-lg px-2 py-1 text-xs"
                            >
                                <option value="sn">Sénégal (SN)</option>
                                <option value="ci">Côte d&apos;Ivoire (CI)</option>
                                <option value="cm">Cameroun (CM)</option>
                                <option value="bj">Bénin (BJ)</option>
                            </select>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Collez les clauses statutaires, pactes d&apos;associés ou contrats commerciaux pour identifier les clauses léonines, risques d&apos;établissement stable et conformité OHADA.
                        </p>
                        <textarea
                            rows={14}
                            value={texteContrat}
                            onChange={(e) => setTexteContrat(e.target.value)}
                            placeholder="Collez ici le texte du contrat ou des statuts à auditer..."
                            className="w-full bg-background border border-border rounded-xl p-3 text-xs font-mono text-foreground placeholder:text-muted-foreground"
                        />
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleAnalyzeContract}
                                disabled={isAnalyzingContract || !texteContrat.trim()}
                                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-xl text-xs hover:bg-primary/90 disabled:opacity-50"
                            >
                                {isAnalyzingContract ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                                Lancer l&apos;audit de conformité
                            </button>
                            {contractError && <span className="text-xs text-red-400">{contractError}</span>}
                        </div>
                    </div>

                    {/* Résultats de l'analyse */}
                    <div className="bg-card/40 border border-border rounded-2xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-primary" />
                            Rapport d&apos;audit de conformité OHADA
                        </h2>

                        {!contractResult ? (
                            <div className="h-64 flex flex-col items-center justify-center text-center text-muted-foreground text-xs p-6 border border-dashed border-border rounded-xl">
                                <FileText className="w-8 h-8 mb-2 opacity-50" />
                                <span>Aucun contrat audité pour le moment. Collez un texte à gauche pour lancer l&apos;analyse.</span>
                            </div>
                        ) : (
                            <div className="space-y-4 text-xs">
                                <div className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-xl">
                                    <div>
                                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Score de conformité</span>
                                        <span className="text-lg font-bold text-foreground">{contractResult.scoreConformite} / 100</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="px-2 py-1 bg-red-950/60 text-red-300 border border-red-800 rounded text-[10px] font-bold">
                                            {contractResult.risquesParGravite.CRITIQUE} Critique(s)
                                        </span>
                                        <span className="px-2 py-1 bg-amber-950/60 text-amber-300 border border-amber-800 rounded text-[10px] font-bold">
                                            {contractResult.risquesParGravite.ELEVE} Élevé(s)
                                        </span>
                                    </div>
                                </div>

                                <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-foreground font-medium">
                                    {contractResult.recommandationGlobale}
                                </div>

                                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                                    {contractResult.risques.map((r: RisqueContractuel) => (
                                        <div key={r.code} className="p-3 rounded-lg border border-border bg-background space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-foreground">{r.risque}</span>
                                                <span className="font-mono text-[10px] text-primary">{r.article}</span>
                                            </div>
                                            {r.clauseIdentifiee && (
                                                <p className="text-[11px] text-muted-foreground italic bg-muted/40 p-1.5 rounded">
                                                    Extrait : « {r.clauseIdentifiee} »
                                                </p>
                                            )}
                                            <p className="text-foreground/90">{r.recommandation}</p>
                                        </div>
                                    ))}
                                </div>

                                <p className="text-[10px] text-muted-foreground italic pt-2 border-t border-border">
                                    {contractResult.disclaimer}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 3: CONSULTATION FISCALE */}
            {activeTab === "consultation" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-card/40 border border-border rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                Paramètres de la Consultation
                            </h2>
                            <select
                                value={paysConsultation}
                                onChange={(e) => setPaysConsultation(e.target.value as PaysFiscal)}
                                className="bg-background border border-border rounded-lg px-2 py-1 text-xs"
                            >
                                <option value="sn">Sénégal (SN)</option>
                                <option value="ci">Côte d&apos;Ivoire (CI)</option>
                                <option value="cm">Cameroun (CM)</option>
                                <option value="bj">Bénin (BJ)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs text-muted-foreground mb-1 font-medium">Sujet de la consultation</label>
                            <input
                                type="text"
                                value={sujetConsultation}
                                onChange={(e) => setSujetConsultation(e.target.value)}
                                placeholder="Ex: Régime fiscal des flux intragroupes et retenues BRS"
                                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-muted-foreground mb-1 font-medium">Contexte opérationnel du dossier</label>
                            <textarea
                                rows={8}
                                value={contexteConsultation}
                                onChange={(e) => setContexteConsultation(e.target.value)}
                                placeholder="Détaillez les flux, montants, parties prenantes et questions précises du client..."
                                className="w-full bg-background border border-border rounded-xl p-3 text-xs"
                            />
                        </div>

                        <button
                            onClick={handleGenerateConsultation}
                            disabled={isGeneratingConsultation || !sujetConsultation.trim()}
                            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-xl text-xs hover:bg-primary/90 disabled:opacity-50"
                        >
                            {isGeneratingConsultation ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                            Générer la consultation professionnelle
                        </button>
                    </div>

                    <div className="bg-card/40 border border-border rounded-2xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold flex items-center gap-2">
                            <Scale className="w-4 h-4 text-primary" />
                            Mémo de Consultation Rédigé
                        </h2>

                        {!consultationResult ? (
                            <div className="h-64 flex flex-col items-center justify-center text-center text-muted-foreground text-xs p-6 border border-dashed border-border rounded-xl">
                                <BookOpen className="w-8 h-8 mb-2 opacity-50" />
                                <span>Remplissez les détails à gauche pour générer un mémo juridique & fiscal documenté.</span>
                            </div>
                        ) : (
                            <div className="bg-background border border-border rounded-xl p-4 text-xs font-sans whitespace-pre-wrap leading-relaxed max-h-[30rem] overflow-y-auto">
                                {consultationResult}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
