import { formatDistance } from '../utils/formatters';

export interface ReasonInputs {
  destDistKm: number;
  timeDiffMinutes: number;
  walkingDistKm: number;
  extraKm: number;
  extraMin: number;
  seatsAvailable: number;
  isWomenOnly: boolean;
  isRecurring: boolean;
}

export function generateMatchReasons(inputs: ReasonInputs): string[] {
  const reasons: string[] = [];

  // Destination proximity
  if (inputs.destDistKm <= 0.8) {
    reasons.push('Same office/campus destination');
  } else if (inputs.destDistKm <= 2.0) {
    reasons.push(`Drop-off within ${formatDistance(inputs.destDistKm)} of work`);
  }

  // Time compatibility
  if (inputs.timeDiffMinutes <= 5) {
    reasons.push('Departs within 5 mins of your schedule');
  } else if (inputs.timeDiffMinutes <= 15) {
    reasons.push(`Departure within ${inputs.timeDiffMinutes} mins`);
  } else {
    reasons.push(`Close time window (±${inputs.timeDiffMinutes}m)`);
  }

  // Detour
  if (inputs.extraKm <= 0.8) {
    reasons.push('Practically zero detour (+0.5 km)');
  } else if (inputs.extraKm <= 2.5) {
    reasons.push(`Minimal route deviation (+${inputs.extraKm.toFixed(1)} km, ~${inputs.extraMin}m)`);
  } else {
    reasons.push(`Comfortable detour (+${inputs.extraKm.toFixed(1)} km)`);
  }

  // Walking to pickup
  if (inputs.walkingDistKm <= 0.4) {
    reasons.push(`Quick pickup spot (${Math.round(inputs.walkingDistKm * 1000)}m walk)`);
  } else if (inputs.walkingDistKm <= 1.2) {
    reasons.push(`Pickup point ${formatDistance(inputs.walkingDistKm)} away`);
  }

  // Seats & community safety
  if (inputs.isWomenOnly) {
    reasons.push('Safe verified Women-Only ride');
  } else if (inputs.seatsAvailable >= 2) {
    reasons.push(`${inputs.seatsAvailable} seats available`);
  }

  return reasons.slice(0, 4);
}
