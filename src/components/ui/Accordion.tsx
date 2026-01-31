import { useState, useId, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

interface AccordionItemProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({ title, icon, children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const id = useId();
  const triggerId = `accordion-trigger-${id}`;
  const contentId = `accordion-content-${id}`;

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <h3>
        <button
          id={triggerId}
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors -mx-2 px-2 rounded-lg min-h-[56px]"
        >
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            {icon && <span aria-hidden="true">{icon}</span>}
            <span className="font-medium">{title}</span>
          </div>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'w-5 h-5 text-gray-400 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </button>
      </h3>
      <div
        id={contentId}
        role="region"
        aria-labelledby={triggerId}
        hidden={!isOpen}
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-[2000px] opacity-100 pb-4' : 'max-h-0 opacity-0'
        )}
      >
        {children}
      </div>
    </div>
  );
}
