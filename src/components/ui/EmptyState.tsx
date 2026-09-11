import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  /** Icône lucide ; boîte de réception par défaut. */
  icon?: ComponentType<{ className?: string }>;
  title: string;
  /** Une phrase qui dit quoi faire ensuite — pas seulement « aucune donnée ». */
  description?: ReactNode;
  /** Action principale : lien (href) ou bouton (onClick). */
  action?: { label: string; href?: string; onClick?: () => void; icon?: ComponentType<{ className?: string }> };
  /** `compact` pour un encart dans une carte, `page` pour une zone entière. */
  size?: "compact" | "page";
  className?: string;
}

/**
 * État vide homogène : un écran sans données doit expliquer pourquoi et
 * proposer la prochaine action, plutôt qu'afficher une ligne grise
 * « Aucun élément ». 143 écrans avaient chacun leur variante.
 */
export function EmptyState({ icon: Icon = Inbox, title, description, action, size = "page", className }: EmptyStateProps) {
  const ActionIcon = action?.icon;
  const actionClass =
    "inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white hover:brightness-110 rounded-xl font-bold text-sm transition-all shadow-sm";

  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        size === "page" ? "gap-4 py-14 px-6" : "gap-3 py-8 px-4",
        className
      )}
    >
      <div
        className={cn(
          "rounded-full bg-muted flex items-center justify-center",
          size === "page" ? "w-16 h-16" : "w-12 h-12"
        )}
      >
        <Icon className={cn("text-muted-foreground", size === "page" ? "w-8 h-8" : "w-6 h-6")} />
      </div>
      <div className="max-w-sm">
        <p className={cn("font-bold text-foreground", size === "page" ? "text-lg" : "text-sm")}>{title}</p>
        {description && (
          <p className={cn("text-muted-foreground mt-1", size === "page" ? "text-sm" : "text-xs")}>{description}</p>
        )}
      </div>
      {action &&
        (action.href ? (
          <Link href={action.href} className={cn(actionClass, size === "compact" && "px-4 py-2 text-xs")}>
            {ActionIcon && <ActionIcon className="w-4 h-4" />}
            {action.label}
          </Link>
        ) : (
          <button type="button" onClick={action.onClick} className={cn(actionClass, size === "compact" && "px-4 py-2 text-xs")}>
            {ActionIcon && <ActionIcon className="w-4 h-4" />}
            {action.label}
          </button>
        ))}
    </div>
  );
}
