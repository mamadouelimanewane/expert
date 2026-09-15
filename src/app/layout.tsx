import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { OnboardingGuide } from "@/components/onboarding/OnboardingGuide";

import { ThemeProvider } from "@/context/ThemeContext";

import { AppShell } from "@/components/layout/AppShell";
import InstallBanner from "@/components/pwa/InstallBanner";
import OfflineIndicator from "@/components/pwa/OfflineIndicator";
import ServiceWorkerRegistration from "@/components/pwa/ServiceWorkerRegistration";

// Rendu dynamique pour toute l'application : la CSP à nonce (middleware)
// exige que Next appose le nonce de CHAQUE requête sur ses balises <script>,
// ce qu'il ne peut pas faire sur une page prérendue à la construction. La page
// de connexion, statique, se retrouvait sans aucun JavaScript exécutable
// (tous ses scripts bloqués par la CSP) : le formulaire partait alors en
// soumission native GET, mot de passe dans l'URL, sans jamais authentifier.
export const dynamic = "force-dynamic";

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
          </head>
          <body className={`${inter.variable} font-sans antialiased text-foreground bg-background`}>
            <ServiceWorkerRegistration />
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
