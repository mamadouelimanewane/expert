export interface AccountBalance {
  account: string;
  label: string;
  debit: number;
  credit: number;
}

export interface CompanyBalance {
  companyId: string;
  companyName: string;
  balances: AccountBalance[];
}

export interface Elimination {
  id: string;
  type: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  accountDebit: string;
  accountCredit: string;
}

export interface ConsolidatedAccount {
  account: string;
  label: string;
  debit: number;
  credit: number;
  eliminationDebit: number;
  eliminationCredit: number;
  consolidatedDebit: number;
  consolidatedCredit: number;
}

export function consolidateBalances(companyBalances: CompanyBalance[], eliminations: Elimination[]): ConsolidatedAccount[] {
  const consolidatedMap = new Map<string, ConsolidatedAccount>();

  // Aggregate all balances
  for (const comp of companyBalances) {
    for (const bal of comp.balances) {
      if (!consolidatedMap.has(bal.account)) {
        consolidatedMap.set(bal.account, {
          account: bal.account,
          label: bal.label,
          debit: 0,
          credit: 0,
          eliminationDebit: 0,
          eliminationCredit: 0,
          consolidatedDebit: 0,
          consolidatedCredit: 0
        });
      }
      const acc = consolidatedMap.get(bal.account)!;
      acc.debit += bal.debit;
      acc.credit += bal.credit;
    }
  }

  // Apply eliminations
  for (const elim of eliminations) {
    // Elimination debit
    if (consolidatedMap.has(elim.accountDebit)) {
      const accDebit = consolidatedMap.get(elim.accountDebit)!;
      accDebit.eliminationDebit += elim.amount;
    }
    // Elimination credit
    if (consolidatedMap.has(elim.accountCredit)) {
      const accCredit = consolidatedMap.get(elim.accountCredit)!;
      accCredit.eliminationCredit += elim.amount;
    }
  }

  // Calculate consolidated
  for (const acc of Array.from(consolidatedMap.values())) {
    acc.consolidatedDebit = Math.max(0, acc.debit - acc.eliminationDebit + acc.eliminationCredit - acc.credit);
    acc.consolidatedCredit = Math.max(0, acc.credit - acc.eliminationCredit + acc.eliminationDebit - acc.debit);
  }

  return Array.from(consolidatedMap.values()).sort((a, b) => a.account.localeCompare(b.account));
}
