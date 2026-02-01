import React from 'react';

export function LiasseHeader({ title, systeme = "SYSTEME NORMAL", year = "2024" }: { title: string, systeme?: string, year?: string }) {
    return (
        <header className="mb-6 font-serif text-xs uppercase text-slate-900">
            {/* Top Banner: REPUBLIQUE DU SENEGAL */}
            <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-2">
                <div className="text-center font-bold w-1/3">
                    <p>REPUBLIQUE DU SENEGAL</p>
                    <p className="text-[10px] font-normal">Un Peuple - Un But - Une Foi</p>
                    <div className="my-1 h-[1px] w-12 bg-black mx-auto"></div>
                    <p>MINISTERE DES FINANCES</p>
                    <p>ET DU BUDGET</p>
                    <div className="mt-2 text-[9px] font-bold border border-black p-1 inline-block">
                        DIRECTION GENERALE DES<br />IMPOTS ET DOMAINES
                    </div>
                </div>

                <div className="flex-1 px-4 text-center">
                    <h1 className="text-2xl font-bold tracking-wider border-2 border-black py-2 bg-slate-100">
                        ETATS FINANCIERS
                    </h1>
                    <p className="mt-1 font-bold">EXERCICE CLOS LE 31/12/{year}</p>
                    <p className="text-[10px]">(ART. 603 DU CODE GENERAL DES IMPOTS)</p>
                </div>

                <div className="w-1/6 text-right">
                    <div className="border border-black p-2 text-center text-[10px]">
                        <p>Timbre à date</p>
                        <div className="h-12"></div>
                        <p>du Service</p>
                    </div>
                </div>
            </div>

            {/* Entity Identification */}
            <div className="border border-black p-2">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold w-24">NINEA :</span>
                            <div className="border border-black px-2 py-0.5 flex-1 font-mono tracking-widest bg-slate-50">004512458 2R2</div>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold w-24">DENOMINATION :</span>
                            <div className="border-b border-dotted border-black flex-1 font-bold">SOCIETE TALL MAKY (STM)</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold w-24">ADRESSE :</span>
                            <div className="border-b border-dotted border-black flex-1">DAKAR SENEGAL</div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold w-32">EXERCICE COMPTABLE :</span>
                            <div className="border border-black px-2 py-0.5 w-24 text-center bg-slate-50">12 MOIS</div>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold w-32">SYSTEME :</span>
                            <div className="border border-black px-2 py-0.5 flex-1 text-center font-bold bg-slate-200">{systeme}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Page Title */}
            <div className="mt-4 flex items-center justify-between border-b-2 border-black pb-1">
                <h2 className="text-lg font-bold">{title}</h2>
                <span className="font-bold">EXERCICE {year}</span>
            </div>
        </header>
    );
}
