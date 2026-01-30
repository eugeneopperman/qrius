import { useQRStore } from '../../stores/qrStore';
import { Input } from '../ui/Input';
import { MessageSquare } from 'lucide-react';

export function SmsForm() {
  const { smsData, setSmsData } = useQRStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <MessageSquare className="w-5 h-5" />
        <h3 className="font-medium">SMS Message</h3>
      </div>

      <Input
        label="Phone Number"
        type="tel"
        value={smsData.phone}
        onChange={(e) => setSmsData({ phone: e.target.value })}
        placeholder="+1 (555) 123-4567"
      />

      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Message (Optional)
        </label>
        <textarea
          value={smsData.message || ''}
          onChange={(e) => setSmsData({ message: e.target.value })}
          placeholder="Pre-filled message text..."
          rows={3}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 resize-none"
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Characters: {(smsData.message || '').length} / 160
        </p>
      </div>
    </div>
  );
}
