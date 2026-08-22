export interface ForecastPoint {
  week: number;
  date: string;
  cash: number;
}

export function generateForecast(baseCash: number, scenario: 'optimiste' | 'realiste' | 'pessimiste'): ForecastPoint[] {
  const points: ForecastPoint[] = [];
  let currentCash = baseCash;
  
  // Base weekly change + noise
  const baseWeeklyChange = 250000; 
  
  // Scenario multiplier
  const multiplier = scenario === 'optimiste' ? 1.5 : scenario === 'pessimiste' ? -0.8 : 1.0;
  
  for (let i = 0; i <= 12; i++) { // 13 weeks = ~90 days
    const date = new Date();
    date.setDate(date.getDate() + (i * 7));
    
    if (i > 0) {
      // Simulate weekly cash flow (some weeks are negative, some positive)
      const weeklyVolatility = Math.sin(i) * 500000;
      currentCash += (baseWeeklyChange * multiplier) + weeklyVolatility;
    }
    
    points.push({
      week: i,
      date: date.toISOString().split('T')[0],
      cash: Math.round(currentCash)
    });
  }
  
  return points;
}

export function detectCriticalPoints(forecast: ForecastPoint[]): { minCash: number; criticalDate: string | null } {
  // Une projection vide faisait planter la lecture de `forecast[0].cash`.
  if (!forecast || forecast.length === 0) {
    return { minCash: 0, criticalDate: null };
  }

  let minCash = forecast[0].cash;
  let criticalDate: string | null = null;

  for (const point of forecast) {
    if (point.cash < minCash) {
      minCash = point.cash;
    }
    if (point.cash < 0 && !criticalDate) {
      criticalDate = point.date;
    }
  }
  
  return { minCash, criticalDate };
}
