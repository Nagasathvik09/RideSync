import React, { useEffect, useRef } from 'react';
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import { RouteStop } from '../types';
import { GOOGLE_MAPS_LIGHT_STYLE } from './googleMapStyles';

interface GoogleMapRendererProps {
  apiKey: string;
  polyline?: [number, number][];
  stops?: RouteStop[];
  currentVehicleLocation?: { lat: number; lng: number };
  showPrivacyZone?: boolean;
  privacyZoneCenter?: { lat: number; lng: number };
  onMapClick?: (lat: number, lng: number) => void;
  interactive?: boolean;
  height?: string;
  zoom?: number;
  center?: [number, number];
}

// Inner Google Maps overlay manager that connects to useMap()
const GoogleMapOverlays: React.FC<{
  polyline?: [number, number][];
  stops?: RouteStop[];
  currentVehicleLocation?: { lat: number; lng: number };
  showPrivacyZone?: boolean;
  privacyZoneCenter?: { lat: number; lng: number };
  onMapClick?: (lat: number, lng: number) => void;
}> = ({
  polyline,
  stops,
  currentVehicleLocation,
  showPrivacyZone,
  privacyZoneCenter,
  onMapClick,
}) => {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const glowPolylineRef = useRef<google.maps.Polyline | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const vehicleMarkerRef = useRef<google.maps.Marker | null>(null);
  const privacyCircleRef = useRef<google.maps.Circle | null>(null);

  // 1. Draw Polyline Route
  useEffect(() => {
    if (!map || typeof google === 'undefined') return;

    // Clean previous polylines
    if (polylineRef.current) polylineRef.current.setMap(null);
    if (glowPolylineRef.current) glowPolylineRef.current.setMap(null);

    if (polyline && polyline.length > 1) {
      const path = polyline.map(p => ({ lat: p[0], lng: p[1] }));

      // Glow backing
      glowPolylineRef.current = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#38bdf8',
        strokeOpacity: 0.45,
        strokeWeight: 8,
        map,
      });

      // Sharp core route
      polylineRef.current = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#0284c7',
        strokeOpacity: 0.95,
        strokeWeight: 4,
        map,
      });
    }

    return () => {
      if (polylineRef.current) polylineRef.current.setMap(null);
      if (glowPolylineRef.current) glowPolylineRef.current.setMap(null);
    };
  }, [map, polyline]);

  // 2. Draw Stops & Markers
  useEffect(() => {
    if (!map || typeof google === 'undefined') return;

    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    if (stops && stops.length > 0) {
      stops.forEach((stop) => {
        let pinColor = '#3b82f6'; // blue for pickup
        let labelText = `${stop.seq}`;
        if (stop.kind === 'origin') {
          pinColor = '#10b981'; // emerald green
          labelText = 'A';
        } else if (stop.kind === 'destination') {
          pinColor = '#f59e0b'; // amber gold
          labelText = 'B';
        }

        const marker = new google.maps.Marker({
          position: { lat: stop.lat, lng: stop.lng },
          map,
          title: stop.label,
          label: {
            text: labelText,
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '12px',
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: pinColor,
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 14,
          },
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="color: #0f172a; padding: 4px; font-family: sans-serif; font-size: 12px;">
              <strong style="display:block; margin-bottom: 2px;">${stop.label}</strong>
              <span style="color: #64748b;">Stop #${stop.seq} • ~${stop.eta_min} mins</span>
              ${stop.pickup_code ? `<div style="margin-top: 4px; font-family: monospace; font-weight: bold; color: #047857;">OTP: ${stop.pickup_code}</div>` : ''}
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open({ anchor: marker, map });
        });

        markersRef.current.push(marker);
      });
    }

    return () => {
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];
    };
  }, [map, stops]);

  // 3. Draw Vehicle Marker
  useEffect(() => {
    if (!map || typeof google === 'undefined') return;

    if (currentVehicleLocation) {
      if (!vehicleMarkerRef.current) {
        vehicleMarkerRef.current = new google.maps.Marker({
          position: { lat: currentVehicleLocation.lat, lng: currentVehicleLocation.lng },
          map,
          title: 'Active Vehicle in Transit',
          zIndex: 9999,
          icon: {
            path: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
            fillColor: '#0284c7',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 1.5,
            scale: 1.2,
            anchor: new google.maps.Point(12, 12),
          },
        });
      } else {
        vehicleMarkerRef.current.setPosition({
          lat: currentVehicleLocation.lat,
          lng: currentVehicleLocation.lng,
        });
      }
    } else if (vehicleMarkerRef.current) {
      vehicleMarkerRef.current.setMap(null);
      vehicleMarkerRef.current = null;
    }

    return () => {
      if (vehicleMarkerRef.current) {
        vehicleMarkerRef.current.setMap(null);
        vehicleMarkerRef.current = null;
      }
    };
  }, [map, currentVehicleLocation]);

  // 4. Blurred Privacy Zone Circle
  useEffect(() => {
    if (!map || typeof google === 'undefined') return;

    if (privacyCircleRef.current) {
      privacyCircleRef.current.setMap(null);
      privacyCircleRef.current = null;
    }

    if (showPrivacyZone && privacyZoneCenter) {
      privacyCircleRef.current = new google.maps.Circle({
        center: { lat: privacyZoneCenter.lat, lng: privacyZoneCenter.lng },
        radius: 450, // 450m radius
        strokeColor: '#3b82f6',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#60a5fa',
        fillOpacity: 0.25,
        map,
      });
    }

    return () => {
      if (privacyCircleRef.current) {
        privacyCircleRef.current.setMap(null);
        privacyCircleRef.current = null;
      }
    };
  }, [map, showPrivacyZone, privacyZoneCenter]);

  // 5. Auto Fit Bounds
  useEffect(() => {
    if (!map || typeof google === 'undefined') return;

    const bounds = new google.maps.LatLngBounds();
    let count = 0;

    if (polyline && polyline.length > 0) {
      polyline.forEach(p => {
        bounds.extend({ lat: p[0], lng: p[1] });
        count++;
      });
    }

    if (stops && stops.length > 0) {
      stops.forEach(s => {
        bounds.extend({ lat: s.lat, lng: s.lng });
        count++;
      });
    }

    if (currentVehicleLocation) {
      bounds.extend({ lat: currentVehicleLocation.lat, lng: currentVehicleLocation.lng });
      count++;
    }

    if (count > 1) {
      map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
    }
  }, [map, polyline, stops, currentVehicleLocation]);

  // 6. Map click listener
  useEffect(() => {
    if (!map || !onMapClick || typeof google === 'undefined') return;

    const listener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        onMapClick(e.latLng.lat(), e.latLng.lng());
      }
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, onMapClick]);

  return null;
};

