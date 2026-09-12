"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, X } from "lucide-react";
import { HUB_CATEGORIES } from "@/app/bi/hub-modules";

// Normalise pour une recherche tolérante aux accents et à la casse
// (« tresorerie » trouve « Trésorerie »).
function normalize(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

const TOTAL_MODULES = HUB_CATEGORIES.reduce((n, c) => n + c.items.length, 0);

export function HubModules() {
  const [query, setQuery] = useState("");

  const categories = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return HUB_CATEGORIES;
    return HUB_CATEGORIES
      .map((c) => ({
        ...c,
        items: c.items.filter((m) => normalize(`${m.label} ${m.desc} ${c.title}`).includes(q)),
      }))
      .filter((c) => c.items.length > 0);
  }, [query]);

  const shown = categories.reduce((n, c) => n + c.items.length, 0);

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Recherche : 42 modules répartis en 10 familles, on ne peut pas
          demander à l'utilisateur de tous les parcourir à chaque fois. */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Rechercher parmi les ${TOTAL_MODULES} modules… (ex. paie, bilan, KYC)`}
          aria-label="Rechercher un module"
          className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 text-base text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm focus:border-[#006B3F] focus:ring-4 focus:ring-[#006B3F]/15 outline-none transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Effacer la recherche"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {query && (
          <p className="mt-2 text-sm text-slate-500 px-1" aria-live="polite">
            {shown === 0
              ? "Aucun module ne correspond."
              : `${shown} module${shown > 1 ? "s" : ""} trouvé${shown > 1 ? "s" : ""}`}
          </p>
        )}
      </div>

      {categories.map((category, catIdx) => (
          <div key={catIdx} className="space-y-4 sm:space-y-6">

            {/* Category header with colored bar + bottom line border */}
            <div className="flex items-center gap-3 border-b-2 border-black/5 dark:border-white/10 pb-2.5">
              <div style={{ width: '6px', height: '24px', background: category.color, borderRadius: '4px', flexShrink: 0 }} className="sm:h-[30px] sm:w-[8px]"></div>
              {/* Couleur de catégorie assombrie en thème clair via .hub-cat-title
                  (globals.css) : l'orange APIX #F29400 pur ne faisait que 2,2:1. */}
              <p role="heading" aria-level={2} className="hub-cat-title text-lg sm:text-xl lg:text-2xl font-extrabold m-0" style={{ ['--cat-color' as any]: category.color }}>
                {category.title}
              </p>
            </div>

            {/* Grid container — 1 col mobile, 2 cols tablet, 4 cols desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {(() => {
                const COLS = 4;
                const total = category.items.length;
                const remainder = total % COLS;
                const spanCount = remainder > 0 && COLS % remainder === 0 ? COLS / remainder : 1;
                return category.items.map((mod, index) => {
                const IconComponent = mod.icon;
                const isInLastPartialRow = remainder > 0 && index >= total - remainder;
                return (
                  <Link
                    key={index}
                    href={mod.href}
                    // Le span de la dernière rangée ne vaut que pour la grille
                    // 4 colonnes (lg) : appliqué en style inline, il créait des
                    // colonnes implicites et écrasait la grille 1 colonne du mobile.
                    className={`apix-hub-card relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl transition-all duration-300 ${
                      isInLastPartialRow && spanCount === 4 ? "lg:col-span-4" : isInLastPartialRow && spanCount === 2 ? "lg:col-span-2" : ""
                    }`}
                    style={{
                      ['--hover-color' as any]: mod.color,
                      ['--hover-color-30' as any]: `${mod.color}30`,
                      ['--hover-color-40' as any]: `${mod.color}40`,
                    }}
                  >
                    {mod.badge && (
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-[#006B3F] text-white px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black tracking-wider shadow-sm">
                        {mod.badge}
                      </div>
                    )}

                    <div>
                      <div
                        className="hub-icon w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 shrink-0"
                        style={{ background: `${mod.color}15` }}
                      >
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>

                      <h3 className="text-sm sm:text-base font-extrabold mb-1 sm:mb-1.5 text-slate-900 dark:text-white leading-snug">
                        {mod.label}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {mod.desc}
                      </p>
                    </div>

                    {/* Teinte du module assombrie en thème clair (.hub-cta) : les
                        pastels (#fde68a, #e0e7ff…) étaient illisibles sur blanc. */}
                    <div className="hub-cta mt-4 pt-2 flex items-center font-bold text-xs sm:text-sm gap-1.5">
                      Accéder <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                );
                });
              })()}
            </div>
          </div>
        ))}
    </div>
  );
}
