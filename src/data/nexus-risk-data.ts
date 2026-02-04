export interface IDVerificationRecord {
    id: string;
    entityName: string;
    type: "individual" | "business";
    country: string;
    status: "verified" | "flagged" | "failed" | "pending";
    matchScore: number;
    details: {
        identity: "match" | "no_match" | "partial";
        compliance: "clear" | "warning" | "restricted";
        address: "confirmed" | "unconfirmed";
        documents: "valid" | "expired" | "not_provided";
    };
    source: string;
    timestamp: string;
    rccm?: string;
    ninea?: string;
}

export interface ScreeningHit {
    source: string;
    category: string;
    matchProbability: number;
}

export interface ScreenedEntity {
    id: string;
    name: string;
    type: "individual" | "business";
    country: string;
    riskLevel: "low" | "medium" | "high" | "critical";
    hits: number;
    lastScreening: string;
    status: "clear" | "hit_detected" | "investigating";
    hitDetails: ScreeningHit[];
}

export const NEXUS_ID_RECORDS: IDVerificationRecord[] = [
    {
        id: "VER-SN-001",
        entityName: "Abdou LEYE",
        type: "individual",
        country: "Sénégal",
        status: "verified",
        matchScore: 99,
        details: {
            identity: "match",
            compliance: "clear",
            address: "confirmed",
            documents: "valid"
        },
        source: "Nexus Global Identity Network",
        timestamp: "2026-02-04 15:30",
        ninea: "1234567 2G3"
    },
    {
        id: "VER-CI-002",
        entityName: "Société Ivoirienne de Banque",
        type: "business",
        country: "Côte d'Ivoire",
        status: "verified",
        matchScore: 100,
        details: {
            identity: "match",
            compliance: "clear",
            address: "confirmed",
            documents: "valid"
        },
        source: "Nexus Business Registry",
        timestamp: "2026-02-04 15:45",
        rccm: "CI-ABJ-2000-B-12345"
    },
    {
        id: "VER-SN-003",
        entityName: "Traoré Import-Export",
        type: "business",
        country: "Sénégal",
        status: "flagged",
        matchScore: 78,
        details: {
            identity: "partial",
            compliance: "warning",
            address: "confirmed",
            documents: "valid"
        },
        source: "Nexus Link Discovery",
        timestamp: "2026-02-04 16:00",
        rccm: "SN-DKR-2018-A-9876"
    }
];

export const NEXUS_SCREENING_DATA: ScreenedEntity[] = [
    {
        id: "SCR-MAL-001",
        name: "Ibrahim Boubacar",
        type: "individual",
        country: "Mali",
        riskLevel: "critical",
        hits: 3,
        lastScreening: "Il y a 5 min",
        status: "hit_detected",
        hitDetails: [
            { source: "Watchlist - Sanctions ONU", category: "Terrorism Finance", matchProbability: 95 },
            { source: "PEP List - Sahel Region", category: "Politically Exposed Person", matchProbability: 100 },
            { source: "Interpol Red Notice", category: "Financial Fraud", matchProbability: 88 }
        ]
    },
    {
        id: "SCR-SN-002",
        name: "Dakar Global Tech SARL",
        type: "business",
        country: "Sénégal",
        riskLevel: "high",
        hits: 1,
        lastScreening: "Il y a 2h",
        status: "investigating",
        hitDetails: [
            { source: "OFAC - SDN List", category: "Money Laundering", matchProbability: 62 }
        ]
    },
    {
        id: "SCR-BEN-003",
        name: "Tech Solutions Bénin",
        type: "business",
        country: "Bénin",
        riskLevel: "low",
        hits: 0,
        lastScreening: "Il y a 1 jour",
        status: "clear",
        hitDetails: []
    }
];
