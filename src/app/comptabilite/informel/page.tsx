"use client";

import React, { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import {
    FileDigit, Upload, BookOpen, BarChart2, ArrowRight,
    Download, CheckCircle2, AlertCircle, Building2, Sparkles,
    CloudUpload, FileSpreadsheet, Save, RefreshCw
} from 'lucide-react';

// ============================================================
// MOTEUR DE COMPTABILISATION OHADA / SYSCOHADA
// ============================================================

interface RawLine {
    date: string;
    libelle: string;
    entree: number;
    sortie: number;
}

interface JournalLine {
    date: string;
    libelle: string;
    debit_compte: string;
    debit_intitule: string;
    credit_compte: string;
    credit_intitule: string;
    montant: number;
}

interface BalanceLine {
    compte: string;
    intitule: string;
    debit: number;
    credit: number;
    solde_debiteur: number;
    solde_crediteur: number;
}

const MAPPING_CHARGES = [
    { keywords: ['loyer', 'location', 'bail'], compte: '622', intitule: 'Loyers et charges locatives' },
    { keywords: ['carburant', 'essence', 'gasoil', 'fuel'], compte: '605', intitule: 'Autres achats' },
    { keywords: ['salaire', 'paie', 'employé', 'personnel'], compte: '661', intitule: 'Rémunérations du personnel' },
    { keywords: ['téléphone', 'telephone', 'internet', 'phone', 'mobile'], compte: '626', intitule: 'Frais de télécommunication' },
    { keywords: ['eau', 'electricite', 'électricité', 'énergie', 'sodeci', 'cie'], compte: '624', intitule: 'Eau et énergie' },
    { keywords: ['achat', 'marchandise', 'fournisseur', 'stock'], compte: '601', intitule: 'Achats de marchandises' },
    { keywords: ['transport', 'livraison', 'coursier'], compte: '612', intitule: 'Transports' },
    { keywords: ['impôt', 'impot', 'taxe', 'patente', 'cotisation'], compte: '644', intitule: 'Impôts et taxes' },
    { keywords: ['frais', 'banque', 'agence', 'commission'], compte: '627', intitule: 'Frais bancaires et assimilés' },
    { keywords: ['réparation', 'entretien', 'maintenance'], compte: '615', intitule: 'Entretiens, réparations' },
];

const MAPPING_PRODUITS = [
    { keywords: ['vente', 'facture', 'prestation', 'service', 'recette'], compte: '701', intitule: 'Ventes de marchandises' },
    { keywords: ['remboursement', 'retour', 'avoir'], compte: '709', intitule: 'Remboursements reçus' },
];

function detectCompteCharge(libelle: string) {
    const lower = libelle.toLowerCase();
    for (const rule of MAPPING_CHARGES) {
        if (rule.keywords.some(k => lower.includes(k))) return { compte: rule.compte, intitule: rule.intitule };
    }
    return { compte: '658', intitule: 'Charges diverses' };
}

function detectCompteProduit(libelle: string) {
    const lower = libelle.toLowerCase();
    for (const rule of MAPPING_PRODUITS) {
        if (rule.keywords.some(k => lower.includes(k))) return { compte: rule.compte, intitule: rule.intitule };
    }
    return { compte: '707', intitule: 'Produits divers' };
}

function generateJournal(rawLines: RawLine[]): JournalLine[] {
    const journal: JournalLine[] = [];
    for (const line of rawLines) {
        if (line.entree > 0) {
            const produit = detectCompteProduit(line.libelle);
            journal.push({ date: line.date, libelle: line.libelle, debit_compte: '571', debit_intitule: 'Caisse principale', credit_compte: produit.compte, credit_intitule: produit.intitule, montant: line.entree });
        }
        if (line.sortie > 0) {
            const charge = detectCompteCharge(line.libelle);
            journal.push({ date: line.date, libelle: line.libelle, debit_compte: charge.compte, debit_intitule: charge.intitule, credit_compte: '571', credit_intitule: 'Caisse principale', montant: line.sortie });
        }
    }
    return journal;
}

function generateBalance(journal: JournalLine[]): BalanceLine[] {
    const map: Record<string, BalanceLine> = {};
    for (const line of journal) {
        if (!map[line.debit_compte]) map[line.debit_compte] = { compte: line.debit_compte, intitule: line.debit_intitule, debit: 0, credit: 0, solde_debiteur: 0, solde_crediteur: 0 };
        map[line.debit_compte].debit += line.montant;
        if (!map[line.credit_compte]) map[line.credit_compte] = { compte: line.credit_compte, intitule: line.credit_intitule, debit: 0, credit: 0, solde_debiteur: 0, solde_crediteur: 0 };
        map[line.credit_compte].credit += line.montant;
    }
    return Object.values(map).sort((a, b) => a.compte.localeCompare(b.compte)).map(b => ({
        ...b,
        solde_debiteur: b.debit > b.credit ? b.debit - b.credit : 0,
        solde_crediteur: b.credit > b.debit ? b.credit - b.debit : 0,
    }));
}

// Demo data
const DEMO_DATA: RawLine[] = [
    { date: '2026-06-01', libelle: 'Vente de marchandises M. Coulibaly', entree: 85000, sortie: 0 },
    { date: '2026-06-01', libelle: 'Achat carburant moto livraison', entree: 0, sortie: 12000 },
    { date: '2026-06-02', libelle: 'Prestation de service salon coiffure', entree: 45000, sortie: 0 },
    { date: '2026-06-02', libelle: 'Loyer du local commercial juin', entree: 0, sortie: 50000 },
    { date: '2026-06-03', libelle: 'Vente journalière boutique', entree: 110000, sortie: 0 },
    { date: '2026-06-03', libelle: 'Facture electricité SODECI', entree: 0, sortie: 18500 },
    { date: '2026-06-04', libelle: 'Achat marchandises fournisseur Diallo', entree: 0, sortie: 75000 },
    { date: '2026-06-04', libelle: 'Vente en gros Entreprise Bamba', entree: 200000, sortie: 0 },
    { date: '2026-06-05', libelle: 'Salaire assistante Mme Koné', entree: 0, sortie: 45000 },
    { date: '2026-06-05', libelle: 'Vente marchandises journalière', entree: 62000, sortie: 0 },
    { date: '2026-06-06', libelle: 'Frais téléphone mobile money', entree: 0, sortie: 5000 },
    { date: '2026-06-06', libelle: 'Remboursement client Traoré', entree: 15000, sortie: 0 },
];

const TABS = ['Cahier Client', 'Brouillard OHADA', 'Balance Provisoire'];

export default function InformelPage() {
    const [activeTab, setActiveTab] = useState(0);
    const [rawData, setRawData] = useState<RawLine[]>([]);
    const [journal, setJournal] = useState<JournalLine[]>([]);
    const [balance, setBalance] = useState<BalanceLine[]>([]);
    const [businessName, setBusinessName] = useState('');
    const [periode, setPeriode] = useState('JUIN-2026');
    const [imported, setImported] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savedCount, setSavedCount] = useState<number | null>(null);
    const [exporting, setExporting] = useState(false);
    const [exported, setExported] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const f = (val: number) => new Intl.NumberFormat('fr-FR').format(val);

    const processData = (data: RawLine[], name: string) => {
        setProcessing(true);
        setImported(false);
        setSavedCount(null);
        setExported(false);
        setTimeout(() => {
            const j = generateJournal(data);
            const b = generateBalance(j);
            setRawData(data);
            setJournal(j);
            setBalance(b);
            setBusinessName(name || 'Commerçant');
            setImported(true);
            setProcessing(false);
            setActiveTab(1);
        }, 1600);
    };

    const parseExcelFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target!.result as ArrayBuffer);
                const wb = XLSX.read(data, { type: 'array' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
                const parsed: RawLine[] = rows
                    .filter(r => r['Libellé'] && r['Libellé'].toString().trim())
                    .map(r => ({
                        date: r['Date'] ? r['Date'].toString() : '',
                        libelle: r['Libellé'].toString(),
                        entree: parseFloat(r['Entrées']) || 0,
                        sortie: parseFloat(r['Sorties']) || 0,
                    }));
                processData(parsed, file.name.replace(/\.[^.]+$/, ''));
            } catch (err) {
                alert("Erreur lors de la lecture du fichier. Vérifiez le format.");
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) parseExcelFile(file);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) parseExcelFile(file);
    }, []);

    const saveToDatabase = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/comptabilite/tpe-journal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ journal, businessName, periode })
            });
            const data = await res.json();
            setSavedCount(data.count);
        } catch {
            alert("Erreur lors de la sauvegarde.");
        } finally {
            setSaving(false);
        }
    };

    const exportToProduction = async () => {
        setExporting(true);
        try {
            const res = await fetch('/api/comptabilite/tpe-journal', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ periode })
            });
            const data = await res.json();
            setExported(true);
            alert(`✅ ${data.message}`);
        } catch {
            alert("Erreur lors de l'export.");
        } finally {
            setExporting(false);
        }
    };

    const totalEntrees = rawData.reduce((acc, l) => acc + l.entree, 0);
    const totalSorties = rawData.reduce((acc, l) => acc + l.sortie, 0);
    const totalMouvements = journal.reduce((acc, l) => acc + l.montant, 0);
    const isBalanced = journal.length > 0;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Header */}
            <header className="flex flex-col gap-2 border-b border-border/50 pb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
                            <FileDigit className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">Cahier de Caisse TPE</h1>
                            <p className="text-sm text-muted-foreground">Saisie simplifiée par le client → Moteur OHADA → Comptabilité SYSCOHADA au cabinet</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            href="/api/comptabilite/tpe-template"
                            download
                            className="flex items-center gap-2 px-4 py-2 border border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10 rounded-xl text-sm font-bold transition-colors"
                        >
                            <FileSpreadsheet className="w-4 h-4" /> Télécharger Modèle Excel
                        </a>
                        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-sm font-bold text-indigo-500">
                            <Building2 className="w-4 h-4" /> Module BPO Actif
                        </div>
                    </div>
                </div>
            </header>

            {/* Zone d'import */}
            {!imported && !processing && (
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    className={`glass-card rounded-3xl border-2 border-dashed p-12 flex flex-col items-center justify-center text-center space-y-6 transition-all duration-300
                        ${dragging ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]' : 'border-indigo-500/30 bg-indigo-500/5'}`}
                >
                    <div className={`p-5 rounded-3xl transition-colors ${dragging ? 'bg-indigo-500/20' : 'bg-indigo-500/10'}`}>
                        <CloudUpload className={`w-12 h-12 transition-colors ${dragging ? 'text-indigo-400' : 'text-indigo-500'}`} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black mb-2">
                            {dragging ? 'Déposez le fichier ici…' : 'Importez le Cahier de Caisse Client'}
                        </h2>
                        <p className="text-muted-foreground max-w-md text-sm">
                            Glissez-déposez le fichier Excel rempli par votre client, ou utilisez le bouton ci-dessous.
                            Notre moteur OHADA le transforme en journal comptable SYSCOHADA en quelques secondes.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-6 py-3 border border-indigo-500/40 text-indigo-500 hover:bg-indigo-500/10 rounded-xl text-sm font-bold transition-colors"
                        >
                            <Upload className="w-4 h-4" /> Choisir un Fichier (.xlsx / .csv)
                        </button>
                        <button
                            onClick={() => processData(DEMO_DATA, 'Boutique Diallo & Frères')}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all"
                        >
                            <Sparkles className="w-4 h-4" /> Simuler avec des données exemples
                        </button>
                    </div>
                    <p className="text-xs text-muted-foreground">Formats acceptés : .xlsx, .xls, .csv · Les colonnes attendues : Date, Libellé, Entrées, Sorties</p>
                </div>
            )}

            {/* Animation de traitement */}
            {processing && (
                <div className="glass-card rounded-3xl border border-indigo-500/20 p-16 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 animate-spin border-t-indigo-500"></div>
                        <Sparkles className="w-8 h-8 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black mb-2">Moteur OHADA en cours…</h2>
                        <p className="text-muted-foreground text-sm">Analyse des libellés · Affectation des comptes SYSCOHADA · Équilibrage Débit / Crédit</p>
                    </div>
                </div>
            )}

            {/* Résultats */}
            {imported && (
                <>
                    {/* Métadonnées */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass-card p-4 rounded-2xl border border-indigo-500/20 col-span-2 md:col-span-1 flex flex-col gap-2">
                            <p className="text-xs font-bold text-muted-foreground">Client / TPE</p>
                            <input
                                className="font-bold text-sm bg-transparent focus:outline-none border-b border-border/30 pb-1"
                                value={businessName}
                                onChange={e => setBusinessName(e.target.value)}
                            />
                        </div>
                        <div className="glass-card p-4 rounded-2xl border border-indigo-500/20 flex flex-col gap-2">
                            <p className="text-xs font-bold text-muted-foreground">Période</p>
                            <input
                                className="font-bold text-sm bg-transparent focus:outline-none border-b border-border/30 pb-1"
                                value={periode}
                                onChange={e => setPeriode(e.target.value)}
                            />
                        </div>
                        <div className="glass-card p-4 rounded-2xl border border-emerald-500/20">
                            <p className="text-xs font-bold text-muted-foreground mb-1">Entrées</p>
                            <p className="text-lg font-black text-emerald-500">+{f(totalEntrees)} FCFA</p>
                        </div>
                        <div className="glass-card p-4 rounded-2xl border border-rose-500/20">
                            <p className="text-xs font-bold text-muted-foreground mb-1">Sorties</p>
                            <p className="text-lg font-black text-rose-500">-{f(totalSorties)} FCFA</p>
                        </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-3">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${isBalanced ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500'}`}>
                            {isBalanced ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            {isBalanced ? `Débit = Crédit ✓ (${f(totalMouvements)} FCFA)` : 'Déséquilibré !'}
                        </div>
                        <div className="px-4 py-2 rounded-full text-sm font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                            {journal.length} écritures générées · {balance.length} comptes mouvementés
                        </div>
                        {savedCount !== null && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                <CheckCircle2 className="w-4 h-4" /> {savedCount} lignes sauvegardées en base
                            </div>
                        )}
                        {exported && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                                <CheckCircle2 className="w-4 h-4" /> Déversé en Production ✓
                            </div>
                        )}
                    </div>

                    {/* Tableau avec onglets */}
                    <div className="glass-card rounded-3xl border border-border/50 overflow-hidden">
                        {/* Tab headers + Actions */}
                        <div className="flex flex-wrap border-b border-border/50 bg-muted/10 items-center">
                            {TABS.map((tab, i) => (
                                <button key={i} onClick={() => setActiveTab(i)}
                                    className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-colors border-b-2 whitespace-nowrap
                                        ${activeTab === i ? 'border-indigo-500 text-indigo-500 bg-indigo-500/5' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                                    {i === 0 && <FileDigit className="w-4 h-4" />}
                                    {i === 1 && <BookOpen className="w-4 h-4" />}
                                    {i === 2 && <BarChart2 className="w-4 h-4" />}
                                    {tab}
                                </button>
                            ))}
                            <div className="ml-auto flex items-center px-4 gap-2 py-2">
                                <button onClick={() => { setImported(false); setRawData([]); setSavedCount(null); setExported(false); }}
                                    className="text-xs px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg font-bold transition-colors">
                                    Nouveau Fichier
                                </button>
                                <button onClick={saveToDatabase} disabled={saving || savedCount !== null}
                                    className="flex items-center gap-1 text-xs px-3 py-2 border border-indigo-500/40 text-indigo-500 hover:bg-indigo-500/10 rounded-lg font-bold transition-colors disabled:opacity-50">
                                    {saving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                    {saving ? 'Sauvegarde…' : savedCount !== null ? 'Sauvegardé ✓' : 'Sauvegarder en base'}
                                </button>
                                <button onClick={exportToProduction} disabled={exporting || exported || savedCount === null}
                                    className="flex items-center gap-1 text-xs px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow shadow-indigo-500/20 transition-all disabled:opacity-50">
                                    {exporting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ArrowRight className="w-3 h-3" />}
                                    {exported ? 'En Production ✓' : 'Déverser en Production'}
                                </button>
                            </div>
                        </div>

                        {/* Onglet 0 : Cahier Client */}
                        {activeTab === 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="text-xs text-muted-foreground uppercase bg-muted/10 border-b border-border/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left">Date</th>
                                            <th className="px-6 py-3 text-left">Libellé (tel que saisi par le client)</th>
                                            <th className="px-6 py-3 text-right">Entrées</th>
                                            <th className="px-6 py-3 text-right">Sorties</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {rawData.map((row, i) => (
                                            <tr key={i} className="hover:bg-muted/20 transition-colors">
                                                <td className="px-6 py-3 text-muted-foreground font-mono text-xs">{row.date}</td>
                                                <td className="px-6 py-3 font-medium">{row.libelle}</td>
                                                <td className="px-6 py-3 text-right font-bold text-emerald-500">{row.entree > 0 ? f(row.entree) : ''}</td>
                                                <td className="px-6 py-3 text-right font-bold text-rose-500">{row.sortie > 0 ? f(row.sortie) : ''}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-muted/20 border-t-2 border-border/50 font-black">
                                        <tr>
                                            <td colSpan={2} className="px-6 py-3 text-xs uppercase text-muted-foreground">Totaux</td>
                                            <td className="px-6 py-3 text-right text-emerald-500">{f(totalEntrees)}</td>
                                            <td className="px-6 py-3 text-right text-rose-500">{f(totalSorties)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}

                        {/* Onglet 1 : Brouillard OHADA */}
                        {activeTab === 1 && (
                            <div className="overflow-x-auto">
                                <div className="px-6 py-2 bg-indigo-500/5 border-b border-indigo-500/20 flex items-center gap-2 text-xs text-indigo-500 font-bold">
                                    <Sparkles className="w-3 h-3" /> Généré par le Moteur OHADA — Référentiel SYSCOHADA / UEMOA
                                </div>
                                <table className="w-full text-sm">
                                    <thead className="text-xs text-muted-foreground uppercase bg-muted/10 border-b border-border/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Date</th>
                                            <th className="px-4 py-3 text-left">Libellé</th>
                                            <th className="px-4 py-3 text-center">Cpte Débit</th>
                                            <th className="px-4 py-3 text-left">Intitulé Débit</th>
                                            <th className="px-4 py-3 text-center">Cpte Crédit</th>
                                            <th className="px-4 py-3 text-left">Intitulé Crédit</th>
                                            <th className="px-4 py-3 text-right">Montant FCFA</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {journal.map((row, i) => (
                                            <tr key={i} className="hover:bg-muted/20 transition-colors">
                                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.date}</td>
                                                <td className="px-4 py-3 text-xs max-w-[180px] truncate" title={row.libelle}>{row.libelle}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 font-mono font-bold rounded text-xs">{row.debit_compte}</span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">{row.debit_intitule}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="px-2 py-0.5 bg-purple-500/10 text-purple-500 font-mono font-bold rounded text-xs">{row.credit_compte}</span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">{row.credit_intitule}</td>
                                                <td className="px-4 py-3 text-right font-bold">{f(row.montant)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-muted/20 border-t-2 border-border/50 font-black">
                                        <tr>
                                            <td colSpan={6} className="px-4 py-3 text-xs uppercase text-muted-foreground">Total Mouvements (Débit = Crédit)</td>
                                            <td className="px-4 py-3 text-right text-indigo-500">{f(totalMouvements)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}

                        {/* Onglet 2 : Balance */}
                        {activeTab === 2 && (
                            <div className="overflow-x-auto">
                                <div className="px-6 py-2 bg-purple-500/5 border-b border-purple-500/20 flex items-center gap-2 text-xs text-purple-500 font-bold">
                                    <BarChart2 className="w-3 h-3" /> Balance Provisoire — Totalisation par Compte SYSCOHADA
                                </div>
                                <table className="w-full text-sm">
                                    <thead className="text-xs text-muted-foreground uppercase bg-muted/10 border-b border-border/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left">N° Compte</th>
                                            <th className="px-6 py-3 text-left">Intitulé</th>
                                            <th className="px-6 py-3 text-right">Mvt Débit</th>
                                            <th className="px-6 py-3 text-right">Mvt Crédit</th>
                                            <th className="px-6 py-3 text-right">Solde Débiteur</th>
                                            <th className="px-6 py-3 text-right">Solde Créditeur</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {balance.map((row, i) => (
                                            <tr key={i} className="hover:bg-muted/20 transition-colors">
                                                <td className="px-6 py-3">
                                                    <span className={`px-2 py-0.5 font-mono font-bold rounded text-xs
                                                        ${row.compte.startsWith('5') ? 'bg-blue-500/10 text-blue-500' :
                                                          row.compte.startsWith('6') ? 'bg-rose-500/10 text-rose-500' :
                                                          'bg-emerald-500/10 text-emerald-500'}`}>
                                                        {row.compte}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-xs font-medium">{row.intitule}</td>
                                                <td className="px-6 py-3 text-right text-xs">{row.debit > 0 ? f(row.debit) : '-'}</td>
                                                <td className="px-6 py-3 text-right text-xs">{row.credit > 0 ? f(row.credit) : '-'}</td>
                                                <td className="px-6 py-3 text-right font-bold text-rose-500">{row.solde_debiteur > 0 ? f(row.solde_debiteur) : ''}</td>
                                                <td className="px-6 py-3 text-right font-bold text-emerald-500">{row.solde_crediteur > 0 ? f(row.solde_crediteur) : ''}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-muted/20 border-t-2 border-border/50 font-black text-sm">
                                        <tr>
                                            <td colSpan={2} className="px-6 py-3 uppercase text-muted-foreground text-xs">Totaux Généraux</td>
                                            <td className="px-6 py-3 text-right">{f(balance.reduce((a, b) => a + b.debit, 0))}</td>
                                            <td className="px-6 py-3 text-right">{f(balance.reduce((a, b) => a + b.credit, 0))}</td>
                                            <td className="px-6 py-3 text-right text-rose-500">{f(balance.reduce((a, b) => a + b.solde_debiteur, 0))}</td>
                                            <td className="px-6 py-3 text-right text-emerald-500">{f(balance.reduce((a, b) => a + b.solde_crediteur, 0))}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
