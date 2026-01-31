import { useRef, useCallback } from 'react';
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
  color: string;
}

const typeOptions: TypeOption[] = [
  { id: 'url', label: 'URL', icon: Link, description: 'Website link', color: 'indigo' },
  { id: 'text', label: 'Text', icon: Type, description: 'Plain text', color: 'slate' },
  { id: 'email', label: 'Email', icon: Mail, description: 'Email address', color: 'rose' },
  { id: 'phone', label: 'Phone', icon: Phone, description: 'Phone number', color: 'emerald' },
  { id: 'sms', label: 'SMS', icon: MessageSquare, description: 'Text message', color: 'cyan' },
  { id: 'wifi', label: 'WiFi', icon: Wifi, description: 'Network credentials', color: 'violet' },
  { id: 'vcard', label: 'vCard', icon: User, description: 'Contact info', color: 'orange' },
  { id: 'event', label: 'Event', icon: Calendar, description: 'Calendar event', color: 'pink' },
  { id: 'location', label: 'Location', icon: MapPin, description: 'Geographic location', color: 'lime' },
] as const;

// Color variants for active state
const colorVariants: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/30',
    border: 'border-indigo-500 dark:border-indigo-400',
    text: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'bg-indigo-100 dark:bg-indigo-800',
  },
  slate: {
    bg: 'bg-slate-50 dark:bg-slate-900/30',
    border: 'border-slate-500 dark:border-slate-400',
    text: 'text-slate-600 dark:text-slate-400',
    iconBg: 'bg-slate-100 dark:bg-slate-800',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-900/30',
    border: 'border-rose-500 dark:border-rose-400',
    text: 'text-rose-600 dark:text-rose-400',
    iconBg: 'bg-rose-100 dark:bg-rose-800',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    border: 'border-emerald-500 dark:border-emerald-400',
    text: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-800',
  },
  cyan: {
    bg: 'bg-cyan-50 dark:bg-cyan-900/30',
    border: 'border-cyan-500 dark:border-cyan-400',
    text: 'text-cyan-600 dark:text-cyan-400',
    iconBg: 'bg-cyan-100 dark:bg-cyan-800',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-900/30',
    border: 'border-violet-500 dark:border-violet-400',
    text: 'text-violet-600 dark:text-violet-400',
    iconBg: 'bg-violet-100 dark:bg-violet-800',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/30',
    border: 'border-orange-500 dark:border-orange-400',
    text: 'text-orange-600 dark:text-orange-400',
    iconBg: 'bg-orange-100 dark:bg-orange-800',
  },
  pink: {
    bg: 'bg-pink-50 dark:bg-pink-900/30',
    border: 'border-pink-500 dark:border-pink-400',
    text: 'text-pink-600 dark:text-pink-400',
    iconBg: 'bg-pink-100 dark:bg-pink-800',
  },
  lime: {
    bg: 'bg-lime-50 dark:bg-lime-900/30',
    border: 'border-lime-500 dark:border-lime-400',
    text: 'text-lime-600 dark:text-lime-400',
    iconBg: 'bg-lime-100 dark:bg-lime-800',
  },
};

export function TypeSelector() {
  const { activeType, setActiveType } = useQRStore();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, currentIndex: number) => {
      let nextIndex: number | null = null;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          nextIndex = (currentIndex + 1) % typeOptions.length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          nextIndex = (currentIndex - 1 + typeOptions.length) % typeOptions.length;
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = typeOptions.length - 1;
          break;
      }

      if (nextIndex !== null) {
        tabRefs.current[nextIndex]?.focus();
        setActiveType(typeOptions[nextIndex].id);
      }
    },
    [setActiveType]
  );

  return (
    <div className="w-full">
      <h2
        id="qr-type-label"
        className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3"
      >
        QR Code Type
      </h2>
      <div
        role="tablist"
        aria-labelledby="qr-type-label"
        aria-orientation="horizontal"
        className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2"
      >
        {typeOptions.map((option, index) => {
          const Icon = option.icon;
          const isActive = activeType === option.id;
          const colors = colorVariants[option.color];

          return (
            <button
              key={option.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              role="tab"
              id={`qr-type-tab-${option.id}`}
              aria-selected={isActive}
              aria-controls={`qr-type-panel-${option.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveType(option.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                'group flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 min-h-[72px]',
                'hover:shadow-md hover:-translate-y-0.5',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                isActive
                  ? cn(colors.border, colors.bg, 'shadow-sm focus:ring-current')
                  : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 focus:ring-indigo-500'
              )}
            >
              <div
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  isActive ? colors.iconBg : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    'w-4 h-4',
                    isActive
                      ? colors.text
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                />
              </div>
              <span
                className={cn(
                  'text-xs font-medium',
                  isActive
                    ? colors.text
                    : 'text-gray-600 dark:text-gray-300'
                )}
              >
                {option.label}
              </span>
              {/* Keyboard shortcut hint on desktop */}
              <kbd className={cn(
                "hidden lg:block text-[10px] font-mono px-1 rounded",
                isActive
                  ? cn(colors.iconBg, colors.text)
                  : "text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700"
              )}>
                {index + 1}
              </kbd>
            </button>
          );
        })}
      </div>
    </div>
  );
}
