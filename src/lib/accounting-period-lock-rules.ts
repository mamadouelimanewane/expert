export function peutVerrouillerPeriode(ecrituresARevoir: number): boolean {
  return Number.isSafeInteger(ecrituresARevoir) && ecrituresARevoir === 0;
}
