"use client";

import { useState, useEffect } from "react";
import { 
  Calculator, Users, Mic, Play, CheckCircle2, AlertTriangle, 
  Send, Loader2, Smartphone, FileText, ChevronRight, Building2,
  RefreshCw, Globe
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
  const [countryCode, setCountryCode] = useState<string>("SN");
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
        setCountryCode(data.country || "SN");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const totalPayroll = variables ? variables.reduce((acc, v) => acc + v.netSalary, 0) : 0;
  const totalTaxes = variables ? variables.reduce((acc, v) => acc + v.taxes, 0) : 0;
  const totalSocial = variables ? variables.reduce((acc, v) => acc + v.socialSecurity + v.employerContributions, 0) : 0;

  const handlePay = async () => {
    setIsGenerating(true);
    // Simuler le traitement de la paie et le push vers Mobile Money + Portail
    await new Promise(r => setTimeout(r, 2000));
    setIsGenerating(false);
    setIsPaid(true);
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-600/10 border border-blue-500/20 flex items-center justify-center shadow-xl shadow-blue-500/10">
          <Calculator className="w-8 h-8 text-blue-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-black text-white tracking-tight">Paie & Social IA Multi-Pays</h2>
          <p className="text-slate-400 mt-1">Générez la paie sans saisie. Le moteur fiscal s'adapte automatiquement au pays du client (Sénégal, CI, etc.).</p>
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
                    <div className="flex-1 min-w-0">
                      <p className={cn("font-bold truncate text-sm flex-1", isSelected ? "text-blue-400" : "text-white")}>{name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{client.country === 'SN' ? 'Sénégal 🇸🇳' : client.country}</p>
                    </div>
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
              Pointage Vocal IA
            </h3>
            <p className="text-xs text-slate-400">Dictez les absences, heures supplémentaires ou primes exceptionnelles.</p>
            
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
              Lancer le Moteur {countryCode && `(${countryCode})`}
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
              <div>
                <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs">3</span> 
                  Bulletin de Paie & Déclarations
                </h3>
                <p className="text-xs text-slate-400 mt-1 ml-8">Calculé selon la législation de : <span className="font-bold text-white">{countryCode === 'SN' ? 'Sénégal 🇸🇳 (Barème IR, TRIMF, IPRES, CSS)' : countryCode}</span></p>
              </div>
              {variables && (
                <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {variables.length} employés traités
                </div>
              )}
            </div>

            {variables ? (
              <div className="space-y-6">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-800/30">
                        <th className="p-3 rounded-tl-xl">Employé</th>
                        <th className="p-3 text-right">Base</th>
                        <th className="p-3 text-center text-rose-400">Absences</th>
                        <th className="p-3 text-center text-indigo-400">HS</th>
                        <th className="p-3 text-right text-emerald-400">Primes</th>
                        <th className="p-3 text-right text-orange-400 border-l border-white/5">Impôts (IR)</th>
                        <th className="p-3 text-right text-purple-400">Cotis. (Sal)</th>
                        <th className="p-3 text-right text-blue-400 border-l border-white/5 rounded-tr-xl">Net à payer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {variables.map(v => (
                        <tr key={v.employeeId} className="group hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-slate-500" />
                              <div>
                                <p className="font-bold text-white text-sm">{v.employeeName}</p>
                                <p className="text-[9px] text-slate-500 uppercase tracking-widest">{v.maritalStatus} · {v.childrenCount} Enf. {v.isCadre && "· CADRE"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right text-slate-400 text-sm tabular-nums">
                            {v.baseSalary.toLocaleString()} F
                          </td>
                          <td className="py-3 px-3 text-center text-rose-400 font-mono text-sm">
                            {v.absencesDays} j
                          </td>
                          <td className="py-3 px-3 text-center text-indigo-400 font-mono text-sm">
                            {v.overtimeHours} h
                          </td>
                          <td className="py-3 px-3 text-right text-emerald-400 font-mono text-sm">
                            {v.bonuses > 0 ? `+${v.bonuses.toLocaleString()}` : "-"}
                          </td>
                          <td className="py-3 px-3 text-right text-orange-400/80 font-mono text-xs tabular-nums border-l border-white/5 bg-orange-500/5">
                            -{v.taxes.toLocaleString()} F
                          </td>
                          <td className="py-3 px-3 text-right text-purple-400/80 font-mono text-xs tabular-nums bg-purple-500/5">
                            -{v.socialSecurity.toLocaleString()} F
                          </td>
                          <td className="py-3 px-3 text-right font-black text-blue-400 text-sm tabular-nums border-l border-white/5 bg-blue-500/5">
                            {v.netSalary.toLocaleString()} F
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                  <div className="p-4 bg-slate-800/30 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Net</p>
                    <p className="text-2xl font-black text-blue-400 tabular-nums">{totalPayroll.toLocaleString()} F</p>
                  </div>
                  <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                    <p className="text-[10px] text-orange-500/70 font-bold uppercase tracking-widest">Impôts Dus (IR/TRIMF)</p>
                    <p className="text-2xl font-black text-orange-400 tabular-nums">{totalTaxes.toLocaleString()} F</p>
                  </div>
                  <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                    <p className="text-[10px] text-purple-500/70 font-bold uppercase tracking-widest">Charges Sociales (Sal+Pat)</p>
                    <p className="text-2xl font-black text-purple-400 tabular-nums">{totalSocial.toLocaleString()} F</p>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-6">
                  {!isPaid ? (
                    <button 
                      onClick={handlePay}
                      disabled={isGenerating}
                      className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
                    >
                      {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Smartphone className="w-5 h-5" />}
                      Valider la Paie & Virement Mobile Money
                    </button>
                  ) : (
                    <div className="w-full px-6 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3 text-emerald-400">
                        <CheckCircle2 className="w-6 h-6" />
                        <div>
                          <p className="font-black text-sm">Salaires virés et bordereaux générés</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 text-white/70">Les fiches de paie et déclarations IPRES/CSS/Impôts ont été poussées sur le portail.</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold border border-white/5 transition-colors">
                        Voir les déclarations
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 opacity-50">
                <Globe className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400 text-sm">Le moteur chargera les règles du pays correspondant.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
