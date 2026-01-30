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
import { cn } from '../utils/cn';
import { useQRStore } from '../stores/qrStore';
import type { QRCodeType } from '../types';

interface TypeOption {
  id: QRCodeType;
  label: string;
  icon: React.ElementType;
  description: string;
}

const typeOptions: TypeOption[] = [
  { id: 'url', label: 'URL', icon: Link, description: 'Website link' },
  { id: 'text', label: 'Text', icon: Type, description: 'Plain text' },
  { id: 'email', label: 'Email', icon: Mail, description: 'Email address' },
  { id: 'phone', label: 'Phone', icon: Phone, description: 'Phone number' },
  { id: 'sms', label: 'SMS', icon: MessageSquare, description: 'Text message' },
  { id: 'wifi', label: 'WiFi', icon: Wifi, description: 'Network credentials' },
  { id: 'vcard', label: 'vCard', icon: User, description: 'Contact info' },
  { id: 'event', label: 'Event', icon: Calendar, description: 'Calendar event' },
  { id: 'location', label: 'Location', icon: MapPin, description: 'Geographic location' },
];

export function TypeSelector() {
  const { activeType, setActiveType } = useQRStore();

  return (
    <div className="w-full">
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        QR Code Type
      </h2>
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
        {typeOptions.map((option) => {
          const Icon = option.icon;
          const isActive = activeType === option.id;

          return (
            <button
              key={option.id}
              onClick={() => setActiveType(option.id)}
              className={cn(
                'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200',
                'hover:border-indigo-300 hover:bg-indigo-50 dark:hover:border-indigo-600 dark:hover:bg-indigo-900/20',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                isActive
                  ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900/30'
                  : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5',
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              />
              <span
                className={cn(
                  'text-xs font-medium',
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-300'
                )}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
