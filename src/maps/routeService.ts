import { HYDERABAD_ROUTES, getNearestHyderabadRoute } from '../data/fallbackRoutes';
import { haversineDistanceKm } from '../utils/geo';
import { getGoogleMapsApiKey } from './googleMapsKeyManager';

export interface RouteResult {
  polyline: [number, number][];
  distanceKm: number;
  durationMin: number;
  source: 'google' | 'osrm' | 'fallback';
}

/**
 * Fetch driving route with optional intermediate waypoints.
 * 1. Checks if Google Maps API key is configured and tries Google Routes API.
 * 2. Falls back to OSRM public routing API.
 * 3. Falls back to high-resolution Hyderabad tech corridor polylines.
 */
export async function getDirectionsRoute(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  waypoints: { lat: number; lng: number }[] = []
): Promise<RouteResult> {
  const googleKey = getGoogleMapsApiKey();

  // Try Google Routes API if key is present
  if (googleKey) {
    try {
      const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': googleKey,
          'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline',
        },
        body: JSON.stringify({
          origin: { location: { latLng: { latitude: originLat, longitude: originLng } } },
          destination: { location: { latLng: { latitude: destLat, longitude: destLng } } },
          intermediates: waypoints.map(w => ({
            location: { latLng: { latitude: w.lat, longitude: w.lng } }
          })),
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE',
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          const r = data.routes[0];
          const distKm = Number((r.distanceMeters / 1000).toFixed(1));
          const durMin = Math.round(parseInt(r.duration || '600s', 10) / 60);
          
          if (r.polyline?.encodedPolyline) {
            const decoded = decodePolyline(r.polyline.encodedPolyline);
            return {
              polyline: decoded,
              distanceKm: distKm,
              durationMin: durMin,
              source: 'google',
            };
          }
        }
      }
    } catch {
      // Fall through to OSRM
    }
  }

  // 2. Try OSRM API
  const points = [[originLng, originLat], ...waypoints.map(w => [w.lng, w.lat]), [destLng, destLat]];
  const coordinatesString = points.map(p => `${p[0].toFixed(5)},${p[1].toFixed(5)}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=geojson`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const polyline: [number, number][] = route.geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]]
        );
        const distanceKm = Number((route.distance / 1000).toFixed(1));
        const durationMin = Math.round(route.duration / 60);

        return {
          polyline,
          distanceKm,
          durationMin,
          source: 'osrm',
        };
      }
    }
  } catch {
    // Network or timeout, proceed to fallback
  }

  // 3. Fallback: Hyderabad precomputed tech corridor route
  const nearest = getNearestHyderabadRoute(originLat, originLng);
  const fallbackPolyline: [number, number][] = [
    [originLat, originLng],
    ...waypoints.map(w => [w.lat, w.lng] as [number, number]),
    ...nearest.polyline.slice(1, -1),
    [destLat, destLng],
  ];

  const totalDist = Number(
    (haversineDistanceKm(originLat, originLng, destLat, destLng) * 1.3).toFixed(1)
  );
  const totalMin = Math.round(totalDist * 2.8);

  return {
    polyline: fallbackPolyline.length > 2 ? fallbackPolyline : nearest.polyline,
    distanceKm: totalDist,
    durationMin: totalMin,
    source: 'fallback',
  };
}

// Simple Google Encoded Polyline decoder
function decodePolyline(encoded: string): [number, number][] {
  const poly: [number, number][] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    poly.push([lat / 1e5, lng / 1e5]);
  }
  return poly;
}
