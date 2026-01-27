export type ClientStatus = "Actif" | "Prospect" | "Inactif" | "Contentieux";

export interface Client {
    id: string;
    name: string;
    type: "Personne Physique" | "Personne Morale";
    email: string;
    phone: string;
    country: string; // Code pays: CI, SN, CM, etc.
    city: string;

    // Champs OHADA / Fiscaux
    rccm?: string; // Registre de Commerce
    ninea?: string; // Sénégal
    cc?: string; // Compte Contribuable (CI)
    ifu?: string; // Bénin
    regimeFiscal: "Réel Normal" | "Réel Simplifié" | "CME" | "Micro-entreprise" | "Non Assujetti";

    // Meta
    status: ClientStatus;
    manager: string;
    lastActivity: string;
}

export const mockClients: Client[] = [
    {
        id: "1",
        name: "Société Ivoirienne de Banque",
        type: "Personne Morale",
        email: "contact@sib.ci",
        phone: "+225 27 20 20 20 20",
        country: "CI",
        city: "Abidjan",
        rccm: "CI-ABJ-2000-B-12345",
        cc: "1234567 A",
        regimeFiscal: "Réel Normal",
        status: "Actif",
        manager: "Jean K.",
        lastActivity: "2024-05-20",
    },
    {
        id: "2",
        name: "Traoré Import-Export",
        type: "Personne Physique",
        email: "m.traore@gmail.com",
        phone: "+221 77 000 00 00",
        country: "SN",
        city: "Dakar",
        rccm: "SN-DKR-2018-A-9876",
        ninea: "001234567",
        regimeFiscal: "Réel Simplifié",
        status: "Actif",
        manager: "Aissatou D.",
        lastActivity: "2024-05-18",
    },
    {
        id: "3",
        name: "Boulangerie du Plateau",
        type: "Personne Morale",
        email: "boulangerie@plateau.cm",
        phone: "+237 6 99 00 00 00",
        country: "CM",
        city: "Yaoundé",
        rccm: "RC/YAO/2021/B/555",
        regimeFiscal: "CME",
        status: "Prospect",
        manager: "Jean K.",
        lastActivity: "2024-05-15",
    },
    {
        id: "4",
        name: "Tech Solutions Bénin",
        type: "Personne Morale",
        email: "contact@tech-benin.bj",
        phone: "+229 97 00 00 00",
        country: "BJ",
        city: "Cotonou",
        rccm: "RB/COT/19-B-1111",
        ifu: "3201912345678",
        regimeFiscal: "Réel Normal",
        status: "Inactif",
        manager: "Paul M.",
        lastActivity: "2023-12-10",
    },
];
