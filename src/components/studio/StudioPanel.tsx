import { memo } from 'react';
import { useStudioStore, type StudioPanel as StudioPanelType } from '@/stores/studioStore';
import { useShallow } from 'zustand/react/shallow';
import { Palette, Frame, Image, Type, PaintBucket } from 'lucide-react';
import { cn } from '@/utils/cn';
import { PanelDotsColors } from './panels/PanelDotsColors';
import { PanelFrame } from './panels/PanelFrame';
import { PanelLogo } from './panels/PanelLogo';
import { PanelLabel } from './panels/PanelLabel';
import { PanelBackground } from './panels/PanelBackground';

const PANEL_TABS: { id: StudioPanelType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dots-colors', label: 'Style', icon: Palette },
  { id: 'frame', label: 'Frame', icon: Frame },
  { id: 'logo', label: 'Logo', icon: Image },
  { id: 'label', label: 'Label', icon: Type },
  { id: 'background', label: 'BG', icon: PaintBucket },
];

const PANEL_COMPONENTS: Record<NonNullable<StudioPanelType>, React.ComponentType> = {
  'dots-colors': PanelDotsColors,
  'frame': PanelFrame,
  'logo': PanelLogo,
  'label': PanelLabel,
  'background': PanelBackground,
};

export const StudioPanel = memo(function StudioPanel() {
  const { activePanel, setActivePanel } = useStudioStore(
    useShallow((s) => ({
      activePanel: s.activePanel,
      setActivePanel: s.setActivePanel,
    }))
  );

  const ActivePanelComponent = activePanel ? PANEL_COMPONENTS[activePanel] : null;

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar — horizontal on mobile, vertical icons on desktop */}
      <div className="flex lg:flex-col border-b lg:border-b-0 lg:border-r border-black/[0.06] dark:border-white/[0.06] bg-gray-50/80 dark:bg-gray-900/50 flex-shrink-0">
        {/* Mobile: horizontal scroll tabs */}
        <div className="flex lg:hidden overflow-x-auto gap-1 px-2 py-2 scrollbar-none">
          {PANEL_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activePanel === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePanel(isActive ? null : tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-700/60'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Desktop: vertical icon tabs */}
        <div className="hidden lg:flex flex-col gap-1 p-2">
          {PANEL_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activePanel === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePanel(isActive ? null : tab.id)}
                className={cn(
                  'flex flex-col items-center gap-0.5 p-2.5 rounded-lg transition-colors',
                  isActive
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 hover:text-gray-700 dark:hover:text-gray-200'
                )}
                title={tab.label}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-medium leading-none">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel content */}
      {activePanel && ActivePanelComponent ? (
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          <ActivePanelComponent />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4 text-center">
          <div>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Click a QR element or tab to start editing
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

StudioPanel.displayName = 'StudioPanel';
