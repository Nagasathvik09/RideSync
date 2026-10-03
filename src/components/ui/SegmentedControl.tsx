import React from 'react';

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  badge?: React.ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <div className={`flex items-center p-1 bg-[#F5FAFF] border border-[#E3ECF5] rounded-[14px] ${className}`}>
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-2 px-3 rounded-[10px] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ${
              isSelected
                ? 'bg-white text-[#0F1B2D] shadow-sm font-bold border border-[#E3ECF5]'
                : 'text-[#5B6B80] hover:text-[#0F1B2D]'
            }`}
          >
            <span>{opt.label}</span>
            {opt.badge}
          </button>
        );
      })}
    </div>
  );
}
