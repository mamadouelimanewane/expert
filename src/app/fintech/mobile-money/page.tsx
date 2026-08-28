"use client";

import React, { useState, useEffect } from 'react';
import { Smartphone, ArrowRightLeft, CheckCircle2, AlertCircle, RefreshCw, Filter, Download, Zap, FlaskConical, Loader2 } from 'lucide-react';

export default function MobileMoneyPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [canSimulate, setCanSimulate] = useState(false);
    const [simulating, setSimulating] = useState(false);
    const [simError, setSimError] = useState<string | null>(null);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/fintech/mobile-money');
            if (res.ok) {
                const data = await res.json();
                setTransactions(data.transactions || []);
                setCanSimulate(!!data.canSimulate);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSimulate = async () => {
        setSimulating(true);
        setSimError(null);
        try {
            const res = await fetch('/api/fintech/mobile-money/simulate', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                await fetchTransactions();
            } else {
                setSimError(data.error || "Échec de la simulation.");
            }
        } catch {
            setSimError("Erreur réseau lors de la simulation.");
        } finally {
            setSimulating(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    // Le rapprochement automatique nécessite une intégration réelle avec l'API de
    // l'opérateur (Wave/Orange/MTN). Aucune logique de correspondance fiable n'étant
    // câblée côté serveur, on affiche honnêtement le message renvoyé par l'API plutôt
    // que de faire semblant de rapprocher les transactions.
    const [reconcileMessage, setReconcileMessage] = useState<string | null>(null);
    const runAILettreage = async () => {
        try {
            const res = await fetch('/api/fintech/mobile-money', { method: 'PATCH' });
            const data = await res.json();
            setReconcileMessage(data.message || data.error || null);
            fetchTransactions();
        } catch (error) {
            console.error(error);
        }
    };

    const formatFCFA = (val: number) => new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';

    // Stats — les transactions de test (référence "SIM-") sont exclues des
    // indicateurs pour ne jamais fausser les chiffres réels du cabinet.
    const realTransactions = transactions.filter(t => !t.reference?.startsWith('SIM-'));
    const testCount = transactions.length - realTransactions.length;
    const totalVolume = realTransactions.reduce((acc, curr) => acc + curr.amount, 0);
    const reconciledCount = realTransactions.filter(t => t.status === 'RECONCILED').length;
    const pendingCount = realTransactions.filter(t => t.status === 'PENDING').length;
    const aiSuccessRate = realTransactions.length > 0 ? Math.round((reconciledCount / realTransactions.length) * 100) : 0;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <h1 className="page-title">Rapprochement Mobile Money</h1>
                    </div>
                    <p className="page-subtitle">Synchronisation en temps réel avec Wave, Orange Money et MTN MoMo.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchTransactions} className="flex items-center gap-2 px-4 py-2 glass-card rounded-xl text-sm font-semibold hover:bg-white/5 transition-colors">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualiser
                    </button>
                    <button onClick={runAILettreage} disabled={pendingCount === 0} className={`flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-bold shadow-lg transition-all ${pendingCount > 0 ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' : 'bg-muted text-muted-foreground opacity-50'}`}>
                        <Zap className="w-4 h-4" /> Rapprochement IA
                    </button>
                    {canSimulate && (
                        <button
                            onClick={handleSimulate}
                            disabled={simulating}
                            title="Génère une transaction de test clairement identifiée (SIM-), sans appeler d'opérateur réel — utile pour la démo avant configuration des clés API"
                            className="flex items-center gap-2 px-4 py-2 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 rounded-xl text-violet-400 text-sm font-bold transition-all disabled:opacity-50"
                        >
                            {simulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
                            Générer transaction test
                        </button>
                    )}
                </div>
            </header>

            {reconcileMessage && (
                <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-xs text-amber-400">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    {reconcileMessage}
                </div>
            )}

            {simError && (
                <div className="flex items-start gap-3 p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl text-xs text-rose-400">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    {simError}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-3xl border border-emerald-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Smartphone className="w-24 h-24 text-emerald-500" />
                    </div>
                    <h3 className="text-sm font-bold text-muted-foreground mb-4">Volume Transactions MoMo</h3>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground">{formatFCFA(totalVolume)}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-emerald-500 font-medium">
                        <ArrowRightLeft className="w-4 h-4" /> {realTransactions.length} flux détectés
                        {testCount > 0 && <span className="text-violet-400">(+{testCount} test)</span>}
                    </div>
                </div>
                <div className="glass-card p-6 rounded-3xl border border-border/50 relative overflow-hidden">
                    <h3 className="text-sm font-bold text-muted-foreground mb-4">Transactions Rapprochées</h3>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground">{reconciledCount}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-emerald-500 font-medium">
                        <CheckCircle2 className="w-4 h-4" /> {aiSuccessRate}% de taux de succès IA
                    </div>
                </div>
                <div className="glass-card p-6 rounded-3xl border border-orange-500/20 relative overflow-hidden">
                    <h3 className="text-sm font-bold text-muted-foreground mb-4">En Attente de Lettrage</h3>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground">{pendingCount}</p>
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
                        <div className="p-8 text-center text-muted-foreground">
                            Aucune transaction trouvée.{canSimulate ? ' Cliquez sur "Générer transaction test" pour tester le flux de rapprochement.' : ''}
                        </div>
                    ) : (
                        <div className="overflow-x-auto"><table className="w-full text-sm text-left">
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
                                            {row.reference?.startsWith('SIM-') && (
                                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-violet-500/10 text-violet-400 border border-violet-500/20">Test</span>
                                            )}
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
                        </table></div>
                    )}
                </div>
            </div>
        </div>
    );
}
