import React from 'react';

export type LiasseClientInfo = {
    companyName?: string | null;
    ninea?: string | null;
    rccm?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
};

const NA = "Non renseigné";

// ─────────────────────────────────────────────────────────────────────────────
// Cet en-tête affichait auparavant une identité d'entreprise entièrement
// fictive (NINEA "004512458 2R2", "SOCIETE TALL MAKY (STM)", "DAKAR SENEGAL")
// sur TOUT document imprimé, quel que soit le client réel sélectionné en amont
// — et un bandeau "RÉPUBLIQUE DU SÉNÉGAL / MINISTÈRE DES FINANCES / DIRECTION
// GÉNÉRALE DES IMPÔTS" laissant croire à un document officiel émis par l'État,
// y compris pour des clients d'autres pays OHADA. Il affiche désormais
// l'identité réelle du client transmis en props, et se présente honnêtement
// comme un document produit par le cabinet (pas par une administration).
// ─────────────────────────────────────────────────────────────────────────────
export function LiasseHeader({
    title,
    systeme = "SYSTEME NORMAL",
    year = String(new Date().getFullYear()),
    client,
}: {
    title: string;
    systeme?: string;
    year?: string;
    client?: LiasseClientInfo | null;
}) {
    return (
        <header className="mb-6 font-serif text-xs uppercase text-slate-900">
            <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-2">
                <div className="text-center font-bold w-1/3">
                    <p>CABINET 360</p>
                    <p className="text-[10px] font-normal normal-case">Document produit par le cabinet — non émis par une administration</p>
                </div>

                <div className="flex-1 px-4 text-center">
                    <h1 className="text-2xl font-bold tracking-wider border-2 border-black py-2 bg-slate-100">
                        ETATS FINANCIERS
                    </h1>
                    <p className="mt-1 font-bold">EXERCICE CLOS LE 31/12/{year}</p>
                    <p className="text-[10px]">SYSTEME COMPTABLE OHADA</p>
                </div>

                <div className="w-1/6 text-right">
                    <div className="border border-black p-2 text-center text-[10px]">
                        <p>Cachet</p>
                        <div className="h-12"></div>
                        <p>Signature</p>
                    </div>
                </div>
            </div>

            {/* Entity Identification — donnees reelles du client */}
            <div className="border border-black p-2">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold w-24">NINEA/RCCM :</span>
                            <div className="border border-black px-2 py-0.5 flex-1 font-mono tracking-widest bg-slate-50">{client?.ninea || client?.rccm || NA}</div>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold w-24">DENOMINATION :</span>
                            <div className="border-b border-dotted border-black flex-1 font-bold">{client?.companyName || NA}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold w-24">ADRESSE :</span>
                            <div className="border-b border-dotted border-black flex-1">
                                {[client?.address, client?.city, client?.country].filter(Boolean).join(", ") || NA}
                            </div>
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
