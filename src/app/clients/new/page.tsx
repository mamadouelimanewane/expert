"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Building2,
    User,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    FileText,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    Save,
    Loader2,
    Copy,
    Check,
    ExternalLink,
    PartyPopper
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function NewClientPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [portalUrl, setPortalUrl] = useState<string | null>(null);
    const [createdName, setCreatedName] = useState("");
    const [copied, setCopied] = useState(false);

    const [formData, setFormData] = useState({
        type: "ENTREPRISE",
        companyName: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        rccm: "",
        ninea: "",
        sector: "",
        country: "CI",
        city: "",
        address: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/clients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Erreur lors de la création du client");

            const data = await res.json();
            const name = data.client.companyName || `${data.client.firstName} ${data.client.lastName}`;
            setCreatedName(name);
            setPortalUrl(data.portalUrl || `${window.location.origin}/portal/${data.portalToken}`);
        } catch (err) {
            setError("Impossible de créer le client. Vérifiez les informations.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (portalUrl) {
            navigator.clipboard.writeText(portalUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // === MODALE SUCCÈS AVEC LIEN PORTAIL ===
    if (portalUrl) {
        return (
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-700">
                <div className="glass-card rounded-[32px] p-10 border border-white/5 bg-slate-900/40 shadow-2xl text-center space-y-8">
                    <div className="w-20 h-20 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                        <PartyPopper className="w-10 h-10 text-emerald-400" />
                    </div>

                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Client créé avec succès !</h2>
                        <p className="text-slate-400 mt-2">
                            Le portail de <span className="text-indigo-400 font-bold">{createdName}</span> est prêt.
                        </p>
                    </div>

                    {/* Lien Portail */}
                    <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center gap-2 justify-center">
                            <ExternalLink className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">URL du Portail PMI</span>
                        </div>

                        <div className="bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
                            <code className="text-sm text-indigo-300 font-mono flex-1 truncate text-left">{portalUrl}</code>
                            <button onClick={handleCopy}
                                className={cn(
                                    "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black transition-all flex-shrink-0",
                                    copied
                                        ? "bg-emerald-600 text-white"
                                        : "bg-indigo-600 hover:bg-indigo-500 text-white"
                                )}>
                                {copied ? <><Check className="w-3.5 h-3.5" /> Copié !</> : <><Copy className="w-3.5 h-3.5" /> Copier</>}
                            </button>
                        </div>

                        <p className="text-[10px] text-slate-500">
                            Partagez ce lien avec votre client PMI. Il pourra saisir ses recettes/dépenses,
                            consulter son score de santé et suivre ses échéances — sans aucune installation.
                        </p>
                    </div>

                    <div className="flex gap-3 justify-center pt-4">
                        <button onClick={() => router.push("/clients")}
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-colors border border-white/10">
                            Voir les clients
                        </button>
                        <button onClick={() => { setPortalUrl(null); setFormData({ type: "ENTREPRISE", companyName: "", firstName: "", lastName: "", email: "", phone: "", rccm: "", ninea: "", sector: "", country: "CI", city: "", address: "" }); }}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs transition-colors shadow-lg shadow-indigo-500/20">
                            Nouveau client
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-700">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Nouveau Dossier Client</h1>
                    <p className="text-slate-400 font-medium">Ajoutez un nouveau client à votre portefeuille OHADA.</p>
                </div>
            </div>

            {/* Form Card */}
            <div className="glass-card rounded-[32px] p-8 sm:p-10 border border-white/5 bg-slate-900/40 shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-8">

                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                            <p className="text-sm font-bold text-rose-200">{error}</p>
                        </div>
                    )}

                    {/* Type de Client */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div
                            onClick={() => setFormData({ ...formData, type: "ENTREPRISE" })}
                            className={cn(
                                "cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group",
                                formData.type === "ENTREPRISE"
                                    ? "bg-indigo-600/10 border-indigo-500"
                                    : "bg-slate-800/50 border-transparent hover:border-slate-700"
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                                formData.type === "ENTREPRISE" ? "bg-indigo-600 text-white" : "bg-slate-700 text-slate-400"
                            )}>
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className={cn("font-bold", formData.type === "ENTREPRISE" ? "text-indigo-400" : "text-slate-300")}>Personne Morale</h3>
                                <p className="text-xs text-slate-500">Société, SA, SARL, SAS...</p>
                            </div>
                            {formData.type === "ENTREPRISE" && <CheckCircle2 className="w-5 h-5 text-indigo-500 ml-auto" />}
                        </div>

                        <div
                            onClick={() => setFormData({ ...formData, type: "PARTICULIER" })}
                            className={cn(
                                "cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group",
                                formData.type === "PARTICULIER"
                                    ? "bg-cyan-600/10 border-cyan-500"
                                    : "bg-slate-800/50 border-transparent hover:border-slate-700"
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                                formData.type === "PARTICULIER" ? "bg-cyan-600 text-white" : "bg-slate-700 text-slate-400"
                            )}>
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className={cn("font-bold", formData.type === "PARTICULIER" ? "text-cyan-400" : "text-slate-300")}>Personne Physique</h3>
                                <p className="text-xs text-slate-500">Entrepreneur individuel, Consultant...</p>
                            </div>
                            {formData.type === "PARTICULIER" && <CheckCircle2 className="w-5 h-5 text-cyan-500 ml-auto" />}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Information Identité */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Identité & Fiscalité
                            </h3>

                            {formData.type === "ENTREPRISE" && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 ml-1">Raison Sociale</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="text"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            placeholder="Ex: Africa Tech Solutions"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 transition-all font-medium text-sm"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 ml-1">Prénom (Dirigeant)</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 transition-all font-medium text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 ml-1">Nom (Dirigeant)</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 transition-all font-medium text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 ml-1">Secteur d'activité</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="text"
                                        name="sector"
                                        value={formData.sector}
                                        onChange={handleChange}
                                        placeholder="Ex: BTP, IT, Négoce..."
                                        className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 transition-all font-medium text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 ml-1">N° RCCM</label>
                                    <input
                                        type="text"
                                        name="rccm"
                                        value={formData.rccm}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 transition-all font-medium text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 ml-1">NINEA / NIF</label>
                                    <input
                                        type="text"
                                        name="ninea"
                                        value={formData.ninea}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 transition-all font-medium text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Coordonnées */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> Coordonnées & Localisation
                            </h3>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 ml-1">Email professionnel</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 transition-all font-medium text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 ml-1">Téléphone</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 transition-all font-medium text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 ml-1">Pays (OHADA)</label>
                                    <select
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 transition-all font-medium text-sm appearance-none"
                                    >
                                        <option value="CI">Côte d'Ivoire</option>
                                        <option value="SN">Sénégal</option>
                                        <option value="ML">Mali</option>
                                        <option value="BF">Burkina Faso</option>
                                        <option value="CM">Cameroun</option>
                                        <option value="GA">Gabon</option>
                                        <option value="TG">Togo</option>
                                        <option value="BJ">Bénin</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 ml-1">Ville</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 transition-all font-medium text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 ml-1">Adresse complète</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 transition-all font-medium text-sm"
                                />
                            </div>
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
                            Enregistrer le Dossier
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
