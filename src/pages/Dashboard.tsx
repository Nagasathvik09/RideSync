import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Car, 
  Users, 
  ChevronRight 
} from 'lucide-react';
import { useStore } from '../lib/store';
import { MapView } from '../maps/MapView';
import { BottomSheet } from '../components/ui/BottomSheet';
import { MapControls } from '../components/MapControls';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';

export const Dashboard: React.FC = () => {
  const { currentUser, carpools, activeCarpoolId } = useStore();
  const navigate = useNavigate();

  const [whereToQuery, setWhereToQuery] = useState(currentUser.work_area || 'Mindspace Tech Park, HITEC City');
  const [mapCenter, setMapCenter] = useState<[number, number]>([17.4435, 78.3650]);

  // Active or upcoming commute
  const nextRide = carpools.find((c) => c.id === activeCarpoolId) || carpools[0];
  const firstName = currentUser.full_name.split(' ')[0];

  const handleRecenter = () => {
    setMapCenter([17.4600, 78.3500]);
  };

  const handleWhereToSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/find');
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-[#F5FAFF]">
      {/* 1. Full-Screen Map with User Pin and Stops */}
      <div className="absolute inset-0 z-0">
        <MapView
          height="100%"
          center={mapCenter}
          zoom={14}
          interactive={true}
          currentVehicleLocation={
            nextRide && nextRide.status === 'in_progress'
              ? { lat: 17.4435, lng: 78.3650 }
              : undefined
          }
          stops={
            nextRide
              ? [
                  {
                    id: 'home',
                    label: 'Pickup (You)',
                    lat: 17.4600,
                    lng: 78.3500,
                    kind: 'pickup',
                    seq: 1,
                    eta_min: 0,
                    completed: false,
                  },
                  {
                    id: 'dest',
                    label: nextRide.dest_label,
                    lat: nextRide.dest_lat,
                    lng: nextRide.dest_lng,
                    kind: 'destination',
                    seq: 2,
                    eta_min: nextRide.duration_min,
                    completed: false,
                  },
                ]
              : undefined
          }
        />
      </div>

      {/* Floating Top Map Controls */}
      <MapControls
        onOpenMenu={() => navigate('/profile')}
        onRecenter={handleRecenter}
        title="RideSync"
        badge="Corporate Pool"
      />

      {/* 2. Draggable Bottom Sheet with 3 Snap Points (Peek, Half, Full) */}
      <BottomSheet initialSnap="half">
        <div className="space-y-5 pb-6">
          {/* Greeting */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#5B6B80]">
                Corporate Commute
              </p>
              <h1 className="text-20 font-bold text-[#0F1B2D] tracking-tight">
                Hi {firstName}, where to?
              </h1>
            </div>
            <Avatar
              name={currentUser.full_name}
              image={currentUser.photo_url}
              size="md"
              className="border-2 border-white shadow-xs cursor-pointer"
            />
          </div>

          {/* Single Search-Style Input "Where to?" (defaults to office) */}
          <form onSubmit={handleWhereToSubmit} className="relative">
            <div className="relative flex items-center bg-[#F5FAFF] border border-[#E3ECF5] rounded-2xl p-1.5 focus-within:border-[#2B8CEB] focus-within:ring-2 focus-within:ring-[#4DA8FF]/20 transition-all shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#2B8CEB] shadow-xs shrink-0">
                <Search className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <input
                type="text"
                value={whereToQuery}
                onChange={(e) => setWhereToQuery(e.target.value)}
                placeholder="Where to?"
                className="w-full bg-transparent px-3 py-2 text-sm font-semibold text-[#0F1B2D] placeholder-[#5B6B80] focus:outline-none"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-[#4DA8FF] hover:bg-[#2B8CEB] text-[#0F1B2D] hover:text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
              >
                Go
              </button>
            </div>
          </form>

          {/* Two Big Cards Side by Side: "Find a ride" & "Host a ride" */}
          <div className="grid grid-cols-2 gap-3">
            {/* Find a Ride Card */}
            <button
              type="button"
              onClick={() => navigate('/find')}
              className="text-left p-4 rounded-2xl bg-white border border-[#E3ECF5] hover:border-[#4DA8FF] shadow-soft active:scale-[0.98] transition-all group"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#E8F3FF] text-[#2B8CEB] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6 stroke-[2]" />
              </div>
              <h2 className="text-base font-bold text-[#0F1B2D] tracking-tight">Find a ride</h2>
              <p className="text-xs text-[#5B6B80] mt-0.5 line-clamp-1">Join a colleague route</p>
              <div className="mt-3 flex items-center text-xs font-bold text-[#2B8CEB]">
                <span>Explore matches</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </div>
            </button>

            {/* Host a Ride Card */}
            <button
              type="button"
              onClick={() => navigate('/host')}
              className="text-left p-4 rounded-2xl bg-white border border-[#E3ECF5] hover:border-[#4DA8FF] shadow-soft active:scale-[0.98] transition-all group"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#E8F3FF] text-[#2B8CEB] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Car className="w-6 h-6 stroke-[2]" />
              </div>
              <h2 className="text-base font-bold text-[#0F1B2D] tracking-tight">Host a ride</h2>
              <p className="text-xs text-[#5B6B80] mt-0.5 line-clamp-1">Offer empty seats</p>
              <div className="mt-3 flex items-center text-xs font-bold text-[#2B8CEB]">
                <span>Publish route</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </div>
            </button>
          </div>

          {/* Today's Commute Summary */}
          {nextRide && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6B80]">
                  Today's Commute
                </span>
                <Badge variant="status">
                  {nextRide.status === 'in_progress' ? 'Live Now' : 'Scheduled'}
                </Badge>
              </div>

              <div
                onClick={() =>
                  nextRide.status === 'in_progress'
                    ? navigate(`/live/${nextRide.id}`)
                    : navigate(`/carpool/${nextRide.id}`)
                }
                className="flex items-center justify-between p-3.5 bg-white border border-[#E3ECF5] rounded-2xl hover:border-[#4DA8FF] shadow-xs cursor-pointer transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F3FF] flex flex-col items-center justify-center text-[#2B8CEB] shrink-0">
                    <span className="text-xs font-bold leading-none">08:45</span>
                    <span className="text-[9px] uppercase font-semibold text-[#5B6B80]">AM</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#0F1B2D] truncate">
                      {nextRide.origin_label.split(',')[0]} → {nextRide.dest_label.split(',')[0]}
                    </p>
                    <p className="text-[11px] text-[#5B6B80] truncate">
                      Host: {nextRide.host_name} • {nextRide.vehicle?.model || 'Colleague Vehicle'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[#2B8CEB] shrink-0 font-semibold text-xs pl-2">
                  <span>View</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}
        </div>
      </BottomSheet>
    </div>
  );
};
