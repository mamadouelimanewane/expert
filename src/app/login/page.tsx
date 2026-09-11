"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [honeypot, setHoneypot] = useState(""); // doit rester vide — bots remplissent
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Honeypot : un vrai utilisateur ne remplit jamais ce champ
        if (honeypot) {
            // Simuler un délai et un échec silencieux pour ne pas alerter le bot
            await new Promise((r) => setTimeout(r, 1200));
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
            _hp: honeypot, // transmis au serveur pour double vérification
        });

        if (res?.error) {
            // NextAuth renvoie un code technique ("CredentialsSignin") : on
            // l'explique sans préciser lequel des deux champs est faux.
            setError(
                res.error === "CredentialsSignin"
                    ? "Email ou mot de passe incorrect."
                    : "Connexion impossible pour le moment. Réessayez dans un instant."
            );
            setIsLoading(false);
        } else {
            // Success: Redirection will be handled by middleware or force redirect
            router.push("/bi");
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #006B3F 0%, #009639 100%)',
        }}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '3rem',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                width: '100%',
                maxWidth: '400px',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    {/* Un <h1> serait écrasé par la règle globale .light h1 { color: var(--foreground) !important } —
                        cette page a son propre fond et sa propre identité de marque, hors thème de l'app. */}
                    <p role="heading" aria-level={1} style={{ fontSize: '2rem', fontWeight: 700, color: '#006B3F', marginBottom: '0.5rem', lineHeight: 1.2 }}>
                        CABINET<span style={{ color: '#F29400' }}>360</span>
                    </p>
                    <p style={{ color: '#94a3b8' }}>Gestion Expert-Comptable OHADA</p>
                </div>

                {error && (
                    <div style={{
                        background: '#ffebee',
                        color: '#c62828',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem',
                        textAlign: 'center',
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    {/* Honeypot — invisible pour les humains, attrayant pour les bots */}
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

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', fontWeight: 500 }}>
                            <Mail size={18} style={{ color: '#006B3F' }} />
                            Email
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
                            style={{ width: '100%', padding: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '1rem' }}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', fontWeight: 500 }}>
                            <Lock size={18} style={{ color: '#006B3F' }} />
                            Mot de passe
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{ width: '100%', padding: '0.85rem 3rem 0.85rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '1rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                aria-pressed={showPassword}
                                style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, padding: '0.5rem', color: '#64748b', cursor: 'pointer', display: 'flex' }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '0.9rem',
                            minHeight: '48px',
                            fontSize: '1rem',
                            background: '#006B3F',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.6 : 1,
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {isLoading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#64748b', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                    <ShieldCheck size={14} style={{ color: '#006B3F', flexShrink: 0 }} />
                    <p style={{ margin: 0 }}>Connexion chiffrée (TLS). Accès réservé aux collaborateurs du cabinet.</p>
                </div>
            </div>
        </div>
    );
}
