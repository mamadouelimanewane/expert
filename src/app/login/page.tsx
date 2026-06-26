"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, Fingerprint, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const res = await signIn("credentials", {
            redirect: false,
            email,
            password
        });

        if (res?.error) {
            setError(res.error);
            setIsLoading(false);
        } else {
            // Success: Redirection will be handled by middleware or force redirect
            router.push("/bi");
        }
    };

    const useDemoAccount = (role: "expert" | "collab") => {
        setEmail(role === "expert" ? "expert@gantic360.com" : "collab@gantic360.com");
        setPassword("password");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-0 relative z-10 rounded-[40px] border border-white/10 bg-slate-900/60 shadow-2xl overflow-hidden backdrop-blur-xl">
                
                {/* Left Side - Branding */}
                <div className="p-4 sm:p-8 lg:p-16 hidden lg:flex flex-col justify-between bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-r border-white/5 relative">
                    <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-12">
                            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                                <Fingerprint className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-white">GANTIC360 EXPERT</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white leading-tight mb-6">
                            L'ERP Nouvelle Génération pour Experts-Comptables.
                        </h1>
                        <p className="text-indigo-200 text-lg font-medium leading-relaxed max-w-md">
                            Connectez-vous pour accéder à vos dossiers d'audit, piloter votre rentabilité et superviser vos collaborateurs via NEXUS IA.
                        </p>
                    </div>

                    <div className="relative z-10 p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md flex items-center gap-4">
                        <ShieldCheck className="w-10 h-10 text-emerald-400" />
                        <div>
                            <p className="font-bold text-white text-sm">Sécurité Bancaire (256-bit)</p>
                            <p className="text-xs text-indigo-200 mt-1">Vos données comptables sont chiffrées de bout en bout.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="p-8 sm:p-16 flex flex-col justify-center">
                    <div className="max-w-md w-full mx-auto">
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-2">Bienvenue</h2>
                        <p className="text-slate-400 font-medium mb-8">Saisissez vos identifiants pour accéder à votre espace sécurisé.</p>

                        <form onSubmit={handleLogin} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm font-bold text-center">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Email Professionnel</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="vous@cabinet.sn" 
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Mot de passe</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                    <input 
                                        type="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="••••••••" 
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/30"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Se Connecter"} 
                                {!isLoading && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </form>

                        {/* DEMO ACCOUNTS */}
                        <div className="mt-12 pt-8 border-t border-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center mb-4">Comptes de Démonstration (Développement)</p>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => useDemoAccount("expert")} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300 transition-colors border border-white/5">
                                    Compte Associé
                                </button>
                                <button onClick={() => useDemoAccount("collab")} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300 transition-colors border border-white/5">
                                    Compte Collaborateur
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
