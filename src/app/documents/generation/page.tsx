"use client";

import { useState, useEffect } from "react";
import { 
  FileCheck, 
  FileSpreadsheet, 
  Receipt, 
  PieChart, 
  Landmark, 
  ChevronRight, 
  Building2, 
  CheckCircle2,
  RefreshCw,
  Eye,
  Send,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface Client {
  id: string;
  companyName: string;
  firstName: string;
  lastName: string;
  rccm: string;
}

const DOCUMENT_TYPES = [
  { 
    id: "etats-financiers", 
    icon: FileSpreadsheet, 
    title: "États Financiers (SYSCOHADA)", 
    desc: "Bilan et Compte de Résultat générés à partir de l'imputation IA.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20"
  },
  { 
    id: "declaration-fiscale", 
    icon: Receipt, 
    title: "Déclaration Fiscale (TVA)", 
    desc: "Bordereau mensuel pré-rempli prêt pour les impôts.",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20"
  },
  { 
    id: "plaquette-sante", 
    icon: PieChart, 
    title: "Plaquette Santé (Data Storytelling)", 
    desc: "Rapport graphique avec commentaires IA pour le dirigeant.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20"
  },
  { 
    id: "dossier-credit", 
    icon: Landmark, 
    title: "Dossier Solvabilité Bancaire", 
    desc: "Package certifié par l'Expert pour demande de financement.",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20"
  }
];

export default function DocumentGenerationCenter() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocUrl, setGeneratedDocUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/clients")
      .then(res => res.json())
      .then(data => {
        if (data.clients) setClients(data.clients);
      });
  }, []);

  const handleGenerate = async () => {
    if (!selectedClient || !selectedDocType) return;
    
    setIsGenerating(true);
    setGeneratedDocUrl(null);

    try {
      const res = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient,
          docType: selectedDocType
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setGeneratedDocUrl(data.document.fileUrl);
      }
    } catch (error) {
      console.error("Erreur de génération", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-600/10 border border-indigo-500/20 flex items-center justify-center shadow-xl shadow-indigo-500/10">
          <FileCheck className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Générateur de Livrables</h2>
          <p className="text-slate-400 mt-1">Générez et propulsez instantanément les documents certifiés vers le portail de la PMI.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Étape 1 : Sélection Client (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs">1</span> 
            Sélectionner la PMI
          </h3>
          
          <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-4 max-h-[500px] overflow-y-auto custom-scrollbar space-y-2">
            {clients.map(client => {
              const isSelected = selectedClient === client.id;
              const name = client.companyName || `${client.firstName} ${client.lastName}`;
              return (
                <div 
                  key={client.id}
                  onClick={() => setSelectedClient(client.id)}
                  className={cn(
                    "cursor-pointer p-4 rounded-2xl border transition-all flex items-center gap-3",
                    isSelected 
                      ? "bg-indigo-600/10 border-indigo-500" 
                      : "bg-slate-800/30 border-transparent hover:bg-slate-800/50"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                    isSelected ? "bg-indigo-600" : "bg-slate-700"
                  )}>
                    <Building2 className={cn("w-5 h-5", isSelected ? "text-white" : "text-slate-400")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-bold truncate text-sm", isSelected ? "text-indigo-400" : "text-white")}>{name}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{client.rccm || "RCCM NON DEFINI"}</p>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-500" />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Étape 2 : Type de Document (Col 8) */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs">2</span> 
            Type de livrable
          </h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {DOCUMENT_TYPES.map(doc => {
              const isSelected = selectedDocType === doc.id;
              const Icon = doc.icon;
              return (
                <div 
                  key={doc.id}
                  onClick={() => setSelectedDocType(doc.id)}
                  className={cn(
                    "cursor-pointer p-6 rounded-[28px] border-2 transition-all flex flex-col h-full",
                    isSelected ? "bg-slate-800/80 border-white/20 shadow-xl" : "bg-slate-900/40 border-transparent hover:bg-slate-800/50"
                  )}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border", doc.bg)}>
                      <Icon className={cn("w-6 h-6", doc.color)} />
                    </div>
                    {isSelected && (
                      <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase rounded-lg border border-indigo-500/20">
                        Sélectionné
                      </span>
                    )}
                  </div>
                  <h4 className="font-black text-white text-base mb-2">{doc.title}</h4>
                  <p className="text-xs text-slate-400 mt-auto">{doc.desc}</p>
                </div>
              )
            })}
          </div>

          {/* Étape 3 : Actions */}
          <div className={cn(
            "mt-8 p-6 rounded-[28px] border transition-all duration-500 flex flex-col sm:flex-row items-center justify-between gap-6",
            selectedClient && selectedDocType 
              ? "bg-indigo-900/20 border-indigo-500/30 shadow-2xl shadow-indigo-500/10" 
              : "bg-slate-900/40 border-white/5 opacity-50 pointer-events-none"
          )}>
            <div>
              <h4 className="font-black text-white">Prêt à générer</h4>
              <p className="text-xs text-slate-400 mt-1">Le document sera compilé, horodaté et poussé sur le portail de la PMI.</p>
            </div>
            
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !selectedClient || !selectedDocType}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
              Lancer la génération
            </button>
          </div>

          {/* Résultat */}
          {generatedDocUrl && (
            <div className="mt-6 p-8 bg-emerald-950/30 border border-emerald-500/30 rounded-[28px] animate-in slide-in-from-bottom-4 duration-500 text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Document Généré avec Succès !</h3>
                <p className="text-slate-400 text-sm mt-2">
                  Il a été automatiquement publié sur le portail privé du client.
                </p>
              </div>
              <div className="flex justify-center gap-4">
                <a 
                  href={generatedDocUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" /> Prévisualiser
                </a>
                <button className="px-6 py-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold text-xs transition-colors flex items-center gap-2">
                  <Send className="w-4 h-4" /> Notifier par WhatsApp
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
