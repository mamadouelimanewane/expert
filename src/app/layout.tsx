import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { OnboardingGuide } from "@/components/onboarding/OnboardingGuide";

import { ThemeProvider } from "@/context/ThemeContext";

import { AppShell } from "@/components/layout/AppShell";
import InstallBanner from "@/components/pwa/InstallBanner";
import OfflineIndicator from "@/components/pwa/OfflineIndicator";

export const metadata: Metadata = {
  title: "Cabinet 360 - Gestion Expert OHADA",
  description: "Logiciel de gestion pour cabinets d'expertise comptable (Zone OHADA)",
};

// `viewport-fit=cover` étend le rendu sous les encoches et la barre d'accueil
// iOS : sans lui, les utilitaires pt-safe / pb-safe (env(safe-area-inset-*))
// valent toujours 0 et la barre mobile se retrouve sous l'encoche.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#006B3F",
};

// Même police que la référence de présentation (apix-pap.vercel.app : Inter).
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <html lang="fr" className="light">
          <head>
            <link rel="manifest" href="/manifest.json" />
            <script dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    // L'echec d'enregistrement etait silencieux : la promesse
                    // rejetee remontait en "Uncaught (in promise)" dans la
                    // console, sans indiquer la cause.
                    navigator.serviceWorker.register('/sw.js').catch(function (e) {
                      console.warn('Service worker non enregistre :', e && e.message);
                    });
                  });
                }
              `
            }} />
          </head>
          <body className={`${inter.variable} font-sans antialiased text-foreground bg-background`}>
            <div className="print:hidden">
              <OfflineIndicator />
              <InstallBanner />
            </div>
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
