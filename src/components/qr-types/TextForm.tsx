import { useQRStore } from '../../stores/qrStore';
import { Type } from 'lucide-react';
import { validateText } from '../../utils/validators';
import { cn } from '../../utils/cn';

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

      <div className="w-full">
        <label
          htmlFor="text-content"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Text Content
        </label>
        <textarea
          id="text-content"
          value={textData.text}
          onChange={(e) => setTextData({ text: e.target.value })}
          placeholder="Enter your text here..."
          rows={4}
          className={cn(
            "w-full rounded-lg border bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 resize-none",
            !validation.isValid
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : isNearLimit
              ? "border-amber-500 focus:border-amber-500 focus:ring-amber-500/20"
              : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-gray-600"
          )}
        />
        {validation.error ? (
          <p className="mt-1 text-sm text-red-500">{validation.error}</p>
        ) : (
          <p className={cn(
            "mt-1 text-sm",
            isNearLimit ? "text-amber-600 dark:text-amber-400" : "text-gray-500 dark:text-gray-400"
          )}>
            Characters: {textLength}
            {isNearLimit && ` / ~2953 max`}
          </p>
        )}
      </div>
    </div>
  );
}
