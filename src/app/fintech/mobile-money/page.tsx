"use client";

import React, { useState, useEffect } from 'react';
import { Smartphone, ArrowRightLeft, CheckCircle2, AlertCircle, RefreshCw, Filter, Download, Zap, Plus } from 'lucide-react';

export default function MobileMoneyPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/fintech/mobile-money');
            if (res.ok) {
                const data = await res.json();
                setTransactions(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const simulateNewTransaction = async () => {
        try {
            const ops = ['Wave', 'Orange Money', 'MTN MoMo'];
            const randomOp = ops[Math.floor(Math.random() * ops.length)];
            
            await fetch('/api/fintech/mobile-money', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    operator: randomOp,
                    amount: Math.floor(Math.random() * 500000) + 5000,
                    type: Math.random() > 0.3 ? 'IN' : 'OUT',
                    senderPhone: '+225 07 ' + Math.floor(Math.random() * 9000000 + 1000000)
                })
            });
            fetchTransactions();
        } catch (error) {
            console.error(error);
        }
    };

    const runAILettreage = async () => {
        try {
            await fetch('/api/fintech/mobile-money', { method: 'PATCH' });
            fetchTransactions();
        } catch (error) {
            console.error(error);
        }
    };

    const formatFCFA = (val: number) => new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';

    // Stats
    const totalVolume = transactions.reduce((acc, curr) => acc + curr.amount, 0);
    const reconciledCount = transactions.filter(t => t.status === 'RECONCILED').length;
    const pendingCount = transactions.filter(t => t.status === 'PENDING').length;
    const aiSuccessRate = transactions.length > 0 ? Math.round((reconciledCount / transactions.length) * 100) : 0;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight">Rapprochement Mobile Money</h1>
                    </div>
                    <p className="text-muted-foreground">Synchronisation en temps réel avec Wave, Orange Money et MTN MoMo.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={simulateNewTransaction} className="flex items-center gap-2 px-4 py-2 border border-border/50 bg-muted/20 hover:bg-muted/50 rounded-xl text-sm font-semibold transition-colors">
                        <Plus className="w-4 h-4" /> Simuler Transaction
                    </button>
                    <button onClick={fetchTransactions} className="flex items-center gap-2 px-4 py-2 glass-card rounded-xl text-sm font-semibold hover:bg-white/5 transition-colors">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualiser
                    </button>
                    <button onClick={runAILettreage} disabled={pendingCount === 0} className={`flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-bold shadow-lg transition-all ${pendingCount > 0 ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' : 'bg-muted text-muted-foreground opacity-50'}`}>
                        <Zap className="w-4 h-4" /> Rapprochement IA
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-3xl border border-emerald-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Smartphone className="w-24 h-24 text-emerald-500" />
                    </div>
                    <h3 className="text-sm font-bold text-muted-foreground mb-4">Volume Transactions MoMo</h3>
                    <p className="text-4xl font-black text-foreground">{formatFCFA(totalVolume)}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-emerald-500 font-medium">
                        <ArrowRightLeft className="w-4 h-4" /> {transactions.length} flux détectés
                    </div>
                </div>
                <div className="glass-card p-6 rounded-3xl border border-border/50 relative overflow-hidden">
                    <h3 className="text-sm font-bold text-muted-foreground mb-4">Transactions Rapprochées</h3>
                    <p className="text-4xl font-black text-foreground">{reconciledCount}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-emerald-500 font-medium">
                        <CheckCircle2 className="w-4 h-4" /> {aiSuccessRate}% de taux de succès IA
                    </div>
                </div>
                <div className="glass-card p-6 rounded-3xl border border-orange-500/20 relative overflow-hidden">
                    <h3 className="text-sm font-bold text-muted-foreground mb-4">En Attente de Lettrage</h3>
                    <p className="text-4xl font-black text-foreground">{pendingCount}</p>
                    <div className={`mt-4 flex items-center gap-2 text-sm font-medium ${pendingCount > 0 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                        <AlertCircle className="w-4 h-4" /> {pendingCount > 0 ? 'Action requise' : 'À jour'}
                    </div>
                </div>
            </div>

            <div className="glass-card rounded-3xl border border-border/50 overflow-hidden">
                <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/20">
                    <h2 className="font-bold text-lg">Flux Récents (Base de données)</h2>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors"><Filter className="w-4 h-4 text-muted-foreground" /></button>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors"><Download className="w-4 h-4 text-muted-foreground" /></button>
                    </div>
                </div>
                <div className="p-0">
                    {loading && transactions.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">Chargement des transactions...</div>
                    ) : transactions.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">Aucune transaction trouvée. Cliquez sur "Simuler Transaction" pour générer des flux.</div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/10">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Opérateur</th>
                                    <th className="px-6 py-4 font-bold">Date & Heure</th>
                                    <th className="px-6 py-4 font-bold">Client / Numéro</th>
                                    <th className="px-6 py-4 font-bold">Montant</th>
                                    <th className="px-6 py-4 font-bold">Statut Comptable</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {transactions.map((row) => (
                                    <tr key={row.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-semibold flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${row.operator === 'Wave' ? 'bg-blue-500' : row.operator === 'Orange Money' ? 'bg-orange-500' : 'bg-yellow-500'}`}></div>
                                            {row.operator}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {new Date(row.transactionDate).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">{row.senderPhone}</td>
                                        <td className={`px-6 py-4 font-bold ${row.type === 'IN' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {row.type === 'IN' ? '+' : '-'} {formatFCFA(row.amount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${row.status === 'PENDING' ? 'bg-orange-500/10 text-orange-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                {row.status === 'PENDING' ? 'À lettrer' : 'Rapproché IA'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
