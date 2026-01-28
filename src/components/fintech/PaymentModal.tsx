import {
    X,
    Smartphone,
    CreditCard,
    CheckCircle,
    QrCode
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface PaymentModalProps {
    invoiceId: string;
    amount: string;
    isOpen: boolean;
    onClose: () => void;
}

export function PaymentModal({ invoiceId, amount, isOpen, onClose }: PaymentModalProps) {
    const [step, setStep] = useState<"method" | "processing" | "success" | "error">("method");
    const [selectedMethod, setSelectedMethod] = useState<"WAVE" | "ORANGE_MONEY" | "MTN_MOMO" | null>(null);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handlePay = async () => {
        if (!selectedMethod) return;

        setIsSubmitting(true);
        setStep("processing");

        try {
            const response = await fetch("/api/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    invoiceId,
                    amount,
                    provider: selectedMethod,
                    phoneNumber
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Simulation d'une attente de validation mobile (push USSD)
                setTimeout(() => {
                    setStep("success");
                    setIsSubmitting(false);
                }, 4000);
            } else {
                setStep("error");
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Payment error:", error);
            setStep("error");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-white/10 rounded-[32px] w-full max-w-md p-8 relative shadow-2xl overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/20 blur-[100px]" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/10 blur-[100px]" />

                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 text-slate-500 hover:text-white transition-all bg-slate-800/50 p-2 rounded-full border border-white/5"
                >
                    <X className="w-4 h-4" />
                </button>

                {step === "method" && (
                    <div className="space-y-8 relative z-10">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/20 shadow-xl">
                                <QrCode className="w-8 h-8 text-indigo-400" />
                            </div>
                            <h3 className="text-2xl font-black text-white tracking-tight">Règlement Facture</h3>
                            <p className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-[0.2em]">{invoiceId}</p>
                            <div className="mt-6 text-4xl font-black text-white tracking-tighter">
                                {amount} <span className="text-sm font-bold text-slate-500 uppercase">FCFA</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Moyen de paiement</label>

                            <button
                                onClick={() => setSelectedMethod("WAVE")}
                                className={cn(
                                    "w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300",
                                    selectedMethod === "WAVE"
                                        ? "bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/20"
                                        : "bg-slate-800/50 border-white/5 hover:border-blue-500/30"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                        <span className="font-black text-white text-xl italic">W</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-white uppercase text-[11px] tracking-widest">Wave</p>
                                        <p className="text-[10px] font-bold text-slate-400">Paiement sans frais</p>
                                    </div>
                                </div>
                                {selectedMethod === "WAVE" && <div className="w-5 h-5 rounded-full bg-blue-500 border-4 border-slate-900 shadow-xl" />}
                            </button>

                            <button
                                onClick={() => setSelectedMethod("ORANGE_MONEY")}
                                className={cn(
                                    "w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300",
                                    selectedMethod === "ORANGE_MONEY"
                                        ? "bg-orange-600/10 border-orange-500 shadow-lg shadow-orange-500/20"
                                        : "bg-slate-800/50 border-white/5 hover:border-orange-500/30"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg">
                                        <span className="font-black text-white text-base">OM</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-white uppercase text-[11px] tracking-widest">Orange Money</p>
                                        <p className="text-[10px] font-bold text-slate-400">Validation via #144#</p>
                                    </div>
                                </div>
                                {selectedMethod === "ORANGE_MONEY" && <div className="w-5 h-5 rounded-full bg-orange-500 border-4 border-slate-900 shadow-xl" />}
                            </button>

                            <button
                                onClick={() => setSelectedMethod("MTN_MOMO")}
                                className={cn(
                                    "w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300",
                                    selectedMethod === "MTN_MOMO"
                                        ? "bg-yellow-600/10 border-yellow-500 shadow-lg shadow-yellow-500/20"
                                        : "bg-slate-800/50 border-white/5 hover:border-yellow-500/30"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center shadow-lg">
                                        <span className="font-black text-slate-900 text-base">MTN</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-white uppercase text-[11px] tracking-widest">MTN MOMO</p>
                                        <p className="text-[10px] font-bold text-slate-400">Validation via USSD</p>
                                    </div>
                                </div>
                                {selectedMethod === "MTN_MOMO" && <div className="w-5 h-5 rounded-full bg-yellow-500 border-4 border-slate-900 shadow-xl" />}
                            </button>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Numéro Mobile</label>
                            <input
                                type="tel"
                                placeholder="Ex: 07 00 00 00 00"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full bg-slate-800/50 border-2 border-white/5 rounded-2xl p-4 text-white font-mono focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                            />
                        </div>

                        <button
                            disabled={!selectedMethod || !phoneNumber || isSubmitting}
                            onClick={handlePay}
                            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:grayscale text-white rounded-[20px] font-black uppercase tracking-widest text-xs transition-all shadow-2xl shadow-indigo-600/30 active:scale-95"
                        >
                            {isSubmitting ? "Initialisation..." : "Valider le paiement"}
                        </button>
                    </div>
                )}

                {step === "processing" && (
                    <div className="py-16 flex flex-col items-center justify-center text-center space-y-8 relative z-10">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full border-[6px] border-white/5 border-t-indigo-500 animate-[spin_1s_linear_infinite] shadow-[0_0_30px_rgba(99,102,241,0.2)]" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Smartphone className="w-12 h-12 text-indigo-400 animate-pulse" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight">Validation Mobile</h3>
                            <p className="text-slate-400 mt-3 max-w-xs mx-auto text-sm font-medium leading-relaxed">
                                Veuillez confirmer la transaction sur votre téléphone. Un message de validation vous a été envoyé.
                            </p>
                        </div>
                    </div>
                )}

                {step === "success" && (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-8 relative z-10">
                        <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-4 border-emerald-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                            <CheckCircle className="w-12 h-12 text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white tracking-tight">Succès !</h3>
                            <p className="text-slate-400 mt-2 font-medium">La facture {invoiceId} a été soldée.</p>
                        </div>
                        <div className="bg-white/5 p-6 rounded-[28px] border border-white/5 w-full shadow-inner">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Montant réglé</span>
                                <span className="text-xl font-black text-white">{amount} FCFA</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Référence</span>
                                <span className="text-xs font-mono font-bold text-indigo-400">TX-{Math.random().toString(36).substring(2, 9).toUpperCase()}</span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full py-5 bg-white/5 hover:bg-white/10 text-white rounded-[20px] font-black uppercase tracking-widest text-xs transition-all border border-white/10"
                        >
                            Fermer
                        </button>
                    </div>
                )}

                {step === "error" && (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-8 relative z-10">
                        <div className="w-24 h-24 rounded-full bg-rose-500/10 border-4 border-rose-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(244,63,94,0.2)]">
                            <X className="w-12 h-12 text-rose-500" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white tracking-tight">Échec</h3>
                            <p className="text-slate-400 mt-2 font-medium">La transaction a été annulée ou a échoué.</p>
                        </div>
                        <button
                            onClick={() => setStep("method")}
                            className="w-full py-5 bg-rose-600 hover:bg-rose-500 text-white rounded-[20px] font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-rose-600/30"
                        >
                            Réessayer
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
