"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, Loader2, Eye, EyeOff, ShieldCheck, Zap, Play } from "lucide-react";

// Identifiants du dossier de démonstration (compte EXPERT démo)
const DEMO_EMAIL = "demo@cabinet360.com";
const DEMO_PASSWORD = "DemoTrial2026!";

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const demoMode      = searchParams.get("demo")       === "1";
    const subscribed    = searchParams.get("subscribed") === "1";
    const refPaiement   = searchParams.get("ref") || "";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [honeypot, setHoneypot] = useState("");
    const [error, setError] = useState("");
    const MODE_TEST = process.env.NEXT_PUBLIC_MODE_TEST_CABINET === "true";
    const [isLoading, setIsLoading] = useState(false);
    const [isDemoLoading, setIsDemoLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Si ?demo=1 dans l'URL : connexion automatique au compte démo au chargement
    useEffect(() => {
        if (demoMode) {
            handleDemoLogin();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDemoLogin = async () => {
        setIsDemoLoading(true);
        setError("");
        const res = await signIn("credentials", {
            redirect: false,
            email: DEMO_EMAIL,
            password: DEMO_PASSWORD,
            _hp: "",
        });
        if (res?.ok) {
            router.push("/bi");
        } else {
            // Le compte démo n'existe pas encore en base : rediriger vers /login normal avec message
            setIsDemoLoading(false);
            setEmail(DEMO_EMAIL);
            setError(
                "Le compte démo n'est pas encore configuré sur cette instance. Contactez l'équipe Cabinet 360 ou connectez-vous avec vos identifiants."
            );
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (honeypot) {
            await new Promise((r) => setTimeout(r, 1200));
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        const res = await signIn("credentials", {
            redirect: false,
            email,
            password: password || (MODE_TEST ? "-" : ""),
            _hp: honeypot,
        });

        if (res?.error) {
            setError(
                res.error === "CredentialsSignin"
                    ? "Email ou mot de passe incorrect."
                    : "Connexion impossible pour le moment. Réessayez dans un instant."
            );
            setIsLoading(false);
        } else {
            router.push("/bi");
        }
    };

    // Écran de chargement pendant la connexion démo automatique
    if (isDemoLoading || demoMode) {
        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                background: "linear-gradient(135deg, #006B3F 0%, #009639 100%)",
                gap: "1.5rem",
                color: "white",
                textAlign: "center",
                padding: "2rem",
            }}>
                <div style={{
                    width: "64px", height: "64px", borderRadius: "16px",
                    background: "rgba(255,255,255,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "2rem",
                }}>
                    🚀
                </div>
                <div>
                    <p style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 0.5rem" }}>
                        Chargement de la démo…
                    </p>
                    <p style={{ opacity: 0.8, margin: 0, fontSize: "0.95rem" }}>
                        Dossier <strong>SARL Diallo & Fils</strong> • Bilan SYSCOHADA • 124 Bulletins de Paie • Flux Wave
                    </p>
                </div>
                <Loader2 style={{ width: "32px", height: "32px", animation: "spin 1s linear infinite" }} />
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            background: "linear-gradient(135deg, #006B3F 0%, #009639 100%)",
            padding: "1rem",
        }}>
            <div style={{
                background: "white",
                borderRadius: "20px",
                padding: "2.5rem",
                boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
                width: "100%",
                maxWidth: "420px",
            }}>
                {/* En-tête marque */}
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <p role="heading" aria-level={1} style={{ fontSize: "2rem", fontWeight: 700, color: "#006B3F", marginBottom: "0.25rem", lineHeight: 1.2 }}>
                        CABINET<span style={{ color: "#F29400" }}>360</span>
                    </p>
                    <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.875rem" }}>Gestion Expert-Comptable OHADA</p>
                </div>

                {/* Bouton Démo 1 Clic */}
                <button
                    type="button"
                    onClick={handleDemoLogin}
                    disabled={isDemoLoading}
                    style={{
                        width: "100%",
                        padding: "0.9rem 1rem",
                        marginBottom: "1.5rem",
                        background: "linear-gradient(135deg, #F29400 0%, #f59e0b 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.6rem",
                        boxShadow: "0 4px 14px rgba(242,148,0,0.4)",
                        transition: "all 0.2s",
                    }}
                >
                    <Play size={16} style={{ fill: "white" }} />
                    🚀 Démo 1 Clic — SARL Diallo & Fils
                </button>

                {/* Séparateur */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                    <hr style={{ flex: 1, border: "none", borderTop: "1px solid #e2e8f0" }} />
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500, whiteSpace: "nowrap" }}>ou connectez-vous avec votre compte</span>
                    <hr style={{ flex: 1, border: "none", borderTop: "1px solid #e2e8f0" }} />
                </div>

                {/* Bannière succès abonnement Wave */}
                {subscribed && (
                    <div style={{
                        background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
                        border: "1px solid #34d399",
                        borderRadius: "12px",
                        padding: "1rem",
                        marginBottom: "1.25rem",
                        textAlign: "center",
                    }}>
                        <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>🎉</div>
                        <p style={{ fontWeight: 700, color: "#065f46", margin: "0 0 0.25rem" }}>Paiement confirmé !</p>
                        <p style={{ fontSize: "0.8rem", color: "#059669", margin: 0 }}>
                            Votre abonnement Cabinet 360 est actif. Connectez-vous pour commencer.
                            {refPaiement && <span style={{ display: "block", opacity: 0.7, marginTop: "0.25rem" }}>Réf : {refPaiement}</span>}
                        </p>
                    </div>
                )}

                {MODE_TEST && (
                    <div role="status" style={{ background: "#FDF0D8", border: "1px solid #F29400", color: "#7a4a00", borderRadius: "10px", padding: "0.75rem 1rem", marginBottom: "1.25rem", fontSize: "0.875rem" }}>
                        <strong>Mode test cabinet.</strong> Saisissez votre e-mail ; le mot de passe n&apos;est pas vérifié pendant la période d&apos;essai.
                    </div>
                )}

                {error && (
                    <div style={{
                        background: "#ffebee",
                        color: "#c62828",
                        padding: "0.9rem 1rem",
                        borderRadius: "10px",
                        marginBottom: "1.25rem",
                        fontSize: "0.875rem",
                        textAlign: "center",
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    {/* Honeypot invisible */}
                    <div aria-hidden="true" style={{ position: "absolute", opacity: 0, pointerEvents: "none", height: 0, overflow: "hidden" }}>
                        <label htmlFor="phone_number">Téléphone</label>
                        <input
                            id="phone_number"
                            name="phone_number"
                            type="text"
                            tabIndex={-1}
                            autoComplete="off"
                            value={honeypot}
                            onChange={(e) => setHoneypot(e.target.value)}
                        />
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: "1.25rem" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>
                            <Mail size={16} style={{ color: "#006B3F" }} />
                            Adresse e-mail
                        </label>
                        <input
                            type="email"
                            name="email"
                            autoComplete="username"
                            autoFocus
                            inputMode="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="vous@cabinet.sn"
                            required
                            style={{ width: "100%", padding: "0.85rem", border: "1px solid #cbd5e1", borderRadius: "10px", fontSize: "1rem", boxSizing: "border-box" }}
                        />
                    </div>

                    {/* Mot de passe */}
                    <div style={{ marginBottom: "1.75rem" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>
                            <Lock size={16} style={{ color: "#006B3F" }} />
                            Mot de passe
                        </label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={MODE_TEST ? "non vérifié pendant les tests" : "••••••••"}
                                required={!MODE_TEST}
                                style={{ width: "100%", padding: "0.85rem 3rem 0.85rem 0.85rem", border: "1px solid #cbd5e1", borderRadius: "10px", fontSize: "1rem", boxSizing: "border-box" }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                aria-pressed={showPassword}
                                style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", background: "none", border: 0, padding: "0.5rem", color: "#64748b", cursor: "pointer", display: "flex" }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Bouton connexion */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: "100%",
                            padding: "0.9rem",
                            minHeight: "48px",
                            fontSize: "1rem",
                            background: "#006B3F",
                            color: "white",
                            border: "none",
                            borderRadius: "10px",
                            fontWeight: 600,
                            cursor: isLoading ? "not-allowed" : "pointer",
                            opacity: isLoading ? 0.6 : 1,
                            transition: "all 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                        }}
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {isLoading ? "Connexion…" : "Se connecter"}
                    </button>
                </form>

                {/* Lien vers landing */}
                <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                    <a href="/" style={{ fontSize: "0.8rem", color: "#006B3F", textDecoration: "none", fontWeight: 600 }}>
                        ← Retour à l'accueil Cabinet 360 SaaS
                    </a>
                </div>

                {/* Badge sécurité */}
                <div style={{ marginTop: "1.25rem", fontSize: "0.75rem", color: "#94a3b8", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                    <ShieldCheck size={13} style={{ color: "#006B3F", flexShrink: 0 }} />
                    <span>Connexion chiffrée TLS • Accès réservé aux collaborateurs du cabinet</span>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "linear-gradient(135deg, #006B3F 0%, #009639 100%)" }}>
                <Loader2 style={{ width: "32px", height: "32px", color: "white", animation: "spin 1s linear infinite" }} />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
