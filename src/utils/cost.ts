import { CostSplit } from '../types';

export const DEFAULT_RATES = {
  fuelWearPerKm: 8,       // ₹8 / km
  timePerMin: 1,           // ₹1 / min
  soloCabRatePerKm: 24,    // ₹24 / km for solo Uber/Ola
  soloCabBaseFare: 120,    // Minimum base fare
  co2KgPerKm: 0.12,        // 0.12 kg CO2 saved per solo km avoided
};

export function calculateCostSplit(
  distanceKm: number,
  durationMin: number,
  passengerCount: number,
  fuelWearRate: number = DEFAULT_RATES.fuelWearPerKm,
  timeRate: number = DEFAULT_RATES.timePerMin
): CostSplit {
  const safeDistance = Math.max(0.5, distanceKm);
  const safeDuration = Math.max(5, durationMin);
  const safePassengers = Math.max(1, passengerCount);

  const distanceCost = safeDistance * fuelWearRate;
  const timeCost = safeDuration * timeRate;
  const totalCost = Math.round(distanceCost + timeCost);

  const totalParticipants = safePassengers + 1; // Passengers + Host
  const perParticipant = Math.round(totalCost / totalParticipants);

  // Solo cab comparison
  const soloCabEstimated = Math.max(
    DEFAULT_RATES.soloCabBaseFare,
    Math.round(safeDistance * DEFAULT_RATES.soloCabRatePerKm)
  );

  const passengerSavings = Math.max(0, soloCabEstimated - perParticipant);
  const totalCostSaved = passengerSavings * safePassengers;

  // CO2 savings formula: (solo km avoided) * 0.12 kg/km
  // Solo km avoided = distanceKm * passengers who avoided taking separate vehicles
  const soloKmAvoided = safeDistance * safePassengers;
  const co2SavedKg = Number((soloKmAvoided * DEFAULT_RATES.co2KgPerKm).toFixed(2));

  return {
    carpool_id: '',
    distance_km: safeDistance,
    duration_min: safeDuration,
    fuel_wear_rate_per_km: fuelWearRate,
    time_rate_per_min: timeRate,
    total_cost: totalCost,
    participants_count: totalParticipants,
    host_share: perParticipant,
    per_passenger: perParticipant,
    solo_cab_estimated_cost: soloCabEstimated,
    cost_saved_per_passenger: passengerSavings,
    total_cost_saved: totalCostSaved,
    co2_saved_kg: co2SavedKg,
  };
}
