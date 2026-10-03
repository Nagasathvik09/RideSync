import React from 'react';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Button } from './Button';
import { ChevronRight } from 'lucide-react';

export interface RideCardData {
  id: string;
  hostName: string;
  hostAvatar?: string;
  departureTime: string; // e.g. "08:45 AM"
  matchPercentage: number; // e.g. 92
  detourText: string; // e.g. "4 min detour · 300 m walk"
  fare: number; // e.g. 65
  currency?: string;
  totalSeats: number;
  availableSeats: number;
  isWomenOnly?: boolean;
  isPrivate?: boolean;
  vehicleModel?: string;
  fromLocation?: string;
  toLocation?: string;
}

interface RideCardProps {
  ride: RideCardData;
  isSelected?: boolean;
  onSelect?: (ride: RideCardData) => void;
  onRequestJoin?: (ride: RideCardData) => void;
  showJoinCta?: boolean;
}

export const RideCard: React.FC<RideCardProps> = ({
  ride,
  isSelected = false,
  onSelect,
  onRequestJoin,
  showJoinCta = false,
}) => {
  const firstName = ride.hostName.split(' ')[0];

  return (
    <div
      onClick={() => onSelect?.(ride)}
      className={`relative w-full rounded-2xl p-4 transition-all cursor-pointer ${
        isSelected
          ? 'bg-[#E8F3FF] border-2 border-[#2B8CEB] shadow-soft'
          : 'bg-white border border-[#E3ECF5] hover:border-[#4DA8FF] shadow-xs'
      }`}
    >
      {/* Top Row: Avatar + Name + Badges + Detour/Match */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar
            name={ride.hostName}
            image={ride.hostAvatar}
            size="md"
            isWomenOnly={ride.isWomenOnly}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-bold text-[#0F1B2D] truncate">{firstName}</span>
              {ride.isWomenOnly && <Badge variant="women-only">Women only</Badge>}
              {ride.isPrivate && <Badge variant="private">Private</Badge>}
            </div>
            <p className="text-xs text-[#5B6B80] truncate">
              {ride.vehicleModel || 'Verified colleague'}
            </p>
          </div>
        </div>

        {/* Match Chip */}
        <Badge variant="match" className="text-xs shrink-0 px-2.5 py-1">
          {ride.matchPercentage}% match
        </Badge>
      </div>

      {/* Middle Row: Large Departure Time & Large Fare */}
      <div className="mt-3 flex items-baseline justify-between">
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#5B6B80]">
            Departs
          </span>
          <span className="text-28 font-semibold text-[#0F1B2D] tracking-tight tabular-nums">
            {ride.departureTime}
          </span>
        </div>

        <div className="text-right">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#5B6B80]">
            Fare
          </span>
          <span className="text-28 font-semibold text-[#0F1B2D] tracking-tight tabular-nums">
            {ride.currency || '₹'}{ride.fare}
          </span>
        </div>
      </div>

      {/* Detour and Walk Info */}
      <div className="mt-1 flex items-center justify-between text-xs text-[#5B6B80]">
        <span>{ride.detourText}</span>

        {/* Seat Availability as Dots */}
        <div className="flex items-center gap-1" title={`${ride.availableSeats} of ${ride.totalSeats} seats left`}>
          <span className="text-[11px] mr-1 text-[#5B6B80] font-medium">{ride.availableSeats} left</span>
          {Array.from({ length: ride.totalSeats }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i < ride.availableSeats
                  ? 'bg-[#2B8CEB]'
                  : 'bg-[#E3ECF5]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Action / Select CTA */}
      {showJoinCta && (
        <div className="mt-3 pt-3 border-t border-[#E3ECF5] flex items-center justify-between">
          <span className="text-xs font-semibold text-[#2B8CEB]">Tap to view route on map</span>
          <Button
            size="sm"
            variant="primary"
            onClick={(e) => {
              e.stopPropagation();
              onRequestJoin?.(ride);
            }}
          >
            Request to join
          </Button>
        </div>
      )}
    </div>
  );
};
