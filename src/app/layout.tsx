import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { OnboardingGuide } from "@/components/onboarding/OnboardingGuide";

import { ThemeProvider } from "@/context/ThemeContext";

import { AppShell } from "@/components/layout/AppShell";

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
        <html lang="fr">
          <body className={`antialiased text-foreground bg-background`}>
            <AuthProvider>
              <ThemeProvider>
                {/* Background ambient glow effect */}
                <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none opacity-50 dark:opacity-100" />

                <AppShell>
                  {children}
                </AppShell>
              </ThemeProvider>
            </AuthProvider>
          </body>
        </html>
  );
}
