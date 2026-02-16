import {
  QrCode,
  Smartphone,
  Camera,
  ArrowRight,
  Download,
  ExternalLink,
  ScanLine,
  Fingerprint,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import type { FrameStyle, FrameFontSize, FrameFontFamily, FrameIcon, QRStyleOptions } from '../../types';

// Icon mapping for frame labels
const frameIconComponents: Record<FrameIcon, React.ComponentType<{ className?: string }> | null> = {
  'none': null,
  'qr-code': QrCode,
  'smartphone': Smartphone,
  'camera': Camera,
  'arrow-right': ArrowRight,
  'download': Download,
  'external-link': ExternalLink,
  'scan': ScanLine,
  'finger-print': Fingerprint,
};

// Font size classes
const fontSizeClasses: Record<FrameFontSize, string> = {
  sm: 'text-xs',
  base: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

// Font family classes
const fontFamilyClasses: Record<FrameFontFamily, string> = {
  sans: 'font-sans',
  serif: 'font-serif',
  mono: 'font-mono',
  rounded: 'font-sans tracking-wide',
};

// Icon size classes (matching font sizes)
const iconSizeClasses: Record<FrameFontSize, string> = {
  sm: 'w-3 h-3',
  base: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6',
};

interface FrameLabelProps {
  label: string;
  fontSize: FrameFontSize;
  fontFamily: FrameFontFamily;
  icon?: FrameIcon;
  iconPosition?: 'left' | 'right' | 'none';
}

function FrameLabel({
  label,
  fontSize,
  icon,
  iconPosition = 'left',
}: Omit<FrameLabelProps, 'fontFamily'>) {
  const IconComponent = icon && icon !== 'none' ? frameIconComponents[icon] : null;

  return (
    <>
      {iconPosition === 'left' && IconComponent && (
        <IconComponent className={iconSizeClasses[fontSize]} />
      )}
      {label}
      {iconPosition === 'right' && IconComponent && (
        <IconComponent className={iconSizeClasses[fontSize]} />
      )}
    </>
  );
}

type TopLabelProps = FrameLabelProps;

export function TopLabel({ label, fontSize, fontFamily, icon, iconPosition }: TopLabelProps) {
  return (
    <div
      className={cn(
        'absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1',
        'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800',
        'font-semibold rounded-full whitespace-nowrap flex items-center gap-1.5',
        fontSizeClasses[fontSize],
        fontFamilyClasses[fontFamily]
      )}
    >
      <FrameLabel
        label={label}
        fontSize={fontSize}
        icon={icon}
        iconPosition={iconPosition}
      />
    </div>
  );
}

type BadgeLabelProps = FrameLabelProps;

export function BadgeLabel({ label, fontSize, fontFamily, icon, iconPosition }: BadgeLabelProps) {
  return (
    <div
      className={cn(
        'text-center mb-3 text-gray-800 dark:text-gray-200',
        'font-bold uppercase tracking-wider',
        'flex items-center justify-center gap-1.5',
        fontSizeClasses[fontSize],
        fontFamilyClasses[fontFamily]
      )}
    >
      <FrameLabel
        label={label}
        fontSize={fontSize}
        icon={icon}
        iconPosition={iconPosition}
      />
    </div>
  );
}

type BottomLabelProps = FrameLabelProps;

export function BottomLabel({ label, fontSize, fontFamily, icon, iconPosition }: BottomLabelProps) {
  return (
    <div
      className={cn(
        'mt-3 text-center text-gray-800 dark:text-gray-200',
        'font-semibold flex items-center justify-center gap-1.5',
        fontSizeClasses[fontSize],
        fontFamilyClasses[fontFamily]
      )}
    >
      <FrameLabel
        label={label}
        fontSize={fontSize}
        icon={icon}
        iconPosition={iconPosition}
      />
    </div>
  );
}

// Banner label (full-width colored bar)
export function BannerLabel({ label, fontSize, fontFamily, icon, iconPosition, bgColor, position }: FrameLabelProps & { bgColor?: string; position: 'top' | 'bottom' }) {
  return (
    <div
      className={cn(
        'w-full py-2 px-4 text-center text-white font-semibold',
        'flex items-center justify-center gap-1.5',
        position === 'top' ? 'rounded-t-2xl mb-2' : 'rounded-b-2xl mt-2',
        fontSizeClasses[fontSize],
        fontFamilyClasses[fontFamily]
      )}
      style={{ backgroundColor: bgColor || '#1f2937' }}
    >
      <FrameLabel label={label} fontSize={fontSize} icon={icon} iconPosition={iconPosition} />
    </div>
  );
}

// Ribbon label
export function RibbonLabel({ label, fontSize, fontFamily, icon, iconPosition, bgColor }: FrameLabelProps & { bgColor?: string }) {
  const color = bgColor || '#EF4444';
  return (
    <div className="relative mt-3 flex justify-center">
      <div
        className={cn(
          'relative px-6 py-1.5 text-white font-semibold',
          'flex items-center justify-center gap-1.5',
          fontSizeClasses[fontSize],
          fontFamilyClasses[fontFamily]
        )}
        style={{ backgroundColor: color }}
      >
        <FrameLabel label={label} fontSize={fontSize} icon={icon} iconPosition={iconPosition} />
        {/* Ribbon ends */}
        <div
          className="absolute -left-2 top-0 w-0 h-0"
          style={{
            borderTop: '14px solid transparent',
            borderBottom: '14px solid transparent',
            borderRight: `8px solid ${color}`,
          }}
        />
        <div
          className="absolute -right-2 top-0 w-0 h-0"
          style={{
            borderTop: '14px solid transparent',
            borderBottom: '14px solid transparent',
            borderLeft: `8px solid ${color}`,
          }}
        />
      </div>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- utility co-located with components
export function getFrameClasses(frameStyle: FrameStyle): string {
  switch (frameStyle) {
    case 'simple':
      return 'border-4 border-gray-800 dark:border-gray-200';
    case 'rounded':
      return 'border-4 border-gray-800 dark:border-gray-200 rounded-[2.5rem]';
    case 'bottom-label':
    case 'top-label':
    case 'badge':
      return 'border-4 border-gray-800 dark:border-gray-200 rounded-2xl';
    case 'speech-bubble':
      return 'border-4 border-gray-800 dark:border-gray-200 rounded-2xl';
    case 'circular':
      return 'border-4 border-gray-800 dark:border-gray-200 rounded-full';
    case 'ribbon':
      return 'border-4 border-gray-800 dark:border-gray-200 rounded-2xl';
    case 'sticker':
      return 'rounded-2xl rotate-[-1deg]';
    case 'gradient-border':
      return 'rounded-2xl';
    case 'decorative-corners':
      return '';
    case 'minimal-line':
      return '';
    case 'shadow-3d':
      return 'rounded-2xl';
    case 'banner-bottom':
    case 'banner-top':
      return 'rounded-2xl overflow-hidden';
    default:
      return '';
  }
}

// eslint-disable-next-line react-refresh/only-export-components -- utility co-located with components
export function getFrameInlineStyles(frameStyle: FrameStyle, styleOptions?: QRStyleOptions): React.CSSProperties {
  const borderColor = styleOptions?.frameBorderColor;
  const bgColor = styleOptions?.frameBgColor;
  const styles: React.CSSProperties = {};

  if (borderColor) {
    if (['simple', 'rounded', 'bottom-label', 'top-label', 'badge', 'speech-bubble', 'circular', 'ribbon'].includes(frameStyle)) {
      styles.borderColor = borderColor;
    }
  }

  if (frameStyle === 'sticker' && bgColor) {
    styles.backgroundColor = bgColor;
  }

  if (frameStyle === 'shadow-3d') {
    styles.boxShadow = `8px 8px 0px ${borderColor || '#d1d5db'}`;
  }

  if (frameStyle === 'gradient-border') {
    const colors = styleOptions?.frameGradientColors || ['#6366F1', '#EC4899'];
    styles.border = '4px solid transparent';
    styles.backgroundImage = `linear-gradient(white, white), linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
    styles.backgroundOrigin = 'border-box';
    styles.backgroundClip = 'padding-box, border-box';
  }

  return styles;
}

// Speech bubble pointer
export function SpeechBubblePointer({ direction = 'bottom', color }: { direction?: 'bottom' | 'top' | 'left' | 'right'; color?: string }) {
  const borderColor = color || 'currentColor';
  const pointerClasses: Record<string, string> = {
    bottom: 'left-1/2 -translate-x-1/2 -bottom-3',
    top: 'left-1/2 -translate-x-1/2 -top-3 rotate-180',
    left: 'top-1/2 -translate-y-1/2 -left-3 rotate-90',
    right: 'top-1/2 -translate-y-1/2 -right-3 -rotate-90',
  };

  return (
    <div className={cn('absolute', pointerClasses[direction])}>
      <div
        className="w-0 h-0"
        style={{
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderTop: `12px solid ${borderColor}`,
        }}
      />
    </div>
  );
}

// Decorative corner accents
export function DecorativeCorners({ color }: { color?: string }) {
  const c = color || '#374151';
  const cornerStyle: React.CSSProperties = {
    position: 'absolute',
    width: '20px',
    height: '20px',
    borderColor: c,
  };

  return (
    <>
      <div style={{ ...cornerStyle, top: 0, left: 0, borderTop: '3px solid', borderLeft: '3px solid' }} />
      <div style={{ ...cornerStyle, top: 0, right: 0, borderTop: '3px solid', borderRight: '3px solid' }} />
      <div style={{ ...cornerStyle, bottom: 0, left: 0, borderBottom: '3px solid', borderLeft: '3px solid' }} />
      <div style={{ ...cornerStyle, bottom: 0, right: 0, borderBottom: '3px solid', borderRight: '3px solid' }} />
    </>
  );
}

// Minimal line decoration
export function MinimalLine({ position = 'bottom', color }: { position?: 'top' | 'bottom'; color?: string }) {
  return (
    <div
      className={cn(
        'w-16 h-0.5 mx-auto',
        position === 'top' ? 'mb-3' : 'mt-3'
      )}
      style={{ backgroundColor: color || '#d1d5db' }}
    />
  );
}

interface FallbackUrlProps {
  qrValue: string;
}

export function FallbackUrl({ qrValue }: FallbackUrlProps) {
  return (
    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center break-all max-w-[280px]">
        {qrValue.length > 100 ? `${qrValue.substring(0, 100)}...` : qrValue}
      </p>
    </div>
  );
}
