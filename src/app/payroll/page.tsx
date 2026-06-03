"use client";

import { useState, useEffect } from "react";
import { 
  Calculator, Users, Mic, Play, CheckCircle2, AlertTriangle, 
  Send, Loader2, Smartphone, FileText, ChevronRight, Building2,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PayrollDashboard() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  
  // Simulation de la voix
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  
  // Variables extraites
  const [variables, setVariables] = useState<any[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    fetch("/api/clients")
      .then(res => res.json())
      .then(data => {
        if (data.clients) setClients(data.clients);
      });
  }, []);

  const handleProcessVoice = async () => {
    if (!selectedClient || !voiceTranscript) return;
    setIsProcessingVoice(true);
    
    try {
      const res = await fetch("/api/payroll/process-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient,
          transcript: voiceTranscript
        })
      });
      const data = await res.json();
      if (data.success) {
        setVariables(data.variables);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const handleVariableChange = (empId: string, field: string, value: number) => {
    if (!variables) return;
    setVariables(variables.map(v => 
      v.employeeId === empId ? { ...v, [field]: value } : v
    ));
  };

  const calculateNet = (base: number, abs: number, over: number, bonus: number) => {
    const dailyRate = base / 30;
    const hourlyRate = (base / 173.33) * 1.15; // +15% overtime
    return Math.round(base - (abs * dailyRate) + (over * hourlyRate) + bonus);
  };

  const totalPayroll = variables ? variables.reduce((acc, v) => acc + calculateNet(v.baseSalary, v.absencesDays, v.overtimeHours, v.bonuses), 0) : 0;

  const handlePay = async () => {
    setIsGenerating(true);
    // Simuler le traitement de la paie et le push vers Mobile Money + Portail
    await new Promise(r => setTimeout(r, 2000));
    setIsGenerating(false);
    setIsPaid(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-600/10 border border-blue-500/20 flex items-center justify-center shadow-xl shadow-blue-500/10">
          <Calculator className="w-8 h-8 text-blue-400" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Paie & Social IA</h2>
          <p className="text-slate-400 mt-1">Générez la paie sans saisie à partir d'un simple message vocal du client (Pointage IA).</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Colonne Gauche : Sélection et Pointage */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-6 space-y-4">
            <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs">1</span> 
              Sélectionner la PMI
            </h3>
            
            <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar">
              {clients.map(client => {
                const isSelected = selectedClient === client.id;
                const name = client.companyName || `${client.firstName} ${client.lastName}`;
                return (
                  <div 
                    key={client.id}
                    onClick={() => { setSelectedClient(client.id); setVariables(null); setIsPaid(false); }}
                    className={cn(
                      "cursor-pointer p-4 rounded-2xl border transition-all flex items-center gap-3",
                      isSelected ? "bg-blue-600/10 border-blue-500" : "bg-slate-800/30 border-transparent hover:bg-slate-800/50"
                    )}
                  >
                    <Building2 className={cn("w-5 h-5", isSelected ? "text-blue-400" : "text-slate-500")} />
                    <p className={cn("font-bold truncate text-sm flex-1", isSelected ? "text-blue-400" : "text-white")}>{name}</p>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                  </div>
                )
              })}
            </div>
          </div>

          <div className={cn(
            "bg-slate-900/40 border rounded-[28px] p-6 space-y-4 transition-all duration-500",
            selectedClient ? "border-blue-500/20 shadow-lg shadow-blue-500/5" : "border-white/5 opacity-50 pointer-events-none"
          )}>
            <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs">2</span> 
              Pointage Vocal (WhatsApp)
            </h3>
            <p className="text-xs text-slate-400">Simulez ici le message vocal ou texte envoyé par le gérant.</p>
            
            <div className="relative">
              <textarea 
                value={voiceTranscript}
                onChange={(e) => setVoiceTranscript(e.target.value)}
                placeholder="Ex: Moussa a été malade 2 jours, Fatou a fait 5 heures supplémentaires et a eu une prime de 50000..."
                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-4 text-sm text-white resize-none h-32 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <div className="absolute right-3 bottom-3 flex gap-2">
                <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 transition-colors">
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button 
              onClick={handleProcessVoice}
              disabled={!voiceTranscript || isProcessingVoice}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessingVoice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Analyser via LLM
            </button>
          </div>
        </div>

        {/* Colonne Droite : Variables et Paiement */}
        <div className="lg:col-span-8 space-y-6">
          <div className={cn(
            "bg-slate-900/40 border rounded-[28px] p-8 transition-all duration-500",
            variables ? "border-blue-500/20 shadow-2xl shadow-blue-500/5" : "border-white/5 opacity-50 pointer-events-none"
          )}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs">3</span> 
                Validation & Paiement
              </h3>
              {variables && (
                <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> IA : {variables.length} employés traités
                </div>
              )}
            </div>

            {variables ? (
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <th className="pb-3 px-2">Employé</th>
                        <th className="pb-3 px-2 text-right">Salaire Base</th>
                        <th className="pb-3 px-2 text-center text-rose-400">Jours Abs</th>
                        <th className="pb-3 px-2 text-center text-indigo-400">Heures Sup</th>
                        <th className="pb-3 px-2 text-right text-emerald-400">Primes</th>
                        <th className="pb-3 px-2 text-right">Net à payer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {variables.map(v => (
                        <tr key={v.employeeId} className="group hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 px-2 font-bold text-white text-sm flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-500" />
                            {v.employeeName}
                          </td>
                          <td className="py-4 px-2 text-right text-slate-400 text-sm tabular-nums">
                            {v.baseSalary.toLocaleString()} F
                          </td>
                          <td className="py-4 px-2 text-center">
                            <input 
                              type="number" 
                              value={v.absencesDays}
                              onChange={(e) => handleVariableChange(v.employeeId, 'absencesDays', parseInt(e.target.value) || 0)}
                              className={cn(
                                "w-16 bg-slate-950/50 border rounded-lg px-2 py-1 text-center text-sm font-mono focus:outline-none focus:border-blue-500",
                                v.absencesDays > 0 ? "border-rose-500/50 text-rose-400" : "border-white/10 text-white"
                              )}
                            />
                          </td>
                          <td className="py-4 px-2 text-center">
                            <input 
                              type="number" 
                              value={v.overtimeHours}
                              onChange={(e) => handleVariableChange(v.employeeId, 'overtimeHours', parseInt(e.target.value) || 0)}
                              className={cn(
                                "w-16 bg-slate-950/50 border rounded-lg px-2 py-1 text-center text-sm font-mono focus:outline-none focus:border-blue-500",
                                v.overtimeHours > 0 ? "border-indigo-500/50 text-indigo-400" : "border-white/10 text-white"
                              )}
                            />
                          </td>
                          <td className="py-4 px-2 text-right">
                            <input 
                              type="number" 
                              value={v.bonuses}
                              onChange={(e) => handleVariableChange(v.employeeId, 'bonuses', parseInt(e.target.value) || 0)}
                              className={cn(
                                "w-24 bg-slate-950/50 border rounded-lg px-2 py-1 text-right text-sm font-mono focus:outline-none focus:border-blue-500",
                                v.bonuses > 0 ? "border-emerald-500/50 text-emerald-400" : "border-white/10 text-white"
                              )}
                            />
                          </td>
                          <td className="py-4 px-2 text-right font-black text-blue-400 text-sm tabular-nums">
                            {calculateNet(v.baseSalary, v.absencesDays, v.overtimeHours, v.bonuses).toLocaleString()} F
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Total Masse Salariale Nette</p>
                    <p className="text-3xl font-black text-white tabular-nums">{totalPayroll.toLocaleString()} FCFA</p>
                  </div>
                  
                  {!isPaid ? (
                    <button 
                      onClick={handlePay}
                      disabled={isGenerating}
                      className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3"
                    >
                      {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Smartphone className="w-5 h-5" />}
                      Payer via Wave / Orange Money
                    </button>
                  ) : (
                    <div className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col items-end">
                      <span className="text-emerald-400 font-black text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" /> Salaires virés avec succès
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">Bulletins envoyés sur le portail et WhatsApp.</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 opacity-50">
                <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400 text-sm">Sélectionnez un client et simulez un pointage vocal pour voir la grille.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
