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
    const [step, setStep] = useState<"method" | "processing" | "success">("method");
    const [selectedMethod, setSelectedMethod] = useState<"wave" | "om" | "mtn" | null>(null);

    if (!isOpen) return null;

    const handlePay = () => {
        setStep("processing");
        setTimeout(() => {
            setStep("success");
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {step === "method" && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-white">Règlement Facture</h3>
                            <p className="text-sm text-slate-400 mt-1">Réf: {invoiceId}</p>
                            <div className="mt-4 text-3xl font-bold text-white tracking-tight">
                                {amount} <span className="text-lg text-slate-500">FCFA</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Choisir le moyen de paiement</p>

                            <button
                                onClick={() => setSelectedMethod("wave")}
                                className={cn(
                                    "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                                    selectedMethod === "wave"
                                        ? "bg-blue-500/10 border-blue-500 ring-1 ring-blue-500/50"
                                        : "bg-slate-800 border-slate-700 hover:border-slate-500"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-[#1e2329] flex items-center justify-center p-1">
                                        {/* Placeholder for Wave Logo */}
                                        <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">W</div>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-white">Wave</p>
                                        <p className="text-xs text-slate-400">1% frais</p>
                                    </div>
                                </div>
                                {selectedMethod === "wave" && <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-slate-900" />}
                            </button>

                            <button
                                onClick={() => setSelectedMethod("om")}
                                className={cn(
                                    "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                                    selectedMethod === "om"
                                        ? "bg-orange-500/10 border-orange-500 ring-1 ring-orange-500/50"
                                        : "bg-slate-800 border-slate-700 hover:border-slate-500"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-[#1e2329] flex items-center justify-center p-1">
                                        <div className="w-full h-full bg-orange-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">OM</div>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-white">Orange Money</p>
                                        <p className="text-xs text-slate-400">0.8% frais</p>
                                    </div>
                                </div>
                                {selectedMethod === "om" && <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-slate-900" />}
                            </button>
                        </div>

                        <button
                            disabled={!selectedMethod}
                            onClick={handlePay}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/25 mt-4"
                        >
                            Payer maintenant
                        </button>
                    </div>
                )}

                {step === "processing" && (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-indigo-500 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Smartphone className="w-8 h-8 text-slate-600" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-white">En attente de validation</h3>
                            <p className="text-slate-400 mt-2 max-w-xs mx-auto">
                                Veuillez valider le paiement sur votre mobile via le code
                                <span className="font-mono bg-slate-800 px-1 rounded text-white mx-1">#144#</span>
                            </p>
                        </div>
                    </div>
                )}

                {step === "success" && (
                    <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">Paiement Réussi !</h3>
                            <p className="text-slate-400 mt-2">La facture {invoiceId} a été soldée.</p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 w-full">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-500">Montant payé</span>
                                <span className="text-white font-mono">{amount} FCFA</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Transaction ID</span>
                                <span className="text-white font-mono text-xs">TX-8829-XJ</span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors border border-slate-700"
                        >
                            Fermer
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
