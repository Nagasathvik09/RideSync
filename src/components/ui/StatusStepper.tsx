import React from 'react';
import { Check, Clock, Navigation, UserCheck, Car, CheckCircle2 } from 'lucide-react';

export type TripStatus = 'scheduled' | 'en_route' | 'picked_up' | 'in_transit' | 'completed';

interface StatusStepperProps {
  currentStatus: TripStatus | string;
  className?: string;
}

interface Step {
  key: TripStatus;
  label: string;
  icon: React.ElementType;
}

const STEPS: Step[] = [
  { key: 'scheduled', label: 'Scheduled', icon: Clock },
  { key: 'en_route', label: 'En route', icon: Navigation },
  { key: 'picked_up', label: 'Picked up', icon: UserCheck },
  { key: 'in_transit', label: 'In transit', icon: Car },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
];

export const StatusStepper: React.FC<StatusStepperProps> = ({
  currentStatus,
  className = '',
}) => {
  // Normalize status key
  const normalizedStatus = (status: string): TripStatus => {
    if (status === 'driver_arriving' || status === 'at_pickup') return 'en_route';
    if (status === 'in_progress') return 'in_transit';
    return (status as TripStatus) || 'scheduled';
  };

  const activeKey = normalizedStatus(currentStatus);
  const statusKeys: TripStatus[] = ['scheduled', 'en_route', 'picked_up', 'in_transit', 'completed'];
  const currentIndex = statusKeys.indexOf(activeKey);

  return (
    <div className={`w-full py-2 ${className}`}>
      <div className="flex items-center justify-between relative px-2">
        {/* Connecting Track Line */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#E3ECF5] -z-0" />
        {/* Progress Track Line */}
        <div
          className="absolute top-4 left-6 h-0.5 bg-[#4DA8FF] -z-0 transition-all duration-300"
          style={{
            width: `${Math.max(0, Math.min(100, (currentIndex / (STEPS.length - 1)) * 100))}%`,
          }}
        />

        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isCompleted
                    ? 'bg-[#4DA8FF] text-white shadow-xs'
                    : isCurrent
                    ? 'bg-white border-2 border-[#2B8CEB] text-[#2B8CEB] ring-4 ring-[#E8F3FF] shadow-sm'
                    : 'bg-[#F5FAFF] border border-[#E3ECF5] text-[#5B6B80]/50'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <Icon className={`w-4 h-4 ${isCurrent ? 'text-[#2B8CEB]' : ''}`} />
                )}
              </div>

              <span
                className={`text-[11px] mt-1.5 font-medium whitespace-nowrap transition-colors ${
                  isCurrent
                    ? 'text-[#0F1B2D] font-bold'
                    : isCompleted
                    ? 'text-[#2B8CEB] font-medium'
                    : 'text-[#5B6B80]'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
