import React, { useState, useRef, useEffect, useId } from 'react';
import { ArrowUpDown, Check, ChevronDown } from 'lucide-react';
import { SortOption } from '../../types';
import { useI18n } from '../../hooks/useI18n';

export interface SortDropdownOption {
  value: SortOption;
  label: string;
}

export interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  options: SortDropdownOption[];
  id?: string;
  className?: string;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
  value,
  onChange,
  options,
  id,
  className = '',
}) => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const baseId = useId();
  const componentId = id || `sort-dropdown-${baseId}`;
  const buttonId = `${componentId}-btn`;
  const listboxId = `${componentId}-listbox`;
  const optionIdPrefix = `${componentId}-opt`;

  // Find index of active value
  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const safeIndex = selectedIndex >= 0 ? selectedIndex : 0;
  const [highlightedIndex, setHighlightedIndex] = useState(safeIndex);

  const selectedOption = options[selectedIndex] || options[0];

  // Sync highlightedIndex when value changes or dropdown opens
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(safeIndex);
    }
  }, [isOpen, safeIndex]);

  // Click outside listener
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isOpen]);

  // Keyboard navigation on trigger button
  const handleButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'Down':
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex((prev) => (prev + 1) % options.length);
        break;
      case 'ArrowUp':
      case 'Up':
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        setIsOpen((prev) => !prev);
        break;
      case 'Escape':
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
        }
        break;
      default:
        break;
    }
  };

  // Keyboard navigation when listbox is focused or open
  const handleListboxKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'Down':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % options.length);
        break;
      case 'ArrowUp':
      case 'Up':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length);
        break;
      case 'Home':
        e.preventDefault();
        setHighlightedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setHighlightedIndex(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (options[highlightedIndex]) {
          onChange(options[highlightedIndex].value);
          setIsOpen(false);
          buttonRef.current?.focus();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleSelectOption = (optValue: SortOption) => {
    onChange(optValue);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-start ${isOpen ? 'z-50' : 'z-20'} ${className}`}>
      {/* Combobox Trigger Button */}
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={t('sort.label')}
        aria-activedescendant={
          isOpen && options[highlightedIndex]
            ? `${optionIdPrefix}-${options[highlightedIndex].value}`
            : undefined
        }
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleButtonKeyDown}
        className="inline-flex items-center justify-between gap-2.5 px-3 py-2 sm:px-3.5 sm:py-2.5 bg-white border border-border hover:border-gold/70 text-xs sm:text-sm font-medium text-near-black focus-visible:outline-none focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold transition-colors cursor-pointer select-none rounded-xs shadow-xs"
      >
        <span className="flex items-center gap-2 text-muted">
          <ArrowUpDown className="w-3.5 h-3.5 text-gold shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline text-xs text-muted/80">{t('sort.label')}:</span>
        </span>

        <span className="font-medium text-near-black truncate max-w-[120px] sm:max-w-[170px]">
          {selectedOption ? selectedOption.label : ''}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-muted shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-gold' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Listbox Popover - fully opaque white, high z-index and elevation */}
      {isOpen && (
        <ul
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          aria-label={t('sort.label')}
          onKeyDown={handleListboxKeyDown}
          className="absolute z-50 mt-1.5 end-0 w-52 sm:w-56 bg-white border border-border shadow-xl py-1.5 rounded-xs overflow-hidden focus:outline-none animate-in fade-in-50 zoom-in-95 duration-150"
        >
          {options.map((opt, index) => {
            const isSelected = opt.value === value;
            const isHighlighted = index === highlightedIndex;

            return (
              <li
                key={opt.value}
                id={`${optionIdPrefix}-${opt.value}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelectOption(opt.value)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`px-3.5 py-2.5 text-xs sm:text-sm flex items-center justify-between gap-2 cursor-pointer transition-colors text-start ${
                  isSelected
                    ? 'text-gold font-medium bg-gold/10'
                    : isHighlighted
                    ? 'bg-stone-100 text-near-black'
                    : 'text-near-black hover:bg-stone-50'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check className="w-4 h-4 text-gold shrink-0 ms-2" aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
