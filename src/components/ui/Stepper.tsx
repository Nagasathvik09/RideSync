import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface StepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  label?: string;
  helperText?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  value,
  min = 1,
  max = 6,
  onChange,
  label,
  helperText,
}) => {
  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className="flex items-center justify-between py-1">
      {label && (
        <div>
          <span className="block text-sm font-semibold text-[#0F1B2D]">{label}</span>
          {helperText && <span className="block text-xs text-[#5B6B80]">{helperText}</span>}
        </div>
      )}

      <div className="inline-flex items-center bg-[#F5FAFF] border border-[#E3ECF5] rounded-full p-1 shadow-sm">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          aria-label="Decrease seats"
          className="w-11 h-11 flex items-center justify-center rounded-full bg-white text-[#0F1B2D] border border-[#E3ECF5] shadow-xs hover:border-[#4DA8FF] active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-[#2B8CEB]"
        >
          <Minus className="w-4 h-4 text-[#0F1B2D]" strokeWidth={2.2} />
        </button>

        <span className="min-w-[48px] text-center font-bold text-xl text-[#0F1B2D] tabular-nums select-none">
          {value}
        </span>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          aria-label="Increase seats"
          className="w-11 h-11 flex items-center justify-center rounded-full bg-white text-[#0F1B2D] border border-[#E3ECF5] shadow-xs hover:border-[#4DA8FF] active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-[#2B8CEB]"
        >
          <Plus className="w-4 h-4 text-[#0F1B2D]" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
};
