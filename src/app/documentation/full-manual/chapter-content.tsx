
import {
    MousePointer2,
    Eye,
    Zap,
    CheckCircle2
} from "lucide-react";

export function ChapterContent({ chapter }: any) {
    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black tracking-widest uppercase border border-indigo-500/20 print:border-black print:text-black">
                        {chapter.label}
                    </span>
                    <div className="h-px flex-1 bg-white/5 print:bg-black/10" />
                </div>
                <div className="flex items-start gap-8 print:block">
                    <div className="p-5 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-2xl shadow-indigo-600/20 shrink-0 print:hidden">
                        <chapter.icon className="w-12 h-12 text-white" />
                    </div>
                    <div className="space-y-3 print:space-y-1">
                        <h2 className="text-5xl font-black text-white tracking-tighter italic print:text-3xl print:text-black">
                            {chapter.title}
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed font-medium print:text-sm print:text-gray-700">
                            {chapter.description}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-12 mt-12 print:gap-8 print:mt-8">
                {chapter.sections.map((section: any, sIdx: number) => (
                    <div key={sIdx} className="space-y-8 print:space-y-4 break-inside-avoid">
                        <h3 className="flex items-center gap-3 text-xl font-black text-white tracking-tight print:text-black print:text-lg">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-indigo-400 print:hidden">
                                <MousePointer2 className="w-4 h-4" />
                            </div>
                            {section.title}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-1 print:gap-4">
                            {section.items.map((item: any, iIdx: number) => (
                                <div key={iIdx} className="group p-8 bg-[#0d1117] border border-white/5 rounded-[40px] hover:border-indigo-500/40 transition-all shadow-2xl relative overflow-hidden print:bg-white print:border-gray-300 print:p-4 print:rounded-xl print:shadow-none">
                                    <div className="space-y-6 relative z-10 print:space-y-2">
                                        <div className="space-y-2">
                                            <h4 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors print:text-black print:text-base">{item.name}</h4>
                                            <div className="h-1 w-12 bg-indigo-600 rounded-full print:bg-black" />
                                        </div>

                                        <div className="space-y-4 print:space-y-2">
                                            <div className="space-y-2">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 print:text-gray-500">
                                                    <Eye className="w-3 h-3" /> Fonctionnalité
                                                </span>
                                                <p className="text-sm text-slate-400 leading-relaxed font-medium italic print:text-black print:not-italic">
                                                    {item.function}
                                                </p>
                                            </div>

                                            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-2 print:bg-gray-100 print:border-gray-200 print:p-2">
                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 print:text-black">
                                                    <CheckCircle2 className="w-3 h-3" /> Résultat Attendu
                                                </span>
                                                <p className="text-xs text-emerald-400/80 font-bold leading-relaxed print:text-black">
                                                    {item.result}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
