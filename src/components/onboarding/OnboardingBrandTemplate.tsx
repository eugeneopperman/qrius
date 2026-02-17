import { Palette } from 'lucide-react';
import { Input } from '../ui/Input';

interface OnboardingBrandTemplateProps {
  brandColor: string;
  setBrandColor: (v: string) => void;
}

const colors = [
  '#6366F1', '#3B82F6', '#06B6D4', '#10B981',
  '#F59E0B', '#F97316', '#EF4444', '#EC4899',
  '#8B5CF6', '#000000',
];

export function OnboardingBrandTemplate({ brandColor, setBrandColor }: OnboardingBrandTemplateProps) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
        <Palette className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Choose your brand color
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Pick a color for your QR codes. This creates your first brand template.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => setBrandColor(color)}
            className={`w-12 h-12 rounded-xl transition-all ${
              brandColor === color
                ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-950 ring-orange-500 scale-110'
                : 'hover:scale-105'
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Or enter a custom color
        </label>
        <Input
          type="text"
          value={brandColor}
          onChange={(e) => setBrandColor(e.target.value)}
          placeholder="#6366F1"
          className="text-center max-w-[200px] mx-auto"
        />
      </div>
    </div>
  );
}
