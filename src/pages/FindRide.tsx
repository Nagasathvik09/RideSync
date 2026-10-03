import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Search, 
  Crosshair, 
  Sparkles, 
  Filter, 
  Shield 
} from 'lucide-react';
import { useStore } from '../lib/store';
import { Commute, MatchScore } from '../types';
import { rankCarpoolMatches } from '../matching/score';
import { MapView } from '../maps/MapView';
import { BottomSheet } from '../components/ui/BottomSheet';
import { MapControls } from '../components/MapControls';
import { Button } from '../components/ui/Button';
import { RideCard, RideCardData } from '../components/ui/RideCard';
import { EmptyState } from '../components/ui/EmptyState';
import { RideCardSkeleton } from '../components/ui/Skeleton';
import { Toast } from '../components/ui/Toast';

const PASSENGER_PICKUP_PRESETS = [
  { label: 'Kondapur Botanical Garden Crossing', lat: 17.4580, lng: 78.3600 },
  { label: 'Gachibowli Telecom Nagar Flyover', lat: 17.4450, lng: 78.3550 },
  { label: 'Madhapur Metro Pillar 12', lat: 17.4483, lng: 78.3915 },
  { label: 'Miyapur Crossroads Bus Bay', lat: 17.4930, lng: 78.3580 },
  { label: 'Jubilee Hills Road 36 Metro', lat: 17.4280, lng: 78.4110 },
];

