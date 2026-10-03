import { Carpool, Commute, UserProfile } from '../types';
import { haversineDistanceKm, calculateDetourKm } from '../utils/geo';

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
}

/**
 * Validates whether a user can host a women-only ride
 */
export function canCreateWomenOnlyRide(user: UserProfile): boolean {
  return user.gender === 'female';
}

/**
 * Hard filters before scoring carpools for a passenger commute:
 * 1. Carpool status must be 'scheduled' and seats_available > 0
 * 2. Passenger cannot be the host
 * 3. Visibility check:
 *    - 'public': open to all verified employees
 *    - 'women_only': strictly enforced - passenger must be female
 *    - 'private': requires matching invite code or host is user
 * 4. Time difference must be within passenger's flex window
 * 5. Detour added to route must not exceed max allowed detour
 */
export function isEligibleForCarpool(
  passenger: UserProfile,
  passengerCommute: Commute,
  carpool: Carpool,
  providedInviteCode?: string
): EligibilityResult {
  // 1. Status & capacity check
  if (carpool.status !== 'scheduled') {
    return { eligible: false, reason: 'Ride is not in scheduled state' };
  }
  if (carpool.seats_available <= 0) {
    return { eligible: false, reason: 'No seats available' };
  }

  // 2. Cannot join own ride
  if (carpool.host_id === passenger.id) {
    return { eligible: false, reason: 'You cannot request to join your own ride' };
  }

  // 3. Already a member
  if (carpool.members.some(m => m.passenger_id === passenger.id && m.status !== 'cancelled')) {
    return { eligible: false, reason: 'Already a confirmed member of this carpool' };
  }

  // 4. Women-Only strict enforcement (CRITICAL SAFETY REQUIREMENT)
  if (carpool.visibility === 'women_only') {
    if (passenger.gender !== 'female') {
      return { 
        eligible: false, 
        reason: 'Restricted to female employees only. Non-female users cannot view or join women-only rides.' 
      };
    }
  }

  // 5. Private ride invite code check
  if (carpool.visibility === 'private') {
    const isOwner = carpool.host_id === passenger.id;
    const hasValidInvite = providedInviteCode && 
      carpool.invite_code && 
      carpool.invite_code.toUpperCase() === providedInviteCode.trim().toUpperCase();
    
    if (!isOwner && !hasValidInvite) {
      return { eligible: false, reason: 'Private ride requires a valid invite code' };
    }
  }

  // 6. Time diff check
  const timeDiffMinutes = calculateTimeDifferenceMinutes(
    carpool.start_time,
    passengerCommute.depart_time
  );
  const allowedFlex = passengerCommute.flex_minutes || 30;
  if (timeDiffMinutes > allowedFlex) {
    return { 
      eligible: false, 
      reason: `Departure time difference (${timeDiffMinutes}m) exceeds allowed flex (${allowedFlex}m)` 
    };
  }

  // 7. Detour check
  const detourKm = calculateDetourKm(
    carpool.origin_lat,
    carpool.origin_lng,
    carpool.dest_lat,
    carpool.dest_lng,
    passengerCommute.src_lat,
    passengerCommute.src_lng
  );
  const maxDetour = Math.max(passengerCommute.max_detour_km || 5, 5);
  if (detourKm > maxDetour) {
    return { 
      eligible: false, 
      reason: `Route detour (${detourKm}km) exceeds max limit (${maxDetour}km)` 
    };
  }

  return { eligible: true };
}

// Convert "HH:MM" strings into difference in minutes
export function calculateTimeDifferenceMinutes(timeA: string, timeB: string): number {
  if (!timeA || !timeB) return 0;
  const [hA, mA] = timeA.split(':').map(Number);
  const [hB, mB] = timeB.split(':').map(Number);
  const minA = (hA || 0) * 60 + (mA || 0);
  const minB = (hB || 0) * 60 + (mB || 0);
  return Math.abs(minA - minB);
}
