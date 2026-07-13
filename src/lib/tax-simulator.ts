export interface TaxSimulation {
  baseImposable: number;
  pays: 'sn' | 'ci' | 'cm' | 'bj';
  regime: 'reel' | 'simplifie';
  secteur: 'services' | 'commerce' | 'industrie';
}

export function simulateCorporateTax(params: TaxSimulation): { is: number; tvaMoyenne: number; cfce: number; total: number } {
  // Simplified tax simulation for demo purposes
  const tauxIS = {
    'sn': 0.30,
    'ci': 0.25,
    'cm': 0.33,
    'bj': 0.30
  };

  const is = params.baseImposable * tauxIS[params.pays];
  
  // Fake estimation for TVA and CFCE based on base imposable
  const tvaMoyenne = params.baseImposable * 0.18; // 18% standard UEMOA
  const cfce = params.baseImposable * 0.03; // ~3% taxes diverses

  return {
    is,
    tvaMoyenne,
    cfce,
    total: is + cfce
  };
}
