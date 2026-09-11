"use client";

/**
 * Notifications non bloquantes (« toasts »), sans dépendance ni contexte React.
 *
 * Remplace les `alert()` natifs : ceux-ci bloquent l'interface, ne portent
 * aucune sémantique (succès / erreur) et ne sont pas stylables. Ici, chaque
 * message est ajouté à une zone `aria-live` en haut de l'écran, se ferme seul
 * après quelques secondes ou d'un clic, et s'empile proprement.
 *
 *   toast.success("Facture enregistrée");
 *   toast.error("Sélectionnez un client avant d'enregistrer");
 *   toast.info("Aucune intégration bancaire configurée", { duration: 8000 });
 *
 * Les styles vivent dans globals.css (`.c360-toast*`).
 */

export type ToastKind = "success" | "error" | "info" | "warning";

export interface ToastOptions {
  /** Durée d'affichage en ms (0 = jusqu'à fermeture manuelle). */
  duration?: number;
  /** Titre optionnel au-dessus du message. */
  title?: string;
}

const DEFAULT_DURATION: Record<ToastKind, number> = {
  success: 4000,
  info: 6000,
  warning: 7000,
  error: 8000,
};

const ICONS: Record<ToastKind, string> = {
  success: "✓",
  error: "!",
  info: "i",
  warning: "!",
};

function getRegion(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  let region = document.getElementById("c360-toasts");
  if (!region) {
    region = document.createElement("div");
    region.id = "c360-toasts";
    region.className = "c360-toast-region";
    region.setAttribute("role", "status");
    region.setAttribute("aria-live", "polite");
    document.body.appendChild(region);
  }
  return region;
}

function show(message: string, kind: ToastKind, options: ToastOptions = {}): () => void {
  const region = getRegion();
  if (!region) return () => {};

  const el = document.createElement("div");
  el.className = `c360-toast c360-toast-${kind}`;
  // Une erreur doit interrompre le lecteur d'écran, pas une confirmation.
  if (kind === "error") el.setAttribute("role", "alert");

  const icon = document.createElement("span");
  icon.className = "c360-toast-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = ICONS[kind];

  const body = document.createElement("div");
  body.className = "c360-toast-body";
  if (options.title) {
    const title = document.createElement("strong");
    title.textContent = options.title;
    body.appendChild(title);
  }
  const text = document.createElement("p");
  text.textContent = message;
  body.appendChild(text);

  const close = document.createElement("button");
  close.type = "button";
  close.className = "c360-toast-close";
  close.setAttribute("aria-label", "Fermer la notification");
  close.textContent = "×";

  el.append(icon, body, close);
  region.appendChild(el);

  let timer: ReturnType<typeof setTimeout> | null = null;
  const dismiss = () => {
    if (timer) clearTimeout(timer);
    el.classList.add("c360-toast-leaving");
    el.addEventListener("animationend", () => el.remove(), { once: true });
    // Filet si l'animation est désactivée (prefers-reduced-motion)
    setTimeout(() => el.remove(), 400);
  };
  close.addEventListener("click", dismiss);

  const duration = options.duration ?? DEFAULT_DURATION[kind];
  if (duration > 0) {
    timer = setTimeout(dismiss, duration);
    // Survol : on laisse le temps de lire
    el.addEventListener("mouseenter", () => timer && clearTimeout(timer));
    el.addEventListener("mouseleave", () => { timer = setTimeout(dismiss, 2000); });
  }
  return dismiss;
}

export const toast = Object.assign(
  (message: string, kind: ToastKind = "info", options?: ToastOptions) => show(message, kind, options),
  {
    success: (message: string, options?: ToastOptions) => show(message, "success", options),
    error: (message: string, options?: ToastOptions) => show(message, "error", options),
    info: (message: string, options?: ToastOptions) => show(message, "info", options),
    warning: (message: string, options?: ToastOptions) => show(message, "warning", options),
  }
);

export default toast;
