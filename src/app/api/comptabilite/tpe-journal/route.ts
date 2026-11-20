import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { requireWriteAccess, requireStaff } from "@/lib/api-auth";
import { AuditService } from "@/lib/audit";
import { normaliserDateISO, normaliserPeriode } from "@/lib/validation";
import { ensureAccountingPeriodOpen } from "@/lib/accounting-period-lock";

// GET: Récupérer tous les journaux TPE sauvegardés
export async function GET() {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const journals = await prisma.tpeJournal.findMany({
            where: { source: { not: 'WHATSAPP_TEST' } },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        return NextResponse.json(journals);
    } catch (error) {
        console.error("Erreur GET TpeJournal:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// POST: Sauvegarder un batch d'écritures générées par le moteur OHADA
export async function POST(request: Request) {
    const { denied } = await requireWriteAccess();
    if (denied) return denied;

    try {
        const body: unknown = await request.json().catch(() => null);
        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
        }
        const { journal, businessName, periode: periodeBrute, clientId } = body as Record<string, unknown>;
        // « JUIN-2026 » et « 2026-06 » désignaient deux périodes distinctes en
        // base : la première n'entrait jamais dans les états financiers.
        const periode = normaliserPeriode(periodeBrute);
        if (!periode) {
            return NextResponse.json({ error: "Période illisible : attendu AAAA-MM (ex. 2026-06)." }, { status: 400 });
        }

        if (!Array.isArray(journal) || journal.length === 0 || journal.length > 500) {
            return NextResponse.json({ error: "Données invalides" }, { status: 400 });
        }

        // `clientId` est obligatoire : sans lui, les écritures étaient
        // silencieusement attribuées au premier client de la base (voire à un
        // client factice créé à la volée), quel que soit le TPE réellement
        // importé.
        if (typeof clientId !== "string" || !/^[a-f0-9]{24}$/i.test(clientId)) {
            return NextResponse.json({ error: "clientId requis" }, { status: 400 });
        }

        const client = await prisma.client.findUnique({ where: { id: clientId } });
        if (!client) {
            return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
        }

        // Refuser le lot entier si une ligne est déséquilibrée, sans compte
        // exploitable ou porte un montant non fini/négatif. Les données OHADA
        // restent à contrôler par un réviseur avant leur export en production.
        const erreurs: number[] = [];
        for (let i = 0; i < journal.length; i++) {
            const line = journal[i] as Record<string, unknown> | null;
            const amount = Number(line?.montant);
            const entree = Number(line?.entree ?? 0);
            const sortie = Number(line?.sortie ?? 0);
            const compteDebit = String(line?.debit_compte ?? "").trim();
            const compteCredit = String(line?.credit_compte ?? "").trim();
            const libelle = String(line?.libelle ?? "").trim();
            if (!line || typeof line !== "object" ||
                !Number.isFinite(amount) || amount <= 0 ||
                !Number.isFinite(entree) || entree < 0 ||
                !Number.isFinite(sortie) || sortie < 0 ||
                Math.abs(entree - sortie) > 0.01 ||
                !/^\d{2,6}$/.test(compteDebit) || !/^\d{2,6}$/.test(compteCredit) ||
                compteDebit === compteCredit || !libelle || libelle.length > 500 ||
                typeof line.debit_intitule !== "string" || typeof line.credit_intitule !== "string") {
                erreurs.push(i + 1);
            }
        }
        if (erreurs.length) {
            return NextResponse.json({
                error: "Lot refusé : lignes invalides ou déséquilibrées. Aucune écriture n'a été enregistrée.",
                lignes: erreurs,
            }, { status: 400 });
        }

        // TpeJournal.date est une chaine ecrite telle quelle. L'export FEC la
        // compare ensuite lexicographiquement et la met en forme via new Date() :
        // une ligne saisie « 15/01/2026 » sortait de la periode demandee sans
        // signalement, ou produisait une colonne EcritureDate vide dans le
        // fichier remis a l'administration. Les dates sont donc normalisees ici,
        // et une date illisible fait rejeter le lot entier.
        const datesNormalisees = journal.map((line: any) => normaliserDateISO(line?.date));
        const lignesSansDate = datesNormalisees
            .map((d: string | null, i: number) => (d === null ? i + 1 : null))
            .filter((n: number | null): n is number => n !== null);
        if (lignesSansDate.length > 0) {
            return NextResponse.json(
                {
                    error: "Date illisible sur certaines lignes : aucune écriture n'a été enregistrée.",
                    lignes: lignesSansDate,
                },
                { status: 400 }
            );
        }
        const lignesHorsPeriode = datesNormalisees
            .map((date: string | null, index: number) => date && date.slice(0, 7) !== periode ? index + 1 : null)
            .filter((n: number | null): n is number => n !== null);
        if (lignesHorsPeriode.length > 0) {
            return NextResponse.json({ error: "La date de chaque écriture doit appartenir à la période sélectionnée.", lignes: lignesHorsPeriode }, { status: 400 });
        }
        const periodeEtat = await ensureAccountingPeriodOpen(client.id, periode);
        if (!periodeEtat.open) return NextResponse.json({ error: "Période comptable verrouillée : ajout d'écritures refusé." }, { status: 409 });

        // Bulk insert all journal lines
        const result = await prisma.tpeJournal.createMany({
            data: journal.map((line: any, index: number) => ({
                periode,
                businessName: (typeof businessName === "string" && businessName.trim()) || client.companyName || 'Commerçant',
                date: datesNormalisees[index] as string,
                libelle: line.libelle,
                entree: Number(line.entree ?? 0),
                sortie: Number(line.sortie ?? 0),
                debitCompte: line.debit_compte,
                debitIntitule: line.debit_intitule,
                creditCompte: line.credit_compte,
                creditIntitule: line.credit_intitule,
                montant: Number(line.montant),
                status: 'PENDING',
                clientId: client.id,
            }))
        });

        await AuditService.log({
            action: "CREATE",
            entity: "TPE_JOURNAL",
            entityId: client.id,
            details: `${result.count} écriture(s) proposées pour ${periode}.`,
            newValue: { clientId: client.id, periode, count: result.count },
        });

        return NextResponse.json({ 
            message: `${result.count} écritures enregistrées avec succès.`,
            count: result.count 
        }, { status: 201 });

    } catch (error) {
        console.error("Erreur POST TpeJournal:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// PATCH: Marquer un batch comme "Exporté vers la Production"
export async function PATCH(request: Request) {
    const { session, denied } = await requireWriteAccess();
    if (denied) return denied;

    try {
        const { periode: periodeBrute, clientId } = await request.json().catch(() => ({}));
        const periode = typeof periodeBrute === "string" ? normaliserPeriode(periodeBrute) ?? periodeBrute.trim() : periodeBrute;

        // Sans strictUndefinedChecks, Prisma retire purement et simplement un
        // filtre valant undefined : un corps de requete sans periode transformait
        // cet updateMany en export de TOUTES les ecritures PENDING de TOUS les
        // clients. Et meme avec une periode valide, l'absence de portee client
        // deversait en production les ecritures de tout le portefeuille pour ce
        // mois-la. Les deux criteres sont desormais obligatoires et verifies.
        if (typeof periode !== "string" || periode.trim() === "") {
            return NextResponse.json({ error: "periode requise." }, { status: 400 });
        }
        if (typeof clientId !== "string" || !/^[a-f0-9]{24}$/i.test(clientId)) {
            return NextResponse.json({ error: "clientId requis." }, { status: 400 });
        }

        // Seules les lignes examinées et approuvées explicitement passent en
        // production. Les lignes PENDING ne peuvent pas être comptabilisées
        // par une action de masse.
        const result = await prisma.tpeJournal.updateMany({
            where: { periode, clientId, status: "APPROVED" },
            data: { status: 'EXPORTED', exportedAt: new Date() }
        });

        await AuditService.log({
            action: "POST",
            entity: "TPE_JOURNAL",
            entityId: clientId,
            details: `${result.count} écriture(s) comptabilisées pour ${periode} par ${session.id}.`,
            newValue: { clientId, periode, count: result.count },
        });

        return NextResponse.json({ 
            message: `${result.count} écritures déversées dans la production.`,
            count: result.count 
        });
    } catch (error) {
        console.error("Erreur PATCH TpeJournal:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
