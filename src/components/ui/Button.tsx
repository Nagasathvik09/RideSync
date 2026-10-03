import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'cta';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-[14px] transition-all duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B8CEB] select-none';

  const sizeStyles = {
    sm: 'h-[36px] px-3 text-[13px]',
    md: 'h-[44px] px-4 text-[14px]',
    lg: 'h-[50px] px-5 text-[15px]',
    cta: 'h-[56px] px-6 text-[16px] tracking-tight font-bold',
  }[size];

  const variantStyles = {
    // #4DA8FF with #0F1B2D gives 6.5:1 contrast, passing WCAG AA
    primary: 'bg-[#4DA8FF] text-[#0F1B2D] hover:bg-[#2B8CEB] hover:text-white shadow-soft disabled:bg-[#E3ECF5] disabled:text-[#5B6B80] disabled:cursor-not-allowed disabled:shadow-none',
    secondary: 'bg-[#E8F3FF] text-[#2B8CEB] hover:bg-[#2B8CEB] hover:text-white disabled:bg-[#F5FAFF] disabled:text-[#5B6B80] disabled:cursor-not-allowed',
    ghost: 'bg-transparent text-[#5B6B80] hover:text-[#0F1B2D] hover:bg-[#F5FAFF] disabled:opacity-50 disabled:cursor-not-allowed',
    danger: 'bg-[#E5484D] text-white hover:bg-[#d63b40] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          <span>Please wait</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
