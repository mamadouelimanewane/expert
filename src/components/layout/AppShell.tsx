"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { OnboardingGuide } from "@/components/onboarding/OnboardingGuide";
import { NexusCopilot } from "@/components/nexus/NexusCopilot";

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Routes that should NOT have the sidebar (Marketing, Login, Landing, Client Portal)
    const isPublicRoute = pathname === "/" || pathname === "/login" || pathname === "/public" || pathname === "/v2-home" || pathname.startsWith("/portal");

    // If we're on a public route, just render children
    if (isPublicRoute) {
        return <>{children}</>;
    }

    return (
        <>
            {/* Le Sidebar, l'assistant flottant et les marges de l'AppShell n'etaient
                jamais masques a l'impression : toute page utilisant window.print()
                (bilan, resultat, lettres de mission...) imprimait la barre laterale
                et le chrome de l'appli en plus du document. */}
            <div className="print:hidden">
                <OnboardingGuide />
            </div>
            <div className="flex min-h-dvh overflow-x-hidden relative print:block print:min-h-0">
                {/* GLOBAL ASSISTANT */}
                <div className="print:hidden">
                    <NexusCopilot />
                </div>
                <div className="print:hidden">
                    <Sidebar />
                </div>
                <main className="lg:pl-64 flex-1 min-h-dvh relative pt-16 lg:pt-0 overflow-x-hidden print:pl-0 print:pt-0 print:min-h-0">
                    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 lg:space-y-8 animate-fade-in print:p-0 print:max-w-none print:space-y-0">
                        {children}
                    </div>
                </main>
            </div>
        </>
    );
}
