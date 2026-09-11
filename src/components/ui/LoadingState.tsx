import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  /** Ce qui se charge, à la première personne du produit : « votre portefeuille ». */
  label?: string;
  /** Silhouette du contenu attendu, pour éviter le saut de mise en page. */
  skeleton?: "cards" | "rows" | "none";
  /** Nombre d'éléments fantômes. */
  count?: number;
  className?: string;
}

function Bone({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} aria-hidden="true" />;
}

/**
 * État de chargement homogène. Un squelette de la mise en page à venir
 * rassure davantage qu'un « Chargement... » nu (63 variantes dans l'app)
 * et évite que la page « saute » à l'arrivée des données.
 */
export function LoadingState({ label = "Chargement…", skeleton = "none", count = 3, className }: LoadingStateProps) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={cn("w-full", className)}>
      <div className="flex items-center justify-center gap-3 py-6 text-muted-foreground">
        <Loader2 className="w-5 h-5 text-primary animate-spin" aria-hidden="true" />
        <span className="text-sm font-medium">{label}</span>
      </div>

      {skeleton === "cards" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-hidden="true">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Bone className="w-10 h-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Bone className="h-3.5 w-2/3" />
                  <Bone className="h-3 w-1/3" />
                </div>
              </div>
              <Bone className="h-3 w-full" />
              <Bone className="h-3 w-4/5" />
            </div>
          ))}
        </div>
      )}

      {skeleton === "rows" && (
        <div className="space-y-2 px-2" aria-hidden="true">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-border/60">
              <Bone className="h-3.5 w-24" />
              <Bone className="h-3.5 flex-1" />
              <Bone className="h-3.5 w-20" />
              <Bone className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
