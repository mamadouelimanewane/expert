import React from "react";
import { Construction, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Page() {
    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col items-center justify-center gap-6 animate-in fade-in zoom-in-95 duration-700">
            <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 shadow-2xl">
                <Construction className="w-12 h-12 text-indigo-400" />
            </div>
            
            <div className="text-center space-y-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tighter">Module en construction</h1>
                <p className="text-slate-400 max-w-md mx-auto">
                    Cette fonctionnalité est actuellement en cours de développement et sera disponible dans la prochaine mise à jour de la plateforme.
                </p>
            </div>
            
            <Link 
                href="/dashboard"
                className="mt-4 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all"
            >
                <ArrowLeft className="w-4 h-4" />
                Retour au tableau de bord
            </Link>
        </div>
    );
}
