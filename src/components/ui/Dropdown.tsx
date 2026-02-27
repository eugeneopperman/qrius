import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
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
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  // Calculate position when opening
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const trigger = containerRef.current;
    const rect = trigger.getBoundingClientRect();

    // Calculate initial position (below trigger)
    let top = rect.bottom + 4;
    let left = align === 'right' ? rect.right : rect.left;

    // Defer flip check to after menu renders and we know its size
    setPosition({ top, left });

    // After paint, check if menu overflows and flip if needed
    requestAnimationFrame(() => {
      if (!menuRef.current) return;
      const menuRect = menuRef.current.getBoundingClientRect();

      // Flip upward if menu overflows viewport bottom
      if (menuRect.bottom > window.innerHeight - 8) {
        top = rect.top - menuRect.height - 4;
        if (top < 8) top = 8; // don't go above viewport either
      }

      // Prevent horizontal overflow
      if (align === 'right') {
        if (left - menuRect.width < 8) {
          left = menuRect.width + 8;
        }
      } else {
        if (left + menuRect.width > window.innerWidth - 8) {
          left = window.innerWidth - menuRect.width - 8;
        }
      }

      setPosition({ top, left });
    });
  }, [isOpen, align]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        menuRef.current && !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    // Close on scroll (menu position would be stale)
    const handleScroll = () => setIsOpen(false);

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div aria-haspopup="true" aria-expanded={isOpen}>
        {trigger({ isOpen, toggle })}
      </div>
      {isOpen && position && createPortal(
        <div
          ref={menuRef}
          role="menu"
          className={cn(
            'fixed bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-[70]',
          )}
          style={{
            top: position.top,
            left: align === 'right' ? undefined : position.left,
            right: align === 'right' ? window.innerWidth - position.left : undefined,
          }}
        >
          {children({ close })}
        </div>,
        document.body
      )}
    </div>
  );
}
