import React from 'react';
import { Shield, Lock, CheckCircle2 } from 'lucide-react';

export type BadgeVariant = 'women-only' | 'match' | 'private' | 'status' | 'neutral' | 'success';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  icon = true,
  className = '',
}) => {
  const base = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-tight transition-colors';

  const variantStyles: Record<BadgeVariant, string> = {
    'women-only': 'bg-[#F3ECFF] text-[#B084F5] border border-[#B084F5]/30',
    'match': 'bg-[#E8F3FF] text-[#2B8CEB] font-bold',
    'private': 'bg-[#F5FAFF] text-[#5B6B80] border border-[#E3ECF5]',
    'status': 'bg-[#E8F3FF] text-[#2B8CEB]',
    'neutral': 'bg-[#F5FAFF] text-[#5B6B80] border border-[#E3ECF5]',
    'success': 'bg-[#EBFBF5] text-[#22B07D] border border-[#22B07D]/30',
  };

  return (
    <span className={`${base} ${variantStyles[variant]} ${className}`}>
      {icon && variant === 'women-only' && <Shield className="w-3 h-3 text-[#B084F5]" strokeWidth={2} />}
      {icon && variant === 'private' && <Lock className="w-3 h-3 text-[#5B6B80]" strokeWidth={2} />}
      {icon && variant === 'success' && <CheckCircle2 className="w-3 h-3 text-[#22B07D]" strokeWidth={2} />}
      <span>{children}</span>
    </span>
  );
};
