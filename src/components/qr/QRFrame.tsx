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
import type { FrameStyle, FrameFontSize, FrameFontFamily, FrameIcon } from '../../types';

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

interface TopLabelProps extends FrameLabelProps {}

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

interface BadgeLabelProps extends FrameLabelProps {}

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

interface BottomLabelProps extends FrameLabelProps {}

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
    default:
      return '';
  }
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
