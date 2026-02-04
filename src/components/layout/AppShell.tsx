"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { OnboardingGuide } from "@/components/onboarding/OnboardingGuide";

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Routes that should NOT have the sidebar (Marketing, Login, Landing)
    const isPublicRoute = pathname === "/" || pathname === "/login" || pathname === "/public" || pathname === "/v2-home";

    // If we're on a public route, just render children
    if (isPublicRoute) {
        return <>{children}</>;
    }

    return (
        <>
            <OnboardingGuide />
            <div className="flex min-h-screen">
                <Sidebar />
                <main className="lg:pl-64 flex-1 min-h-screen relative pt-16 lg:pt-0">
                    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 lg:space-y-8 animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </>
    );
}
