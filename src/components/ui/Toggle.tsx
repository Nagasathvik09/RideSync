import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: string;
  badgePreview?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  badgePreview,
  disabled = false,
  className = '',
}) => {
  return (
    <div
      onClick={() => {
        if (!disabled) onChange(!checked);
      }}
      className={`flex items-center justify-between p-3 rounded-[16px] border transition-colors cursor-pointer select-none ${
        checked
          ? 'bg-[#F5FAFF] border-[#4DA8FF]/50'
          : 'bg-white border-[#E3ECF5] hover:bg-[#F5FAFF]/60'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <div className="flex-1 pr-3">
        <div className="flex items-center gap-2">
          {label && <span className="text-sm font-semibold text-[#0F1B2D]">{label}</span>}
          {badgePreview}
        </div>
        {description && <p className="text-xs text-[#5B6B80] mt-0.5">{description}</p>}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-[#2B8CEB] ${
          checked ? 'bg-[#2B8CEB]' : 'bg-[#E3ECF5]'
        }`}
      >
        <div
          className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-200 ease-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};
