import React from 'react';

export default function PrintLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white text-black print:bg-white print:text-black">
            <style>{`
        @page {
          size: A4 portrait;
          margin: 10mm;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
           /* Hide all non-printable elements if they leak in */
          .no-print {
            display: none !important;
          }
        }
      `}</style>
            <div className="mx-auto max-w-[210mm] min-h-[297mm] p-[5mm] print:p-0">
                {children}
            </div>
        </div>
    );
}
