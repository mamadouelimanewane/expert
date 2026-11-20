export type ProfilCalendrierFiscal = {
    id: string;
    country: string;
    type: string;
    fiscalRegime: string;
    sector?: string | null;
    taxProfile?: unknown;
};

export type EcheanceAnnuelle = {
    code: string;
    titre: string;
    categorie: "IS" | "SOCIAL" | "PATRIMOINE";
    period: string;
    dueDate: Date;
    reference: string;
    source: string;
};

function taxProfileOf(client: ProfilCalendrierFiscal): Record<string, unknown> {
    return client.taxProfile && typeof client.taxProfile === "object" && !Array.isArray(client.taxProfile)
        ? client.taxProfile as Record<string, unknown>
        : {};
}

function date(year: number, month: number, day: number): Date {
    return new Date(Date.UTC(year, month - 1, day));
}

function dateAfterMonths(start: Date, months: number, day: number): Date {
    const monthIndex = start.getUTCMonth() + months;
    const year = start.getUTCFullYear() + Math.floor(monthIndex / 12);
    const month = ((monthIndex % 12) + 12) % 12;
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    return new Date(Date.UTC(year, month, Math.min(day, lastDay)));
}

/**
 * Échéances récurrentes publiées par les administrations. Les actes hors
 * calendrier (mutation, timbre, accise sectorielle, contrôles, etc.) restent
 * gérés comme événements de dossier et nécessitent un paramétrage métier.
 */
export function echeancesFiscalesAnnuelles(client: ProfilCalendrierFiscal, year: number): EcheanceAnnuelle[] {
    const profile = taxProfileOf(client);
    const country = client.country.toUpperCase();
    const prev = year - 1;
    const tasks: EcheanceAnnuelle[] = [];
    const add = (code: string, titre: string, categorie: EcheanceAnnuelle["categorie"], period: string, month: number, day: number, reference: string, source: string) => {
        tasks.push({ code, titre, categorie, period, dueDate: date(year, month, day), reference, source });
    };

    if (country === "SN") {
        if (client.type === "ENTREPRISE") {
            add("sn-is-return", "Déclaration annuelle de résultat IS", "IS", `${prev}-A`, 4, 30, "CGI Sénégal, art. 30", "https://dgid-digitale.dgid.sn/loi-reglement");
            add("sn-is-advance-1", "1er acompte IS/IR", "IS", `${year}-T1`, 2, 15, "Calendrier fiscal DGID", "https://dgid-digitale.dgid.sn/");
            add("sn-is-advance-2", "2e acompte IS/IR", "IS", `${year}-T2`, 4, 30, "Calendrier fiscal DGID", "https://dgid-digitale.dgid.sn/");
            add("sn-is-balance", "Solde IS/IR", "IS", `${prev}-A`, 6, 15, "Calendrier fiscal DGID", "https://dgid-digitale.dgid.sn/");
        }
        if (profile.propertyOwner === true) add("sn-property-tax", "Contribution foncière (propriétés bâties/non bâties)", "PATRIMOINE", `${year}-A`, 1, 31, "Calendrier fiscal DGID", "https://dgid-digitale.dgid.sn/");
    }

    if (country === "CI") {
        if (client.type === "ENTREPRISE" || client.type === "ASSOCIATION") {
            const auditRequired = profile.requiresAudit === true;
            const [closingMonth = 12, closingDay = 31] = String(profile.fiscalYearEnd ?? "12-31").split("-").map(Number);
            const qualifier = auditRequired ? "entreprise soumise à certification" : "autres entreprises";
            for (const closingYear of [year - 2, year - 1, year]) {
                const closure = new Date(Date.UTC(closingYear, Math.max(0, closingMonth - 1), closingDay));
                const filing = dateAfterMonths(closure, auditRequired ? 6 : 5, 30);
                if (filing.getUTCFullYear() !== year) continue;
                const filingMonth = filing.getUTCMonth() + 1;
                const filingDay = filing.getUTCDate();
                add("ci-result-return", "Déclaration de résultat et états financiers", "IS", `${closingYear}-A`, filingMonth, filingDay, `Calendrier fiscal DGI CI (${qualifier})`, "https://www.dgi.gouv.ci/assets/documents/CALENDRIER.pdf");
                if (profile.employer === true) add("ci-annual-payroll", "État récapitulatif annuel des salaires (état 301)", "SOCIAL", `${closingYear}-A`, filingMonth, filingDay, `Calendrier fiscal DGI CI (${qualifier})`, "https://www.dgi.gouv.ci/assets/documents/CALENDRIER.pdf");
            }
            const sector = (client.sector ?? "").toLowerCase();
            const centre = String(profile.taxCenter ?? "").toUpperCase();
            const monthlyDay = centre === "DGE" || centre === "DME"
                ? /industrie|p[eé]trole|min(e|i[eè])re/.test(sector) ? 10 : /service|conseil|prestation/.test(sector) ? 20 : 15
                : 15;
            for (const [n, month] of [[1, 4], [2, 6], [3, 9]] as const) {
                add(`ci-is-advance-${n}`, `Acompte IS (${n}/3)`, "IS", `${year}-T${n}`, month, monthlyDay, "Calendrier fiscal DGI CI", "https://www.dgi.gouv.ci/assets/documents/CALENDRIER.pdf");
            }
        }
    }

    if (country === "CM") {
        if (client.type === "ENTREPRISE" || client.type === "ASSOCIATION") {
            const centre = String(profile.taxCenter ?? "").toUpperCase();
            const month = centre === "DGE" ? 3 : ["CIME", "CSI"].includes(centre) ? 4 : 5;
            add("cm-is-return", "Déclaration annuelle IS et états financiers", "IS", `${prev}-A`, month, 15, "CGI Cameroun 2026, centre fiscal selon contribuable", "https://www.impots.cm/fr/documents/39");
        }
    }

    if (country === "BJ") {
        if (client.type === "ENTREPRISE" || client.type === "ASSOCIATION") {
            add("bj-is-return", "Déclaration annuelle de résultat IS", "IS", `${prev}-A`, 4, 30, "CGI Bénin 2026, art. 49-50", "https://api.impots.bj/media/6984ebbbb7bc0_B%C3%A9nin-Code%20G%C3%A9n%C3%A9ral%20des%20Imp%C3%B4ts%202026.pdf");
            for (const [n, month] of [[1, 3], [2, 6], [3, 9], [4, 12]] as const) {
                add(`bj-is-advance-${n}`, `Acompte IS (${n}/4)`, "IS", `${year}-T${n}`, month, 10, "CGI Bénin 2026, art. 51", "https://api.impots.bj/media/6984ebbbb7bc0_B%C3%A9nin-Code%20G%C3%A9n%C3%A9ral%20des%20Imp%C3%B4ts%202026.pdf");
            }
        }
    }

    return tasks;
}
