import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-ivory-subtle/80 border border-border/40 rounded-xs ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col bg-ivory border sm:border-[1.5px] border-gold/40 rounded-[8px] sm:rounded-[10px] p-0 overflow-hidden">
      {/* Image Skeleton */}
      <Skeleton className="aspect-square w-full" />

      {/* Content Skeleton */}
      <div className="p-2.5 sm:p-3.5 md:p-4 space-y-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-2.5 w-12 sm:w-16" />
          <Skeleton className="h-2.5 w-8 sm:w-10" />
        </div>
        <Skeleton className="h-3.5 sm:h-4 w-3/4" />
        <Skeleton className="h-2.5 w-full" />
        <div className="pt-2 flex justify-between items-center">
          <Skeleton className="hidden sm:block h-2.5 w-16" />
          <Skeleton className="h-3.5 sm:h-4 w-12 sm:w-14 ms-auto" />
        </div>
      </div>
    </div>
  );
};
