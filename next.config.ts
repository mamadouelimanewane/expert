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
  // La Content-Security-Policy est posée par le middleware (src/middleware.ts,
  // src/lib/csp.ts) avec un nonce par requête : une politique statique ici
  // ne pourrait autoriser les scripts inline de Next qu'avec 'unsafe-inline'.
];

const nextConfig: NextConfig = {
  // tesseract.js lance un worker_thread depuis un chemin de node_modules :
  // bundlé par Turbopack, ce chemin n'existe plus et la reconnaissance ne
  // rend jamais la main (documents figés en PROCESSING). sharp embarque des
  // binaires natifs. Les deux doivent rester résolus depuis node_modules.
  serverExternalPackages: ["@prisma/client", "prisma", "tesseract.js", "sharp", "pdf-parse", "@napi-rs/canvas", "mongodb"],
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
