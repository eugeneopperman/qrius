import { useQRStore } from '../../stores/qrStore';
import { Type } from 'lucide-react';

export function TextForm() {
  const { textData, setTextData } = useQRStore();

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
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 resize-none"
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Characters: {textData.text.length}
        </p>
      </div>
    </div>
  );
}
