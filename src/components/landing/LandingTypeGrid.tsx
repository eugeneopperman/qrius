import { cn } from '@/utils/cn';
import { typeOptions } from '@/data/qrTypeOptions';
import type { QRCodeType } from '@/types';

interface LandingTypeGridProps {
  onSelect: (typeId: QRCodeType) => void;
}

export function LandingTypeGrid({ onSelect }: LandingTypeGridProps) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-2">
          What would you like to create?
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Choose a QR code type to get started — free, fast, and trackable
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {typeOptions.map((option) => {
          const Icon = option.icon;

          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={cn(
                'group relative flex flex-col items-center gap-3 p-6 rounded-2xl text-center transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2',
                'hover:shadow-lg hover:-translate-y-0.5',
                'active:scale-[0.98]',
                'glass hover:border-orange-300/50 dark:hover:border-orange-600/50'
              )}
            >
              <div
                className={cn(
                  'p-4 rounded-2xl transition-colors duration-200',
                  'bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-300 group-hover:bg-orange-500/10 group-hover:text-orange-600 dark:group-hover:text-orange-400'
                )}
              >
                <Icon className={cn('w-6 h-6', option.animClass)} />
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white transition-colors">
                  {option.label}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {option.description}
                </p>
              </div>

              <span className="text-xs text-gray-400 dark:text-gray-500">
                {option.example}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
