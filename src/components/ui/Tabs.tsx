import { createContext, useContext, useState, useRef, useEffect, useCallback, type ReactNode, isValidElement, type ReactElement } from 'react';
import { cn } from '@/utils/cn';

// Context for tab state
interface TabContextValue {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

const TabContext = createContext<TabContextValue | null>(null);

function useTabContext() {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('Tab components must be used within a TabGroup');
  }
  return context;
}

// TabGroup - Container
interface TabGroupProps {
  defaultTab?: number;
  onChange?: (index: number) => void;
  children: ReactNode;
  className?: string;
}

export function TabGroup({ defaultTab = 0, onChange, children, className }: TabGroupProps) {
  const [activeIndex, setActiveIndex] = useState(defaultTab);

  const handleSetActiveIndex = useCallback((index: number) => {
    setActiveIndex(index);
    onChange?.(index);
  }, [onChange]);

  return (
    <TabContext.Provider value={{ activeIndex, setActiveIndex: handleSetActiveIndex }}>
      <div className={cn('w-full', className)}>
        {children}
      </div>
    </TabContext.Provider>
  );
}

// TabList - Container for Tab buttons
interface TabListProps {
  children: ReactNode;
  className?: string;
}

export function TabList({ children, className }: TabListProps) {
  const { activeIndex, setActiveIndex } = useTabContext();
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  // Check overflow and update fade hints
  const updateFades = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    setShowLeftFade(container.scrollLeft > 4);
    setShowRightFade(container.scrollLeft + container.clientWidth < container.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateFades();
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(updateFades);
    ro.observe(container);
    return () => ro.disconnect();
  }, [updateFades]);

  // Update indicator position
  useEffect(() => {
    const activeTab = tabsRef.current[activeIndex];
    const container = containerRef.current;
    const indicator = indicatorRef.current;

    if (activeTab && container && indicator) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();

      indicator.style.width = `${tabRect.width}px`;
      indicator.style.transform = `translateX(${tabRect.left - containerRect.left + container.scrollLeft}px)`;
    }
  }, [activeIndex]);

  // Auto-scroll active tab into view
  useEffect(() => {
    const activeTab = tabsRef.current[activeIndex];
    const container = containerRef.current;

    if (activeTab && container) {
      const tabRect = activeTab.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      if (tabRect.left < containerRect.left + 20) {
        container.scrollBy({ left: tabRect.left - containerRect.left - 20, behavior: 'smooth' });
      } else if (tabRect.right > containerRect.right - 20) {
        container.scrollBy({ left: tabRect.right - containerRect.right + 20, behavior: 'smooth' });
      }
    }
  }, [activeIndex]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent, currentIndex: number) => {
    const tabCount = tabsRef.current.filter(Boolean).length;
    let nextIndex: number | null = null;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        nextIndex = (currentIndex + 1) % tabCount;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        nextIndex = (currentIndex - 1 + tabCount) % tabCount;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = tabCount - 1;
        break;
    }

    if (nextIndex !== null) {
      tabsRef.current[nextIndex]?.focus();
      setActiveIndex(nextIndex);
    }
  }, [setActiveIndex]);

  // Clone children to inject props - filter to valid React elements
  const tabs = (Array.isArray(children) ? children : [children])
    .filter((child): child is ReactElement<TabProps> => isValidElement(child));

  return (
    <div className="relative">
      {/* Left fade hint */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-6 z-10 pointer-events-none bg-gradient-to-r from-[var(--color-bg)] to-transparent transition-opacity duration-200',
          showLeftFade ? 'opacity-100' : 'opacity-0'
        )}
      />
      {/* Right fade hint */}
      <div
        className={cn(
          'absolute right-0 top-0 bottom-0 w-6 z-10 pointer-events-none bg-gradient-to-l from-[var(--color-bg)] to-transparent transition-opacity duration-200',
          showRightFade ? 'opacity-100' : 'opacity-0'
        )}
      />
      <div
        ref={containerRef}
        role="tablist"
        onScroll={updateFades}
        className={cn(
          'flex gap-1 overflow-x-auto scrollbar-hide scroll-smooth pb-0.5',
          className
        )}
      >
        {tabs.map((element, index) => {
          return (
            <button
              key={index}
              ref={(el) => { tabsRef.current[index] = el; }}
              role="tab"
              id={`tab-${index}`}
              aria-selected={activeIndex === index}
              aria-controls={`tabpanel-${index}`}
              aria-label={typeof element.props.children === 'string' ? element.props.children : undefined}
              tabIndex={activeIndex === index ? 0 : -1}
              onClick={() => setActiveIndex(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                'group relative flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg whitespace-nowrap min-w-[44px] min-h-[44px]',
                'transition-all duration-200 ease-out',
                'focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1',
                activeIndex === index
                  ? 'text-orange-700 dark:text-orange-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              {element.props.icon && (
                <element.props.icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    activeIndex === index
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                  )}
                />
              )}
              <span className="text-sm font-medium hidden sm:inline">{element.props.children}</span>
            </button>
          );
        })}

        {/* Sliding indicator */}
        <div
          ref={indicatorRef}
          className="absolute bottom-0 h-0.5 bg-orange-500 rounded-full transition-all duration-200 ease-out"
          style={{ width: 0 }}
        />
      </div>
    </div>
  );
}

// Tab - Individual tab button (just a type marker, rendered by TabList)
export interface TabProps {
  icon?: React.ElementType;
  children: ReactNode;
  disabled?: boolean;
}

/**
 * Tab component - serves as a type marker for TabList.
 * This component doesn't render its own content; TabList handles rendering.
 * Returns null but TypeScript needs a valid ReactElement return type.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Tab(_props: TabProps): null {
  // This component doesn't render directly - TabList handles rendering
  return null;
}

// TabPanel props (defined early for use in TabPanels)
interface TabPanelProps {
  children: ReactNode;
  className?: string;
}

// TabPanels - Container for TabPanel components
interface TabPanelsProps {
  children: ReactNode;
  className?: string;
}

export function TabPanels({ children, className }: TabPanelsProps) {
  const { activeIndex } = useTabContext();

  // Filter to valid React elements
  const panels = (Array.isArray(children) ? children : [children])
    .filter((child): child is ReactElement<TabPanelProps> => isValidElement(child));

  return (
    <div className={cn('relative', className)}>
      {panels.map((element, index) => {
        const isActive = activeIndex === index;

        return (
          <div
            key={index}
            id={`tabpanel-${index}`}
            role="tabpanel"
            aria-labelledby={`tab-${index}`}
            hidden={!isActive}
            className={cn(
              'transition-opacity duration-200',
              isActive ? 'opacity-100 animate-fade-in' : 'opacity-0'
            )}
          >
            {isActive && element.props.children}
          </div>
        );
      })}
    </div>
  );
}

/**
 * TabPanel component - serves as a type marker for TabPanels.
 * This component doesn't render its own content; TabPanels handles rendering.
 * Returns null but TypeScript needs the component to be valid.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function TabPanel(_props: TabPanelProps): null {
  // This component doesn't render directly - TabPanels handles rendering
  return null;
}
