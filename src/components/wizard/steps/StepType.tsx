import {
  Link,
  Type,
  Mail,
  Phone,
  MessageSquare,
  Wifi,
  User,
  Calendar,
  MapPin,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useQRStore } from '@/stores/qrStore';
import { useWizardStore } from '@/stores/wizardStore';
import type { QRCodeType } from '@/types';

interface TypeOption {
  id: QRCodeType;
  label: string;
  icon: React.ElementType;
  description: string;
  example: string;
}

const typeOptions: TypeOption[] = [
  { id: 'url', label: 'URL', icon: Link, description: 'Website link', example: 'https://example.com' },
  { id: 'text', label: 'Text', icon: Type, description: 'Plain text message', example: 'Hello world!' },
  { id: 'email', label: 'Email', icon: Mail, description: 'Email address', example: 'hello@example.com' },
  { id: 'phone', label: 'Phone', icon: Phone, description: 'Phone number', example: '+1 234 567 8900' },
  { id: 'sms', label: 'SMS', icon: MessageSquare, description: 'Text message', example: 'Send a message' },
  { id: 'wifi', label: 'WiFi', icon: Wifi, description: 'Network credentials', example: 'Join network' },
  { id: 'vcard', label: 'vCard', icon: User, description: 'Contact card', example: 'Save contact' },
  { id: 'event', label: 'Event', icon: Calendar, description: 'Calendar event', example: 'Add to calendar' },
  { id: 'location', label: 'Location', icon: MapPin, description: 'Map coordinates', example: 'Open in maps' },
];

export function StepType() {
  const { activeType, setActiveType } = useQRStore();
  const { nextStep } = useWizardStore();

  const handleSelect = (typeId: QRCodeType) => {
    setActiveType(typeId);
    // Auto-advance to next step
    nextStep();
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-2">
          What would you like to create?
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Choose the type of QR code you want to generate
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {typeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = activeType === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={cn(
                'group relative flex flex-col items-center gap-3 p-6 rounded-2xl text-center transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2',
                'hover:shadow-lg hover:-translate-y-0.5',
                'active:scale-[0.98]',
                isSelected
                  ? 'bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500 shadow-md'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600'
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  'p-4 rounded-2xl transition-colors duration-200',
                  isSelected
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 group-hover:text-orange-600 dark:group-hover:text-orange-400'
                )}
              >
                <Icon className="w-6 h-6" />
              </div>

              {/* Label */}
              <div>
                <h3
                  className={cn(
                    'font-semibold text-lg transition-colors',
                    isSelected
                      ? 'text-orange-700 dark:text-orange-400'
                      : 'text-gray-900 dark:text-white'
                  )}
                >
                  {option.label}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {option.description}
                </p>
              </div>

              {/* Example hint */}
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {option.example}
              </span>

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-3 h-3 bg-orange-500 rounded-full animate-scale-in" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
