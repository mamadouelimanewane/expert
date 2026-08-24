import prisma from './prisma';

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

export class NetworkService {
    static async getNetworkData(clientId?: string) {
        // Fetch clients
        const clients = await prisma.client.findMany({
            take: 5
        });

        // Fetch users
        const users = await prisma.user.findMany({
            take: 3
        });

        // Fetch top invoices
        const invoices = await prisma.invoice.findMany({
            where: clientId ? { clientId } : {},
            take: 10,
            include: { client: true }
        });

        const nodes: Node[] = [];
        const edges: Edge[] = [];

        // Add client nodes
        clients.forEach((client, i) => {
            nodes.push({
                id: `client-${client.id}`,
                type: "company",
                label: client.companyName || `${client.firstName} ${client.lastName}`,
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

        // Add user nodes (Experts)
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

        // Add invoice nodes and edges
        invoices.forEach((inv, i) => {
            const invNodeId = `inv-${inv.id}`;
            nodes.push({
                id: invNodeId,
                type: "invoice",
                label: inv.invoiceNumber,
                risk: inv.total > 5000000 ? "high" : "medium",
                x: 600 + ((i % 4) * 60),
                y: 100 + (i * 60),
                metadata: `${inv.total.toLocaleString()} FCFA`
            });

            edges.push({
                source: `client-${inv.clientId}`,
                target: invNodeId,
                type: "ISSUED",
                value: "Facturation"
            });
        });

        return { nodes, edges };
    }
}
