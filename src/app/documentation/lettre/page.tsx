"use client";

import React, { useState } from 'react';
import {
    Download,
    Printer,
    AtSign,
    Phone,
    MapPin,
    Globe,
    Signature,
    PenLine,
    Layout
} from 'lucide-react';

export default function PresentationLetterPage() {
    const [cabinetName, setCabinetName] = useState("CABINET EXPERT OHADA");
    const [managerName, setManagerName] = useState("Expert Principal");
    const [clientName, setClientName] = useState("[NOM DU CLIENT / ENTREPRISE]");
    const [date, setDate] = useState(new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }));

    const handlePrint = () => window.print();

    return (
        <div className="min-h-screen bg-slate-100 p-8 print:p-0 print:bg-white overflow-y-auto">
            {/* Control Panel (Hidden on Print) */}
            <div className="max-w-[21cm] mx-auto mb-8 bg-white p-6 rounded-3xl shadow-xl flex items-center justify-between border border-slate-200 print:hidden">
                <div className="flex gap-4">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all"
                    >
                        <Printer className="w-5 h-5" /> Imprimer / PDF
                    </button>
                    <div className="h-10 w-px bg-slate-200" />
                    <p className="text-slate-500 text-sm font-medium">
                        <span className="text-indigo-600 font-bold uppercase">Mode Édition</span> : Cliquez directement sur le texte pour le modifier avant l'impression.
                    </p>
                </div>
            </div>

            {/* A4 Document Container */}
            <div className="max-w-[21cm] mx-auto bg-white shadow-2xl p-[2cm] min-h-[29.7cm] flex flex-col print:shadow-none print:m-0 print:border-none">

                {/* Letter Header */}
                <div className="flex justify-between items-start mb-20">
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center">
                            <span className="text-3xl font-black text-white">C</span>
                        </div>
                        <div className="space-y-1">
                            <h2
                                contentEditable
                                suppressContentEditableWarning
                                className="text-xl font-bold text-slate-900 outline-none hover:bg-slate-50 p-1 rounded"
                            >
                                {cabinetName}
                            </h2>
                            <p className="text-sm text-slate-500 font-medium">Expertise Comptable & Audit</p>
                        </div>
                    </div>
                    <div className="text-right space-y-2 text-sm text-slate-400 font-medium">
                        <div className="flex items-center justify-end gap-2">
                            <span contentEditable suppressContentEditableWarning className="outline-none">Abidjan / Dakar</span>
                            <MapPin className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="flex items-center justify-end gap-2">
                            <span contentEditable suppressContentEditableWarning className="outline-none">contact@cabinet360.com</span>
                            <AtSign className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="flex items-center justify-end gap-2">
                            <span contentEditable suppressContentEditableWarning className="outline-none">+225 00 00 00 00 / +221 00 00 00 00</span>
                            <Phone className="w-4 h-4 text-indigo-500" />
                        </div>
                    </div>
                </div>

                {/* Date & Destination */}
                <div className="flex flex-col gap-10 mb-20">
                    <div className="text-right">
                        <p className="text-slate-600">
                            Fait à <span contentEditable suppressContentEditableWarning className="font-bold underline underline-offset-4 decoration-indigo-300">Dakar</span>, le {date}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Destinataire :</p>
                        <h3
                            contentEditable
                            suppressContentEditableWarning
                            className="text-lg font-bold text-slate-900 outline-none hover:bg-slate-50 p-1 rounded inline-block"
                        >
                            À l'attention du dirigeant de {clientName}
                        </h3>
                    </div>
                </div>

                {/* Subject */}
                <div className="mb-10 p-4 bg-slate-50 border-l-4 border-indigo-600">
                    <p className="font-bold uppercase tracking-tight text-slate-900">
                        Objet : Présentation de Cabinet 360 - Solution Innovante d'Expertise Comptable OHADA
                    </p>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-6 text-slate-700 leading-relaxed text-justify">
                    <p>Madame, Monsieur le Dirigeant,</p>

                    <p>
                        Dans le cadre de l'évolution numérique de notre cabinet et de notre volonté constante d'offrir une valeur ajoutée stratégique à nos clients,
                        j'ai le plaisir de vous présenter notre nouvelle plateforme digitale : <strong>Cabinet 360</strong>.
                    </p>

                    <p>
                        Conscient des enjeux de conformité et de performance que vous rencontrez au quotidien, nous avons déployé cet outil
                        de nouvelle génération certifié <strong>SYSCOHADA</strong> pour transformer votre gestion financière. Grâce à Cabinet 360,
                        vous bénéficiez désormais :
                    </p>

                    <ul className="list-disc list-inside space-y-3 pl-4">
                        <li>D'une <strong>visibilité en temps réel</strong> sur vos indicateurs clés de performance et votre situation fiscale.</li>
                        <li>D'un <strong>espace sécurisé</strong> pour le dépôt et la gestion dématérialisée de vos pièces comptables.</li>
                        <li>De rapports d'analyse assistés par <strong>Intelligence Artificielle</strong> pour anticiper vos besoins de trésorerie.</li>
                        <li>D'une réactivité accrue de nos équipes grâce à l'automatisation des tâches à faible valeur ajoutée.</li>
                    </ul>

                    <p>
                        Nous sommes convaincus que cette digitalisation renforcera notre collaboration et vous permettra de vous concentrer
                        pleinement sur votre cœur de métier.
                    </p>

                    <p>
                        Mon équipe et moi-même restons à votre entière disposition pour vous présenter plus en détail les fonctionnalités
                        de cet outil lors de notre prochain rendez-vous.
                    </p>

                    <p>En vous souhaitant une excellente réception, nous vous prions d'agréer, Madame, Monsieur le Dirigeant, l'expression de nos salutations distinguées.</p>
                </div>

                {/* Signature */}
                <div className="mt-20 flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cachet du Cabinet</p>
                        <div className="w-32 h-32 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center text-slate-300">
                            <Layout className="w-10 h-10" />
                        </div>
                    </div>
                    <div className="text-right space-y-4">
                        <div className="space-y-1">
                            <p className="font-bold text-slate-900 uppercase tracking-tight" contentEditable suppressContentEditableWarning>{managerName}</p>
                            <p className="text-xs text-slate-500 uppercase tracking-widest">Expert-Comptable Inscrit</p>
                        </div>
                        <div className="h-20 w-48 border-b-2 border-slate-200 flex items-center justify-center italic text-slate-300 select-none">
                            <Signature className="w-16 h-16 opacity-10" />
                            [Signature]
                        </div>
                    </div>
                </div>

                {/* Footer Page Number */}
                <div className="hidden print:block text-center mt-auto pt-8 text-[10px] text-slate-400 uppercase tracking-widest">
                    Cabinet 360 Elite Edition • Document Officiel 2026
                </div>

            </div>
        </div>
    );
}
