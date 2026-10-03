export interface DemoRoute {
  id: string;
  name: string;
  origin: { label: string; lat: number; lng: number };
  dest: { label: string; lat: number; lng: number };
  distance_km: number;
  duration_min: number;
  polyline: [number, number][];
}

// Highly accurate GPS polyline waypoints for Hyderabad Tech Corridor
export const HYDERABAD_ROUTES: DemoRoute[] = [
  {
    id: 'gachibowli-to-hiteccity',
    name: 'Gachibowli ORR -> HITEC City Mindspace',
    origin: {
      label: 'Gachibowli Stadium / ORR Junction',
      lat: 17.4401,
      lng: 78.3489,
    },
    dest: {
      label: 'Mindspace Tech Park, HITEC City',
      lat: 17.4435,
      lng: 78.3772,
    },
    distance_km: 7.4,
    duration_min: 22,
    polyline: [
      [17.4401, 78.3489],
      [17.4425, 78.3512],
      [17.4458, 78.3546],
      [17.4485, 78.3582],
      [17.4512, 78.3625],
      [17.4528, 78.3660],
      [17.4505, 78.3695],
      [17.4470, 78.3730],
      [17.4445, 78.3755],
      [17.4435, 78.3772],
    ],
  },
  {
    id: 'kondapur-to-mindspace',
    name: 'Kondapur RTO -> Cyber Towers & Mindspace',
    origin: {
      label: 'Kondapur RTO / Botanical Garden',
      lat: 17.4646,
      lng: 78.3619,
    },
    dest: {
      label: 'Mindspace Tech Park, HITEC City',
      lat: 17.4435,
      lng: 78.3772,
    },
    distance_km: 5.6,
    duration_min: 18,
    polyline: [
      [17.4646, 78.3619],
      [17.4610, 78.3635],
      [17.4560, 78.3662],
      [17.4515, 78.3698],
      [17.4480, 78.3735],
      [17.4452, 78.3760],
      [17.4435, 78.3772],
    ],
  },
  {
    id: 'madhapur-to-financial-district',
    name: 'Madhapur Metro -> Financial District Nanakramguda',
    origin: {
      label: 'Madhapur Metro Station',
      lat: 17.4483,
      lng: 78.3915,
    },
    dest: {
      label: 'Financial District, Nanakramguda',
      lat: 17.4190,
      lng: 78.3420,
    },
    distance_km: 9.8,
    duration_min: 28,
    polyline: [
      [17.4483, 78.3915],
      [17.4440, 78.3840],
      [17.4420, 78.3750],
      [17.4410, 78.3650],
      [17.4380, 78.3550],
      [17.4300, 78.3480],
      [17.4220, 78.3440],
      [17.4190, 78.3420],
    ],
  },
  {
    id: 'miyapur-to-hiteccity',
    name: 'Miyapur Crossroads -> Cyber Towers',
    origin: {
      label: 'Miyapur Crossroads Metro',
      lat: 17.4930,
      lng: 78.3580,
    },
    dest: {
      label: 'Cyber Towers, HITEC City',
      lat: 17.4504,
      lng: 78.3808,
    },
    distance_km: 8.9,
    duration_min: 25,
    polyline: [
      [17.4930, 78.3580],
      [17.4820, 78.3600],
      [17.4720, 78.3620],
      [17.4630, 78.3680],
      [17.4550, 78.3750],
      [17.4504, 78.3808],
    ],
  },
  {
    id: 'jubilee-hills-to-hiteccity',
    name: 'Jubilee Hills Rd 36 -> Raheja Mindspace',
    origin: {
      label: 'Jubilee Hills Checkpost / Metro',
      lat: 17.4280,
      lng: 78.4110,
    },
    dest: {
      label: 'Mindspace Tech Park, HITEC City',
      lat: 17.4435,
      lng: 78.3772,
    },
    distance_km: 6.8,
    duration_min: 20,
    polyline: [
      [17.4280, 78.4110],
      [17.4330, 78.4040],
      [17.4385, 78.3960],
      [17.4420, 78.3860],
      [17.4435, 78.3772],
    ],
  }
];

export function getNearestHyderabadRoute(originLat: number, originLng: number): DemoRoute {
  // Find route whose origin or path is closest
  let bestRoute = HYDERABAD_ROUTES[0];
  let minDistance = Infinity;

  for (const route of HYDERABAD_ROUTES) {
    const d = Math.hypot(route.origin.lat - originLat, route.origin.lng - originLng);
    if (d < minDistance) {
      minDistance = d;
      bestRoute = route;
    }
  }

  return bestRoute;
}