export const FindRide: React.FC = () => {
  const { currentUser, carpools, joinRequests, requestJoinCarpool } = useStore();
  const navigate = useNavigate();

  const [selectedPickupIndex, setSelectedPickupIndex] = useState(0);
  const currentPickup = PASSENGER_PICKUP_PRESETS[selectedPickupIndex];

  const [pickupLabel, setPickupLabel] = useState(currentPickup.label);
  const [pickupLat, setPickupLat] = useState(currentPickup.lat);
  const [pickupLng, setPickupLng] = useState(currentPickup.lng);
  const [filterWomenOnly, setFilterWomenOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Synthesize commute object for scoring
  const passengerCommute: Commute = useMemo(
    () => ({
      id: `commute-search-${currentUser.id}`,
      user_id: currentUser.id,
      role: 'passenger',
      source_label: pickupLabel,
      src_lat: pickupLat,
      src_lng: pickupLng,
      dest_label: 'Mindspace Tech Park, HITEC City',
      dest_lat: 17.4435,
      dest_lng: 78.3772,
      depart_time: '08:35',
      arrive_time: '09:15',
      flex_minutes: 25,
      max_detour_km: 4.5,
      recurring: true,
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      visibility: 'public',
      status: 'active',
      created_at: new Date().toISOString(),
    }),
    [currentUser.id, pickupLabel, pickupLat, pickupLng]
  );

  // Compute matches
  const rankedMatches: MatchScore[] = useMemo(() => {
    let matches = rankCarpoolMatches(currentUser, passengerCommute, carpools);
    if (filterWomenOnly) {
      matches = matches.filter((m) => m.carpool.visibility === 'women_only');
    }
    return matches;
  }, [currentUser, passengerCommute, carpools, filterWomenOnly]);

  // Set default selected ride
  const activeSelectedMatch = useMemo(() => {
    if (selectedRideId) {
      const found = rankedMatches.find((m) => m.carpool.id === selectedRideId);
      if (found) return found;
    }
    return rankedMatches[0] || null;
  }, [rankedMatches, selectedRideId]);

  // Map click to drop pin
  const handleMapClick = (lat: number, lng: number) => {
    setPickupLat(lat);
    setPickupLng(lng);
    setPickupLabel(`Pinned Landmark (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
  };

  const handleSelectPreset = (idx: number) => {
    setIsLoading(true);
    setSelectedPickupIndex(idx);
    const p = PASSENGER_PICKUP_PRESETS[idx];
    setPickupLabel(p.label);
    setPickupLat(p.lat);
    setPickupLng(p.lng);
    setTimeout(() => setIsLoading(false), 250);
  };

  const handleRequestJoin = (rideData?: RideCardData) => {
    const match = rideData
      ? rankedMatches.find((m) => m.carpool.id === rideData.id)
      : activeSelectedMatch;

    if (!match) return;

    // Check if already requested
    const existing = joinRequests.find(
      (r) => r.carpool_id === match.carpool.id && r.passenger_id === currentUser.id
    );
    if (existing) {
      setToastMessage('You have already submitted a join request for this ride.');
      setToastOpen(true);
      return;
    }

    requestJoinCarpool(
      match.carpool.id,
      pickupLabel,
      pickupLat,
      pickupLng,
      match.total,
      match.reasons || ['Optimal route corridor overlap', 'Minimal detour distance']
    );

    setToastMessage('Request sent to host! Waiting for corporate confirmation.');
    setToastOpen(true);

    setTimeout(() => {
      navigate('/requests');
    }, 900);
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-[#F5FAFF]">
      {/* 1. Full-Screen Map with selected route preview & user pin */}
      <div className="absolute inset-0 z-0">
        <MapView
          height="100%"
          polyline={activeSelectedMatch?.carpool.polyline}
          interactive={true}
          onMapClick={handleMapClick}
          stops={[
            {
              id: 'pickup_user',
              label: `Your Pickup: ${pickupLabel}`,
              lat: pickupLat,
              lng: pickupLng,
              kind: 'pickup',
              seq: 1,
              eta_min: 0,
              completed: false,
            },
            ...(activeSelectedMatch?.carpool
              ? [
                  {
                    id: 'dest_corp',
                    label: activeSelectedMatch.carpool.dest_label,
                    lat: activeSelectedMatch.carpool.dest_lat,
                    lng: activeSelectedMatch.carpool.dest_lng,
                    kind: 'destination' as const,
                    seq: 2,
                    eta_min: activeSelectedMatch.carpool.duration_min,
                    completed: false,
                  },
                ]
              : []),
          ]}
        />
      </div>

      {/* Floating Top Controls (Back Button + Recenter) */}
      <MapControls
        showBack={true}
        onBack={() => navigate('/dashboard')}
        onRecenter={() => {
          setPickupLat(17.4580);
          setPickupLng(78.3600);
        }}
        title="Find a ride"
        badge={`${rankedMatches.length} available`}
      />

      {/* 2. Draggable Bottom Sheet with Ranked Ride Cards */}
      <BottomSheet
        initialSnap="half"
        stickyFooter={
          activeSelectedMatch ? (
            <Button
              type="button"
              variant="primary"
              size="cta"
              onClick={() => handleRequestJoin()}
              className="w-full text-base font-bold shadow-soft"
            >
              Request to join
            </Button>
          ) : undefined
        }
      >
        <div className="space-y-4 pb-6">
          {/* Pickup Location Selector + Map Pin instruction */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6B80]">
                Your Pickup Point
              </span>
              <span className="text-[11px] text-[#2B8CEB] font-semibold">Tap map to drop pin</span>
            </div>

            <div className="flex items-center bg-[#F5FAFF] border border-[#E3ECF5] rounded-2xl p-2 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-white border border-[#E3ECF5] flex items-center justify-center text-[#2B8CEB] shrink-0 mr-2.5">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={pickupLabel}
                onChange={(e) => setPickupLabel(e.target.value)}
                placeholder="Enter pickup point"
                className="w-full bg-transparent text-xs font-semibold text-[#0F1B2D] focus:outline-none truncate"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 no-scrollbar">
              {PASSENGER_PICKUP_PRESETS.map((p, i) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleSelectPreset(i)}
                  className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                    selectedPickupIndex === i
                      ? 'bg-[#E8F3FF] text-[#2B8CEB] border border-[#2B8CEB] font-semibold'
                      : 'bg-white text-[#5B6B80] border border-[#E3ECF5] hover:border-[#4DA8FF]'
                  }`}
                >
                  {p.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Bar: Women only toggle chip */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-[#0F1B2D]">
              Ranked matches along route
            </span>

            <button
              type="button"
              onClick={() => setFilterWomenOnly(!filterWomenOnly)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                filterWomenOnly
                  ? 'bg-[#F3ECFF] text-[#B084F5] border border-[#B084F5]'
                  : 'bg-white text-[#5B6B80] border border-[#E3ECF5] hover:border-[#4DA8FF]'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Women only</span>
            </button>
          </div>

          {/* Cards List / Loading / Empty */}
          {isLoading ? (
            <div className="space-y-3">
              <RideCardSkeleton />
              <RideCardSkeleton />
            </div>
          ) : rankedMatches.length === 0 ? (
            <EmptyState
              title="No rides on your route yet"
              description="Be the first colleague to offer a ride along this corridor and earn corporate fuel credits."
              actionLabel="Host a ride instead"
              onAction={() => navigate('/host')}
            />
          ) : (
            <div className="space-y-3">
              {rankedMatches.map((match) => {
                const c = match.carpool;
                const isSelected = activeSelectedMatch?.carpool.id === c.id;
                const walkM = Math.round((match.walking_distance_km || 0.25) * 1000);
                const fareAmount = 64;

                const cardData: RideCardData = {
                  id: c.id,
                  hostName: c.host_name,
                  hostAvatar: c.host_photo,
                  departureTime: c.start_time.includes(':') ? `${c.start_time} AM` : c.start_time,
                  matchPercentage: Math.round(match.total || 92),
                  detourText: `${match.extra_min || 4} min detour · ${walkM} m walk`,
                  fare: fareAmount,
                  totalSeats: c.seats_total,
                  availableSeats: c.seats_available,
                  isWomenOnly: c.visibility === 'women_only',
                  isPrivate: c.visibility === 'private',
                  vehicleModel: c.vehicle?.model,
                  fromLocation: c.origin_label,
                  toLocation: c.dest_label,
                };

                return (
                  <RideCard
                    key={c.id}
                    ride={cardData}
                    isSelected={isSelected}
                    onSelect={() => setSelectedRideId(c.id)}
                    onRequestJoin={handleRequestJoin}
                  />
                );
              })}
            </div>
          )}
        </div>
      </BottomSheet>

      <Toast
        isOpen={toastOpen}
        onClose={() => setToastOpen(false)}
        message={toastMessage}
        type="success"
      />
    </div>
  );
};
