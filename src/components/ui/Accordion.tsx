import { useState, useId, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

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
    <div className={cn(
      "border-b last:border-b-0 transition-all duration-200",
      isOpen
        ? "border-transparent bg-orange-50/50 dark:bg-orange-900/10 -mx-3 px-3 rounded-2xl my-1"
        : "border-gray-100 dark:border-gray-700/50"
    )}>
      <h3>
        <button
          id={triggerId}
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 -mx-2 px-2 rounded-xl min-h-[52px] group"
        >
          <div className="flex items-center gap-3">
            {icon && (
              <span
                aria-hidden="true"
                className={cn(
                  "p-2 rounded-xl transition-colors duration-200",
                  isOpen
                    ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                )}
              >
                {icon}
              </span>
            )}
            <span className={cn(
              "font-medium transition-colors",
              isOpen
                ? "text-orange-700 dark:text-orange-400"
                : "text-gray-900 dark:text-gray-100"
            )}>
              {title}
            </span>
          </div>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'w-5 h-5 transition-transform duration-200',
              isOpen
                ? 'rotate-180 text-orange-500'
                : 'text-gray-400 dark:text-gray-500'
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
          isOpen ? 'max-h-[2000px] opacity-100 pb-4 animate-fade-in' : 'max-h-0 opacity-0'
        )}
      >
        {children}
      </div>
    </div>
  );
}
