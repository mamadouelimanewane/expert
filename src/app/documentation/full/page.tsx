"use client";

import React from 'react';
import BrochureItem from '../brochure/page';
import LetterItem from '../lettre/page';
import ManualItem from '../manuel/page';
import ReleaseItem from '../release-notes/page';

// L'impression se déclenchait toute seule une seconde après l'ouverture :
// la boîte de dialogue bloquait la page (et toute vérification automatisée)
// avant même que l'utilisateur ait vu le document. Elle est désormais
// déclenchée par un bouton, ou par ?print=1 pour un lien direct.
export default function FullDocumentationPage() {
    React.useEffect(() => {
        if (new URLSearchParams(window.location.search).get("print") !== "1") return;
        const timer = setTimeout(() => window.print(), 800);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="bg-white">
            <div className="print:hidden sticky top-0 z-20 flex items-center justify-between gap-3 px-6 py-3 border-b border-slate-200 bg-white/95 backdrop-blur">
                <p className="text-sm text-slate-600">Documentation complète — brochure, lettre, manuel et notes de version, prêts à imprimer ou à enregistrer en PDF.</p>
                <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:brightness-110">Imprimer / PDF</button>
            </div>
            <div className="print:block">
                <section className="break-after-page">
                    <BrochureItem />
                </section>
                <section className="break-after-page">
                    <LetterItem />
                </section>
                <section className="break-after-page bg-white text-slate-900 min-h-screen p-20">
                    <ManualItem />
                </section>
                <section className="break-after-page bg-white text-slate-900">
                    <ReleaseItem />
                </section>
            </div>
        </div>
    );
}
