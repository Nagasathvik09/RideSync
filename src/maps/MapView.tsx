import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { RouteStop } from '../types';
import { getGoogleMapsApiKey } from './googleMapsKeyManager';
import { GoogleMapRenderer } from './GoogleMapRenderer';

interface MapViewProps {
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

// Custom modern SVG icons for Leaflet matching the Light Blue theme
function createCustomIcon(htmlString: string, size: [number, number] = [36, 36]) {
  return L.divIcon({
    html: htmlString,
    className: 'custom-leaflet-icon',
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1] / 2],
    popupAnchor: [0, -size[1] / 2],
  });
}

const originIcon = createCustomIcon(`
  <div class="relative flex items-center justify-center w-8 h-8 bg-[#2B8CEB] text-white rounded-full shadow-md ring-4 ring-[#E8F3FF]">
    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  </div>
`);

const destIcon = createCustomIcon(`
  <div class="relative flex items-center justify-center w-8 h-8 bg-[#0F1B2D] text-white rounded-full shadow-md ring-4 ring-[#E3ECF5]">
    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
      <line x1="4" x2="4" y1="22" y2="15"/>
    </svg>
  </div>
`);

const vehicleIcon = createCustomIcon(`
  <div class="relative flex items-center justify-center w-10 h-10 bg-white text-[#2B8CEB] border-2 border-[#4DA8FF] rounded-full shadow-lg ring-4 ring-[#E8F3FF]">
    <span class="absolute w-full h-full rounded-full bg-[#4DA8FF]/25 animate-ping"></span>
    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 z-10" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
    </svg>
  </div>
`, [40, 40]);

function createPickupIcon(seq: number) {
  return createCustomIcon(`
    <div class="relative flex items-center justify-center w-8 h-8 bg-[#2B8CEB] text-white font-bold text-xs rounded-full shadow-md ring-4 ring-[#E8F3FF] border border-white">
      ${seq}
    </div>
  `, [32, 32]);
}

