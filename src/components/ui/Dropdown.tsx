import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface DropdownProps {
  trigger: (props: { isOpen: boolean; toggle: () => void }) => ReactNode;
  children: (props: { close: () => void }) => ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, children, align = 'left', className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div aria-haspopup="true" aria-expanded={isOpen}>
        {trigger({ isOpen, toggle })}
      </div>
      {isOpen && (
        <div
          role="menu"
          className={cn(
            'absolute top-full mt-1 glass-heavy rounded-xl shadow-lg overflow-hidden z-50',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {children({ close })}
        </div>
      )}
    </div>
  );
}
