"use client";

import { useState } from "react";
import { FileText, Building2, User, Calendar, ChevronLeft, Send, Sparkles, CheckCircle2, Briefcase, Scale } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const MISSION_TYPES = [
  { value: "AUDIT", label: "Audit Légal", icon: Scale },
  { value: "EXPERTISE", label: "Expertise Comptable", icon: FileText },
  { value: "CONSEIL", label: "Conseil Fiscal", icon: Sparkles },
  { value: "PAIE", label: "Gestion de la Paie", icon: User },
  { value: "JURIDIQUE", label: "Secrétariat Juridique", icon: Briefcase },
];

export default function NewLettreMissionPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    clientName: "",
    missionType: "EXPERTISE",
    startDate: "",
    endDate: "",
    honoraires: "",
    periodicite: "MENSUEL",
    description: "",
    signataire: "",
  });
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setGenerated(true);
    setStep(3);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/lettres-mission" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors border border-white/5">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">Nouvelle Lettre de Mission</h2>
          <p className="text-slate-400 text-sm mt-1">Générez une lettre conforme aux normes OHADA en quelques clics</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 p-4 bg-slate-900/40 rounded-2xl border border-white/5">
        {[
          { n: 1, label: "Informations" },
          { n: 2, label: "Honoraires" },
          { n: 3, label: "Génération" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2 flex-1">
            <button
              onClick={() => setStep(s.n)}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all",
                step >= s.n ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-500"
              )}
            >
              {step > s.n ? <CheckCircle2 className="w-4 h-4" /> : s.n}
            </button>
            <span className={cn("text-xs font-bold hidden sm:block", step >= s.n ? "text-white" : "text-slate-500")}>{s.label}</span>
            {i < 2 && <div className={cn("flex-1 h-px", step > s.n ? "bg-indigo-600" : "bg-slate-800")} />}
          </div>
        ))}
      </div>

      {/* Step 1: Informations */}
      {step === 1 && (
        <div className="glass-card p-4 sm:p-8 rounded-[32px] border border-white/5 bg-slate-900/20 space-y-6">
          <h3 className="text-lg font-black text-white flex items-center gap-3"><Building2 className="w-5 h-5 text-indigo-400" /> Informations Client & Mission</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nom du Client / Entreprise *</label>
              <input
                type="text"
                value={form.clientName}
                onChange={e => setForm({ ...form, clientName: e.target.value })}
                placeholder="SONELEC SA, Moussa Diallo..."
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Signataire (Expert) *</label>
              <input
                type="text"
                value={form.signataire}
                onChange={e => setForm({ ...form, signataire: e.target.value })}
                placeholder="M. Jean Kouassi, Expert-Comptable"
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Type de Mission *</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {MISSION_TYPES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setForm({ ...form, missionType: value })}
                  className={cn(
                    "p-3 rounded-xl border flex flex-col items-center gap-2 transition-all text-center",
                    form.missionType === value
                      ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-400"
                      : "bg-slate-800/30 border-white/5 text-slate-500 hover:border-white/10 hover:text-white"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Date de début</label>
              <input
                type="date"
                value={form.startDate}
                onChange={e => setForm({ ...form, startDate: e.target.value })}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Date de fin (optionnel)</label>
              <input
                type="date"
                value={form.endDate}
                onChange={e => setForm({ ...form, endDate: e.target.value })}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!form.clientName || !form.signataire}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Honoraires */}
      {step === 2 && (
        <div className="glass-card p-4 sm:p-8 rounded-[32px] border border-white/5 bg-slate-900/20 space-y-6">
          <h3 className="text-lg font-black text-white flex items-center gap-3"><Calendar className="w-5 h-5 text-emerald-400" /> Honoraires & Périodicité</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Montant des Honoraires (FCFA) *</label>
              <input
                type="number"
                value={form.honoraires}
                onChange={e => setForm({ ...form, honoraires: e.target.value })}
                placeholder="150000"
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Périodicité *</label>
              <select
                value={form.periodicite}
                onChange={e => setForm({ ...form, periodicite: e.target.value })}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="MENSUEL">Mensuel</option>
                <option value="TRIMESTRIEL">Trimestriel</option>
                <option value="SEMESTRIEL">Semestriel</option>
                <option value="ANNUEL">Annuel</option>
                <option value="FORFAIT">Forfait unique</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description des prestations</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="Tenue de comptabilité, établissement des déclarations fiscales mensuelles (TVA, IS), établissement des bulletins de paie..."
              className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          {/* Aperçu montant */}
          {form.honoraires && (
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-400 font-black uppercase tracking-widest">Total annuel estimé</p>
                <p className="text-2xl font-black text-white mt-1">
                  {(parseInt(form.honoraires) * (form.periodicite === "MENSUEL" ? 12 : form.periodicite === "TRIMESTRIEL" ? 4 : form.periodicite === "SEMESTRIEL" ? 2 : 1)).toLocaleString("fr-FR")} FCFA
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-bold uppercase">TVA (18%)</p>
                <p className="text-lg font-bold text-slate-300">
                  {(parseInt(form.honoraires) * (form.periodicite === "MENSUEL" ? 12 : form.periodicite === "TRIMESTRIEL" ? 4 : form.periodicite === "SEMESTRIEL" ? 2 : 1) * 0.18).toLocaleString("fr-FR")} FCFA
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between gap-4">
            <button onClick={() => setStep(1)} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all border border-white/5">
              ← Retour
            </button>
            <button
              onClick={handleGenerate}
              disabled={!form.honoraires}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-40 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Générer la Lettre
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Document généré */}
      {step === 3 && generated && (
        <div className="space-y-6">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <p className="text-emerald-400 font-black text-sm">Lettre de mission générée avec succès</p>
              <p className="text-slate-400 text-xs">Vérifiez le document ci-dessous avant de l'envoyer au client</p>
            </div>
          </div>

          {/* Aperçu du document */}
          <div className="glass-card p-4 sm:p-8 rounded-[32px] border border-white/5 bg-white/5">
            <div className="max-w-2xl mx-auto bg-white text-slate-900 rounded-2xl p-8 sm:p-12 shadow-2xl text-sm leading-relaxed">
              <div className="text-center border-b border-slate-200 pb-6 mb-8">
                <h1 className="text-xl font-black uppercase tracking-widest text-indigo-700">CABINET 360</h1>
                <p className="text-slate-500 text-xs mt-1">Expert-Comptable & Commissaire aux Comptes</p>
              </div>

              <div className="text-right mb-8 text-slate-600">
                <p>Dakar, le {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>

              <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide text-center mb-8 border border-slate-200 p-3 rounded">
                LETTRE DE MISSION — {MISSION_TYPES.find(m => m.value === form.missionType)?.label.toUpperCase()}
              </h2>

              <p className="mb-4">Monsieur / Madame,</p>
              <p className="mb-4">
                Nous avons l'honneur de vous confirmer les termes de notre mission d'<strong>{MISSION_TYPES.find(m => m.value === form.missionType)?.label.toLowerCase()}</strong> pour le compte de <strong>{form.clientName || "[NOM CLIENT]"}</strong>.
              </p>

              <h3 className="font-black uppercase text-xs tracking-widest text-slate-600 mt-6 mb-3">1. NATURE ET ÉTENDUE DE LA MISSION</h3>
              <p className="text-slate-700 mb-4">
                {form.description || "La mission comprend l'ensemble des diligences prévues par les normes professionnelles en vigueur au sein de la zone OHADA (SYSCOHADA Révisé)."}
              </p>

              <h3 className="font-black uppercase text-xs tracking-widest text-slate-600 mt-6 mb-3">2. HONORAIRES</h3>
              <p className="text-slate-700 mb-4">
                Nos honoraires pour cette mission sont fixés à <strong>{parseInt(form.honoraires || "0").toLocaleString("fr-FR")} FCFA HT</strong> ({form.periodicite.toLowerCase()}),
                soit <strong>{(parseInt(form.honoraires || "0") * 1.18).toLocaleString("fr-FR")} FCFA TTC</strong> (TVA 18% incluse).
              </p>

              <h3 className="font-black uppercase text-xs tracking-widest text-slate-600 mt-6 mb-3">3. DURÉE</h3>
              <p className="text-slate-700 mb-8">
                La présente mission prend effet le <strong>{form.startDate ? new Date(form.startDate).toLocaleDateString("fr-FR") : "[DATE DÉBUT]"}</strong>
                {form.endDate ? ` et se termine le ${new Date(form.endDate).toLocaleDateString("fr-FR")}` : ", pour une durée indéterminée, résiliable par l'une ou l'autre des parties avec un préavis de 3 mois"}.
              </p>

              <div className="grid grid-cols-2 gap-8 mt-12 pt-6 border-t border-slate-200">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase mb-8">Pour le Client :</p>
                  <p className="text-xs text-slate-400">Nom & Signature</p>
                  <div className="h-16 border-b border-slate-300 mt-2" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase mb-8">Pour le Cabinet :</p>
                  <p className="text-xs font-bold text-slate-700">{form.signataire || "Expert-Comptable"}</p>
                  <div className="h-16 border-b border-slate-300 mt-2" />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 justify-end">
            <button onClick={() => { setStep(1); setGenerated(false); }} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all border border-white/5">
              Modifier
            </button>
            <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2">
              <Send className="w-4 h-4" /> Envoyer au Client
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
