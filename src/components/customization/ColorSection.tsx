import { useQRStore } from '../../stores/qrStore';
import { ColorPicker } from '../ui/ColorPicker';

export function ColorSection() {
  const { styleOptions, setStyleOptions } = useQRStore();

  return (
    <div className="space-y-4">
      <ColorPicker
        label="QR Code Color"
        value={styleOptions.dotsColor}
        onChange={(color) => setStyleOptions({ dotsColor: color })}
      />

      <ColorPicker
        label="Background Color"
        value={styleOptions.backgroundColor}
        onChange={(color) => setStyleOptions({ backgroundColor: color })}
      />

      <div className="pt-2">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Tip: Ensure good contrast between colors for reliable scanning.
          Dark QR codes on light backgrounds work best.
        </p>
      </div>
    </div>
  );
}
