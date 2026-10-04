import React, { forwardRef } from 'react';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, id, className = '', ...props }, ref) => {
    const inputId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const errorId = error && inputId ? `${inputId}-error` : undefined;
    const helperId = helperText && inputId ? `${inputId}-helper` : undefined;

    return (
      <div className="w-full text-start">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-near-black mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId || helperId}
          className={`w-full bg-ivory text-near-black text-base sm:text-sm px-3.5 py-2.5 border rounded-xs transition-all duration-150 focus:outline-none resize-y min-h-[80px] shadow-2xs ${
            error
              ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
              : 'border-border focus:border-gold focus:ring-2 focus:ring-gold/30'
          } ${className}`}
          {...props}
        />
        {error ? (
          <p id={errorId} className="text-red-500 text-[11px] mt-1" role="alert">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-muted text-[11px] mt-1">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
