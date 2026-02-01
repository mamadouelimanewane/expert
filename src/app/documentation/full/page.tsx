"use client";

import React from 'react';
import BrochureItem from '../brochure/page';
import LetterItem from '../lettre/page';
import ManualItem from '../manuel/page';
import ReleaseItem from '../release-notes/page';

export default function FullDocumentationPage() {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            window.print();
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="bg-white">
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
