"use client";

import React from 'react';
import { FolderPlus, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';

export default function EntreprenantPage() {
    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <header className="flex flex-col gap-2 border-b border-border/50 pb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
                        <FolderPlus className="w-6 h-6" />
                    </div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">Statut de l'Entreprenant OHADA</h1>
                </div>
                <p className="text-muted-foreground">Accompagnez les acteurs de l'informel vers la formalisation en 3 étapes simples.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { step: "1", title: "Identification", desc: "Recueil des pièces d'identité et description de l'activité.", active: true, done: true },
                    { step: "2", title: "Dossier RCCM", desc: "Génération automatique des formulaires pour le greffe.", active: true, done: false },
                    { step: "3", title: "Immatriculation", desc: "Réception du numéro NINEA/RCCM et déclaration d'existence fiscale.", active: false, done: false }
                ].map((s, i) => (
                    <div key={i} className={`glass-card p-6 rounded-3xl border relative overflow-hidden transition-all ${s.active ? (s.done ? 'border-emerald-500/50' : 'border-indigo-500/50 ring-2 ring-indigo-500/20') : 'border-border/30 opacity-60'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${s.done ? 'bg-emerald-500 text-white' : s.active ? 'bg-indigo-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                                {s.done ? <CheckCircle2 className="w-5 h-5" /> : s.step}
                            </div>
                        </div>
                        <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                        <p className="text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                ))}
            </div>

            <div className="glass-card rounded-3xl p-8 border border-border/50">
                <h2 className="text-xl font-bold mb-6">Nouveau Dossier Client</h2>
                <div className="space-y-4 max-w-lg">
                    <div>
                        <label className="text-sm font-bold text-muted-foreground mb-1 block">Nom ou Dénomination Commerciale</label>
                        <input type="text" className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="Ex: Chez Fatou Restauration" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-muted-foreground mb-1 block">Activité Principale</label>
                        <input type="text" className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="Commerce de détail" />
                    </div>
                    <button className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 font-bold mt-6 transition-colors">
                        Générer la Déclaration <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
