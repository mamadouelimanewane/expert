import type { CompteBalance } from "./types";

/** Écriture de journal en partie double, telle que stockée dans `TpeJournal`. */
export type EcritureJournal = {
    debitCompte: string | null;
    debitIntitule?: string | null;
    creditCompte: string | null;
    creditIntitule?: string | null;
    montant: number | null;
};

/**
 * Agrège des écritures de journal en balance générale.
 *
 * Chaque écriture alimente le débit d'un compte et le crédit d'un autre pour le
 * même montant : la balance produite est donc équilibrée par construction, et
 * `controleBalance` du moteur le vérifie.
 *
 * On utilise `montant`, et non `entree + sortie` : additionner une entrée et
 * une sortie sur la même ligne doublerait le montant de l'écriture.
 */
export function balanceDepuisJournal(ecritures: EcritureJournal[]): CompteBalance[] {
    const comptes = new Map<string, CompteBalance>();

    const toucher = (numero: string, intitule: string): CompteBalance => {
        const cle = numero.trim();
        let compte = comptes.get(cle);
        if (!compte) {
            compte = { numero: cle, intitule: intitule?.trim() || cle, debit: 0, credit: 0 };
            comptes.set(cle, compte);
        } else if (!compte.intitule || compte.intitule === cle) {
            compte.intitule = intitule?.trim() || compte.intitule;
        }
        return compte;
    };

    for (const e of ecritures) {
        const montant = Number(e.montant) || 0;
        if (montant === 0) continue;

        const debitCompte = (e.debitCompte ?? "").trim();
        const creditCompte = (e.creditCompte ?? "").trim();

        // Une écriture incomplète casserait l'équilibre : on l'ignore plutôt que
        // de la ventiler à moitié.
        if (!debitCompte || !creditCompte) continue;

        toucher(debitCompte, e.debitIntitule ?? "").debit += montant;
        toucher(creditCompte, e.creditIntitule ?? "").credit += montant;
    }

    return [...comptes.values()].sort((a, b) => a.numero.localeCompare(b.numero));
}
