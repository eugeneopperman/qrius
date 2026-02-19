import { memo } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { WizardStep } from '@/stores/templateStore';

interface TemplateWizardProgressProps {
  currentStep: WizardStep;
  onStepClick?: (step: WizardStep) => void;
}

const STEPS = [
  { number: 1 as WizardStep, label: 'Basic Info', short: 'Name' },
  { number: 2 as WizardStep, label: 'Colors & Style', short: 'Style' },
  { number: 3 as WizardStep, label: 'Frame & Typography', short: 'Frame' },
  { number: 4 as WizardStep, label: 'Logo & Save', short: 'Logo' },
];

export const TemplateWizardProgress = memo(function TemplateWizardProgress({
  currentStep,
  onStepClick,
}: TemplateWizardProgressProps) {
  return (
    <nav aria-label="Template wizard progress" className="w-full">
      <ol className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isClickable = onStepClick && (isCompleted || isCurrent);

          return (
            <li key={step.number} className="flex-1 flex items-center">
              {/* Step Circle */}
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step.number)}
                disabled={!isClickable}
                className={cn(
                  'relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-sm font-semibold transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-indigo-500/50',
                  isCompleted && 'bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700',
                  isCurrent && 'bg-indigo-600 text-white ring-4 ring-indigo-200 dark:ring-indigo-800',
                  !isCompleted && !isCurrent && 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
                  !isClickable && 'cursor-default'
                )}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`Step ${step.number}: ${step.label}${isCompleted ? ' (completed)' : ''}`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  step.number
                )}
              </button>

              {/* Step Label - hidden on mobile, shown on larger screens */}
              <div className="hidden sm:block ml-2 mr-4">
                <p
                  className={cn(
                    'text-xs font-medium whitespace-nowrap',
                    isCurrent || isCompleted
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  {step.label}
                </p>
              </div>

              {/* Mobile short label */}
              <span
                className={cn(
                  'sm:hidden ml-1 text-[10px] font-medium whitespace-nowrap',
                  isCurrent || isCompleted
                    ? 'text-gray-700 dark:text-gray-300'
                    : 'text-gray-400 dark:text-gray-500'
                )}
              >
                {step.short}
              </span>

              {/* Connector Line (not for last step) */}
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 sm:mx-4 rounded-full transition-colors',
                    currentStep > step.number
                      ? 'bg-indigo-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});

TemplateWizardProgress.displayName = 'TemplateWizardProgress';
