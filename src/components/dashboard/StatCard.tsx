import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string;
    trend?: string;
    trendUp?: boolean;
    icon: LucideIcon;
    color?: "indigo" | "cyan" | "purple" | "emerald";
}

export function StatCard({ title, value, trend, trendUp, icon: Icon, color = "indigo" }: StatCardProps) {
    const colorStyles = {
        indigo: "from-indigo-500/20 to-indigo-600/5 text-indigo-400 border-indigo-500/20",
        cyan: "from-cyan-500/20 to-cyan-600/5 text-cyan-400 border-cyan-500/20",
        purple: "from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/20",
        emerald: "from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20",
    };

    return (
        <div className={cn(
            "glass-card p-6 rounded-2xl border relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300",
            colorStyles[color]
        )}>
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1 mt-2 text-xs font-semibold px-2 py-1 rounded-full w-fit bg-slate-800/50",
                            trendUp ? "text-emerald-400" : "text-rose-400"
                        )}>
                            {trendUp ? "↗" : "↘"} {trend}
                        </div>
                    )}
                </div>
                <div className={cn(
                    "p-3 rounded-xl bg-gradient-to-br border border-white/5 shadow-inner",
                    colorStyles[color].replace("text-", "bg-") // Hacky but works for demo background
                )}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>

            {/* Background decoration */}
            <div className={cn(
                "absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-20",
                color === "indigo" && "bg-indigo-500",
                color === "cyan" && "bg-cyan-500",
                color === "purple" && "bg-purple-500",
                color === "emerald" && "bg-emerald-500",
            )} />
        </div>
    );
}
