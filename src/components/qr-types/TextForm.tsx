import { useQRStore } from '@/stores/qrStore';
import { useShallow } from 'zustand/react/shallow';

import { validateText } from '@/utils/validators';
import { Textarea } from '../ui/Textarea';

export function TextForm() {
  const { textData, setTextData } = useQRStore(useShallow((s) => ({ textData: s.textData, setTextData: s.setTextData })));

  const validation = validateText(textData.text);
  const textLength = textData.text.length;
  const isNearLimit = textLength > 2000;

  return (
    <div className="space-y-4">
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
