import React, { useState, useEffect, useId } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { Button } from './Button';

export interface PriceRangeInputProps {
  minLimit: number;
  maxLimit: number;
  step?: number;
  currentMin?: number;
  currentMax?: number;
  onChange: (min: number | undefined, max: number | undefined) => void;
  className?: string;
}

export const PriceRangeInput: React.FC<PriceRangeInputProps> = ({
  minLimit,
  maxLimit,
  step = 1,
  currentMin,
  currentMax,
  onChange,
  className = '',
}) => {
  const { isRTL, t, formatPrice } = useI18n();
  const id = useId();

  const [minVal, setMinVal] = useState<number>(currentMin !== undefined ? currentMin : minLimit);
  const [maxVal, setMaxVal] = useState<number>(currentMax !== undefined ? currentMax : maxLimit);

  // Sync with prop changes
  useEffect(() => {
    setMinVal(currentMin !== undefined ? currentMin : minLimit);
  }, [currentMin, minLimit]);

  useEffect(() => {
    setMaxVal(currentMax !== undefined ? currentMax : maxLimit);
  }, [currentMax, maxLimit]);

  // Percentage calculations (0 to 100)
  const minPercent = Math.max(0, Math.min(100, Math.round(((minVal - minLimit) / (maxLimit - minLimit)) * 100)));
  const maxPercent = Math.max(0, Math.min(100, Math.round(((maxVal - minLimit) / (maxLimit - minLimit)) * 100)));

  const handleMinSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxVal - step);
    setMinVal(value);
  };

  const handleMaxSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minVal + step);
    setMaxVal(value);
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? minLimit : Number(e.target.value);
    if (!isNaN(val)) {
      setMinVal(Math.max(minLimit, Math.min(val, maxVal - step)));
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? maxLimit : Number(e.target.value);
    if (!isNaN(val)) {
      setMaxVal(Math.min(maxLimit, Math.max(val, minVal + step)));
    }
  };

  const handleApply = () => {
    const finalMin = minVal <= minLimit ? undefined : minVal;
    const finalMax = maxVal >= maxLimit ? undefined : maxVal;
    onChange(finalMin, finalMax);
  };

  const handleClear = () => {
    setMinVal(minLimit);
    setMaxVal(maxLimit);
    onChange(undefined, undefined);
  };

  const isFiltered =
    (currentMin !== undefined && currentMin > minLimit) ||
    (currentMax !== undefined && currentMax < maxLimit) ||
    minVal > minLimit ||
    maxVal < maxLimit;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dual Range Track */}
      <div className="relative pt-3 pb-2 px-1">
        {/* Track Background */}
        <div className="relative w-full h-1.5 bg-border rounded-full">
          {/* Highlighted Gold Active Segment using logical properties */}
          <div
            className="absolute top-0 bottom-0 bg-gold rounded-full transition-all duration-75"
            style={
              isRTL
                ? {
                    insetInlineStart: `${100 - maxPercent}%`,
                    inlineSize: `${maxPercent - minPercent}%`,
                  }
                : {
                    insetInlineStart: `${minPercent}%`,
                    inlineSize: `${maxPercent - minPercent}%`,
                  }
            }
          />
        </div>

        {/* Min Range Slider */}
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          step={step}
          value={minVal}
          onChange={handleMinSlider}
          aria-label={t('filters.minPrice')}
          className="absolute inset-x-0 top-1.5 w-full h-1.5 appearance-none bg-transparent pointer-events-none cursor-pointer focus:outline-none z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-ivory [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gold [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-ivory [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gold"
        />

        {/* Max Range Slider */}
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          step={step}
          value={maxVal}
          onChange={handleMaxSlider}
          aria-label={t('filters.maxPrice')}
          className="absolute inset-x-0 top-1.5 w-full h-1.5 appearance-none bg-transparent pointer-events-none cursor-pointer focus:outline-none z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-ivory [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gold [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-ivory [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gold"
        />
      </div>

      {/* Min and Max Numeric Input Fields */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <label htmlFor={`${id}-min-input`} className="text-[11px] text-muted block mb-1 text-start">
            {t('filters.from')}
          </label>
          <div className="relative">
            <input
              id={`${id}-min-input`}
              type="number"
              value={minVal}
              onChange={handleMinInputChange}
              step={step}
              min={minLimit}
              max={maxLimit}
              className="w-full bg-ivory text-near-black text-xs px-2.5 py-1.5 border border-border rounded-xs focus:outline-none focus:border-gold font-mono text-start"
            />
          </div>
          <span className="block text-[10px] text-muted font-mono mt-0.5 text-start">
            {formatPrice(minVal)}
          </span>
        </div>

        <div>
          <label htmlFor={`${id}-max-input`} className="text-[11px] text-muted block mb-1 text-start">
            {t('filters.to')}
          </label>
          <div className="relative">
            <input
              id={`${id}-max-input`}
              type="number"
              value={maxVal}
              onChange={handleMaxInputChange}
              step={step}
              min={minLimit}
              max={maxLimit}
              className="w-full bg-ivory text-near-black text-xs px-2.5 py-1.5 border border-border rounded-xs focus:outline-none focus:border-gold font-mono text-start"
            />
          </div>
          <span className="block text-[10px] text-muted font-mono mt-0.5 text-start">
            {formatPrice(maxVal)}
          </span>
        </div>
      </div>

      {/* Apply / Clear Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="flex-1 text-xs py-1.5"
          onClick={handleApply}
        >
          {t('filters.apply')}
        </Button>
        {isFiltered && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-muted hover:text-near-black transition-colors px-2 py-1.5 underline cursor-pointer"
          >
            {t('filters.clearAll')}
          </button>
        )}
      </div>
    </div>
  );
};
