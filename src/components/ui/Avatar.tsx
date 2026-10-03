import React from 'react';

interface AvatarProps {
  name: string;
  image?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isWomenOnly?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  image,
  size = 'md',
  isWomenOnly = false,
  className = '',
}) => {
  const getInitials = (n: string) => {
    if (!n) return 'U';
    const parts = n.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-16 h-16 text-lg',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 font-semibold select-none overflow-hidden transition-transform ${
        sizeClasses[size]
      } ${
        isWomenOnly ? 'ring-2 ring-[#B084F5] ring-offset-2' : 'ring-1 ring-[#E3ECF5]'
      } ${className}`}
    >
      {image ? (
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            // Fallback to text avatar on error
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
      ) : null}
      <span className="w-full h-full flex items-center justify-center bg-[#E8F3FF] text-[#2B8CEB]">
        {getInitials(name)}
      </span>
    </div>
  );
};
