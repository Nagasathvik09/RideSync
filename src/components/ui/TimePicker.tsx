import React, { useState } from 'react';
import { Clock } from 'lucide-react';

interface TimePickerProps {
  value: string; // e.g., "08:30" or ISO or formatted
  onChange: (time: string) => void;
  label?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  label = 'Departure time',
}) => {
  // Ensure formatted HH:MM
  const timeString = value || '08:30';

  const presets = [
    { label: 'Now + 15m', time: getRelativeTime(15) },
    { label: '8:30 AM', time: '08:30' },
    { label: '9:00 AM', time: '09:00' },
    { label: '5:30 PM', time: '17:30' },
    { label: '6:00 PM', time: '18:00' },
  ];

  function getRelativeTime(minutesAhead: number) {
    const d = new Date();
    d.setMinutes(d.getMinutes() + minutesAhead);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(Math.ceil(d.getMinutes() / 5) * 5 % 60).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  // Format nicely for display (e.g. 08:30 -> 08:30 AM)
  const formatTimeDisplay = (time24: string) => {
    if (!time24) return '--:--';
    const [h, m] = time24.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return time24;
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return {
      time: `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
      period,
    };
  };

  const display = formatTimeDisplay(timeString);

  return (
    <div className="w-full space-y-2">
      {label && <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B80]">{label}</label>}

      {/* Hero 28-36px semibold time block */}
      <div className="relative flex items-center justify-between p-3.5 bg-[#F5FAFF] border border-[#E3ECF5] rounded-2xl focus-within:border-[#2B8CEB] focus-within:ring-2 focus-within:ring-[#4DA8FF]/20 transition-all">
        <div className="flex items-baseline gap-2">
          <span className="text-32 md:text-36 font-semibold tracking-tight text-[#0F1B2D] tabular-nums">
            {typeof display === 'object' ? display.time : display}
          </span>
          {typeof display === 'object' && (
            <span className="text-sm font-bold text-[#2B8CEB] bg-[#E8F3FF] px-2 py-0.5 rounded-md uppercase tracking-wide">
              {display.period}
            </span>
          )}
        </div>

        <div className="relative flex items-center">
          <input
            type="time"
            value={timeString}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
            aria-label="Select custom time"
          />
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl border border-[#E3ECF5] text-xs font-semibold text-[#0F1B2D] shadow-xs pointer-events-none">
            <Clock className="w-4 h-4 text-[#2B8CEB]" strokeWidth={2} />
            <span>Change</span>
          </div>
        </div>
      </div>

      {/* Quick commute chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {presets.map((preset) => {
          const isSelected = preset.time === timeString;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => onChange(preset.time)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-[#E8F3FF] text-[#2B8CEB] border border-[#2B8CEB] font-semibold'
                  : 'bg-white text-[#5B6B80] border border-[#E3ECF5] hover:border-[#4DA8FF]'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
