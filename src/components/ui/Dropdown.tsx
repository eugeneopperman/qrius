import { useState, useRef, useEffect, useCallback, useLayoutEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';

interface DropdownProps {
  trigger: (props: { isOpen: boolean; toggle: () => void }) => ReactNode;
  children: (props: { close: () => void }) => ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

interface MenuPosition {
  top: number;
  left: number;
  ready: boolean;
}

export function Dropdown({ trigger, children, align = 'left', className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<MenuPosition>({ top: 0, left: 0, ready: false });

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  // Reset position when closing so next open gets a fresh calculation
  useEffect(() => {
    if (!isOpen) {
      setPosition({ top: 0, left: 0, ready: false });
    }
  }, [isOpen]);

  // Calculate position synchronously after DOM update, before paint
  useLayoutEffect(() => {
    if (!isOpen || !containerRef.current || !menuRef.current) return;

    const triggerRect = containerRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pad = 8;

    // Vertical: prefer below, flip above if it would overflow
    let top = triggerRect.bottom + 4;
    if (top + menuRect.height > vh - pad) {
      const above = triggerRect.top - menuRect.height - 4;
      top = above >= pad ? above : pad;
    }

    // Horizontal: anchor to trigger edge, then clamp to viewport
    let left: number;
    if (align === 'right') {
      left = triggerRect.right - menuRect.width;
      if (left < pad) left = pad;
    } else {
      left = triggerRect.left;
      if (left + menuRect.width > vw - pad) {
        left = vw - menuRect.width - pad;
      }
    }

    setPosition({ top, left, ready: true });
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
      {isOpen && createPortal(
        <div
          ref={menuRef}
          role="menu"
          className={cn(
            'fixed bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-[70]',
          )}
          style={{
            top: position.top,
            left: position.left,
            // Render invisibly on first pass so useLayoutEffect can measure;
            // show once position is calculated
            visibility: position.ready ? 'visible' : 'hidden',
          }}
        >
          {children({ close })}
        </div>,
        document.body
      )}
    </div>
  );
}
