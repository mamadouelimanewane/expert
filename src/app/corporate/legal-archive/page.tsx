"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Database, Upload, FileText, CheckCircle2, Search, Link as LinkIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Archive {
  id: string;
  docName: string;
  author: string;
  date: string;
  hash: string;
  sig: string;
}

export default function LegalArchivePage() {
  const [archives, setArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [newArchive, setNewArchive] = useState<Archive | null>(null);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadArchives = () => {
    fetch("/api/legal-archive")
      .then(res => res.json())
      .then(data => setArchives(data.archives || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadArchives(); }, []);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnchoring(true);
    setNewArchive(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/legal-archive", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok && data.success) {
        const formatted: Archive = {
          id: data.record.id,
          docName: data.record.documentName,
          author: data.record.author,
          date: new Date(data.record.timestamp).toLocaleDateString('fr-FR'),
          hash: data.record.documentHash,
          sig: data.record.signature,
        };
        setNewArchive(formatted);
        loadArchives();
      }
    } catch (error) {
      console.error("Archive error:", error);
    } finally {
      setIsAnchoring(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const filteredArchives = archives.filter(a =>
    a.docName.toLowerCase().includes(search.toLowerCase()) || a.hash.includes(search)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Database className="w-6 h-6 text-indigo-500" /> Archivage Légal (Empreinte d'Intégrité)
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Hash SHA-256 réel + horodatage, tracé dans le journal d'audit du cabinet</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Upload & Anchor */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl">
            <h3 className="text-lg font-black text-white mb-6">Nouvel Ancrage</h3>
            
            <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.xml" onChange={handleFileSelected} />
            <div
              onClick={!isAnchoring ? () => fileInputRef.current?.click() : undefined}
              className={cn(
                "border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-colors",
                isAnchoring
                  ? "border-indigo-500/50 bg-indigo-500/10 cursor-not-allowed"
                  : "border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/50 cursor-pointer"
              )}
            >
              {isAnchoring ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
                  <p className="text-sm font-bold text-white mb-1">Calcul de l'empreinte SHA-256...</p>
                  <p className="text-xs text-slate-400">Enregistrement dans le journal d'audit</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-10 h-10 text-slate-500 mb-4" />
                  <p className="text-sm font-bold text-white mb-1">Cliquez pour choisir le document finalisé</p>
                  <p className="text-xs text-slate-400">PDF, XML</p>
                </div>
              )}
            </div>

            <AnimatePresence>
              {newArchive && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-sm font-bold text-emerald-400">Empreinte Enregistrée</h4>
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">ID Transaction</p>
                  <p className="text-xs font-mono text-white mb-3">{newArchive.id}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Hash SHA-256</p>
                  <p className="text-xs font-mono text-white truncate">{newArchive.hash}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="bg-slate-900/40 border border-indigo-500/20 rounded-[32px] p-6 backdrop-blur-xl shadow-2xl flex items-start gap-4">
            <ShieldCheck className="w-8 h-8 text-indigo-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white mb-2">Ce que garantit cette empreinte</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Le hash SHA-256 et l'horodatage sont calculés sur le contenu réel du fichier et tracés dans le journal d'audit interne du cabinet. Ceci permet de détecter une modification ultérieure, mais ne constitue <strong>pas</strong> un ancrage blockchain ni une preuve opposable aux tiers/à l'administration fiscale au sens légal — aucun réseau distribué ni tiers de confiance externe n'est utilisé.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Archive Register */}
        <div className="lg:col-span-8">
          <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-white">Registre des Preuves</h3>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher par nom ou hash..."
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Document</th>
                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Auteur & Date</th>
                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Empreinte (Hash)</th>
                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Preuve</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {!loading && filteredArchives.length === 0 && (
                    <tr><td colSpan={4} className="py-10 text-center text-sm text-slate-500">Aucun document archivé pour l'instant.</td></tr>
                  )}
                  {filteredArchives.map((arc, i) => (
                    <motion.tr 
                      key={arc.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-bold text-white">{arc.docName}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <p className="text-sm text-slate-300">{arc.author}</p>
                        <p className="text-xs text-slate-500">{arc.date}</p>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                          <span className="text-xs font-mono text-slate-400 w-32 truncate" title={arc.hash}>{arc.hash}</span>
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 justify-end w-fit ml-auto border border-white/5">
                          <LinkIcon className="w-3 h-3" /> Certificat
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
