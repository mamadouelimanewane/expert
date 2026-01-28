"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveCardProps {
    children: ReactNode;
    className?: string;
    noPadding?: boolean;
}

export function ResponsiveCard({ children, className, noPadding }: ResponsiveCardProps) {
    return (
        <div className={cn(
            "glass-card rounded-2xl border border-slate-700/50",
            !noPadding && "p-4 sm:p-6",
            className
        )}>
            {children}
        </div>
    );
}

interface ResponsiveGridProps {
    children: ReactNode;
    cols?: 1 | 2 | 3 | 4;
    className?: string;
}

export function ResponsiveGrid({ children, cols = 4, className }: ResponsiveGridProps) {
    const gridClasses = {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
    };

    return (
        <div className={cn(
            "grid gap-4 sm:gap-6",
            gridClasses[cols],
            className
        )}>
            {children}
        </div>
    );
}

interface ResponsiveTableProps {
    children: ReactNode;
    className?: string;
}

export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
    return (
        <div className={cn("overflow-x-auto -mx-4 sm:mx-0", className)}>
            <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden">
                    {children}
                </div>
            </div>
        </div>
    );
}
