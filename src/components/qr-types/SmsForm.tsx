import { useQRStore } from '@/stores/qrStore';
import { useShallow } from 'zustand/react/shallow';
import { Input } from '../ui/Input';

import { validatePhone } from '@/utils/validators';
import { cn } from '@/utils/cn';
import { useFormField } from '@/hooks/useFormField';

export function SmsForm() {
  const { smsData, setSmsData } = useQRStore(useShallow((s) => ({ smsData: s.smsData, setSmsData: s.setSmsData })));
  const phoneField = useFormField(smsData.phone, validatePhone);
  const messageLength = (smsData.message || '').length;

  return (
    <div className="space-y-4">
      <Input
        label="Phone Number"
        type="tel"
        value={smsData.phone}
        onChange={(e) => setSmsData({ phone: e.target.value })}
        onBlur={phoneField.handleBlur}
        placeholder="+1 (555) 123-4567"
        error={phoneField.error}
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
          className={cn(
            "w-full rounded-lg border bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 resize-none",
            messageLength > 160
              ? "border-amber-500 focus:border-amber-500 focus:ring-amber-500/20"
              : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-gray-600"
          )}
        />
        <p className={cn(
          "mt-1 text-sm",
          messageLength > 160 ? "text-amber-600 dark:text-amber-400" : "text-gray-500 dark:text-gray-400"
        )}>
          Characters: {messageLength} / 160
          {messageLength > 160 && " (may be split into multiple messages)"}
        </p>
      </div>
    </div>
  );
}
