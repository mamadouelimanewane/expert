"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Briefcase,
    Building2,
    Calendar,
    FileText,
    Save,
    AlertCircle,
    ArrowLeft,
    Loader2,
    Banknote
} from "lucide-react";

interface Client {
    id: string;
    companyName: string | null;
    firstName: string | null;
    lastName: string | null;
}

export default function NewMissionPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [clients, setClients] = useState<Client[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        clientId: "",
        type: "TENUE_COMPTABLE",
        budget: "",
        deadline: "",
        description: ""
    });

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const res = await fetch("/api/clients");
                if (res.ok) {
                    const data = await res.json();
                    setClients(data.clients || []);
                    if (data.clients && data.clients.length > 0) {
                        setFormData(prev => ({ ...prev, clientId: data.clients[0].id }));
                    }
                }
            } catch (err) {
                console.error("Failed to fetch clients", err);
            }
        };
        fetchClients();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/missions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Erreur lors de la création de la mission");
            
            router.push("/missions");
        } catch (err) {
            setError("Impossible de créer la mission. Veuillez vérifier les informations.");
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-700 pb-10">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">Nouvelle Mission</h1>
                    <p className="text-slate-400 font-medium">Définissez les paramètres de la mission pour un client existant.</p>
                </div>
            </div>

            {/* Form Card */}
            <div className="glass-card rounded-[32px] p-8 sm:p-10 border border-white/5 bg-slate-900/40 shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                            <p className="text-sm font-bold text-rose-200">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 ml-1">Titre de la mission</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Ex: Audit Financier Annuel 2026"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 transition-all font-medium text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 ml-1">Client Associé</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <select
                                        name="clientId"
                                        required
                                        value={formData.clientId}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 transition-all font-medium text-sm appearance-none"
                                    >
                                        <option value="" disabled>Sélectionner un client</option>
                                        {clients.map(client => (
                                            <option key={client.id} value={client.id}>
                                                {client.companyName || `${client.firstName} ${client.lastName}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 ml-1">Type de mission</label>
                                <select
                                    name="type"
                                    required
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 transition-all font-medium text-sm appearance-none"
                                >
                                    <option value="TENUE_COMPTABLE">Tenue Comptable</option>
                                    <option value="REVISION">Révision des Comptes</option>
                                    <option value="AUDIT">Audit Légal / Contractuel</option>
                                    <option value="CONSEIL_FISCAL">Conseil Fiscal</option>
                                    <option value="SOCIAL_PAIE">Social & Paie</option>
                                    <option value="JURIDIQUE">Secrétariat Juridique</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 ml-1">Date d'échéance / Deadline</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="date"
                                        name="deadline"
                                        value={formData.deadline}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 transition-all font-medium text-sm"
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 ml-1">Budget / Honoraires (FCFA)</label>
                                <div className="relative">
                                    <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="number"
                                        name="budget"
                                        value={formData.budget}
                                        onChange={handleChange}
                                        placeholder="Ex: 5000000"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 transition-all font-medium text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 ml-1">Description et détails</label>
                        <div className="relative">
                            <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-500" />
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Détails de la mission, objectifs spécifiques, interlocuteurs..."
                                className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 transition-all font-medium text-sm"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex gap-4 justify-end">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-4 rounded-xl font-bold text-slate-400 hover:text-white transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-3 disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Créer la Mission
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
