import React from 'react';
import { Check } from 'lucide-react';

export interface StepperStep {
  id: string;
  label: string;
}

export interface StepperProps {
  steps: StepperStep[];
  currentStepIndex: number;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStepIndex,
  className = '',
}) => {
  return (
    <nav aria-label="Checkout Progress" className={`w-full max-w-xl mx-auto ${className}`}>
      <ol className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div
          className="absolute top-3.5 inset-x-6 h-[1.5px] bg-border -z-0"
          aria-hidden="true"
        >
          <div
            className="h-full bg-gold transition-all duration-300"
            style={{
              width: `${(currentStepIndex / Math.max(1, steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {steps.map((step, index) => {
          const isDone = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <li
              key={step.id}
              className="flex flex-col items-center relative z-10 text-center"
              aria-current={isCurrent ? 'step' : undefined}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono transition-colors ${
                  isDone
                    ? 'bg-gold text-near-black font-bold'
                    : isCurrent
                    ? 'bg-near-black text-ivory ring-2 ring-gold ring-offset-2 font-medium'
                    : 'bg-ivory border border-border text-muted font-light'
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={`text-[10px] sm:text-xs mt-1.5 transition-colors text-center max-w-[64px] sm:max-w-none leading-tight ${
                  isCurrent
                    ? 'font-medium text-near-black'
                    : isDone
                    ? 'text-near-black/80'
                    : 'text-muted'
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
