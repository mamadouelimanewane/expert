import type { NextConfig } from "next";

const securityHeaders = [
  // Empêche l'indexation et le suivi par les moteurs
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" },
  // Empêche le clickjacking (chargement en iframe)
  { key: "X-Frame-Options", value: "DENY" },
  // Empêche le MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Politique de référent stricte
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Désactive les fonctionnalités navigateur inutiles
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // Force HTTPS pendant 1 an
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Content Security Policy : restreindre les sources de scripts et ressources
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval requis par Next.js dev
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      // Déclarés explicitement : sans `worker-src`, tous les navigateurs
      // n'appliquent pas le repli sur `default-src` de la même façon et
      // peuvent refuser l'enregistrement du service worker.
      "worker-src 'self'",
      "manifest-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        // Appliquer les headers de sécurité à toutes les routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
