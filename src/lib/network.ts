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
                risk: client.healthScore && client.healthScore < 50 ? "high" : "low",
                x: 400 + (i * 100),
                y: 300 + (i * 50),
                metadata: "Entité Principale",
                geo: { lat: 5.341, lng: -4.018, city: client.city || "Abidjan" }
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
                x: 600 + (Math.random() * 200),
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

        // Add hidden offshore node if specific risk is detected (for the demo)
        const highRiskInvoices = invoices.filter(inv => inv.total > 5000000);
        if (highRiskInvoices.length > 0) {
            nodes.push({
                id: "offshore-1",
                type: "offshore",
                label: "SHELL HOLDING LTD",
                risk: "critical",
                x: 800,
                y: 400,
                metadata: "Dubaï (Revelé par IA)",
                hidden: true,
                geo: { lat: 25.077, lng: 55.148, city: "Jebel Ali, UAE" }
            });

            edges.push({
                source: `client-${highRiskInvoices[0].clientId}`,
                target: "offshore-1",
                type: "SECRET_OWNER",
                value: "90% Parts",
                hidden: true
            });
        }

        return { nodes, edges };
    }
}
