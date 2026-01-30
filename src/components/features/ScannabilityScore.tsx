import { useMemo } from 'react';
import { useQRStore } from '../../stores/qrStore';
import { analyzeScannability } from '../../utils/scannabilityAnalyzer';
import { CheckCircle, AlertTriangle, XCircle, Info, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export function ScannabilityScore() {
  const { styleOptions, getQRValue } = useQRStore();
  const qrValue = getQRValue();

  const analysis = useMemo(() => {
    return analyzeScannability({
      dotsColor: styleOptions.dotsColor,
      backgroundColor: styleOptions.backgroundColor,
      logoSize: styleOptions.logoSize,
      hasLogo: !!styleOptions.logoUrl,
      dataLength: qrValue.length,
      errorCorrectionLevel: styleOptions.errorCorrectionLevel,
    });
  }, [styleOptions, qrValue]);

  const scoreConfig = {
    excellent: {
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      barColor: 'bg-green-500',
      label: 'Excellent',
    },
    good: {
      icon: CheckCircle,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      barColor: 'bg-blue-500',
      label: 'Good',
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800',
      barColor: 'bg-amber-500',
      label: 'Warning',
    },
    poor: {
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      barColor: 'bg-red-500',
      label: 'Poor',
    },
  };

  const config = scoreConfig[analysis.score];
  const Icon = config.icon;

  return (
    <div className={cn('rounded-lg border p-4', config.bgColor, config.borderColor)}>
      {/* Score Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={cn('w-5 h-5', config.color)} />
          <span className={cn('font-semibold', config.color)}>
            Scannability: {config.label}
          </span>
        </div>
        <span className={cn('text-2xl font-bold', config.color)}>
          {analysis.percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
        <div
          className={cn('h-full transition-all duration-500', config.barColor)}
          style={{ width: `${analysis.percentage}%` }}
        />
      </div>

      {/* Issues */}
      {analysis.issues.length > 0 && (
        <div className="space-y-2 mb-3">
          {analysis.issues.map((issue, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-2 text-sm',
                issue.severity === 'high'
                  ? 'text-red-600 dark:text-red-400'
                  : issue.severity === 'medium'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-gray-600 dark:text-gray-400'
              )}
            >
              <ChevronRight className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{issue.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2">
            <Info className="w-3.5 h-3.5" />
            <span className="font-medium">Suggestions</span>
          </div>
          <ul className="space-y-1">
            {analysis.suggestions.slice(0, 3).map((suggestion, index) => (
              <li key={index} className="text-xs text-gray-600 dark:text-gray-400">
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* All Good Message */}
      {analysis.issues.length === 0 && (
        <p className="text-sm text-green-600 dark:text-green-400">
          Your QR code should scan reliably across all devices!
        </p>
      )}
    </div>
  );
}
