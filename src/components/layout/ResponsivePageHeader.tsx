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
        <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex items-start gap-2.5 sm:gap-3">
                {Icon && (
                    <div className="flex w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-emerald-600 items-center justify-center shadow-md shadow-primary/20 shrink-0 mt-0.5">
                        <Icon className="w-4.5 h-4.5 sm:w-6 sm:h-6 text-white" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground dark:text-white tracking-tight leading-snug">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-muted-foreground mt-1 text-xs sm:text-sm lg:text-base leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            {actions && (
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
                    {actions}
                </div>
            )}
        </div>
    );
}
