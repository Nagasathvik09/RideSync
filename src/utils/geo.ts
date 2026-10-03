// Haversine formula to compute great-circle distance between two coordinates in kilometers
export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Compute total distance of an array of coordinates
export function computePolylineDistanceKm(polyline: [number, number][]): number {
  if (!polyline || polyline.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < polyline.length - 1; i++) {
    total += haversineDistanceKm(
      polyline[i][0],
      polyline[i][1],
      polyline[i + 1][0],
      polyline[i + 1][1]
    );
  }
  return Number(total.toFixed(2));
}

// Find nearest point along a polyline segment to a target location (suggested pickup spot)
export function findNearestPointOnPolyline(
  targetLat: number,
  targetLng: number,
  polyline: [number, number][]
): { lat: number; lng: number; distanceKm: number; segmentIndex: number } {
  if (!polyline || polyline.length === 0) {
    return { lat: targetLat, lng: targetLng, distanceKm: 0, segmentIndex: 0 };
  }

  let minDistance = Infinity;
  let nearestCoord: [number, number] = polyline[0];
  let nearestSegmentIndex = 0;

  for (let i = 0; i < polyline.length; i++) {
    const d = haversineDistanceKm(targetLat, targetLng, polyline[i][0], polyline[i][1]);
    if (d < minDistance) {
      minDistance = d;
      nearestCoord = polyline[i];
      nearestSegmentIndex = i;
    }
  }

  return {
    lat: nearestCoord[0],
    lng: nearestCoord[1],
    distanceKm: Number(minDistance.toFixed(2)),
    segmentIndex: nearestSegmentIndex,
  };
}

// Calculate detour in kilometers: (Driver Start -> Passenger Pickup -> Destination) - (Driver Start -> Destination)
export function calculateDetourKm(
  startLat: number,
  startLng: number,
  destLat: number,
  destLng: number,
  pickupLat: number,
  pickupLng: number
): number {
  const directDistance = haversineDistanceKm(startLat, startLng, destLat, destLng);
  const withPickupDistance =
    haversineDistanceKm(startLat, startLng, pickupLat, pickupLng) +
    haversineDistanceKm(pickupLat, pickupLng, destLat, destLng);

  const detour = Math.max(0, withPickupDistance - directDistance);
  return Number(detour.toFixed(2));
}

// Interpolate GPS coordinate along polyline by progress fraction [0, 1]
export function interpolatePolyline(
  polyline: [number, number][],
  fraction: number
): { lat: number; lng: number; remainingKm: number; currentSegment: number } {
  if (!polyline || polyline.length === 0) {
    return { lat: 0, lng: 0, remainingKm: 0, currentSegment: 0 };
  }
  if (polyline.length === 1 || fraction <= 0) {
    const total = computePolylineDistanceKm(polyline);
    return { lat: polyline[0][0], lng: polyline[0][1], remainingKm: total, currentSegment: 0 };
  }
  if (fraction >= 1) {
    const last = polyline[polyline.length - 1];
    return { lat: last[0], lng: last[1], remainingKm: 0, currentSegment: polyline.length - 1 };
  }

  const segmentDistances: number[] = [];
  let totalDistance = 0;

  for (let i = 0; i < polyline.length - 1; i++) {
    const d = haversineDistanceKm(
      polyline[i][0],
      polyline[i][1],
      polyline[i + 1][0],
      polyline[i + 1][1]
    );
    segmentDistances.push(d);
    totalDistance += d;
  }

  const targetDist = totalDistance * fraction;
  let accumulatedDist = 0;

  for (let i = 0; i < segmentDistances.length; i++) {
    const segDist = segmentDistances[i];
    if (accumulatedDist + segDist >= targetDist) {
      const segFraction = segDist === 0 ? 0 : (targetDist - accumulatedDist) / segDist;
      const lat = polyline[i][0] + (polyline[i + 1][0] - polyline[i][0]) * segFraction;
      const lng = polyline[i][1] + (polyline[i + 1][1] - polyline[i][1]) * segFraction;
      const remainingKm = Math.max(0, totalDistance - targetDist);
      return {
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
        remainingKm: Number(remainingKm.toFixed(2)),
        currentSegment: i,
      };
    }
    accumulatedDist += segDist;
  }

  const last = polyline[polyline.length - 1];
  return { lat: last[0], lng: last[1], remainingKm: 0, currentSegment: polyline.length - 1 };
}
