"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PenTool, FileText, CheckCircle2, ShieldCheck, Download, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignaturePad } from "@/components/signature/SignaturePad";

// ─────────────────────────────────────────────────────────────────────────────
// Cette page listait des Missions et faisait signer un texte générique
// ("Il a été convenu ce qui suit : ...") au nom d'un cabinet fictif
// "GANTIC360 EXPERT" — incohérent avec la marque utilisée partout ailleurs
// (Cabinet 360) — au lieu du vrai contenu de la lettre de mission
// (modèle EngagementLetter : périmètre, honoraires, référence, signataire
// désigné) déjà saisi via /lettres-mission/new. Elle source désormais
// /api/engagement-letters et affiche le vrai contenu de la lettre.
// ─────────────────────────────────────────────────────────────────────────────

interface LetterDoc {
  id: string;
  client: string;
  reference: string;
  scope: string;
  fees: number | null;
  signatoryName: string | null;
  status: string;
}

export default function SignaturePage() {
  const [docs, setDocs] = useState<LetterDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<LetterDoc | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [certificate, setCertificate] = useState<any>(null);

  useEffect(() => {
    fetch("/api/engagement-letters")
      .then(res => res.json())
      .then(data => {
        const letters: LetterDoc[] = (data.letters || []).map((l: any) => ({
          id: l.id,
          client: l.client?.companyName || `${l.client?.firstName ?? ""} ${l.client?.lastName ?? ""}`.trim() || "—",
          reference: l.reference,
          scope: l.scope,
          fees: l.fees ?? null,
          signatoryName: l.signatoryName ?? null,
          status: l.status === "SIGNEE" ? "Signé" : l.status === "EXPIREE" ? "Archivé" : "En attente",
        }));
        setDocs(letters);
        setSelectedDoc(letters[0] || null);
        setLoading(false);
      });
  }, []);

  const handleValidateSignature = async () => {
    if (!signatureData || !selectedDoc) return;
    setIsSigning(true);

    try {
      const res = await fetch("/api/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: selectedDoc.id, signatureData })
      });
      const data = await res.json();

      if (data.success) {
        setCertificate(data);
        // L'appel ci-dessus ne fait que tracer l'empreinte d'intégrité (audit log) ;
        // sans cette mise à jour, la lettre restait indéfiniment "en attente" dans
        // /api/engagement-letters malgré la signature validée.
        await fetch("/api/engagement-letters", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedDoc.id, status: "SIGNEE", signatureHash: data.certificateHash }),
        });
        setDocs(prev => prev.map(d => d.id === selectedDoc.id ? { ...d, status: "Signé" } : d));
        setSelectedDoc(prev => prev ? { ...prev, status: "Signé" } : prev);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSigning(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400">Chargement des lettres de mission…</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="page-title flex items-center gap-3">
            <PenTool className="w-6 h-6 text-primary" /> E-Signature Intégrée
          </h2>
          <p className="page-subtitle">Signez numériquement vos lettres de mission (empreinte d'intégrité, pas une signature qualifiée)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left List */}
        <div className="lg:col-span-5 space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/40 border border-white/5 rounded-[32px] p-6 backdrop-blur-xl shadow-2xl">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Documents</h3>
            <div className="space-y-3">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoc(doc);
                    setCertificate(null);
                    setSignatureData(null);
                  }}
                  className={cn(
                    "p-4 rounded-2xl border transition-all cursor-pointer group",
                    selectedDoc?.id === doc.id
                      ? "bg-primary/10 border-primary/30"
                      : "bg-slate-800/30 border-white/5 hover:bg-slate-800/50"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className={cn("text-sm font-bold", selectedDoc?.id === doc.id ? "text-primary" : "text-white")}>{doc.client}</p>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                      doc.status === 'En attente' ? "bg-amber-500/10 text-amber-400" :
                      doc.status === 'Signé' ? "bg-emerald-500/10 text-emerald-400" :
                      "bg-slate-500/10 text-slate-400"
                    )}>
                      {doc.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{doc.reference}</p>
                  <p className="text-[10px] font-bold text-slate-500 mt-2">{doc.id}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Signature Area */}
        <div className="lg:col-span-7">
          {!selectedDoc ? (
            <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 min-h-[600px] flex items-center justify-center text-slate-500 text-sm">
              Aucune lettre de mission disponible. Créez-en une depuis <a href="/lettres-mission/new" className="text-primary underline ml-1">Nouvelle lettre de mission</a>.
            </div>
          ) : (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={selectedDoc.id} className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl min-h-[600px] flex flex-col">

            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
              <div>
                <h3 className="text-xl font-black text-white">{selectedDoc.reference}</h3>
                <p className="text-sm font-medium text-slate-400 mt-1">{selectedDoc.client} • {selectedDoc.id}</p>
              </div>
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            {selectedDoc.status !== 'En attente' ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-black text-white mb-2">Document Signé</h4>
                <p className="text-slate-400 text-sm mb-8 text-center max-w-md">Ce document a déjà été signé. Une empreinte SHA-256 et un horodatage garantissent son intégrité.</p>
                <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-colors border border-white/5 flex items-center gap-2">
                  <Download className="w-4 h-4" /> Télécharger le PDF
                </button>
              </div>
            ) : certificate ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1">
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    <div>
                      <h4 className="text-lg font-black text-emerald-400">Signature Validée</h4>
                      <p className="text-xs font-bold text-emerald-400/70 uppercase tracking-widest">Empreinte d'intégrité (pas une signature qualifiée)</p>
                    </div>
                  </div>
                  <div className="space-y-3 bg-slate-950/50 p-4 rounded-2xl">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Empreinte SHA-256</p>
                      <p className="text-xs font-mono text-slate-300 break-all">{certificate.certificateHash}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Horodatage</p>
                      <p className="text-xs font-medium text-slate-300">{new Date(certificate.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button className="px-6 py-3 bg-primary hover:brightness-110 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" /> Télécharger Copie
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="bg-slate-100 p-8 rounded-2xl mb-8 flex-1 text-slate-800 overflow-y-auto max-h-[300px]">
                  <h4 className="font-bold text-lg mb-4 text-center">LETTRE DE MISSION — {selectedDoc.reference}</h4>
                  <p className="text-sm mb-4">Entre les soussignés :</p>
                  <p className="text-sm mb-4">Le cabinet, représenté par {selectedDoc.signatoryName || "[signataire à compléter]"}, d&apos;une part,</p>
                  <p className="text-sm mb-4">Et <strong>{selectedDoc.client}</strong>, d&apos;autre part.</p>
                  <p className="text-sm font-bold mb-2">Objet de la mission :</p>
                  <p className="text-sm mb-4 whitespace-pre-wrap">{selectedDoc.scope || "[à compléter]"}</p>
                  {selectedDoc.fees != null && (
                    <p className="text-sm mb-4">Honoraires convenus : <strong>{selectedDoc.fees.toLocaleString("fr-FR")} FCFA</strong>.</p>
                  )}
                </div>
                
                <div className="mb-6">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Zone de Signature</label>
                  <SignaturePad onSign={(data) => setSignatureData(data)} />
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleValidateSignature}
                    disabled={!signatureData || isSigning}
                    className="px-8 py-4 bg-primary hover:brightness-110 disabled:bg-primary/50 disabled:cursor-not-allowed text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-3 shadow-xl shadow-primary/30"
                  >
                    {isSigning ? "Validation en cours..." : "Valider la Signature"}
                    {!isSigning && <Check className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
