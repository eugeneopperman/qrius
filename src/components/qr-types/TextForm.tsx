import { useQRStore } from '../../stores/qrStore';
import { Type } from 'lucide-react';
import { validateText } from '../../utils/validators';
import { Textarea } from '../ui/Textarea';

export function TextForm() {
  const { textData, setTextData } = useQRStore();

  const validation = validateText(textData.text);
  const textLength = textData.text.length;
  const isNearLimit = textLength > 2000;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <Type className="w-5 h-5" />
        <h3 className="font-medium">Plain Text</h3>
      </div>

      <Textarea
        label="Text Content"
        value={textData.text}
        onChange={(e) => setTextData({ text: e.target.value })}
        placeholder="Enter your text here..."
        rows={4}
        error={validation.error}
        hint={
          !validation.error
            ? `Characters: ${textLength}${isNearLimit ? ' / ~2953 max' : ''}`
            : undefined
        }
        className={isNearLimit && !validation.error ? 'border-amber-500 focus:border-amber-500 focus:ring-amber-500/20' : undefined}
      />
    </div>
  );
}
