"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Lock,
    Mail,
    ArrowRight,
    ShieldCheck,
    Globe,
    AlertCircle,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success) {
                router.push("/");
                router.refresh();
            } else {
                setError(data.error || "Identifiants invalides");
            }
        } catch (err) {
            setError("Une erreur est survenue");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050608] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute top-[30%] right-[10%] w-[20%] h-[20%] bg-purple-600/5 blur-[80px] rounded-full" />
            </div>

            <div className="w-full max-w-lg relative z-10">
                {/* Logo & Header */}
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-700 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/20 group">
                        <ShieldCheck className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2">CABINET <span className="text-indigo-500">360</span></h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Expertise Comptable OHADA</p>
                </div>

                {/* Login Card */}
                <div className="glass-card rounded-[40px] p-10 border border-white/5 bg-slate-900/40 backdrop-blur-2xl shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2">
                                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                                <p className="text-sm font-bold text-rose-200">{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Professionnel</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="expert@cabinet360.com"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border-2 border-white/5 rounded-2xl text-white outline-none focus:border-indigo-500/50 transition-all font-medium placeholder:text-slate-700"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mot de Passe</label>
                                    <a href="#" className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300">Oublié ?</a>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border-2 border-white/5 rounded-2xl text-white outline-none focus:border-indigo-500/50 transition-all font-medium placeholder:text-slate-700"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={isLoading}
                            type="submit"
                            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[24px] font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 relative overflow-hidden group disabled:opacity-50"
                        >
                            <span className={cn(isLoading && "opacity-0")}>Se Connecter</span>
                            <ArrowRight className={cn("w-4 h-4 group-hover:translate-x-1 transition-transform", isLoading && "opacity-0")} />
                            {isLoading && (
                                <Loader2 className="absolute w-5 h-5 animate-spin" />
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <Globe className="w-4 h-4 text-slate-600 group-hover:text-indigo-500 transition-colors" />
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-slate-400">Zone OHADA (XOF)</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors cursor-pointer">Support</span>
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors cursor-pointer">Sécurité</span>
                        </div>
                    </div>
                </div>

                <p className="text-center mt-8 text-slate-600 text-[11px] font-medium">
                    &copy; 2026 Cabinet 360 v2.0.0. Tous droits réservés.
                </p>
            </div>
        </div>
    );
}
