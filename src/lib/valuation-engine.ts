export function calculateDCF(ca: number, tauxCroissance: number, tauxActualisation: number, annees: number): { values: number[], terminalValue: number, enterpriseValue: number } {
  const values: number[] = [];
  let currentCF = ca * 0.15; // Assume 15% FCF margin for demo
  let npv = 0;

  for (let i = 1; i <= annees; i++) {
    currentCF = currentCF * (1 + tauxCroissance / 100);
    const pv = currentCF / Math.pow(1 + tauxActualisation / 100, i);
    values.push(pv);
    npv += pv;
  }

  // Terminal value (Gordon Growth Model assuming 2% perpetual growth)
  const perpetualGrowth = 0.02;
  const terminalValueRaw = (currentCF * (1 + perpetualGrowth)) / ((tauxActualisation / 100) - perpetualGrowth);
  const terminalValueDiscounted = terminalValueRaw / Math.pow(1 + tauxActualisation / 100, annees);
  
  const enterpriseValue = npv + terminalValueDiscounted;

  return {
    values,
    terminalValue: terminalValueDiscounted,
    enterpriseValue
  };
}

export function calculateEBITDAMultiple(ebitda: number, multiple: number): number {
  return ebitda * multiple;
}

export function calculateANR(actif: number, dettes: number, ajustements: number): number {
  return (actif - dettes) + ajustements;
}
