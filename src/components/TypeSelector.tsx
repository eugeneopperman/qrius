import { useRef, useCallback, useState, useEffect } from 'react';
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
] as const;

export function TypeSelector() {
  const { activeType, setActiveType } = useQRStore();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [animatingTab, setAnimatingTab] = useState<string | null>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);

  // Check scroll position to show/hide edge fades
  const updateScrollFades = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftFade(scrollLeft > 10);
    setShowRightFade(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    updateScrollFades();
    container.addEventListener('scroll', updateScrollFades, { passive: true });
    window.addEventListener('resize', updateScrollFades);

    return () => {
      container.removeEventListener('scroll', updateScrollFades);
      window.removeEventListener('resize', updateScrollFades);
    };
  }, [updateScrollFades]);

  // Cleanup animation timeout on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // Scroll active tab into view
  const scrollTabIntoView = useCallback((index: number) => {
    const tab = tabRefs.current[index];
    const container = scrollContainerRef.current;
    if (!tab || !container) return;

    const tabRect = tab.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    if (tabRect.left < containerRect.left + 40) {
      container.scrollBy({ left: tabRect.left - containerRect.left - 40, behavior: 'smooth' });
    } else if (tabRect.right > containerRect.right - 40) {
      container.scrollBy({ left: tabRect.right - containerRect.right + 40, behavior: 'smooth' });
    }
  }, []);

  const handleSelect = useCallback((option: typeof typeOptions[number], index: number) => {
    setAnimatingTab(option.id);
    setActiveType(option.id);
    scrollTabIntoView(index);

    // Clear animation state after animation completes
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    animationTimeoutRef.current = setTimeout(() => setAnimatingTab(null), 300);
  }, [setActiveType, scrollTabIntoView]);

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
        handleSelect(typeOptions[nextIndex], nextIndex);
      }
    },
    [handleSelect]
  );

  return (
    <div className="w-full">
      <h2
        id="qr-type-label"
        className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3"
      >
        QR Code Type
      </h2>

      {/* Horizontal scrollable container */}
      <div className="relative w-full">
        {/* Left fade gradient */}
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-[var(--color-bg)] to-transparent z-10 pointer-events-none transition-opacity duration-200",
            showLeftFade ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Right fade gradient */}
        <div
          className={cn(
            "absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[var(--color-bg)] to-transparent z-10 pointer-events-none transition-opacity duration-200",
            showRightFade ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Scrollable tabs container */}
        <div
          ref={scrollContainerRef}
          role="tablist"
          aria-labelledby="qr-type-label"
          aria-orientation="horizontal"
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide scroll-smooth snap-x"
        >
          {typeOptions.map((option, index) => {
            const Icon = option.icon;
            const isActive = activeType === option.id;
            const isAnimating = animatingTab === option.id;

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
                onClick={() => handleSelect(option, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={cn(
                  'group relative flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap snap-start',
                  'transition-all duration-200 ease-out',
                  'focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2',
                  'active:scale-95',
                  isActive
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-500 hover:text-gray-900 dark:hover:text-white hover:shadow-sm'
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    'w-4 h-4 transition-all duration-200',
                    isActive
                      ? 'text-white dark:text-gray-900'
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-orange-500 dark:group-hover:text-orange-400',
                    isAnimating && 'animate-icon-bounce'
                  )}
                />
                <span className="text-sm font-medium">
                  {option.label}
                </span>

                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-orange-500 rounded-full animate-scale-in" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
