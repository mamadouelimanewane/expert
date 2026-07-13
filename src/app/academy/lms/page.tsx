"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Award, Clock, CheckCircle2, PlayCircle, BookMarked, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LMSPage() {
  const [data, setData] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/academy/progress")
      .then(res => res.json())
      .then(d => setData(d));
    fetch("/api/training/certificates")
      .then(res => res.json())
      .then(d => setCertificates(d.certificates ?? []));
  }, []);

  if (!data) return <div className="p-8 text-white">Chargement de l'Académie...</div>;

  const pctHours = Math.min(100, Math.round((data.user.completedHours / data.user.requiredHours) * 100));

  return (
    <div className="space-y-8 animate-in fade-in duration-700 p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center bg-slate-900/40 p-8 rounded-[32px] border border-white/5 backdrop-blur-xl shadow-2xl">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-indigo-500" /> Cabinet 360 Academy
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Formation continue et maintien des compétences (DPC)</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Objectif {data.user.period}</p>
          <div className="flex items-center gap-4">
            <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pctHours}%` }}></div>
            </div>
            <p className="text-sm font-bold text-white">{data.user.completedHours}h / {data.user.requiredHours}h</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" /> Mes Formations
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            {data.courses.map((course: any, idx: number) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={course.id} 
                className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-6 group"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border",
                    course.status === 'completed' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                    course.status === 'in_progress' ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-500" :
                    "bg-slate-800/50 border-slate-700 text-slate-500"
                  )}>
                    {course.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : 
                     course.status === 'in_progress' ? <PlayCircle className="w-6 h-6" /> : 
                     <BookMarked className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md text-[9px] font-black uppercase tracking-widest mb-2 inline-block">
                      {course.category}
                    </span>
                    <h4 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">{course.title}</h4>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}h certifiées</span>
                      {course.status === 'in_progress' && (
                        <div className="flex items-center gap-2 flex-1 max-w-[150px]">
                          <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: `${course.progress}%` }}></div>
                          </div>
                          <span className="text-[10px] text-indigo-400 font-bold">{course.progress}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="sm:border-l border-white/5 sm:pl-6 flex items-center justify-end shrink-0">
                  <button className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    course.status === 'completed' ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" :
                    course.status === 'in_progress' ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20" :
                    "bg-slate-800 text-white hover:bg-slate-700"
                  )}>
                    {course.status === 'completed' ? "Revoir" :
                     course.status === 'in_progress' ? "Continuer" : "Commencer"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Mes Certificats
            </h3>
            
            {certificates.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Aucun certificat obtenu pour l'instant.</p>
            ) : (
              <div className="space-y-4">
                {certificates.map((c) => (
                  <div key={c.id} className="p-4 bg-slate-800/30 rounded-2xl border border-white/5 flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{c.title}</p>
                      <p className="text-[10px] text-slate-500">Obtenu le {new Date(c.issueDate).toLocaleDateString("fr-FR")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <a href="/training/certificates" className="block text-center w-full mt-6 py-3 border border-dashed border-white/20 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">
              Voir tout l'historique
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
