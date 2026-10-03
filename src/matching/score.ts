import { Carpool, Commute, MatchScore, UserProfile } from '../types';
import { haversineDistanceKm, findNearestPointOnPolyline, calculateDetourKm } from '../utils/geo';
import { isEligibleForCarpool, calculateTimeDifferenceMinutes } from './eligibility';
import { generateMatchReasons } from './reasons';

export interface MatchingWeights {
  route: number;    // 0.30
  time: number;     // 0.25
  distance: number; // 0.20
  pickup: number;   // 0.15
  detour: number;   // 0.10
}

export const DEFAULT_WEIGHTS: MatchingWeights = {
  route: 0.30,
  time: 0.25,
  distance: 0.20,
  pickup: 0.15,
  detour: 0.10,
};

/**
 * Computes compatibility score for a single carpool and passenger commute pair
 */
export function scoreCarpool(
  passenger: UserProfile,
  passengerCommute: Commute,
  carpool: Carpool,
  weights: MatchingWeights = DEFAULT_WEIGHTS,
  inviteCode?: string
): MatchScore | null {
  // 1. Run hard filters
  const eligibility = isEligibleForCarpool(passenger, passengerCommute, carpool, inviteCode);
  if (!eligibility.eligible) {
    return null;
  }

  // 2. Factor 1: Route Similarity (Weight 0.30)
  // Destination within 1.5 km = 100, linearly down to 0 at 6 km
  const destDistKm = haversineDistanceKm(
    passengerCommute.dest_lat,
    passengerCommute.dest_lng,
    carpool.dest_lat,
    carpool.dest_lng
  );
  let destScore = 100;
  if (destDistKm > 1.5) {
    destScore = Math.max(0, 100 - ((destDistKm - 1.5) / (6.0 - 1.5)) * 100);
  }

  // Passenger origin to host polyline proximity (0 km = 100, 5 km = 0)
  const nearestOnRoute = findNearestPointOnPolyline(
    passengerCommute.src_lat,
    passengerCommute.src_lng,
    carpool.polyline
  );
  const originScore = Math.max(0, 100 - (nearestOnRoute.distanceKm / 5.0) * 100);
  const routeSimScore = Math.round(destScore * 0.5 + originScore * 0.5);

  // 3. Factor 2: Time Compatibility (Weight 0.25)
  const timeDiffMinutes = calculateTimeDifferenceMinutes(
    carpool.start_time,
    passengerCommute.depart_time
  );
  const flexMinutes = passengerCommute.flex_minutes || 30;
  const timeScore = Math.round(
    Math.max(0, 100 - (timeDiffMinutes / flexMinutes) * 100)
  );

  // 4. Factor 3: Distance Proximity (Weight 0.20)
  // Distance from passenger source to nearest point on host route (0 km = 100, 5 km = 0)
  const distanceScore = Math.round(
    Math.max(0, 100 - (nearestOnRoute.distanceKm / 5.0) * 100)
  );

  // 5. Factor 4: Pickup Convenience (Weight 0.15)
  // Walking distance to suggested pickup point: <= 0.5 km = 100, >= 2.0 km = 0
  const walkingDistKm = nearestOnRoute.distanceKm;
  let pickupScore = 100;
  if (walkingDistKm > 0.5) {
    pickupScore = Math.max(0, 100 - ((walkingDistKm - 0.5) / (2.0 - 0.5)) * 100);
  }
  pickupScore = Math.round(pickupScore);

  // 6. Factor 5: Detour (Weight 0.10)
  const extraKm = calculateDetourKm(
    carpool.origin_lat,
    carpool.origin_lng,
    carpool.dest_lat,
    carpool.dest_lng,
    nearestOnRoute.lat,
    nearestOnRoute.lng
  );
  const maxDetourKm = passengerCommute.max_detour_km || 5.0;
  const detourScore = Math.round(
    Math.max(0, 100 - (extraKm / maxDetourKm) * 100)
  );
  const extraMin = Math.max(1, Math.round(extraKm * 2.5)); // Approx 2.5 min per km in city traffic

  // Total weighted score
  const total = Math.round(
    routeSimScore * weights.route +
    timeScore * weights.time +
    distanceScore * weights.distance +
    pickupScore * weights.pickup +
    detourScore * weights.detour
  );

  // Suggested pickup spot
  const suggestedPickup = {
    lat: nearestOnRoute.lat,
    lng: nearestOnRoute.lng,
    label: nearestOnRoute.distanceKm < 0.2 
      ? passengerCommute.source_label 
      : `${passengerCommute.source_label} Junction (${Math.round(nearestOnRoute.distanceKm * 1000)}m walk)`,
  };

  // Generate explainable reasons
  const reasons = generateMatchReasons({
    destDistKm,
    timeDiffMinutes,
    walkingDistKm,
    extraKm,
    extraMin,
    seatsAvailable: carpool.seats_available,
    isWomenOnly: carpool.visibility === 'women_only',
    isRecurring: passengerCommute.recurring,
  });

  return {
    carpool_id: carpool.id,
    carpool,
    passenger_commute_id: passengerCommute.id,
    total: Math.min(99, Math.max(15, total)), // keep within realistic range
    route_sim: routeSimScore,
    time_score: timeScore,
    distance_score: distanceScore,
    pickup_score: pickupScore,
    detour_score: detourScore,
    reasons,
    extra_km: extraKm,
    extra_min: extraMin,
    walking_distance_km: walkingDistKm,
    suggested_pickup: suggestedPickup,
  };
}

/**
 * Filter and rank all candidate carpools for a passenger commute
 */
export function rankCarpoolMatches(
  passenger: UserProfile,
  passengerCommute: Commute,
  allCarpools: Carpool[],
  inviteCode?: string
): MatchScore[] {
  const matches: MatchScore[] = [];

  for (const carpool of allCarpools) {
    const scored = scoreCarpool(passenger, passengerCommute, carpool, DEFAULT_WEIGHTS, inviteCode);
    if (scored) {
      matches.push(scored);
    }
  }

  // Sort descending by total score
  matches.sort((a, b) => b.total - a.total);
  return matches;
}
