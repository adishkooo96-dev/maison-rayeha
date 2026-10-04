import React from 'react';
import { Star } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';

export interface RatingProps {
  score: number; // e.g., 4.9
  max?: number;
  reviewCount?: number;
  reviewsLabel?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({
  score,
  max = 5,
  reviewCount,
  reviewsLabel,
  size = 'sm',
  className = '',
}) => {
  const { formatNumber } = useI18n();
  const starSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5 text-gold" aria-label={`Rating: ${score} out of ${max}`}>
        {Array.from({ length: max }).map((_, i) => {
          const fillPercentage = Math.max(0, Math.min(1, score - i));
          const isFull = fillPercentage >= 0.8;
          const isHalf = fillPercentage >= 0.3 && fillPercentage < 0.8;

          return (
            <span key={i} className="relative inline-block">
              <Star
                className={`${starSize} text-border fill-border`}
                aria-hidden="true"
              />
              {(isFull || isHalf) && (
                <span
                  className="absolute inset-0 overflow-hidden text-gold"
                  style={{ width: isFull ? '100%' : '50%' }}
                >
                  <Star className={`${starSize} fill-current`} aria-hidden="true" />
                </span>
              )}
            </span>
          );
        })}
      </div>

      <span className="text-xs font-semibold text-near-black font-mono">
        {formatNumber(score, { useGrouping: false, minimumFractionDigits: 1, maximumFractionDigits: 1 })}
      </span>

      {reviewCount !== undefined && (
        <span className="text-xs text-muted font-light">
          ({formatNumber(reviewCount, { useGrouping: false })} {reviewsLabel || 'reviews'})
        </span>
      )}
    </div>
  );
};