export const GoogleMapRenderer: React.FC<GoogleMapRendererProps> = ({
  apiKey,
  polyline,
  stops,
  currentVehicleLocation,
  showPrivacyZone,
  privacyZoneCenter,
  onMapClick,
  interactive = true,
  height = '420px',
  zoom = 13,
  center = [17.4435, 78.3650],
}) => {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/60 shadow-xl bg-slate-950" style={{ height }}>
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={{ lat: center[0], lng: center[1] }}
          defaultZoom={zoom}
          gestureHandling={interactive ? 'auto' : 'none'}
          disableDefaultUI={!interactive}
          zoomControl={interactive}
          styles={GOOGLE_MAPS_LIGHT_STYLE}
          style={{ width: '100%', height: '100%' }}
        >
          <GoogleMapOverlays
            polyline={polyline}
            stops={stops}
            currentVehicleLocation={currentVehicleLocation}
            showPrivacyZone={showPrivacyZone}
            privacyZoneCenter={privacyZoneCenter}
            onMapClick={onMapClick}
          />
        </Map>
      </APIProvider>

      {/* Google Maps Active Floating Badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full border border-sky-200 text-xs shadow-sm">
        <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
        <span className="font-semibold text-slate-700 flex items-center gap-1 text-[11px]">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#0284c7"/>
          </svg>
          Google Maps
        </span>
      </div>

      {/* Floating legend */}
      <div className="absolute top-3 right-3 z-10 hidden sm:flex flex-col gap-1 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-200 text-[10px] text-slate-600 shadow-sm pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-600 ring-2 ring-sky-200"></span>
          <span>Start Point</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 ring-2 ring-blue-200"></span>
          <span>Pickup Stop</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-amber-200"></span>
          <span>Destination</span>
        </div>
      </div>
    </div>
  );
};
