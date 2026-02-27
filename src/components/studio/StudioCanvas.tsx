import { memo } from 'react';
import { StudioPreview } from './StudioPreview';
import { StudioContextPopover } from './StudioContextPopover';

export const StudioCanvas = memo(function StudioCanvas() {
  return (
    <div className="flex-1 flex items-center justify-center p-6 overflow-auto relative min-h-0 h-full">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 opacity-[0.15] dark:opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #94a3b8 0.75px, transparent 0.75px)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative z-10">
        <StudioPreview />
      </div>

      {/* Contextual popover (portal to body) */}
      <StudioContextPopover />
    </div>
  );
});

StudioCanvas.displayName = 'StudioCanvas';
