import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: string;
  isPositive?: boolean;
  icon?: LucideIcon;
  subtext?: string;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  unit,
  change,
  isPositive = true,
  icon: Icon,
  subtext,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-2xl p-5 border border-[#E3ECF5] shadow-soft flex flex-col justify-between transition-all hover:border-[#4DA8FF] ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#5B6B80] uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-[#E8F3FF] text-[#2B8CEB] flex items-center justify-center">
            <Icon className="w-4 h-4" strokeWidth={2} />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-28 md:text-36 font-semibold text-[#0F1B2D] tracking-tight tabular-nums">
          {value}
        </span>
        {unit && <span className="text-sm font-medium text-[#5B6B80]">{unit}</span>}
      </div>

      {(change || subtext) && (
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          {change && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold ${
                isPositive ? 'text-[#22B07D]' : 'text-[#E5484D]'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {change}
            </span>
          )}
          {subtext && <span className="text-[#5B6B80] truncate">{subtext}</span>}
        </div>
      )}
    </div>
  );
};
