import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = 'rounded-xl',
}) => {
  return (
    <div
      className={`skeleton-shimmer ${rounded} ${className}`}
      style={{
        width: width,
        height: height,
      }}
    />
  );
};

export const RideCardSkeleton: React.FC = () => {
  return (
    <div className="p-4 bg-white border border-[#E3ECF5] rounded-2xl shadow-soft space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="w-20 h-3.5" />
            <Skeleton className="w-28 h-2.5" />
          </div>
        </div>
        <Skeleton className="w-16 h-7 rounded-full" />
      </div>

      <div className="flex items-center justify-between pt-1">
        <Skeleton className="w-24 h-6" />
        <Skeleton className="w-16 h-6" />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#E3ECF5]">
        <Skeleton className="w-32 h-3" />
        <Skeleton className="w-12 h-3" />
      </div>
    </div>
  );
};
