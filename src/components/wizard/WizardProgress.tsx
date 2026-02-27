import { useState, useEffect } from 'react';
import { Check, Loader2, CloudUpload } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useWizardStore, type WizardStep } from '@/stores/wizardStore';

const steps: { step: WizardStep; label: string }[] = [
  { step: 1, label: 'Type' },
  { step: 2, label: 'Content' },
  { step: 3, label: 'Style' },
  { step: 4, label: 'Download' },
];

function getRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return 'Saved just now';
  if (seconds < 60) return `Saved ${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Saved ${minutes}m ago`;
  return `Saved ${Math.floor(minutes / 60)}h ago`;
}

interface WizardProgressProps {
  lastSavedAt?: Date | null;
  isSaving?: boolean;
}

function SaveIndicator({ lastSavedAt, isSaving }: { lastSavedAt: Date | null; isSaving: boolean }) {
  const [, setTick] = useState(0);

  // Tick every 30s to update relative time
  useEffect(() => {
    if (!lastSavedAt) return;
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, [lastSavedAt]);

  if (isSaving) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
        <Loader2 className="w-3 h-3 animate-spin" />
        Saving...
      </span>
    );
  }

  if (lastSavedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
        <CloudUpload className="w-3 h-3" />
        {getRelativeTime(lastSavedAt)}
      </span>
    );
  }

  return null;
}

export function WizardProgress({ lastSavedAt, isSaving }: WizardProgressProps) {
  const { currentStep, completedSteps, goToStep, isStepAccessible } = useWizardStore();

  const showSaveIndicator = isSaving || lastSavedAt;

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
                  isAccessible && !isCurrent && 'hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer',
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
                      : 'bg-black/10 dark:bg-white/10 text-gray-500 dark:text-gray-400'
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
                      : 'bg-black/10 dark:bg-white/10'
                  )}
                />
              )}
            </div>
          );
        })}

        {/* Desktop save indicator — after step buttons */}
        {showSaveIndicator && (
          <div className="ml-4">
            <SaveIndicator lastSavedAt={lastSavedAt ?? null} isSaving={isSaving ?? false} />
          </div>
        )}
      </div>

      {/* Mobile: Compact indicator */}
      <div className="sm:hidden flex flex-col px-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Step {currentStep} of {steps.length}
            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400 ml-2">
              {steps.find(s => s.step === currentStep)?.label}
            </span>
          </span>
          {/* Mobile save indicator — inline */}
          {showSaveIndicator && (
            <SaveIndicator lastSavedAt={lastSavedAt ?? null} isSaving={isSaving ?? false} />
          )}
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10">
          <div
            className="h-full bg-orange-500 transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
