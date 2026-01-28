"use client";

import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface ResponsivePageHeaderProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    actions?: ReactNode;
}

export function ResponsivePageHeader({
    title,
    description,
    icon: Icon,
    actions
}: ResponsivePageHeaderProps) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
                {Icon && (
                    <div className="hidden sm:flex w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-slate-400 mt-2 text-sm sm:text-base">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            {actions && (
                <div className="flex flex-col sm:flex-row gap-3">
                    {actions}
                </div>
            )}
        </div>
    );
}
