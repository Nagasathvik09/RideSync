import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

export interface RouteStopItem {
  id: string;
  name: string;
  location: string;
  eta?: string;
  isPickup?: boolean;
  isDestination?: boolean;
  status?: 'completed' | 'current' | 'upcoming';
  riderName?: string;
}

interface RouteTimelineProps {
  origin?: { name: string; time?: string };
  stops: RouteStopItem[];
  destination: { name: string; time?: string };
  className?: string;
}

export const RouteTimeline: React.FC<RouteTimelineProps> = ({
  origin,
  stops,
  destination,
  className = '',
}) => {
  return (
    <div className={`relative pl-2 py-2 space-y-4 ${className}`}>
      {/* Origin (if specified) */}
      {origin && (
        <div className="relative flex items-start gap-3">
          {/* Node */}
          <div className="relative z-10 w-7 h-7 rounded-full bg-[#E8F3FF] border border-[#2B8CEB] flex items-center justify-center text-[#2B8CEB] shrink-0 shadow-xs">
            <Navigation className="w-3.5 h-3.5 fill-[#2B8CEB]" />
          </div>

          {/* Dotted connecting line downwards */}
          <div className="absolute left-[13px] top-7 bottom-[-16px] w-[2px] border-l-2 border-dashed border-[#4DA8FF]" />

          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6B80]">Start / Departs</span>
              {origin.time && <span className="text-xs font-medium text-[#5B6B80]">{origin.time}</span>}
            </div>
            <p className="text-sm font-semibold text-[#0F1B2D] truncate">{origin.name}</p>
          </div>
        </div>
      )}

      {/* Numbered Pickup Stops */}
      {stops.map((stop, index) => {
        const isCurrent = stop.status === 'current';
        const isCompleted = stop.status === 'completed';

        return (
          <div key={stop.id || index} className="relative flex items-start gap-3">
            {/* Dotted line connecting downwards */}
            <div className="absolute left-[13px] top-7 bottom-[-16px] w-[2px] border-l-2 border-dashed border-[#4DA8FF]" />

            {/* Numbered Node */}
            <div
              className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                isCompleted
                  ? 'bg-[#22B07D] text-white shadow-xs'
                  : isCurrent
                  ? 'bg-[#2B8CEB] text-white ring-4 ring-[#E8F3FF] shadow-sm'
                  : 'bg-white border-2 border-[#4DA8FF] text-[#0F1B2D]'
              }`}
            >
              {index + 1}
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#2B8CEB]">
                  Pickup {index + 1} {stop.riderName ? `• ${stop.riderName}` : ''}
                </span>
                {stop.eta && <span className="text-xs font-bold text-[#0F1B2D]">{stop.eta}</span>}
              </div>
              <p className="text-sm font-medium text-[#0F1B2D] truncate">{stop.location || stop.name}</p>
            </div>
          </div>
        );
      })}

      {/* Destination */}
      <div className="relative flex items-start gap-3">
        {/* Node */}
        <div className="relative z-10 w-7 h-7 rounded-full bg-[#0F1B2D] text-white flex items-center justify-center shrink-0 shadow-xs">
          <MapPin className="w-3.5 h-3.5 fill-white" />
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6B80]">Destination</span>
            {destination.time && <span className="text-xs font-bold text-[#0F1B2D]">{destination.time}</span>}
          </div>
          <p className="text-sm font-bold text-[#0F1B2D] truncate">{destination.name}</p>
        </div>
      </div>
    </div>
  );
};
