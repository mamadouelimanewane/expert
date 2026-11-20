"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const demoUnavailable = searchParams.get("demo") === "1";
    const subscribed    = searchParams.get("subscribed") === "1";
    const refPaiement   = searchParams.get("ref") || "";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [honeypot, setHoneypot] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
            password,
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

                {demoUnavailable && (
                    <div role="status" style={{ background: "#fff7ed", border: "1px solid #fdba74", color: "#9a3412", borderRadius: "10px", padding: "0.75rem 1rem", marginBottom: "1.25rem", fontSize: "0.875rem" }}>
                        La démo est suspendue pendant la sécurisation des espaces cabinets. Aucun compte réel ne sera utilisé pour une démonstration.
                    </div>
                )}

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
                        <p style={{ fontWeight: 700, color: "#065f46", margin: "0 0 0.25rem" }}>Retour de paiement reçu</p>
                        <p style={{ fontSize: "0.8rem", color: "#059669", margin: 0 }}>
                            Le fournisseur de paiement nous a redirigés ici. Le statut de votre abonnement doit être confirmé par le serveur avant son activation.
                            {refPaiement && <span style={{ display: "block", opacity: 0.7, marginTop: "0.25rem" }}>Réf : {refPaiement}</span>}
                        </p>
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
                                placeholder="••••••••••••"
                                required
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
                    <Link href="/" style={{ fontSize: "0.8rem", color: "#006B3F", textDecoration: "none", fontWeight: 600 }}>
                        ← Retour à l'accueil Cabinet 360 SaaS
                    </Link>
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