// Auto-bounds fitter for Leaflet
function MapBoundsFitter({ polyline, stops, currentVehicleLocation }: { 
  polyline?: [number, number][]; 
  stops?: RouteStop[];
  currentVehicleLocation?: { lat: number; lng: number };
}) {
  const map = useMap();

  useEffect(() => {
    const coords: [number, number][] = [];
    if (polyline && polyline.length > 0) {
      coords.push(...polyline);
    }
    if (stops && stops.length > 0) {
      stops.forEach((s) => coords.push([s.lat, s.lng]));
    }
    if (currentVehicleLocation) {
      coords.push([currentVehicleLocation.lat, currentVehicleLocation.lng]);
    }

    if (coords.length > 1) {
      const bounds = L.latLngBounds(coords.map((c) => [c[0], c[1]]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else if (coords.length === 1) {
      map.setView(coords[0], 14);
    }
  }, [polyline, stops, currentVehicleLocation, map]);

  return null;
}

// Leaflet map click listener
function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export const MapView: React.FC<MapViewProps> = (props) => {
  const [googleKey, setGoogleKey] = useState<string>(() => getGoogleMapsApiKey());

  // Listen to key changes in localStorage or custom event
  useEffect(() => {
    const updateKey = () => {
      setGoogleKey(getGoogleMapsApiKey());
    };
    window.addEventListener('google_maps_key_change', updateKey);
    window.addEventListener('storage', updateKey);
    return () => {
      window.removeEventListener('google_maps_key_change', updateKey);
      window.removeEventListener('storage', updateKey);
    };
  }, []);

  const initialCenter: [number, number] = useMemo(() => {
    if (props.currentVehicleLocation) return [props.currentVehicleLocation.lat, props.currentVehicleLocation.lng];
    if (props.polyline && props.polyline.length > 0) return [props.polyline[0][0], props.polyline[0][1]];
    if (props.stops && props.stops.length > 0) return [props.stops[0].lat, props.stops[0].lng];
    return props.center || [17.4435, 78.3650];
  }, [props.polyline, props.stops, props.currentVehicleLocation, props.center]);

  // If Google Maps API Key is configured, render Google Maps JS API seamlessly
  if (googleKey && googleKey.length > 0) {
    return (
      <div className="relative w-full h-full">
        <GoogleMapRenderer
          {...props}
          apiKey={googleKey}
          center={initialCenter}
        />
      </div>
    );
  }

  // Default clean, minimalist OpenStreetMap mode (Leaflet + Carto Voyager tiles)
  return (
    <div
      className="relative w-full h-full overflow-hidden bg-[#F5FAFF]"
      style={{ height: props.height || '100%' }}
    >
      <MapContainer
        center={initialCenter}
        zoom={props.zoom || 13}
        scrollWheelZoom={props.interactive !== false}
        dragging={props.interactive !== false}
        touchZoom={props.interactive !== false}
        doubleClickZoom={props.interactive !== false}
        style={{ height: '100%', width: '100%', background: '#F5FAFF' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> | &copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        <MapBoundsFitter 
          polyline={props.polyline} 
          stops={props.stops} 
          currentVehicleLocation={props.currentVehicleLocation} 
        />

        {props.interactive !== false && props.onMapClick && (
          <MapClickHandler onMapClick={props.onMapClick} />
        )}

        {/* Driver Main Route Polyline in Light Blue Theme */}
        {props.polyline && props.polyline.length > 1 && (
          <>
            <Polyline
              positions={props.polyline}
              pathOptions={{
                color: '#4DA8FF',
                weight: 8,
                opacity: 0.35,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            <Polyline
              positions={props.polyline}
              pathOptions={{
                color: '#2B8CEB',
                weight: 4,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </>
        )}

        {/* Blurred Privacy Zone */}
        {props.showPrivacyZone && props.privacyZoneCenter && (
          <Circle
            center={[props.privacyZoneCenter.lat, props.privacyZoneCenter.lng]}
            radius={450}
            pathOptions={{
              color: '#4DA8FF',
              fillColor: '#E8F3FF',
              fillOpacity: 0.45,
              weight: 2,
              dashArray: '6, 6',
            }}
          />
        )}

        {/* Origin Marker */}
        {props.stops &&
          props.stops
            .filter((s) => s.kind === 'origin')
            .map((stop) => (
              <Marker
                key={stop.id}
                position={[stop.lat, stop.lng]}
                icon={originIcon}
              >
                <Popup>
                  <div className="p-1 text-[#0F1B2D] text-xs">
                    <p className="font-bold text-[#2B8CEB]">Route Start</p>
                    <p className="text-[#5B6B80] mt-0.5">{stop.label}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

        {/* Destination Marker */}
        {props.stops &&
          props.stops
            .filter((s) => s.kind === 'destination')
            .map((stop) => (
              <Marker
                key={stop.id}
                position={[stop.lat, stop.lng]}
                icon={destIcon}
              >
                <Popup>
                  <div className="p-1 text-[#0F1B2D] text-xs">
                    <p className="font-bold text-[#0F1B2D]">Corporate Campus</p>
                    <p className="text-[#5B6B80] mt-0.5">{stop.label}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

        {/* Intermediate Sequenced Pickup Stops */}
        {props.stops &&
          props.stops
            .filter((s) => s.kind === 'pickup')
            .map((stop, index) => (
              <Marker
                key={stop.id}
                position={[stop.lat, stop.lng]}
                icon={createPickupIcon(stop.seq || index + 1)}
              >
                <Popup>
                  <div className="p-1 text-[#0F1B2D] text-xs">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-[#2B8CEB]">Pickup Stop #{stop.seq || index + 1}</span>
                      {stop.completed && (
                        <span className="text-[10px] bg-[#EBFBF5] text-[#22B07D] font-bold px-1 rounded">
                          Boarded
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-[#0F1B2D] mt-0.5">{stop.label}</p>
                    {stop.passenger_name && (
                      <p className="text-[#5B6B80] text-[11px] mt-0.5">Colleague: {stop.passenger_name}</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

        {/* Live Moving Vehicle Marker */}
        {props.currentVehicleLocation && (
          <Marker
            position={[props.currentVehicleLocation.lat, props.currentVehicleLocation.lng]}
            icon={vehicleIcon}
          >
            <Popup>
              <div className="p-1 text-[#0F1B2D] text-xs">
                <p className="font-bold text-[#22B07D] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#22B07D] animate-pulse"></span>
                  Active Vehicle in Transit
                </p>
                <p className="text-[#5B6B80] mt-0.5 font-mono text-[11px]">Live GPS Feed</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};
