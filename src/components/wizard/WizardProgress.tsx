import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useWizardStore, type WizardStep } from '../../stores/wizardStore';

const steps: { step: WizardStep; label: string }[] = [
  { step: 1, label: 'Type' },
  { step: 2, label: 'Content' },
  { step: 3, label: 'Style' },
  { step: 4, label: 'Download' },
];

export function WizardProgress() {
  const { currentStep, completedSteps, goToStep, isStepAccessible } = useWizardStore();

  return (
    <div className="w-full">
      {/* Desktop: Horizontal steps */}
      <div className="hidden sm:flex items-center justify-center gap-0">
        {steps.map((item, index) => {
          const isCompleted = completedSteps.has(item.step);
          const isCurrent = currentStep === item.step;
          const isAccessible = isStepAccessible(item.step);
          const isLast = index === steps.length - 1;

          return (
            <div key={item.step} className="flex items-center">
              <button
                onClick={() => isAccessible && goToStep(item.step)}
                disabled={!isAccessible}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2',
                  isAccessible && !isCurrent && 'hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer',
                  !isAccessible && 'cursor-not-allowed opacity-50'
                )}
              >
                {/* Step indicator circle */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200',
                    isCompleted && !isCurrent
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    item.step
                  )}
                </div>

                {/* Step label */}
                <span
                  className={cn(
                    'text-sm font-medium transition-colors',
                    isCurrent
                      ? 'text-orange-600 dark:text-orange-400'
                      : isCompleted
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  {item.label}
                </span>
              </button>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={cn(
                    'w-12 h-0.5 transition-colors duration-300',
                    isCompleted
                      ? 'bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: Compact indicator */}
      <div className="sm:hidden flex items-center justify-between px-4">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Step {currentStep} of {steps.length}
        </span>
        <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
          {steps.find(s => s.step === currentStep)?.label}
        </span>
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full bg-orange-500 transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
