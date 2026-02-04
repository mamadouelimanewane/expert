import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Cabinet 360 Elite - L'Intelligence Artificielle au Service de l'OHADA",
    description: "La plateforme de référence pour les cabinets d'expertise comptable, d'audit et de conseil en zone OHADA.",
};

export default function HomeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={`${inter.className} min-h-screen bg-[#0a0c10] text-slate-200 overflow-x-hidden`}>
            {children}
        </div>
    );
}
