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
            <OnboardingGuide />
            <div className="flex min-h-dvh overflow-x-hidden relative">
                {/* GLOBAL ASSISTANT */}
                <NexusCopilot />
                <Sidebar />
                <main className="lg:pl-64 flex-1 min-h-dvh relative pt-16 lg:pt-0 overflow-x-hidden">
                    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 lg:space-y-8 animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </>
    );
}
