import { useQRStore } from '../../stores/qrStore';
import { ColorPicker } from '../ui/ColorPicker';
import { Palette } from 'lucide-react';

export function ColorSection() {
  const { styleOptions, setStyleOptions } = useQRStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <Palette className="w-5 h-5" />
        <h3 className="font-medium">Colors</h3>
      </div>

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
