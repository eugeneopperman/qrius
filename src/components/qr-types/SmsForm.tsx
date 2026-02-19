import { useQRStore } from '@/stores/qrStore';
import { useShallow } from 'zustand/react/shallow';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';

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

      <Textarea
        label="Message (Optional)"
        value={smsData.message || ''}
        onChange={(e) => setSmsData({ message: e.target.value })}
        placeholder="Pre-filled message text..."
        rows={3}
        className={cn(
          messageLength > 160 && 'border-amber-500/50 focus:border-amber-500 focus:ring-amber-500/20'
        )}
        hint={
          messageLength > 160
            ? `Characters: ${messageLength} / 160 (may be split into multiple messages)`
            : `Characters: ${messageLength} / 160`
        }
      />
    </div>
  );
}
