import React from 'react';
import { FileSpreadsheet, BarChart3, Settings, Upload } from 'lucide-react';
import Link from 'next/link';

export default function EtatsFinanciersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-900">
      {/* Module Header */}
      <header className="border-b border-slate-200 bg-white/50 px-6 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-600 p-2 text-white">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                États Financiers
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                SYSCOHADA Révisé
              </p>
            </div>
          </div>
          <nav className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-900">
            <NavItem href="/etats-financiers" icon={<BarChart3 size={18} />} label="Synthèse" />
            <NavItem href="/etats-financiers/import" icon={<Upload size={18} />} label="Import Balance" />
            <NavItem href="/etats-financiers/bilan" icon={<FileSpreadsheet size={18} />} label="Bilan" />
            <NavItem href="/etats-financiers/resultat" icon={<FileSpreadsheet size={18} />} label="Résultat" />
            <NavItem href="/etats-financiers/config" icon={<Settings size={18} />} label="Paramètres" />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-indigo-600 hover:shadow-sm dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
