import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Car, 
  MapPin, 
  Clock, 
  Shield, 
  PiggyBank, 
  Users, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../lib/store';
import { MapView } from '../maps/MapView';
import { BottomSheet } from '../components/ui/BottomSheet';
import { MapControls } from '../components/MapControls';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { RouteTimeline, RouteStopItem } from '../components/ui/RouteTimeline';

export const RideDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { carpools, currentUser, requestJoinCarpool, joinRequests } = useStore();

  const carpool = carpools.find((c) => c.id === id) || carpools[0];
  const isHost = carpool.host_id === currentUser.id;
  const isPassenger = carpool.members.some((m) => m.passenger_id === currentUser.id);
  const alreadyRequested = joinRequests.some(
    (r) => r.carpool_id === carpool.id && r.passenger_id === currentUser.id && r.status === 'pending'
  );

  // Cost calculation
  const yourShare = 64;
  const soloCost = 174;
  const savings = soloCost - yourShare; // ₹110

  // Format stops for RouteTimeline
  const stops: RouteStopItem[] = carpool.stops
    .filter((s) => s.kind === 'pickup')
    .map((s, idx) => ({
      id: s.id,
      name: s.label,
      location: s.label,
      eta: `+${s.eta_min || (idx + 1) * 8}m`,
      riderName: s.passenger_name || 'Reserved Seat',
      status: s.kind === 'origin' ? 'completed' : 'upcoming',
    }));

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-[#F5FAFF]">
      {/* 1. Full-Screen Map */}
      <div className="absolute inset-0 z-0">
        <MapView
          height="100%"
          polyline={carpool.polyline}
          interactive={true}
          stops={carpool.stops}
        />
      </div>

      {/* Floating Top Controls (Back Button) */}
      <MapControls
        showBack={true}
        onBack={() => navigate(-1)}
        title="Ride details"
        badge={carpool.visibility === 'women_only' ? 'Women Only' : 'Corporate Pool'}
      />

      {/* 2. Draggable Bottom Sheet with Route Timeline, Rider Avatars, Cost Split */}
      <BottomSheet
        initialSnap="half"
        defaultHeight="half"
        stickyFooter={
          isHost || isPassenger ? (
            <Button
              type="button"
              variant="primary"
              size="cta"
              onClick={() => navigate(`/live/${carpool.id}`)}
              className="w-full text-base font-bold shadow-soft"
            >
              Track live trip
            </Button>
          ) : alreadyRequested ? (
            <Button
              type="button"
              variant="secondary"
              size="cta"
              disabled
              className="w-full text-base font-bold"
            >
              Request pending host review
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="cta"
              onClick={() => navigate('/find')}
              className="w-full text-base font-bold shadow-soft"
            >
              Request to join (₹{yourShare})
            </Button>
          )
        }
      >
        <div className="space-y-5 pb-6">
          {/* Header Row: Destination, Departure Time & Status Chip */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                <Badge variant="status">
                  {carpool.status === 'in_progress'
                    ? 'In transit'
                    : carpool.status === 'scheduled'
                    ? 'Scheduled'
                    : 'Active'}
                </Badge>
                {carpool.visibility === 'women_only' && (
                  <Badge variant="women-only">Women only</Badge>
                )}
                {carpool.visibility === 'private' && (
                  <Badge variant="private">Private</Badge>
                )}
              </div>
              <h1 className="text-20 font-bold text-[#0F1B2D] tracking-tight">
                {carpool.origin_label.split(',')[0]} → {carpool.dest_label.split(',')[0]}
              </h1>
              <p className="text-xs text-[#5B6B80]">
                {carpool.distance_km} km • ~{carpool.duration_min} min estimated duration
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#5B6B80]">
                Departs
              </span>
              <span className="text-28 font-semibold text-[#0F1B2D] tracking-tight tabular-nums">
                {carpool.start_time}
              </span>
            </div>
          </div>

          {/* Cost Split Row: "Your share ₹64, saves ₹110 vs solo" */}
          <div className="p-3.5 bg-[#E8F3FF] border border-[#2B8CEB]/30 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-[#2B8CEB] flex items-center justify-center shadow-xs shrink-0">
                <PiggyBank className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs font-medium text-[#5B6B80]">Your share:</span>
                  <span className="text-base font-bold text-[#0F1B2D]">₹{yourShare}</span>
                </div>
                <p className="text-xs font-bold text-[#22B07D]">
                  Saves ₹{savings} vs solo ride
                </p>
              </div>
            </div>

            <div className="text-right text-[11px] text-[#5B6B80]">
              <span className="block font-semibold">Fair Split</span>
              <span>100% automated</span>
            </div>
          </div>

          {/* Rider Avatars & Vehicle */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B80]">
              Driver & Passengers
            </span>

            <div className="p-3 bg-white border border-[#E3ECF5] rounded-2xl shadow-xs space-y-3">
              {/* Driver */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Avatar
                    name={carpool.host_name}
                    image={carpool.host_photo}
                    size="md"
                    isWomenOnly={carpool.visibility === 'women_only'}
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#0F1B2D]">{carpool.host_name}</span>
                      <span className="text-[10px] bg-[#E8F3FF] text-[#2B8CEB] px-1.5 py-0.2 rounded font-bold">
                        Host
                      </span>
                    </div>
                    <span className="text-[11px] text-[#5B6B80]">
                      {carpool.vehicle?.model} • {carpool.vehicle?.reg_no}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-semibold text-[#22B07D]">Verified Host</span>
              </div>

              {/* Members */}
              {carpool.members.length > 0 && (
                <div className="pt-2 border-t border-[#E3ECF5] flex items-center gap-2">
                  <span className="text-xs text-[#5B6B80] font-medium">Co-riders:</span>
                  <div className="flex items-center -space-x-1.5">
                    {carpool.members.map((m) => (
                      <Avatar
                        key={m.passenger_id}
                        name={m.passenger_name}
                        image={m.passenger_photo}
                        size="sm"
                        className="ring-2 ring-white"
                      />
                    ))}
                  </div>
                  <span className="text-xs text-[#5B6B80] font-medium ml-1">
                    {carpool.members.map((m) => m.passenger_name.split(' ')[0]).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Route Timeline (Vertical dotted line with numbered pickup stops) */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B80]">
              Route Timeline
            </span>

            <div className="p-3 bg-[#F5FAFF] border border-[#E3ECF5] rounded-2xl">
              <RouteTimeline
                origin={{ name: carpool.origin_label, time: carpool.start_time }}
                stops={stops}
                destination={{ name: carpool.dest_label, time: '+32m' }}
              />
            </div>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};
