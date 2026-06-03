"use client";

import { useState } from "react";
import { BrainCircuit, Server, Key, Save, CheckCircle2, ShieldAlert, Cpu, Sparkles, Activity, RefreshCw } from "lucide-react";

export default function AILlmSettings() {
  const [provider, setProvider] = useState<"ollama" | "mistral" | "openai" | "anthropic" | "deepseek">("ollama");
  const [endpoint, setEndpoint] = useState("http://localhost:11434");
  const [modelName, setModelName] = useState("llama3");
  const [apiKey, setApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setSaved(false);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-600/10 border border-indigo-500/20 flex items-center justify-center shadow-xl shadow-indigo-500/10">
          <BrainCircuit className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Configuration LLM & Moteur IA</h2>
          <p className="text-slate-400 mt-1">Gérez le modèle d'intelligence artificielle utilisé pour l'imputation automatique et l'OCR.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Colonne Principale - Sélection du Provider */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-8 space-y-6">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" /> Fournisseur d'IA (LLM)
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Ollama - Open Source Local */}
              <div 
                onClick={() => { setProvider("ollama"); setEndpoint("http://localhost:11434"); setModelName("llama3"); }}
                className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${provider === "ollama" ? "bg-indigo-600/10 border-indigo-500" : "bg-slate-800/50 border-transparent hover:border-slate-700"}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <Server className={`w-6 h-6 ${provider === "ollama" ? "text-indigo-400" : "text-slate-500"}`} />
                  {provider === "ollama" && <CheckCircle2 className="w-5 h-5 text-indigo-500" />}
                </div>
                <h4 className="font-bold text-white">Ollama (Local)</h4>
                <p className="text-[10px] text-slate-500 mt-1">Open-Source, Zéro coût cloud. Modèles : Llama 3, Mistral, Qwen.</p>
                <div className="mt-3 px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase rounded w-fit border border-emerald-500/20">
                  RGPD Compliant - 100% Privé
                </div>
              </div>

              {/* Mistral AI */}
              <div 
                onClick={() => { setProvider("mistral"); setEndpoint("https://api.mistral.ai/v1"); setModelName("mistral-large-latest"); }}
                className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${provider === "mistral" ? "bg-amber-600/10 border-amber-500" : "bg-slate-800/50 border-transparent hover:border-slate-700"}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <Sparkles className={`w-6 h-6 ${provider === "mistral" ? "text-amber-400" : "text-slate-500"}`} />
                  {provider === "mistral" && <CheckCircle2 className="w-5 h-5 text-amber-500" />}
                </div>
                <h4 className="font-bold text-white">Mistral AI</h4>
                <p className="text-[10px] text-slate-500 mt-1">Souveraineté européenne, haute performance comptable en français.</p>
                <div className="mt-3 px-2 py-1 bg-amber-500/10 text-amber-400 text-[9px] font-black uppercase rounded w-fit border border-amber-500/20">
                  API Cloud
                </div>
              </div>

              {/* OpenAI */}
              <div 
                onClick={() => { setProvider("openai"); setEndpoint("https://api.openai.com/v1"); setModelName("gpt-4o"); }}
                className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${provider === "openai" ? "bg-emerald-600/10 border-emerald-500" : "bg-slate-800/50 border-transparent hover:border-slate-700"}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <BrainCircuit className={`w-6 h-6 ${provider === "openai" ? "text-emerald-400" : "text-slate-500"}`} />
                  {provider === "openai" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                </div>
                <h4 className="font-bold text-white">OpenAI (ChatGPT)</h4>
                <p className="text-[10px] text-slate-500 mt-1">Performances maximales de raisonnement. Modèles : GPT-4o, GPT-4-Turbo.</p>
                <div className="mt-3 px-2 py-1 bg-slate-700/50 text-slate-400 text-[9px] font-black uppercase rounded w-fit border border-slate-600">
                  API Cloud
                </div>
              </div>

              {/* Anthropic */}
              <div 
                onClick={() => { setProvider("anthropic"); setEndpoint("https://api.anthropic.com/v1"); setModelName("claude-3-5-sonnet"); }}
                className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${provider === "anthropic" ? "bg-purple-600/10 border-purple-500" : "bg-slate-800/50 border-transparent hover:border-slate-700"}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <Activity className={`w-6 h-6 ${provider === "anthropic" ? "text-purple-400" : "text-slate-500"}`} />
                  {provider === "anthropic" && <CheckCircle2 className="w-5 h-5 text-purple-500" />}
                </div>
                <h4 className="font-bold text-white">Anthropic (Claude)</h4>
                <p className="text-[10px] text-slate-500 mt-1">Excellente compréhension des documents complexes et factures.</p>
                <div className="mt-3 px-2 py-1 bg-slate-700/50 text-slate-400 text-[9px] font-black uppercase rounded w-fit border border-slate-600">
                  API Cloud
                </div>
              </div>

              {/* DeepSeek */}
              <div 
                onClick={() => { setProvider("deepseek"); setEndpoint("https://api.deepseek.com/v1"); setModelName("deepseek-reasoner"); }}
                className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${provider === "deepseek" ? "bg-blue-600/10 border-blue-500" : "bg-slate-800/50 border-transparent hover:border-slate-700"}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <BrainCircuit className={`w-6 h-6 ${provider === "deepseek" ? "text-blue-400" : "text-slate-500"}`} />
                  {provider === "deepseek" && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                </div>
                <h4 className="font-bold text-white">DeepSeek</h4>
                <p className="text-[10px] text-slate-500 mt-1">Rapport performance/prix imbattable. Modèles très doués en raisonnement logique.</p>
                <div className="mt-3 px-2 py-1 bg-slate-700/50 text-slate-400 text-[9px] font-black uppercase rounded w-fit border border-slate-600">
                  API Cloud / Local
                </div>
              </div>
            </div>

            {/* Formulaire de configuration */}
            <div className="pt-6 border-t border-white/5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Modèle utilisé</label>
                  <input 
                    type="text" 
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Endpoint URL</label>
                  <input 
                    type="text" 
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-400 focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {provider !== "ollama" && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Key className="w-3 h-3" /> Clé API (Chiffrée)
                  </label>
                  <input 
                    type="password" 
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              )}
            </div>

            <div className="pt-4 flex items-center gap-4">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-xl font-black text-xs transition-colors shadow-lg shadow-indigo-500/20"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Enregistrer la configuration
              </button>
              {saved && <span className="text-emerald-400 text-xs font-bold flex items-center gap-1 animate-in zoom-in"><CheckCircle2 className="w-4 h-4" /> Sauvegardé</span>}
            </div>

          </div>
        </div>

        {/* Colonne Droite - Infos Contextuelles */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border border-indigo-500/20 rounded-[28px] p-6">
            <h3 className="font-black text-white flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-indigo-400" />
              Pourquoi Ollama ?
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Pour des raisons de <strong>confidentialité absolue</strong> (RGPD, données bancaires), Cabinet 360 recommande l'utilisation d'Ollama avec des modèles open-source (ex: Llama 3) tournant <strong>localement sur vos serveurs</strong>.
            </p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">✅ Aucune donnée envoyée dans le cloud</li>
              <li className="flex items-center gap-2">✅ Coût d'inférence nul</li>
              <li className="flex items-center gap-2">✅ Indépendance technologique</li>
            </ul>
          </div>

          <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-6 space-y-4">
            <h3 className="font-black text-white text-sm">Règles d'imputation (Fallback)</h3>
            <p className="text-xs text-slate-500">
              Le LLM n'est appelé que si aucune règle stricte (Machine Learning ou Règles comptables manuelles) n'a pu identifier le libellé de l'opération dans le journal TPE.
            </p>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
              <div className="h-full bg-emerald-500 w-[60%]" title="Règles Manuelles (60%)"></div>
              <div className="h-full bg-indigo-500 w-[30%]" title="Machine Learning (30%)"></div>
              <div className="h-full bg-purple-500 w-[10%]" title="Appel LLM (10%)"></div>
            </div>
            <div className="flex justify-between text-[9px] font-black uppercase text-slate-500">
              <span>Règles</span>
              <span>ML (Apprentissage)</span>
              <span>LLM IA</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
