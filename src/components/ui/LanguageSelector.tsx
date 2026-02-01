import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { supportedLanguages, type SupportedLanguage } from '../../i18n';
import { cn } from '../../utils/cn';

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentLanguage = (i18n.language?.split('-')[0] || 'en') as SupportedLanguage;
  const currentLangInfo = supportedLanguages[currentLanguage] || supportedLanguages.en;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    i18n.changeLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
          'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select language"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{currentLangInfo.nativeName}</span>
        <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Available languages"
          className={cn(
            'absolute right-0 top-full mt-1 py-1 min-w-[160px] z-50',
            'bg-white dark:bg-gray-800 rounded-lg shadow-lg',
            'border border-gray-200 dark:border-gray-700'
          )}
        >
          {(Object.entries(supportedLanguages) as [SupportedLanguage, typeof supportedLanguages.en][]).map(
            ([code, lang]) => (
              <button
                key={code}
                role="option"
                aria-selected={code === currentLanguage}
                onClick={() => handleLanguageChange(code)}
                className={cn(
                  'w-full px-4 py-2.5 text-left text-sm flex items-center justify-between',
                  'hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                  code === currentLanguage
                    ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
                    : 'text-gray-700 dark:text-gray-200'
                )}
              >
                <span>
                  {lang.nativeName}
                  <span className="text-gray-400 dark:text-gray-500 ml-2 text-xs">
                    ({lang.name})
                  </span>
                </span>
                {code === currentLanguage && (
                  <Check className="w-4 h-4 text-orange-500" />
                )}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
