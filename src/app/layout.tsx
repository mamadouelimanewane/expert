import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { OnboardingGuide } from "@/components/onboarding/OnboardingGuide";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cabinet 360 - Gestion Expert OHADA",
  description: "Logiciel de gestion pour cabinets d'expertise comptable (Zone OHADA)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.className} antialiased text-slate-100`}>
        {/* Background ambient glow effect */}
        <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 pointer-events-none" />

        <OnboardingGuide />

        <div className="flex min-h-screen">
          <Sidebar />
          <main className="pl-64 flex-1 min-h-screen relative">
            <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
