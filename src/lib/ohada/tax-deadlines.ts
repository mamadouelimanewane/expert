export type ProfilEcheanceFiscale = {
    country: string;
    sector?: string | null;
    taxCenter?: string | null;
};

/**
 * Délai mensuel de TVA du mois suivant. Les règles ivoiriennes DGE/DME
 * distinguent le secteur : 10 (industrie/pétrole/mines), 15 (commerce), 20
 * (services). Références: calendrier officiel DGI CI; CGI SN art. 363;
 * CGI BJ 2026 art. 259; CGI CM 2026 art. 152.
 */
export function jourLimiteTVA(profil: ProfilEcheanceFiscale): number {
    const country = profil.country.toUpperCase();
    if (country === "BJ") return 10;
    if (country === "CI" && ["DGE", "DME", "CME"].includes((profil.taxCenter ?? "").toUpperCase())) {
        const sector = (profil.sector ?? "").toLowerCase();
        if (/(industrie|p[eé]trole|min(e|i[eè])re)/.test(sector)) return 10;
        if (/(service|conseil|prestation|num[eé]rique)/.test(sector)) return 20;
        if (/(commerce|vente|distribution)/.test(sector)) return 15;
    }
    // SN: 15; CI réel sans variante (15); CM: dans les quinze premiers jours.
    return 15;
}

export function echeanceTVA(profil: ProfilEcheanceFiscale, annee: number, mois: number): Date {
    const dernierJour = new Date(Date.UTC(annee, mois + 1, 0)).getUTCDate();
    return new Date(Date.UTC(annee, mois, Math.min(jourLimiteTVA(profil), dernierJour)));
}
