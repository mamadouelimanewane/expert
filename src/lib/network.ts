import prisma from './prisma';

// ─────────────────────────────────────────────────────────────────────────────
// Graphe de relations client / facture / collaborateur.
//
// Trois défauts corrigés :
//
// 1. Les nœuds « client » venaient d'un `findMany({ take: 5 })` sans aucun
//    rapport avec les factures chargées — et sans tenir compte du `clientId`
//    demandé. Les arêtes `client-<id> → facture` pointaient donc régulièrement
//    vers un nœud absent du graphe, et le dossier demandé pouvait ne pas y
//    figurer du tout. Les clients affichés sont désormais exactement ceux des
//    factures retenues.
//
// 2. Le risque d'une facture était déduit de son seul montant
//    (`total > 5 000 000 → "high"`). Sur un écran d'analyse de réseau et de
//    fraude, une grosse facture parfaitement réglée s'affichait en risque
//    élevé. Le risque suit désormais le statut réel de la facture, qui est une
//    donnée et non une supposition.
//
// 3. `prisma.user.findMany()` chargeait l'utilisateur entier, empreinte du mot
//    de passe comprise, pour n'en afficher que le nom et le rôle.
// ─────────────────────────────────────────────────────────────────────────────

export interface Node {
    id: string;
    type: "person" | "company" | "invoice" | "account" | "offshore";
    label: string;
    risk: "low" | "medium" | "high" | "critical";
    x: number;
    y: number;
    metadata?: string;
    hidden?: boolean;
    geo?: { lat: number, lng: number, city: string };
}

export interface Edge {
    source: string;
    target: string;
    type: string;
    value?: string;
    hidden?: boolean;
}

/** Risque porté par une facture : son statut, pas son montant. */
function risqueFacture(status: string): Node["risk"] {
    if (status === "OVERDUE") return "high";
    if (status === "SENT") return "medium";
    if (status === "CANCELLED") return "medium";
    return "low"; // PAID, DRAFT
}

export class NetworkService {
    static async getNetworkData(clientId?: string) {
        const invoices = await prisma.invoice.findMany({
            where: clientId ? { clientId } : {},
            take: 10,
            orderBy: { issueDate: "desc" },
            select: {
                id: true,
                invoiceNumber: true,
                total: true,
                status: true,
                clientId: true,
            },
        });

        // Les clients du graphe sont ceux des factures retenues — plus le
        // dossier explicitement demandé, même s'il n'a aucune facture.
        const idsClients = Array.from(
            new Set([...invoices.map((i) => i.clientId), ...(clientId ? [clientId] : [])])
        );

        const clients = await prisma.client.findMany({
            where: { id: { in: idsClients } },
            select: {
                id: true,
                companyName: true,
                firstName: true,
                lastName: true,
                healthScore: true,
            },
        });

        const users = await prisma.user.findMany({
            where: { isActive: true },
            select: { id: true, firstName: true, lastName: true, role: true },
            take: 3,
        });

        const nodes: Node[] = [];
        const edges: Edge[] = [];

        clients.forEach((client, i) => {
            nodes.push({
                id: `client-${client.id}`,
                type: "company",
                label: client.companyName || [client.firstName, client.lastName].filter(Boolean).join(" ") || "Client",
                // "medium" quand le healthScore n'est pas evalue : ne pas presenter un
                // client non evalue comme "faible risque" par defaut.
                risk: client.healthScore == null ? "medium" : client.healthScore < 50 ? "high" : "low",
                x: 400 + (i * 100),
                y: 300 + (i * 50),
                metadata: "Entité Principale",
                // Aucune geolocalisation reelle n'est disponible (pas de geocodage des
                // adresses clients) : le champ geo n'est plus fabrique avec des
                // coordonnees fixes (auparavant toujours Abidjan, 5.341/-4.018).
            });
        });

        users.forEach((user, i) => {
            nodes.push({
                id: `user-${user.id}`,
                type: "person",
                label: `${user.firstName} ${user.lastName}`,
                risk: "low",
                x: 200 + (i * 150),
                y: 150,
                metadata: user.role
            });
        });

        const clientsPresents = new Set(clients.map((c) => c.id));

        invoices.forEach((inv, i) => {
            const invNodeId = `inv-${inv.id}`;
            nodes.push({
                id: invNodeId,
                type: "invoice",
                label: inv.invoiceNumber,
                risk: risqueFacture(inv.status),
                x: 600 + ((i % 4) * 60),
                y: 100 + (i * 60),
                metadata: `${inv.total.toLocaleString("fr-FR")} FCFA — ${inv.status}`
            });

            // Une arête vers un nœud absent afficherait un lien dans le vide.
            if (clientsPresents.has(inv.clientId)) {
                edges.push({
                    source: `client-${inv.clientId}`,
                    target: invNodeId,
                    type: "ISSUED",
                    value: "Facturation"
                });
            }
        });

        return { nodes, edges };
    }
}
