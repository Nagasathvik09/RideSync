import React from 'react';
import { LucideIcon, Search, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  isError?: boolean;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Search,
  title,
  description,
  actionLabel,
  onAction,
  isError = false,
  className = '',
}) => {
  const IconComponent = isError ? AlertCircle : Icon;

  return (
    <div className={`flex flex-col items-center justify-center text-center p-6 sm:p-8 rounded-2xl bg-white border border-[#E3ECF5] shadow-soft ${className}`}>
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3.5 ${
          isError ? 'bg-[#FFEBEB] text-[#E5484D]' : 'bg-[#E8F3FF] text-[#2B8CEB]'
        }`}
      >
        <IconComponent className="w-7 h-7" strokeWidth={1.75} />
      </div>

      <h3 className="text-base font-semibold text-[#0F1B2D] tracking-tight">{title}</h3>

      {description && (
        <p className="mt-1 text-xs text-[#5B6B80] max-w-xs mx-auto leading-relaxed">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <div className="mt-4">
          <Button
            variant={isError ? 'secondary' : 'primary'}
            size="sm"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
