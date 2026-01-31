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
    <div className={cn(
      "border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors",
      isOpen && "bg-gradient-to-r from-indigo-50/50 to-transparent dark:from-indigo-900/10 dark:to-transparent -mx-3 px-3 rounded-lg"
    )}>
      <h3>
        <button
          id={triggerId}
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all duration-200 -mx-2 px-2 rounded-lg min-h-[56px] group"
        >
          <div className="flex items-center gap-2.5">
            {icon && (
              <span
                aria-hidden="true"
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  isOpen
                    ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                )}
              >
                {icon}
              </span>
            )}
            <span className={cn(
              "font-medium transition-colors",
              isOpen
                ? "text-indigo-700 dark:text-indigo-300"
                : "text-gray-700 dark:text-gray-300"
            )}>
              {title}
            </span>
          </div>
          <div className={cn(
            "p-1 rounded-full transition-all",
            isOpen
              ? "bg-indigo-100 dark:bg-indigo-900/50"
              : "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
          )}>
            <ChevronDown
              aria-hidden="true"
              className={cn(
                'w-4 h-4 transition-transform duration-200',
                isOpen
                  ? 'rotate-180 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-400'
              )}
            />
          </div>
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
